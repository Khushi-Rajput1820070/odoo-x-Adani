'use server';

import { DB } from './db';
import { 
  Equipment, 
  MaintenanceRequest, 
  Team, 
  EquipmentCategory, 
  WorkCenter, 
  Notification, 
  TrackingLog, 
  Requirement,
  User
} from './types';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';

// Equipment
export async function getEquipment(id?: string) {
  if (id) {
    return await DB.getById('equipment', id);
  }
  return await DB.getAll('equipment');
}

export async function saveEquipment(data: Equipment) {
  const all = await DB.getAll('equipment');
  const exists = all.find(e => e.id === data.id);
  if (exists) {
    await DB.setAll('equipment', all.map(e => e.id === data.id ? data : e));
  } else {
    all.push(data);
    await DB.setAll('equipment', all);
  }
  revalidatePath('/equipment');
}

export async function deleteEquipment(id: string) {
  let equipment = await DB.getAll('equipment');
  equipment = equipment.filter((e: any) => e.id !== id);
  await DB.setAll('equipment', equipment);
  
  // Also remove related requests
  let requests = await DB.getAll('requests');
  requests = requests.filter((r: any) => r.equipmentId !== id);
  await DB.setAll('requests', requests);
  
  revalidatePath('/equipment');
}

// Maintenance Requests
export async function getRequests(id?: string) {
  if (id) {
    return await DB.getById('requests', id);
  }
  return await DB.getAll('requests');
}

export async function saveRequest(data: MaintenanceRequest) {
  const all = await DB.getAll('requests');
  const exists = all.find(r => r.id === data.id);
  
  if (exists) {
    await DB.setAll('requests', all.map(r => r.id === data.id ? data : r));
  } else {
    all.push(data);
    await DB.setAll('requests', all);
  }

  // Handle Scrap Logic
  if (data.stage === 'Scrap' && data.maintenanceFor === 'Equipment' && data.equipmentId) {
    const equipment = await DB.getAll('equipment');
    const item = equipment.find((e: any) => e.id === data.equipmentId);
    if (item) {
      item.status = 'Scrapped';
      item.scrapDate = new Date().toISOString();
      await DB.setAll('equipment', equipment);
    }
  }
  
  revalidatePath('/maintenance');
  revalidatePath('/equipment');
}

export async function deleteRequest(id: string) {
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
  
  revalidatePath('/maintenance');
}

// Teams
export async function getTeams(id?: string) {
  if (id) {
    return await DB.getById('teams', id);
  }
  return await DB.getAll('teams');
}

export async function saveTeam(data: Team) {
  const all = await DB.getAll('teams');
  const exists = all.find(t => t.id === data.id);
  if (exists) {
    await DB.setAll('teams', all.map(t => t.id === data.id ? data : t));
  } else {
    all.push(data);
    await DB.setAll('teams', all);
  }
  revalidatePath('/teams');
}

export async function deleteTeam(id: string) {
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
  
  revalidatePath('/teams');
}

// Work Centers
export async function getWorkCenters(id?: string) {
  if (id) {
    return await DB.getById('workcenters', id);
  }
  return await DB.getAll('workcenters');
}

export async function saveWorkCenter(data: WorkCenter) {
  const all = await DB.getAll('workcenters');
  const exists = all.find(wc => wc.id === data.id);
  if (exists) {
    await DB.setAll('workcenters', all.map(wc => wc.id === data.id ? data : wc));
  } else {
    all.push(data);
    await DB.setAll('workcenters', all);
  }
  revalidatePath('/maintenance');
}

export async function deleteWorkCenter(id: string) {
  let workcenters = await DB.getAll('workcenters');
  workcenters = workcenters.filter((wc: any) => wc.id !== id);
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
  
  revalidatePath('/maintenance');
}

// Categories
export async function getCategories(id?: string) {
  if (id) {
    return await DB.getById('categories', id);
  }
  return await DB.getAll('categories');
}

export async function saveCategory(data: EquipmentCategory) {
  const all = await DB.getAll('categories');
  const exists = all.find(c => c.id === data.id);
  if (exists) {
    await DB.setAll('categories', all.map(c => c.id === data.id ? data : c));
  } else {
    all.push(data);
    await DB.setAll('categories', all);
  }
  revalidatePath('/categories');
}

export async function deleteCategory(id: string) {
  let categories = await DB.getAll('categories');
  categories = categories.filter((c: any) => c.id !== id);
  await DB.setAll('categories', categories);
  
  // Update equipment that was using this category
  let equipment = await DB.getAll('equipment');
  equipment = equipment.map((e: any) => {
    if (e.category === id) {
      e.category = ''; // Clear category assignment
    }
    return e;
  });
  await DB.setAll('equipment', equipment);
  
  // Update requests that were using this category
  let requests = await DB.getAll('requests');
  requests = requests.map((r: any) => {
    if (r.category === id) {
      r.category = ''; // Clear category assignment
    }
    return r;
  });
  await DB.setAll('requests', requests);
  
  revalidatePath('/categories');
}

// Notifications
export async function getNotifications(userId: string) {
  const allNotifications = await DB.getAll('notifications');
  return allNotifications.filter((n: any) => n.userId === userId);
}

export async function addNotification(notif: Notification) {
  const all = await DB.getAll('notifications');
  all.push(notif);
  await DB.setAll('notifications', all);
}

export async function markNotificationAsRead(id: string) {
  let notifications = await DB.getAll('notifications');
  notifications = notifications.map((n: any) => {
    if (n.id === id) {
      n.isRead = true;
    }
    return n;
  });
  await DB.setAll('notifications', notifications);
}

// Users
export async function getUsers(id?: string) {
  if (id) {
    return await DB.getById('users', id);
  }
  return await DB.getAll('users');
}

export async function saveUser(data: User) {
  const all = await DB.getAll('users');
  const exists = all.find((u: any) => u.id === data.id);
  if (exists) {
    await DB.setAll('users', all.map((u: any) => u.id === data.id ? data : u));
  } else {
    all.push(data);
    await DB.setAll('users', all);
  }
  revalidatePath('/users');
}

export async function deleteUser(id: string) {
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
  
  revalidatePath('/users');
}

// Tracking Logs
export async function getTrackingLogs(requestId: string) {
  return await DB.getTrackingLogs(requestId);
}

export async function addTrackingLog(requestId: string, log: TrackingLog) {
  await DB.addTrackingLog(requestId, log);
}

export async function updateTrackingLog(logId: string, log: Partial<TrackingLog>) {
  await DB.updateTrackingLog(logId, log);
}

export async function deleteTrackingLog(logId: string) {
  await DB.deleteTrackingLog(logId);
}

// Requirements
export async function getRequirements(requestId: string) {
  return await DB.getRequirements(requestId);
}

export async function addRequirement(requestId: string, req: Requirement) {
  await DB.addRequirement(requestId, req);
}

export async function updateRequirement(reqId: string, req: Partial<Requirement>) {
  await DB.updateRequirement(reqId, req);
}

export async function deleteRequirement(reqId: string) {
  await DB.deleteRequirement(reqId);
}