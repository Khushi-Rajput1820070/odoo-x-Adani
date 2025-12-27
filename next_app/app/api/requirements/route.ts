import { NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get('requestId');
  const id = searchParams.get('id');
  
  if (id) {
    // Get specific requirement by ID
    const allRequirements = await DB.getAll('requirements');
    const specificReq = allRequirements.find((req: any) => req.id === id);
    return NextResponse.json(specificReq || null);
  }
  
  if (requestId) {
    const requirements = await DB.getRequirements(requestId);
    return NextResponse.json(requirements);
  }
  
  const requirements = await DB.getAll('requirements');
  return NextResponse.json(requirements);
}

export async function POST(request: Request) {
  const data = await request.json();
  data.id = data.id || randomUUID();
  data.createdAt = data.createdAt || new Date().toISOString();
  data.status = data.status || 'pending';
  
  // Use the specialized DB method for requirements
  await DB.addRequirement(data.requestId, data);
  
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const data = await request.json();
  
  // Use the specialized DB method for updating requirements
  await DB.updateRequirement(data.id, data);
  
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (id) {
    // Use the specialized DB method for deleting requirements
    await DB.deleteRequirement(id);
    
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: 'ID parameter required' }, { status: 400 });
}