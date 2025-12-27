import { NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (id) {
    const user = await DB.getById('users', id);
    return NextResponse.json(user);
  }
  
  const users = await DB.getAll('users');
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const data = await request.json();
  data.id = data.id || randomUUID();
  data.createdAt = data.createdAt || new Date().toISOString();
  data.role = data.role || 'user';
  
  const users = await DB.getAll('users');
  users.push(data);
  await DB.setAll('users', users);
  
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const data = await request.json();
  let users = await DB.getAll('users');
  users = users.map((u: any) => u.id === data.id ? data : u);
  await DB.setAll('users', users);
  
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (id) {
    let users = await DB.getAll('users');
    users = users.filter((u: any) => u.id !== id);
    await DB.setAll('users', users);
    
    // Remove user from teams
    let teams = await DB.getAll('teams');
    teams = teams.map((t: any) => {
      t.memberIds = t.memberIds.filter((memberId: string) => memberId !== id);
      return t;
    });
    await DB.setAll('teams', teams);
    
    // Update requests assigned to this user
    let requests = await DB.getAll('requests');
    requests = requests.map((r: any) => {
      if (r.assignedToUserId === id) {
        r.assignedToUserId = null; // Clear user assignment
      }
      return r;
    });
    await DB.setAll('requests', requests);
    
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: 'ID parameter required' }, { status: 400 });
}