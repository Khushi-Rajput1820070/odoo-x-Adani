import { NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (userId) {
    const notifications = await DB.getAll('notifications');
    const userNotifications = notifications.filter(n => n.userId === userId);
    return NextResponse.json(userNotifications);
  }
  
  const notifications = await DB.getAll('notifications');
  return NextResponse.json(notifications);
}

export async function POST(request: Request) {
  const data = await request.json();
  data.id = data.id || randomUUID();
  data.createdAt = data.createdAt || new Date().toISOString();
  data.isRead = data.isRead || false;
  
  const notifications = await DB.getAll('notifications');
  notifications.push(data);
  await DB.setAll('notifications', notifications);
  
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const data = await request.json();
  let notifications = await DB.getAll('notifications');
  notifications = notifications.map((n: any) => n.id === data.id ? data : n);
  await DB.setAll('notifications', notifications);
  
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (id) {
    let notifications = await DB.getAll('notifications');
    notifications = notifications.filter((n: any) => n.id !== id);
    await DB.setAll('notifications', notifications);
    
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: 'ID parameter required' }, { status: 400 });
}