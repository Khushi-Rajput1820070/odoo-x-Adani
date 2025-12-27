import { Collection, WithId } from 'mongodb';
import { getDb } from './mongo';
import {
  User,
  Team,
  Equipment,
  MaintenanceRequest,
  EquipmentCategory,
  WorkCenter,
  Notification,
  TrackingLog,
  Requirement,
} from './types';
import { randomUUID } from 'crypto';

type CollectionKey =
  | 'users'
  | 'teams'
  | 'equipment'
  | 'requests'
  | 'categories'
  | 'workcenters'
  | 'notifications'
  | 'trackingLogs'
  | 'requirements';

type CollectionType<K extends CollectionKey> =
  K extends 'users' ? User :
  K extends 'teams' ? Team :
  K extends 'equipment' ? Equipment :
  K extends 'requests' ? MaintenanceRequest :
  K extends 'categories' ? EquipmentCategory :
  K extends 'workcenters' ? WorkCenter :
  K extends 'notifications' ? Notification :
  K extends 'trackingLogs' ? TrackingLog :
  K extends 'requirements' ? Requirement : never;

// Helper to remove MongoDB's _id field from the response
function sanitizeDoc<T>(doc: WithId<T> | null): T | null {
  if (!doc) return null;
  const { _id, ...rest } = doc as any;
  return rest as T;
}

async function getCollection<K extends CollectionKey>(key: K): Promise<Collection<CollectionType<K>>> {
  const db = await getDb();
  return db.collection<CollectionType<K>>(key);
}

export class DB {
  // Generic helpers
  static async getAll<K extends CollectionKey>(key: K): Promise<CollectionType<K>[]> {
    const col = await getCollection(key);
    const docs = await col.find({}).toArray();
    return docs.map(doc => sanitizeDoc(doc) as CollectionType<K>);
  }

  static async getById<K extends CollectionKey>(key: K, id: string): Promise<CollectionType<K> | null> {
    const col = await getCollection(key);
    const doc = await col.findOne({ id } as any);
    return sanitizeDoc(doc as WithId<CollectionType<K>>) as CollectionType<K> | null;
  }

  static async upsert<K extends CollectionKey>(key: K, item: CollectionType<K>): Promise<void> {
    const col = await getCollection(key);
    const id = (item as any).id;
    if (!id) throw new Error(`Cannot upsert item without id in collection ${key}`);
    await col.updateOne(
      { id } as any,
      { $set: item },
      { upsert: true }
    );
  }

  static async setAll<K extends CollectionKey>(key: K, items: CollectionType<K>[]): Promise<void> {
    const col = await getCollection(key);
    await col.deleteMany({});
    if (items.length > 0) {
      await col.insertMany(items as any[]);
    }
  }

  // Specialized methods that mirror previous behavior
  static async getTrackingLogs(requestId: string): Promise<TrackingLog[]> {
    const col = await getCollection('trackingLogs');
    const docs = await col.find({ requestId }).toArray();
    return docs.map(doc => sanitizeDoc(doc) as TrackingLog);
  }

  static async addTrackingLog(requestId: string, log: Omit<TrackingLog, 'requestId'>): Promise<void> {
    const col = await getCollection('trackingLogs');
    await col.insertOne({
      ...log,
      requestId,
      id: log.id || randomUUID(),
      createdAt: (log as any).createdAt || new Date().toISOString()
    } as any);
  }

  static async updateTrackingLog(logId: string, log: Partial<TrackingLog>): Promise<void> {
    const col = await getCollection('trackingLogs');
    await col.updateOne(
      { id: logId } as any,
      { $set: { ...log, updatedAt: new Date().toISOString() } }
    );
  }

  static async deleteTrackingLog(logId: string): Promise<void> {
    const col = await getCollection('trackingLogs');
    await col.deleteOne({ id: logId } as any);
  }

  static async getRequirements(requestId: string): Promise<Requirement[]> {
    const col = await getCollection('requirements');
    const docs = await col.find({ requestId }).toArray();
    return docs.map(doc => sanitizeDoc(doc) as Requirement);
  }

  static async addRequirement(requestId: string, requirement: Omit<Requirement, 'requestId'>): Promise<void> {
    const col = await getCollection('requirements');
    await col.insertOne({
      ...requirement,
      requestId,
      id: requirement.id || randomUUID(),
      createdAt: (requirement as any).createdAt || new Date().toISOString()
    } as any);
  }

  static async updateRequirement(reqId: string, requirement: Partial<Requirement>): Promise<void> {
    const col = await getCollection('requirements');
    await col.updateOne(
      { id: reqId } as any,
      { $set: { ...requirement, updatedAt: new Date().toISOString() } }
    );
  }

  static async deleteRequirement(reqId: string): Promise<void> {
    const col = await getCollection('requirements');
    await col.deleteOne({ id: reqId } as any);
  }
}