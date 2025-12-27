import { NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get('requestId');
  const id = searchParams.get('id');
  
  if (id) {
    // Get specific tracking log by ID
    const allLogs = await DB.getAll('trackingLogs');
    const specificLog = allLogs.find((log: any) => log.id === id);
    return NextResponse.json(specificLog || null);
  }
  
  if (requestId) {
    const trackingLogs = await DB.getTrackingLogs(requestId);
    return NextResponse.json(trackingLogs);
  }
  
  const trackingLogs = await DB.getAll('trackingLogs');
  return NextResponse.json(trackingLogs);
}

export async function POST(request: Request) {
  const data = await request.json();
  data.id = data.id || randomUUID();
  data.createdAt = data.createdAt || new Date().toISOString();
  
  // Use the specialized DB method for tracking logs
  await DB.addTrackingLog(data.requestId, data);
  
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const data = await request.json();
  
  // Use the specialized DB method for updating tracking logs
  await DB.updateTrackingLog(data.id, data);
  
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (id) {
    // Use the specialized DB method for deleting tracking logs
    await DB.deleteTrackingLog(id);
    
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: 'ID parameter required' }, { status: 400 });
}