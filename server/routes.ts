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
import pdfkit from 'pdfkit';
import HTMLtoDOCX from 'html-to-docx';
import { pipeline } from 'stream/promises';

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

// Function to analyze document structure for audit notices
async function analyzeDocumentStructure(text: string): Promise<{
  documentType: string;
  taxAuthority?: string;
  targetEntities?: string[];
  auditAreas?: string[];
  informationRequests?: string[];
  suggestedResponses?: string[];
  dataSourceRecommendations?: string[];
  keyDates?: { description: string; date: string; }[];
  additionalNotes?: string;
}> {
  try {
    // Note: gpt-4o is the latest model as of May 13, 2024
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert in transfer pricing and tax documentation analysis. 
Analyze the document and extract structured information about its contents.
If it's an audit notice, focus on identifying:
1. The tax authority issuing the notice
2. Target entities under audit
3. Areas being audited
4. Information being requested
5. Key compliance dates
6. Suggested responses
7. Recommended data sources for response

Format your response as a JSON object with these fields:
{
  "documentType": "audit_notice" | "other",
  "taxAuthority": "string",
  "targetEntities": string[],
  "auditAreas": string[],
  "informationRequests": string[],
  "keyDates": [{ "description": string, "date": string }],
  "suggestedResponses": string[],
  "dataSourceRecommendations": string[],
  "additionalNotes": string
}`
        },
        { role: "user", content: text }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Document structure analysis error:", error);
    throw new Error("Failed to analyze document structure");
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

// Add this helper function at the top of the file
function generateAnalysisHTML(analysis: any) {
  return `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        h1 { color: #2D3748; }
        h2 { color: #4A5568; margin-top: 20px; }
        .section { margin: 20px 0; }
        .badge { 
          display: inline-block;
          padding: 4px 8px;
          margin: 4px;
          border-radius: 4px;
          background: #EDF2F7;
          color: #2D3748;
        }
        .date { color: #718096; }
      </style>
    </head>
    <body>
      <h1>Document Analysis Report</h1>
      <div class="section">
        <h2>Sentiment Analysis</h2>
        <p>Overall Sentiment: ${analysis.sentiment.sentiment}</p>
        <p>Confidence Score: ${Math.round(analysis.sentiment.score * 100)}%</p>

        <h3>Key Drivers</h3>
        ${analysis.sentiment.keyDrivers.map((driver: string) => 
          `<div class="badge">${driver}</div>`
        ).join('')}

        <h3>Risk Indicators</h3>
        ${analysis.sentiment.riskIndicators.map((risk: string) => 
          `<div class="badge">${risk}</div>`
        ).join('')}
      </div>

      <div class="section">
        <h2>Document Structure Analysis</h2>
        ${analysis.structure.taxAuthority ? 
          `<p><strong>Tax Authority:</strong> ${analysis.structure.taxAuthority}</p>` : ''}

        ${analysis.structure.targetEntities?.length ? `
          <h3>Target Entities</h3>
          ${analysis.structure.targetEntities.map((entity: string) => 
            `<div class="badge">${entity}</div>`
          ).join('')}
        ` : ''}

        ${analysis.structure.auditAreas?.length ? `
          <h3>Audit Areas</h3>
          ${analysis.structure.auditAreas.map((area: string) => 
            `<div class="badge">${area}</div>`
          ).join('')}
        ` : ''}

        ${analysis.structure.keyDates?.length ? `
          <h3>Key Dates</h3>
          ${analysis.structure.keyDates.map((date: any) => 
            `<p><span class="date">${date.date}</span> - ${date.description}</p>`
          ).join('')}
        ` : ''}
      </div>
    </body>
    </html>
  `;
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Document upload endpoint with sentiment and structure analysis
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
      let documentStructure;
      try {
        // Run both analyses in parallel
        [sentimentAnalysis, documentStructure] = await Promise.all([
          analyzeSentiment(fileContent),
          analyzeDocumentStructure(fileContent)
        ]);
        console.log("Document analysis completed");
      } catch (analysisError: any) {
        console.error("Analysis error:", analysisError);
        throw new Error(`Failed to analyze document: ${analysisError.message}`);
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
            sentimentAnalysis,
            documentStructure
          }
        })
        .returning();

      res.json({
        document: doc,
        analysis: {
          sentiment: sentimentAnalysis,
          structure: documentStructure
        }
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

  // Get recent document analyses
  app.get("/api/documents/recent-analyses", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");

    try {
      const recentDocs = await db
        .select()
        .from(documents)
        .where(eq(documents.userId, req.user.id))
        .orderBy(desc(documents.createdAt))
        .limit(10);

      res.json(recentDocs);
    } catch (error: any) {
      console.error("Failed to fetch recent analyses:", error);
      res.status(500).json({
        error: error.message || "Failed to fetch recent analyses",
      });
    }
  });

  // Add this new endpoint to the registerRoutes function
  app.post("/api/documents/export", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");

    const { analysis, format } = req.body;
    if (!analysis || !format) {
      return res.status(400).send("Missing required fields");
    }

    try {
      if (format === 'pdf') {
        const doc = new pdfkit();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=document-analysis.pdf');

        doc.pipe(res);

        // Add content to PDF
        doc
          .fontSize(24)
          .text('Document Analysis Report', { align: 'center' })
          .moveDown();

        // Sentiment Analysis Section
        doc
          .fontSize(18)
          .text('Sentiment Analysis')
          .moveDown()
          .fontSize(12)
          .text(`Overall Sentiment: ${analysis.sentiment.sentiment}`)
          .text(`Confidence Score: ${Math.round(analysis.sentiment.score * 100)}%`)
          .moveDown();

        // Key Drivers
        doc
          .fontSize(14)
          .text('Key Drivers')
          .moveDown()
          .fontSize(12);
        analysis.sentiment.keyDrivers.forEach((driver: string) => {
          doc.text(`• ${driver}`);
        });
        doc.moveDown();

        // Risk Indicators
        doc
          .fontSize(14)
          .text('Risk Indicators')
          .moveDown()
          .fontSize(12);
        analysis.sentiment.riskIndicators.forEach((risk: string) => {
          doc.text(`• ${risk}`);
        });
        doc.moveDown();

        // Document Structure Section
        doc
          .fontSize(18)
          .text('Document Structure Analysis')
          .moveDown();

        if (analysis.structure.taxAuthority) {
          doc
            .fontSize(12)
            .text(`Tax Authority: ${analysis.structure.taxAuthority}`)
            .moveDown();
        }

        if (analysis.structure.targetEntities?.length) {
          doc
            .fontSize(14)
            .text('Target Entities')
            .moveDown()
            .fontSize(12);
          analysis.structure.targetEntities.forEach((entity: string) => {
            doc.text(`• ${entity}`);
          });
          doc.moveDown();
        }

        if (analysis.structure.keyDates?.length) {
          doc
            .fontSize(14)
            .text('Key Dates')
            .moveDown()
            .fontSize(12);
          analysis.structure.keyDates.forEach((date: any) => {
            doc.text(`${date.date} - ${date.description}`);
          });
        }

        doc.end();
      } else if (format === 'docx') {
        const html = generateAnalysisHTML(analysis);
        const docx = await HTMLtoDOCX(html, null, {
          table: { row: { cantSplit: true } },
          footer: true,
          pageNumber: true,
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', 'attachment; filename=document-analysis.docx');
        res.send(docx);
      } else {
        res.status(400).send("Unsupported format");
      }
    } catch (error: any) {
      console.error("Export error:", error);
      res.status(500).json({
        error: error.message || "Failed to export document",
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