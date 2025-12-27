import { NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (id) {
    const team = await DB.getById('teams', id);
    return NextResponse.json(team);
  }
  
  const teams = await DB.getAll('teams');
  return NextResponse.json(teams);
}

export async function POST(request: Request) {
  const data = await request.json();
  data.id = data.id || randomUUID();
  data.createdAt = data.createdAt || new Date().toISOString();
  data.memberIds = data.memberIds || [];
  
  const teams = await DB.getAll('teams');
  teams.push(data);
  await DB.setAll('teams', teams);
  
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const data = await request.json();
  let teams = await DB.getAll('teams');
  teams = teams.map((t: any) => t.id === data.id ? data : t);
  await DB.setAll('teams', teams);
  
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (id) {
    let teams = await DB.getAll('teams');
    teams = teams.filter((t: any) => t.id !== id);
    await DB.setAll('teams', teams);
    
    // Update equipment that was assigned to this team
    let equipment = await DB.getAll('equipment');
    equipment = equipment.map((e: any) => {
      if (e.maintenanceTeamId === id) {
        e.maintenanceTeamId = ''; // Clear team assignment
      }
      return e;
    });
    await DB.setAll('equipment', equipment);
    
    // Update requests that were assigned to this team
    let requests = await DB.getAll('requests');
    requests = requests.map((r: any) => {
      if (r.teamId === id) {
        r.teamId = ''; // Clear team assignment
      }
      return r;
    });
    await DB.setAll('requests', requests);
    
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: 'ID parameter required' }, { status: 400 });
}