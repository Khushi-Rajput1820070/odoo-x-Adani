import { NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { MaintenanceRequest, Notification, NotificationType } from '@/lib/types';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('teamId');
  const userId = searchParams.get('userId');
  
  // Get all requests for the specified team or user
  let requests: MaintenanceRequest[] = await DB.getAll('requests');
  
  if (teamId) {
    requests = requests.filter(r => r.teamId === teamId);
  }
  
  if (userId) {
    requests = requests.filter(r => r.assignedToUserId === userId);
  }
  
  // Group requests by stage for Kanban board
  const kanbanData = {
    new: requests.filter(r => r.stage === 'New'),
    inProgress: requests.filter(r => r.stage === 'In Progress'),
    repaired: requests.filter(r => r.stage === 'Repaired'),
    scrap: requests.filter(r => r.stage === 'Scrap'),
  };
  
  return NextResponse.json(kanbanData);
}

export async function PUT(request: Request) {
  const data = await request.json();
  const { requestId, newStage, assignedToUserId } = data;
  
  if (!requestId || !newStage) {
    return NextResponse.json({ error: 'Request ID and new stage are required' }, { status: 400 });
  }
  
  // Update the request stage and assigned user
  let requests = await DB.getAll('requests');
  const requestIndex = requests.findIndex((r: any) => r.id === requestId);
  
  if (requestIndex !== -1) {
    const updatedRequest = { ...requests[requestIndex] };
    
    // Update stage
    updatedRequest.stage = newStage;
    
    // Update assigned user if provided
    if (assignedToUserId !== undefined) {
      updatedRequest.assignedToUserId = assignedToUserId;
      
      // If assigned to a user, update the acceptedAt timestamp
      if (newStage === 'In Progress' && !updatedRequest.acceptedAt) {
        updatedRequest.acceptedAt = new Date().toISOString();
      }
    }
    
    // Update timestamps
    updatedRequest.updatedAt = new Date().toISOString();
    
    // If completed, set completed date
    if (newStage === 'Repaired' && !updatedRequest.completedDate) {
      updatedRequest.completedDate = new Date().toISOString();
    }
    
    requests[requestIndex] = updatedRequest;
    await DB.setAll('requests', requests);
    
    // Create notification for assignment or status change
    if (assignedToUserId) {
      const notification: Notification = {
        id: randomUUID(),
        userId: assignedToUserId,
        type: 'request_assigned' as NotificationType,
        title: 'Request Assigned to You',
        message: `Maintenance request "${updatedRequest.subject}" has been assigned to you`,
        relatedId: requestId,
        relatedType: 'request',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      
      const notifications = await DB.getAll('notifications');
      notifications.push(notification);
      await DB.setAll('notifications', notifications);
    } else if (updatedRequest.requestedByUserId) {
      // Notify the requester about status change
      const notification: Notification = {
        id: randomUUID(),
        userId: updatedRequest.requestedByUserId,
        type: 'request_updated' as NotificationType,
        title: 'Request Status Updated',
        message: `Your request "${updatedRequest.subject}" status changed to ${newStage}`,
        relatedId: requestId,
        relatedType: 'request',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      
      const notifications = await DB.getAll('notifications');
      notifications.push(notification);
      await DB.setAll('notifications', notifications);
    }
    
    return NextResponse.json(updatedRequest);
  }
  
  return NextResponse.json({ error: 'Request not found' }, { status: 404 });
}