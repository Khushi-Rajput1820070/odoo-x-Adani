import { NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { randomUUID } from 'crypto';
import { Notification, NotificationType } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const equipmentId = searchParams.get('equipmentId');
  const teamId = searchParams.get('teamId');
  const stage = searchParams.get('stage');
  const type = searchParams.get('type');
  const assignedToUserId = searchParams.get('assignedToUserId');
  
  if (id) {
    const requestItem = await DB.getById('requests', id);
    return NextResponse.json(requestItem);
  }
  
  let requests = await DB.getAll('requests');
  
  if (equipmentId) {
    requests = requests.filter(r => r.equipmentId === equipmentId);
  }
  
  if (teamId) {
    requests = requests.filter(r => r.teamId === teamId);
  }
  
  if (stage) {
    requests = requests.filter(r => r.stage === stage);
  }
  
  if (type) {
    requests = requests.filter(r => r.type === type);
  }
  
  if (assignedToUserId) {
    requests = requests.filter(r => r.assignedToUserId === assignedToUserId);
  }
  
  // Calculate overdue status
  requests = requests.map((req: any) => {
    if (req.scheduledDate && req.stage !== 'Repaired' && req.stage !== 'Scrap') {
      const scheduledDate = new Date(req.scheduledDate);
      const now = new Date();
      req.isOverdue = scheduledDate < now;
    }
    return req;
  });
  
  return NextResponse.json(requests);
}

export async function POST(request: Request) {
  const data = await request.json();
  data.id = data.id || randomUUID();
  data.stage = data.stage || 'New';
  data.createdAt = data.createdAt || new Date().toISOString();
  data.updatedAt = data.updatedAt || new Date().toISOString();
  data.priority = data.priority || 'Medium';
  
  // Auto-fill team based on equipment if not provided
  if (data.maintenanceFor === 'Equipment' && data.equipmentId && !data.teamId) {
    const equipment = await DB.getById('equipment', data.equipmentId);
    if (equipment) {
      data.teamId = equipment.maintenanceTeamId;
    }
  }
  
  const requests = await DB.getAll('requests');
  requests.push(data);
  await DB.setAll('requests', requests);
  
  // Create notification for new request
  if (data.teamId) {
    const teams = await DB.getAll('teams');
    const team = teams.find((t: any) => t.id === data.teamId);
    if (team) {
      const notification: Notification = {
        id: randomUUID(),
        userId: team.memberIds[0], // Notify first team member
        type: 'new_request' as NotificationType,
        title: 'New Maintenance Request',
        message: `New request: ${data.subject}`,
        relatedId: data.id,
        relatedType: 'request',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      
      const notifications = await DB.getAll('notifications');
      notifications.push(notification);
      await DB.setAll('notifications', notifications);
    }
  }
  
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const data = await request.json();
  let requests = await DB.getAll('requests');
  const oldRequest = requests.find((r: any) => r.id === data.id);
  
  requests = requests.map((r: any) => r.id === data.id ? data : r);
  await DB.setAll('requests', requests);
  
  // Handle scrap logic
  if (data.stage === 'Scrap' && data.maintenanceFor === 'Equipment' && data.equipmentId) {
    const equipment = await DB.getAll('equipment');
    const item = equipment.find((e: any) => e.id === data.equipmentId);
    if (item) {
      item.status = 'Scrapped';
      item.scrapDate = new Date().toISOString();
      await DB.setAll('equipment', equipment);
    }
  }
  
  // Create notification for status update
  if (oldRequest && oldRequest.stage !== data.stage) {
    const notification: Notification = {
      id: randomUUID(),
      userId: data.assignedToUserId || data.requestedByUserId,
      type: 'request_updated' as NotificationType,
      title: 'Request Status Updated',
      message: `Request "${data.subject}" status changed to ${data.stage}`,
      relatedId: data.id,
      relatedType: 'request',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    
    const notifications = await DB.getAll('notifications');
    notifications.push(notification);
    await DB.setAll('notifications', notifications);
  }
  
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (id) {
    let requests = await DB.getAll('requests');
    requests = requests.filter((r: any) => r.id !== id);
    await DB.setAll('requests', requests);
    
    // Remove related tracking logs and requirements
    let trackingLogs = await DB.getAll('trackingLogs');
    trackingLogs = trackingLogs.filter((t: any) => t.requestId !== id);
    await DB.setAll('trackingLogs', trackingLogs);
    
    let requirements = await DB.getAll('requirements');
    requirements = requirements.filter((r: any) => r.requestId !== id);
    await DB.setAll('requirements', requirements);
    
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: 'ID parameter required' }, { status: 400 });
}