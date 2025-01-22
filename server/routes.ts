import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { users, documents, auditNotices, noticeAnalysis } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import OpenAI from "openai";
import { WebSocketServer } from 'ws';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { fileTypeFromFile } from 'file-type';
import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/tiff',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Ensure uploads directory exists
fs.mkdir('uploads', { recursive: true }).catch(console.error);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to extract text from images
async function extractTextFromImage(filePath: string): Promise<string> {
  const worker = await createWorker();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data: { text } } = await worker.recognize(filePath);
  await worker.terminate();
  return text;
}

// Helper function to extract text from PDF
async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const data = await fs.readFile(filePath);
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(data) });
    const pdf = await loadingTask.promise;

    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items
        .map((item: any) => item.str)
        .join(' ') + '\n';
    }

    return text || "No text content could be extracted from PDF";
  } catch (error: any) {
    console.error("PDF extraction error:", error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

// Helper function to analyze notices
async function analyzeNotice(text: string): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Analyze this notice and provide JSON response with:
1. Summary (max 3 sentences)
2. Key issues (up to 5)
3. Suggested responses (up to 5)
4. Required documents (up to 5)
5. Risk assessment with risk level and factors`
        },
        { role: "user", content: text }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI analysis error:", error);
    throw new Error("Failed to analyze notice content");
  }
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Notice Management Routes
  app.post("/api/notices/upload", upload.single('file'), async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    if (!req.file) return res.status(400).send("No file uploaded");

    try {
      const fileType = await fileTypeFromFile(req.file.path);
      let fileContent = '';

      console.log("Processing file:", {
        path: req.file.path,
        type: fileType?.mime || req.file.mimetype
      });

      if (fileType?.mime.startsWith('image/')) {
        fileContent = await extractTextFromImage(req.file.path);
      } else if (fileType?.mime === 'application/pdf') {
        fileContent = await extractTextFromPDF(req.file.path);
      } else {
        fileContent = await fs.readFile(req.file.path, 'utf-8');
      }

      const analysis = await analyzeNotice(fileContent);

      const [notice] = await db.insert(auditNotices)
        .values({
          title: req.file.originalname,
          content: fileContent,
          noticeType: req.body.noticeType || 'audit',
          jurisdiction: req.body.jurisdiction || 'Unknown',
          receivedDate: new Date(),
          dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
          userId: req.user.id,
          metadata: {
            size: req.file.size,
            mimetype: fileType?.mime || req.file.mimetype,
            originalName: req.file.originalname,
            filePath: req.file.path,
            analysis
          }
        })
        .returning();

      res.json({
        notice,
        analysis
      });

    } catch (error: any) {
      console.error("Upload error:", error);
      if (req.file?.path) {
        fs.unlink(req.file.path).catch(console.error);
      }
      res.status(500).json({
        error: error.message || "Failed to process upload",
        details: error.toString()
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Setup WebSocket server for collaboration
  const wss = new WebSocketServer({ server: httpServer, path: '/ws/collaboration' });

  wss.on('connection', (ws, req) => {
    if (!req.url) return ws.close();
  });

  return httpServer;
}

// Type definition for CollaborationMessage
interface CollaborationMessage {
  type: 'join' | 'leave' | 'cursor' | 'edit' | 'comment';
  userId: number;
  content?: any;
}