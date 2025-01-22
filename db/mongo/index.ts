import { MongoClient, Db } from 'mongodb';
import { log } from '../../server/vite';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI must be set in environment variables');
}

let db: Db | null = null;

export async function connectToMongo(): Promise<Db> {
  if (db) return db;

  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    db = client.db('transfer_pricing_db');
    log('MongoDB connected successfully');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function getMongoDb(): Promise<Db> {
  if (!db) {
    return connectToMongo();
  }
  return db;
}
