import { NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const teamId = searchParams.get('teamId');
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  
  if (id) {
    const equipment = await DB.getById('equipment', id);
    return NextResponse.json(equipment);
  }
  
  let equipment = await DB.getAll('equipment');
  
  if (teamId) {
    equipment = equipment.filter(e => e.maintenanceTeamId === teamId);
  }
  
  if (status) {
    equipment = equipment.filter(e => e.status === status);
  }
  
  if (category) {
    equipment = equipment.filter(e => e.category === category);
  }
  
  return NextResponse.json(equipment);
}

export async function POST(request: Request) {
  const data = await request.json();
  data.id = data.id || randomUUID();
  data.status = data.status || 'Active';
  data.createdAt = data.createdAt || new Date().toISOString();
  
  const equipment = await DB.getAll('equipment');
  equipment.push(data);
  await DB.setAll('equipment', equipment);
  
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const data = await request.json();
  let equipment = await DB.getAll('equipment');
  equipment = equipment.map((e: any) => e.id === data.id ? data : e);
  await DB.setAll('equipment', equipment);
  
  // If equipment is marked as scrapped, update related requests
  if (data.status === 'Scrapped') {
    const requests = await DB.getAll('requests');
    const updatedRequests = requests.map((req: any) => {
      if (req.equipmentId === data.id && req.maintenanceFor === 'Equipment') {
        req.stage = 'Scrap';
      }
      return req;
    });
    await DB.setAll('requests', updatedRequests);
  }
  
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (id) {
    let equipment = await DB.getAll('equipment');
    equipment = equipment.filter((e: any) => e.id !== id);
    await DB.setAll('equipment', equipment);
    
    // Also remove related requests
    let requests = await DB.getAll('requests');
    requests = requests.filter((r: any) => r.equipmentId !== id);
    await DB.setAll('requests', requests);
    
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: 'ID parameter required' }, { status: 400 });
}