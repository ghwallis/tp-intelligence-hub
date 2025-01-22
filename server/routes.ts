import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { users, documents, auditNotices } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import OpenAI from "openai";
import { WebSocketServer } from 'ws';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import fs from 'fs/promises';
import { fileTypeFromBuffer } from 'file-type';
import { createWorker } from 'tesseract.js';
import pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// Helper function to extract text from images
async function extractTextFromImage(filePath: string): Promise<string> {
  const worker = await createWorker();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data: { text } } = await worker.recognize(filePath);
  await worker.terminate();
  return text;
}

// Helper function to extract text from PDF without worker dependency
async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const buffer = await fs.readFile(filePath);
    const data = new Uint8Array(buffer);

    // Load the PDF document with minimal dependencies
    const loadingTask = pdfjsLib.getDocument({
      data,
      useSystemFonts: false,
      disableFontFace: true,
      standardFontDataUrl: path.join(__dirname, '../node_modules/pdfjs-dist/standard_fonts/'),
      isEvalSupported: false,
      useWorker: false
    });

    const pdfDocument = await loadingTask.promise;
    let text = '';

    // Extract text from each page
    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      text += textContent.items.map((item: any) => item.str).join(' ') + '\n';
    }

    return text || "No text content could be extracted from PDF";
  } catch (error: any) {
    console.error("PDF extraction error:", error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

// Helper function to analyze sentiment
async function analyzeSentiment(text: string): Promise<{
  sentiment: string;
  score: number;
  keyDrivers: string[];
  riskIndicators: string[];
  complianceTone: string;
  analysis: string;
}> {
  try {
    // Note: gpt-4o is the latest model as of May 13, 2024
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert in transfer pricing document analysis. Analyze the sentiment and tone of transfer pricing documents, focusing on:
1. Overall sentiment (positive/negative/neutral)
2. Key sentiment drivers
3. Risk indicators
4. Compliance tone
5. Detailed analysis

Format your response as a JSON object with these exact fields:
{
  "sentiment": "positive" | "negative" | "neutral",
  "score": number between 0 and 1,
  "keyDrivers": string[],
  "riskIndicators": string[],
  "complianceTone": string,
  "analysis": string
}`
        },
        { role: "user", content: text }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    throw new Error("Failed to analyze document sentiment");
  }
}

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

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Document upload endpoint with sentiment analysis
  app.post("/api/documents/upload", upload.single('file'), async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    if (!req.file) return res.status(400).send("No file uploaded");

    try {
      const fileBuffer = await fs.readFile(req.file.path);
      const fileType = await fileTypeFromBuffer(fileBuffer);
      let fileContent = '';

      console.log("Processing file:", {
        path: req.file.path,
        type: fileType?.mime || req.file.mimetype,
        originalName: req.file.originalname
      });

      try {
        // Determine file type and extract content
        if (fileType?.mime?.startsWith('image/') || req.file.mimetype.startsWith('image/')) {
          fileContent = await extractTextFromImage(req.file.path);
        } else if (
          fileType?.mime === 'application/pdf' || 
          req.file.mimetype === 'application/pdf' ||
          req.file.originalname.toLowerCase().endsWith('.pdf')
        ) {
          fileContent = await extractTextFromPDF(req.file.path);
        } else {
          fileContent = await fs.readFile(req.file.path, 'utf-8');
        }

        console.log("Content extracted successfully, length:", fileContent.length);
      } catch (extractError: any) {
        console.error("Content extraction error:", extractError);
        throw new Error(`Failed to extract content: ${extractError.message}`);
      }

      let sentimentAnalysis;
      try {
        sentimentAnalysis = await analyzeSentiment(fileContent);
        console.log("Sentiment analysis completed");
      } catch (analysisError: any) {
        console.error("Sentiment analysis error:", analysisError);
        throw new Error(`Failed to analyze sentiment: ${analysisError.message}`);
      }

      // Store the document and analysis in the database
      const [doc] = await db.insert(documents)
        .values({
          title: req.file.originalname,
          content: fileContent,
          userId: req.user.id,
          status: 'analyzed',
          metadata: {
            size: req.file.size,
            mimetype: fileType?.mime || req.file.mimetype,
            originalName: req.file.originalname,
            filePath: req.file.path,
            sentimentAnalysis
          }
        })
        .returning();

      res.json({
        document: doc,
        analysis: sentimentAnalysis
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