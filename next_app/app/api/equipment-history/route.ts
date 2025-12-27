import { NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { Notification, NotificationType } from '@/lib/types';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const equipmentId = searchParams.get('equipmentId');
  
  if (!equipmentId) {
    return NextResponse.json({ error: 'Equipment ID is required' }, { status: 400 });
  }
  
  // Get equipment details
  const equipment = await DB.getById('equipment', equipmentId);
  if (!equipment) {
    return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
  }
  
  // Get all requests related to this equipment
  const requests = await DB.getAll('requests');
  const equipmentRequests = requests.filter(r => r.equipmentId === equipmentId);
  
  // Get all tracking logs for these requests
  const trackingLogs = await DB.getAll('trackingLogs');
  const equipmentTrackingLogs = trackingLogs.filter(log => 
    equipmentRequests.some(req => req.id === log.requestId)
  );
  
  // Get all requirements for these requests
  const requirements = await DB.getAll('requirements');
  const equipmentRequirements = requirements.filter(req => 
    equipmentRequests.some(eReq => eReq.id === req.requestId)
  );
  
  // Combine all information for the equipment history
  const history = {
    equipment: equipment,
    maintenanceRequests: equipmentRequests,
    trackingLogs: equipmentTrackingLogs,
    requirements: equipmentRequirements,
    openIssues: equipmentRequests.filter(r => r.stage !== 'Repaired' && r.stage !== 'Scrap').length,
    totalMaintenanceCount: equipmentRequests.length,
    lastMaintenanceDate: equipmentRequests
      .filter(r => r.stage === 'Repaired')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]?.updatedAt || null
  };
  
  return NextResponse.json(history);
}

// This endpoint allows adding a maintenance request directly from the equipment page
export async function POST(request: Request) {
  const data = await request.json();
  
  if (!data.equipmentId) {
    return NextResponse.json({ error: 'Equipment ID is required' }, { status: 400 });
  }
  
  // Get equipment to auto-fill team and category
  const equipment = await DB.getById('equipment', data.equipmentId);
  if (!equipment) {
    return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
  }
  
  // Set default values for the maintenance request
  data.id = data.id || randomUUID();
  data.teamId = data.teamId || equipment.maintenanceTeamId;
  data.category = data.category || equipment.category;
  data.maintenanceFor = 'Equipment';
  data.stage = data.stage || 'New';
  data.type = data.type || 'Corrective';
  data.createdAt = data.createdAt || new Date().toISOString();
  data.updatedAt = data.updatedAt || new Date().toISOString();
  data.priority = data.priority || 'Medium';
  
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
        message: `New request for ${equipment.name}: ${data.subject}`,
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