import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  userId: integer("user_id").references(() => users.id),
  templateId: integer("template_id").references(() => templates.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata")
});

export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const riskAssessments = pgTable("risk_assessments", {
  id: serial("id").primaryKey(),
  entityName: text("entity_name").notNull(),
  jurisdiction: text("jurisdiction").notNull(),
  riskLevel: text("risk_level").notNull(),
  metrics: jsonb("metrics").notNull(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow()
});

export const complianceChecks = pgTable("compliance_checks", {
  id: serial("id").primaryKey(),
  jurisdiction: text("jurisdiction").notNull(),
  requirements: jsonb("requirements").notNull(),
  status: text("status").notNull(),
  userId: integer("user_id").references(() => users.id),
  documentId: integer("document_id").references(() => documents.id),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Document = typeof documents.$inferSelect;
export type Template = typeof templates.$inferSelect;
export type RiskAssessment = typeof riskAssessments.$inferSelect;
export type ComplianceCheck = typeof complianceChecks.$inferSelect;
