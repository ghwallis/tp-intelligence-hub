import { MongoClient, Db } from 'mongodb';
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import { log } from '../../server/vite';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { dirname } = path;

// Validate required environment variables
const requiredEnvVars = [
  'DOCDB_CLUSTER_ENDPOINT',
  'DOCDB_USERNAME',
  'DOCDB_PASSWORD',
  'AWS_REGION'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} must be set in environment variables`);
  }
}

let db: Db | null = null;

export async function connectToDocDB(): Promise<Db> {
  if (db) return db;

  try {
    // Construct the DocumentDB connection URL
    const connectionUrl = `mongodb://${process.env.DOCDB_USERNAME}:${
      process.env.DOCDB_PASSWORD
    }@${process.env.DOCDB_CLUSTER_ENDPOINT}/transfer_pricing_db?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`;

    // Create MongoDB client with AWS DocumentDB specific options
    const client = await MongoClient.connect(connectionUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      tlsCAFile: path.join(__dirname, '../rds-combined-ca-bundle.pem')
    });

    db = client.db('transfer_pricing_db');
    log('AWS DocumentDB connected successfully');
    return db;
  } catch (error) {
    console.error('DocumentDB connection error:', error);
    throw error;
  }
}

export async function getDocDB(): Promise<Db> {
  if (!db) {
    return connectToDocDB();
  }
  return db;
}

// Helper function to verify connection
export async function checkDocDBConnection(): Promise<boolean> {
  try {
    const database = await getDocDB();
    await database.command({ ping: 1 });
    return true;
  } catch (error) {
    console.error('DocumentDB connection check failed:', error);
    return false;
  }
}

// Helper function to download CA certificate if not exists
async function downloadCACertificate(): Promise<void> {
  const certPath = path.join(__dirname, '../rds-combined-ca-bundle.pem');
  try {
    await fs.access(certPath);
  } catch {
    // Certificate doesn't exist, download it
    const response = await fetch('https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem');
    const cert = await response.text();
    await fs.writeFile(certPath, cert);
  }
}

// Initialize connection prerequisites
downloadCACertificate().catch(console.error);
