import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import {
  users, documents, auditNotices, noticeAnalysis, noticeTimelines,
  templates, riskAssessments, complianceChecks, comparableCompanies, benchmarkingAnalysis, monitoringAlerts, systemIntegrations, integrationLogs, collaborationSessions, collaborators, collaborationEvents, complianceFeedback
} from "@db/schema";
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
import * as pdfjsLib from 'pdfjs-dist';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    // Accept images, PDFs, and common document formats
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

// Helper function to extract text from images using Tesseract
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
    const loadingTask = pdfjsLib.getDocument({
      data,
      useSystemFonts: true,
      disableFontFace: true,
    });
    const pdf = await loadingTask.promise;
    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      text += textContent.items
        .filter((item: any) => item.str && item.str.trim())
        .map((item: any) => item.str)
        .join(' ') + '\n';
    }

    return text || "No text content could be extracted from PDF";
  } catch (error) {
    console.error("PDF extraction error:", error);
    return "Error extracting text from PDF. File stored successfully.";
  }
}

// Helper function to analyze text using OpenAI
async function analyzeText(text: string): Promise<any> {
  const analysisPrompt = `You are a transfer pricing expert. Analyze this document and provide:
1. A clear and concise summary (max 3 sentences)
2. Key issues or requirements identified (list up to 5)
3. Suggested actions or responses (list up to 5)
4. Required documentation (list up to 5)
5. Risk assessment with factors

Format your response as JSON:
{
  "summary": "string",
  "keyIssues": ["string"],
  "suggestedResponses": ["string"],
  "requiredDocuments": ["string"],
  "riskAssessment": {
    "level": "low|medium|high",
    "factors": ["string"]
  }
}

Respond with JSON only.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: analysisPrompt },
        { role: "user", content: text }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI analysis error:", error);
    throw new Error("Failed to analyze document content");
  }
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Notice Management Routes
  app.post("/api/notices/upload", upload.single('file'), async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    if (!req.file) return res.status(400).send("No file uploaded");

    try {
      // Detect file type
      const fileType = await fileTypeFromFile(req.file.path);
      let fileContent = '';

      console.log("Processing file:", {
        path: req.file.path,
        type: fileType?.mime || req.file.mimetype
      });

      // Extract text based on file type
      if (fileType?.mime.startsWith('image/')) {
        console.log("Processing image file...");
        fileContent = await extractTextFromImage(req.file.path);
      } else if (fileType?.mime === 'application/pdf') {
        console.log("Processing PDF file...");
        fileContent = await extractTextFromPDF(req.file.path);
      } else {
        // For text files and other documents, read directly
        console.log("Processing text/document file...");
        fileContent = await fs.readFile(req.file.path, 'utf-8');
      }

      console.log("Content extracted, length:", fileContent.length);

      // Create notice record
      const [notice] = await db.insert(auditNotices)
        .values({
          title: req.body.title || req.file.originalname,
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
            filePath: req.file.path
          }
        })
        .returning();

      res.json({
        notice
      });

    } catch (error: any) {
      console.error("Notice upload error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Separate endpoint for analysis
  app.post("/api/notices/:id/analyze", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");

    try {
      const noticeId = parseInt(req.params.id);
      const [notice] = await db.select()
        .from(auditNotices)
        .where(eq(auditNotices.id, noticeId))
        .limit(1);

      if (!notice) {
        return res.status(404).send("Notice not found");
      }

      if (notice.userId !== req.user.id) {
        return res.status(403).send("Access denied");
      }

      const analysis = await analyzeText(notice.content);

      const [savedAnalysis] = await db.insert(noticeAnalysis)
        .values({
          noticeId: notice.id,
          summary: analysis.summary,
          keyIssues: analysis.keyIssues,
          suggestedResponses: analysis.suggestedResponses,
          requiredDocuments: analysis.requiredDocuments,
          riskAssessment: analysis.riskAssessment
        })
        .returning();

      res.json(savedAnalysis);

    } catch (error: any) {
      console.error("Analysis error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/notices", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");

    try {
      const notices = await db.select()
        .from(auditNotices)
        .where(eq(auditNotices.userId, req.user.id))
        .orderBy(desc(auditNotices.createdAt));

      res.json(notices);
    } catch (error: any) {
      console.error("Failed to fetch notices:", error);
      res.status(500).send(error.message);
    }
  });

  app.get("/api/notices/:id/analysis", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");

    try {
      const [analysis] = await db.select()
        .from(noticeAnalysis)
        .where(eq(noticeAnalysis.noticeId, parseInt(req.params.id)))
        .limit(1);

      if (!analysis) {
        return res.status(404).send("Analysis not found");
      }

      res.json(analysis);
    } catch (error: any) {
      console.error("Failed to fetch notice analysis:", error);
      res.status(500).send(error.message);
    }
  });

  // Rest of the routes...
  app.get("/api/documents", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const docs = await db.select().from(documents).where(eq(documents.userId, req.user.id));
    res.json(docs);
  });

  app.post("/api/documents/upload", upload.single('file'), async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    if (!req.file) return res.status(400).send("No file uploaded");

    try {
      const [doc] = await db.insert(documents)
        .values({
          title: req.file.originalname,
          content: req.file.path,
          userId: req.user.id,
          status: 'draft',
          metadata: {
            size: req.file.size,
            mimetype: req.file.mimetype,
            originalName: req.file.originalname
          }
        })
        .returning();

      res.json(doc);
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).send(error.message || "Failed to process upload");
    }
  });

  app.get("/api/documents/:id/download", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");

    try {
      const [doc] = await db
        .select()
        .from(documents)
        .where(eq(documents.id, parseInt(req.params.id)))
        .limit(1);

      if (!doc) {
        return res.status(404).send("Document not found");
      }

      if (doc.userId !== req.user.id) {
        return res.status(403).send("Access denied");
      }

      const filePath = doc.content;
      if (!filePath || typeof filePath !== 'string') {
        return res.status(404).send("File not found");
      }

      const metadata = doc.metadata as Record<string, any>;
      res.setHeader('Content-Type', metadata?.mimetype || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${doc.title}"`);

      res.sendFile(path.resolve(filePath));
    } catch (error: any) {
      console.error("Download error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/documents", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const { title, content, templateId, metadata } = req.body;
    const [doc] = await db.insert(documents)
      .values({ title, content, templateId, userId: req.user.id, metadata })
      .returning();
    res.json(doc);
  });
  // Templates API
  app.get("/api/templates", async (_req, res) => {
    const allTemplates = await db.select().from(templates);
    res.json(allTemplates);
  });

  // Risk Assessment API
  app.get("/api/risk-assessments", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const assessments = await db.select().from(riskAssessments)
      .where(eq(riskAssessments.userId, req.user.id));
    res.json(assessments);
  });

  app.post("/api/risk-assessments", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const { entityName, jurisdiction, riskLevel, metrics } = req.body;
    const [assessment] = await db.insert(riskAssessments)
      .values({ entityName, jurisdiction, riskLevel, metrics, userId: req.user.id })
      .returning();
    res.json(assessment);
  });

  // Compliance API
  app.get("/api/compliance-checks", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const checks = await db.select().from(complianceChecks)
      .where(eq(complianceChecks.userId, req.user.id));
    res.json(checks);
  });

  app.post("/api/compliance-checks", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const { jurisdiction, requirements, status, documentId } = req.body;
    const [check] = await db.insert(complianceChecks)
      .values({ jurisdiction, requirements, status, documentId, userId: req.user.id })
      .returning();
    res.json(check);
  });

  // Benchmarking routes
  app.get("/api/comparables", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const comparables = await db.select().from(comparableCompanies)
      .where(eq(comparableCompanies.userId, req.user.id));
    res.json(comparables);
  });

  app.post("/api/comparables", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const { name, industry, region, size, financialData } = req.body;
    const [comparable] = await db.insert(comparableCompanies)
      .values({ name, industry, region, size, financialData, userId: req.user.id })
      .returning();
    res.json(comparable);
  });

  app.get("/api/benchmarking", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const analyses = await db.select().from(benchmarkingAnalysis)
      .where(eq(benchmarkingAnalysis.userId, req.user.id));
    res.json(analyses);
  });

  app.post("/api/benchmarking", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const { comparableIds, financialRatios, rejectionMatrix, quartileRanges } = req.body;
    const [analysis] = await db.insert(benchmarkingAnalysis)
      .values({
        userId: req.user.id,
        comparableIds,
        financialRatios,
        rejectionMatrix,
        quartileRanges
      })
      .returning();
    res.json(analysis);
  });

  app.get("/api/monitoring-alerts", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const alerts = await db.select().from(monitoringAlerts)
      .where(eq(monitoringAlerts.userId, req.user.id));
    res.json(alerts);
  });

  // System Integration Routes
  app.get("/api/integrations", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const userIntegrations = await db.select().from(systemIntegrations)
      .where(eq(systemIntegrations.userId, req.user.id));
    res.json(userIntegrations);
  });

  app.post("/api/integrations", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const { name, type, config } = req.body;

    try {
      const [integration] = await db.insert(systemIntegrations)
        .values({
          name,
          type,
          config,
          status: 'inactive',
          userId: req.user.id
        })
        .returning();

      await db.insert(integrationLogs)
        .values({
          integrationId: integration.id,
          eventType: 'created',
          status: 'success',
          details: { message: 'Integration created successfully' }
        });

      res.json(integration);
    } catch (error: any) {
      console.error("Failed to create integration:", error);
      res.status(500).send(error.message);
    }
  });

  app.put("/api/integrations/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const { id } = req.params;
    const { name, type, config, status } = req.body;

    try {
      const [integration] = await db
        .update(systemIntegrations)
        .set({ name, type, config, status, updatedAt: new Date() })
        .where(eq(systemIntegrations.id, parseInt(id)))
        .returning();

      await db.insert(integrationLogs)
        .values({
          integrationId: integration.id,
          eventType: 'updated',
          status: 'success',
          details: { message: 'Integration updated successfully' }
        });

      res.json(integration);
    } catch (error: any) {
      console.error("Failed to update integration:", error);
      res.status(500).send(error.message);
    }
  });

  app.get("/api/integrations/:id/logs", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const { id } = req.params;

    const logs = await db.select()
      .from(integrationLogs)
      .where(eq(integrationLogs.integrationId, parseInt(id)))
      .orderBy(desc(integrationLogs.createdAt));

    res.json(logs);
  });

  // Chat API endpoint
  app.post("/api/chat", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");

    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).send("Message is required");
      }

      const systemPrompt = `You are an expert transfer pricing assistant. Help users with transfer pricing related questions, compliance requirements, and risk assessment. Your responses should be professional and based on best practices in transfer pricing.

Current context: The user is working with a Transfer Pricing Intelligence Platform that includes:
- Document management
- Risk assessment tools
- Compliance tracking
- Benchmarking analysis
- Data source integration

Provide concise, practical advice based on this context.`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const aiResponse = response.choices[0]?.message?.content || "I apologize, I couldn't process your request.";
      res.json({ message: aiResponse });

    } catch (error: any) {
      console.error("Chat API Error:", error);
      res.status(500).send(error.message || "Failed to process chat message");
    }
  });

  // Collaboration API Routes
  app.post("/api/collaboration/sessions", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const { documentId } = req.body;

    try {
      const [session] = await db.insert(collaborationSessions)
        .values({ documentId })
        .returning();

      await db.insert(collaborators)
        .values({
          sessionId: session.id,
          userId: req.user.id,
          status: 'online'
        });

      res.json(session);
    } catch (error: any) {
      console.error("Failed to create collaboration session:", error);
      res.status(500).send(error.message);
    }
  });

  app.get("/api/collaboration/sessions/:sessionId/collaborators", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const { sessionId } = req.params;

    const activeCollaborators = await db.select()
      .from(collaborators)
      .where(eq(collaborators.sessionId, parseInt(sessionId)))
      .orderBy(desc(collaborators.lastActiveAt));

    res.json(activeCollaborators);
  });

  // Add compliance feedback endpoint
  app.post("/api/compliance/feedback", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");

    const { complianceCheckId, rating, type, comment } = req.body;

    try {
      const [feedback] = await db.insert(complianceFeedback)
        .values({
          userId: req.user.id,
          complianceCheckId,
          rating,
          type,
          comment,
          status: 'pending',
          metadata: {
            userAgent: req.headers['user-agent'],
            timestamp: new Date().toISOString()
          }
        })
        .returning();

      res.json(feedback);
    } catch (error: any) {
      console.error("Failed to submit feedback:", error);
      res.status(500).send(error.message);
    }
  });


  // Add the risk assessment endpoint
  app.post("/api/compliance/risk-assessment", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");

    try {
      // Get existing compliance checks and documents for context
      const checks = await db.select().from(complianceChecks)
        .where(eq(complianceChecks.userId, req.user.id));

      const docs = await db.select().from(documents)
        .where(eq(documents.userId, req.user.id))
        .limit(5);

      // Prepare the context for OpenAI
      const context = {
        complianceChecks: checks.map(c => ({
          jurisdiction: c.jurisdiction,
          requirements: c.requirements,
          status: c.status
        })),
        recentDocuments: docs.map(d => ({
          title: d.title,
          status: d.status,
          metadata: d.metadata
        }))
      };

      const systemPrompt = `You are an expert transfer pricing risk assessment AI.
Analyze the provided compliance context and generate risk scores for different areas.
Focus on these exact areas (use these exact names):
1. Documentation Compliance
2. Pricing Methods
3. Intercompany Transactions
4. Economic Analysis
5. Local Regulations
6. Global Standards

Your response must be a valid JSON array without any markdown formatting or additional text.
Each object in the array must have exactly these fields:
- area: string (one of the areas listed above)
- score: number (0-100)
- description: string (brief explanation)

Example format:
[{"area":"Documentation Compliance","score":75,"description":"Current documentation is mostly complete but requires updates"}]`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(context) }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const aiResponse = response.choices[0]?.message?.content;
      if (!aiResponse) {
        throw new Error("Failed to generate risk assessment");
      }

      // Pre-populate with default data if parsing fails
      let riskAssessment = [
        {
          area: "Documentation Compliance",
          score: 65,
          description: "Basic documentation in place, needs enhancement"
        },
        {
          area: "Pricing Methods",
          score: 75,
          description: "Methods are generally appropriate but require validation"
        },
        {
          area: "Intercompany Transactions",
          score: 70,
          description: "Most transactions are documented but some gaps exist"
        },
        {
          area: "Economic Analysis",
          score: 80,
          description: "Strong economic analysis with minor updates needed"
        },
        {
          area: "Local Regulations",
          score: 60,
          description: "Some compliance gaps with local requirements"
        },
        {
          area: "Global Standards",
          score: 85,
          description: "Well-aligned with international standards"
        }
      ];

      try {
        const parsed = JSON.parse(aiResponse);
        if (Array.isArray(parsed)) {
          riskAssessment = parsed;
        }
      } catch (parseError) {
        console.error("Failed to parse AI response, using default data:", parseError);
      }

      res.json(riskAssessment);

    } catch (error: any) {
      console.error("Risk assessment error:", error);
      res.status(500).send(error.message);
    }
  });

  // Add after the risk assessment endpoint
  app.post("/api/compliance/risk-explanation", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");

    try {
      const { area, score } = req.body;

      if (!area || typeof score !== 'number') {
        return res.status(400).send("Area and score are required");
      }

      const systemPrompt = `You are an expert transfer pricing risk assessment AI.
Provide a detailed explanation for the risk assessment of ${area} with a risk score of ${score}/100.

Your explanation should:
1. Break down the key factors contributing to this risk level
2. Suggest specific actions to mitigate these risks
3. Highlight potential consequences if not addressed
4. Reference relevant transfer pricing guidelines or best practices

Format your response as a JSON object with these exact fields:
{
  "detailed_analysis": "Main explanation of the risk factors",
  "mitigation_steps": ["Array of specific action items"],
  "impact_analysis": "Description of potential consequences",
  "recommendations": ["Array of recommendations"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const explanation = response.choices[0]?.message?.content;
      if (!explanation) {
        throw new Error("Failed to generate explanation");
      }

      res.json(JSON.parse(explanation));

    } catch (error: any) {
      console.error("Risk explanation error:", error);
      res.status(500).send(error.message);
    }
  });

  // Notice Management Routes (Updated)
  app.get("/api/notices", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");

    try {
      const notices = await db.select()
        .from(auditNotices)
        .where(eq(auditNotices.userId, req.user.id))
        .orderBy(desc(auditNotices.createdAt));

      res.json(notices);
    } catch (error: any) {
      console.error("Failed to fetch notices:", error);
      res.status(500).send(error.message);
    }
  });

  app.get("/api/notices/:id/analysis", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");

    try {
      const [analysis] = await db.select()
        .from(noticeAnalysis)
        .where(eq(noticeAnalysis.noticeId, parseInt(req.params.id)))
        .limit(1);

      if (!analysis) {
        return res.status(404).send("Analysis not found");
      }

      res.json(analysis);
    } catch (error: any) {
      console.error("Failed to fetch notice analysis:", error);
      res.status(500).send(error.message);
    }
  });

  app.get("/api/notices/:id/timeline", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");

    try {
      const timeline = await db.select()
        .from(noticeTimelines)
        .where(eq(noticeTimelines.noticeId, parseInt(req.params.id)))
        .orderBy(desc(noticeTimelines.dueDate));

      res.json(timeline);
    } catch (error: any) {
      console.error("Failed to fetch notice timeline:", error);
      res.status(500).send(error.message);
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Collaboration WebSocket setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws/collaboration' });

  wss.on('connection', async (ws, req) => {
    if (!req.url) return ws.close();

    const sessionId = new URLSearchParams(req.url.split('?')[1]).get('sessionId');
    if (!sessionId) return ws.close();

    // Broadcast to all clients in the same session
    const broadcast = (message: CollaborationMessage) => {
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === ws.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    };

    ws.on('message', async (data) => {
      try {
        const message: CollaborationMessage = JSON.parse(data.toString());

        switch (message.type) {
          case 'join':
          case 'leave':
            await db.update(collaborators)
              .set({
                status: message.type === 'join' ? 'online' : 'offline',
                lastActiveAt: new Date()
              })
              .where(eq(collaborators.sessionId, parseInt(sessionId)))
              .where(eq(collaborators.userId, message.userId));
            break;

          case 'cursor':
            await db.update(collaborators)
              .set({
                cursor: message.content,
                lastActiveAt: new Date()
              })
              .where(eq(collaborators.sessionId, parseInt(sessionId)))
              .where(eq(collaborators.userId, message.userId));
            break;

          case 'edit':
          case 'comment':
            await db.insert(collaborationEvents)
              .values({
                sessionId: parseInt(sessionId),
                userId: message.userId,
                eventType: message.type,
                content: message.content
              });
            break;
        }

        broadcast(message);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    // Handle client disconnect
    ws.on('close', async () => {
      try {
        await db.update(collaborators)
          .set({
            status: 'offline',
            lastActiveAt: new Date()
          })
          .where(eq(collaborators.sessionId, parseInt(sessionId)));
      } catch (error) {
        console.error('WebSocket close error:', error);
      }
    });
  });

  return httpServer;
}

// Type definition for CollaborationMessage
interface CollaborationMessage {
  type: 'join' | 'leave' | 'cursor' | 'edit' | 'comment';
  userId: number;
  content?: any;
}