import { ObjectId } from 'mongodb';

export interface DocumentVersion {
  version: number;
  content: string;
  timestamp: Date;
  changes?: {
    added: string[];
    removed: string[];
    modified: string[];
  };
}

export interface DocumentTranslation {
  language: string;
  content: string;
  version: number;
}

export interface AIAnalysis {
  sentiment?: {
    score: number;
    label: string;
    keyPhrases: string[];
  };
  structure?: {
    sections: string[];
    keyPoints: string[];
    recommendations: string[];
  };
  riskIndicators?: string[];
}

export interface MongoDocument {
  _id?: ObjectId;
  documentId: string;        // Reference to PostgreSQL document ID
  content: string;
  versions: DocumentVersion[];
  translations: DocumentTranslation[];
  aiAnalysis: AIAnalysis;
  createdAt: Date;
  updatedAt: Date;
}

// Collection names as constants to avoid typos
export const COLLECTIONS = {
  DOCUMENTS: 'documents',
  TEMPLATES: 'templates',
} as const;
