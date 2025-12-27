import { MongoClient, Db } from 'mongodb';

const DEFAULT_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://lovelyblinks2007_db_user:oddo_adani@cluster0.xfpgxlr.mongodb.net/';
const DB_NAME = process.env.MONGODB_DB_NAME || 'gearguard';

let client: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb;

  const uri = DEFAULT_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }

  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }

  cachedDb = client.db(DB_NAME);
  return cachedDb;
}