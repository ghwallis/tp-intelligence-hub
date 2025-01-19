import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { documents, templates, riskAssessments, complianceChecks } from "@db/schema";
import { eq } from "drizzle-orm";

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

  const httpServer = createServer(app);
  return httpServer;
}
