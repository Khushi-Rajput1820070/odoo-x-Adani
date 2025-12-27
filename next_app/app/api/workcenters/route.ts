import { NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (id) {
    const workcenter = await DB.getById('workcenters', id);
    return NextResponse.json(workcenter);
  }
  
  const workcenters = await DB.getAll('workcenters');
  return NextResponse.json(workcenters);
}

export async function POST(request: Request) {
  const data = await request.json();
  data.id = data.id || randomUUID();
  
  const workcenters = await DB.getAll('workcenters');
  workcenters.push(data);
  await DB.setAll('workcenters', workcenters);
  
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const data = await request.json();
  let workcenters = await DB.getAll('workcenters');
  workcenters = workcenters.map((w: any) => w.id === data.id ? data : w);
  await DB.setAll('workcenters', workcenters);
  
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (id) {
    let workcenters = await DB.getAll('workcenters');
    workcenters = workcenters.filter((w: any) => w.id !== id);
    await DB.setAll('workcenters', workcenters);
    
    // Update requests that were assigned to this workcenter
    let requests = await DB.getAll('requests');
    requests = requests.map((r: any) => {
      if (r.workCenterId === id) {
        r.workCenterId = null; // Clear workcenter assignment
      }
      return r;
    });
    await DB.setAll('requests', requests);
    
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: 'ID parameter required' }, { status: 400 });
}