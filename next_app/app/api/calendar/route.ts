import { NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { MaintenanceRequest, Notification, NotificationType } from '@/lib/types';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('teamId');
  const userId = searchParams.get('userId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  
  // Get all requests
  let requests: MaintenanceRequest[] = await DB.getAll('requests');
  
  // Filter by team if specified
  if (teamId) {
    requests = requests.filter(r => r.teamId === teamId);
  }
  
  // Filter by user if specified
  if (userId) {
    requests = requests.filter(r => r.assignedToUserId === userId);
  }
  
  // Filter by date range if specified
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    requests = requests.filter(r => {
      if (!r.scheduledDate) return false;
      const scheduled = new Date(r.scheduledDate);
      return scheduled >= start && scheduled <= end;
    });
  }
  
  // Filter for preventive maintenance requests (scheduled jobs)
  const calendarEvents = requests
    .filter(r => r.type === 'Preventive' && r.scheduledDate)
    .map(r => ({
      id: r.id,
      title: r.subject,
      start: r.scheduledDate,
      end: r.scheduledDate,
      allDay: true,
      stage: r.stage,
      type: r.type,
      equipmentId: r.equipmentId,
      assignedToUserId: r.assignedToUserId,
      priority: r.priority,
      isOverdue: r.isOverdue
    }));
  
  return NextResponse.json(calendarEvents);
}

export async function POST(request: Request) {
  const data = await request.json();
  
  // Validate required fields for preventive maintenance
  if (!data.scheduledDate) {
    return NextResponse.json({ error: 'Scheduled date is required for calendar events' }, { status: 400 });
  }
  
  if (!data.type || data.type !== 'Preventive') {
    return NextResponse.json({ error: 'Calendar events are only for preventive maintenance' }, { status: 400 });
  }
  
  // Set default values for calendar events
  data.stage = data.stage || 'New';
  data.type = 'Preventive';
  data.createdAt = data.createdAt || new Date().toISOString();
  data.updatedAt = data.updatedAt || new Date().toISOString();
  data.id = data.id || randomUUID();
  
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
  
  // Create notification for new scheduled request
  if (data.teamId) {
    const teams = await DB.getAll('teams');
    const team = teams.find((t: any) => t.id === data.teamId);
    if (team) {
      // Notify all team members about the scheduled job
      for (const memberId of team.memberIds) {
        const notification: Notification = {
          id: randomUUID(),
          userId: memberId,
          type: 'new_request' as NotificationType,
          title: 'New Scheduled Maintenance',
          message: `Scheduled maintenance: ${data.subject} on ${data.scheduledDate}`,
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
  }
  
  return NextResponse.json(data);
}