import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { documents, templates, riskAssessments, complianceChecks, comparableCompanies, benchmarkingAnalysis, monitoringAlerts, systemIntegrations, integrationLogs, collaborationSessions, collaborators, collaborationEvents } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import OpenAI from "openai";
import { WebSocketServer } from 'ws';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

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

const upload = multer({ storage });

// Ensure uploads directory exists
fs.mkdir('uploads', { recursive: true }).catch(console.error);

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Documents API
  app.get("/api/documents", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const docs = await db.select().from(documents).where(eq(documents.userId, req.user.id));
    res.json(docs);
  });

  // File upload endpoint
  app.post("/api/documents/upload", upload.single('file'), async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    if (!req.file) return res.status(400).send("No file uploaded");

    try {
      // Store file metadata and path in the database
      const [doc] = await db.insert(documents)
        .values({
          title: req.file.originalname,
          content: req.file.path, // Store the file path
          userId: req.user.id,
          metadata: {
            size: req.file.size,
            mimetype: req.file.mimetype,
            originalName: req.file.originalname
          }
        })
        .returning();

      res.json(doc);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).send("Failed to process upload");
    }
  });

  // File download endpoint
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

      // Verify user has access to this document
      if (doc.userId !== req.user.id) {
        return res.status(403).send("Access denied");
      }

      const filePath = doc.content;
      if (!filePath || typeof filePath !== 'string') {
        return res.status(404).send("File not found");
      }

      // Set appropriate headers for the file download
      res.setHeader('Content-Type', doc.metadata?.mimetype || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${doc.title}"`);

      // Stream the file to the response
      res.sendFile(path.resolve(filePath));
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).send("Failed to download file");
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

  // Create HTTP server
  const httpServer = createServer(app);

  // Setup WebSocket server
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

//Type definition for CollaborationMessage
interface CollaborationMessage {
    type: 'join' | 'leave' | 'cursor' | 'edit' | 'comment';
    userId: number;
    content?: any;
}