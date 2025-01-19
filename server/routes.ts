import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { documents, templates, riskAssessments, complianceChecks, comparableCompanies, benchmarkingAnalysis, monitoringAlerts } from "@db/schema";
import { eq } from "drizzle-orm";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Documents API
  app.get("/api/documents", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const docs = await db.select().from(documents).where(eq(documents.userId, req.user.id));
    res.json(docs);
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

  const httpServer = createServer(app);
  return httpServer;
}