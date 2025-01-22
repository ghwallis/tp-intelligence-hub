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

export interface TPDocumentGeneration {
  templateId: string;
  parameters: {
    countryCode: string;
    fiscalYear: string;
    entityName: string;
    customFields: Record<string, any>;
  };
  generatedContent?: string;
  status: 'pending' | 'completed' | 'failed';
  generatedAt?: Date;
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

export interface DocDBDocument {
  _id?: ObjectId;
  documentId: string;        // Reference to PostgreSQL document ID
  content: string;
  versions: DocumentVersion[];
  translations: DocumentTranslation[];
  aiAnalysis: AIAnalysis;
  tpDocumentGeneration?: TPDocumentGeneration;
  createdAt: Date;
  updatedAt: Date;
}

// Collection names as constants to avoid typos
export const COLLECTIONS = {
  DOCUMENTS: 'documents',
  TEMPLATES: 'templates',
  TP_DOCUMENTS: 'tp_documents'
} as const;

// Indexes to be created
export const INDEXES = {
  DOCUMENTS: [
    { key: { documentId: 1 }, unique: true },
    { key: { "versions.version": 1 } },
    { key: { "translations.language": 1 } },
    { key: { createdAt: -1 } }
  ],
  TEMPLATES: [
    { key: { countryCode: 1 } },
    { key: { templateType: 1 } }
  ],
  TP_DOCUMENTS: [
    { key: { "parameters.countryCode": 1 } },
    { key: { "parameters.fiscalYear": 1 } },
    { key: { status: 1 } }
  ]
} as const;
