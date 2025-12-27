// API service for GearGuard backend
import type {
  User,
  Team,
  Equipment,
  MaintenanceRequest,
  EquipmentCategory,
  Notification,
  TrackingLog,
  Requirement,
  WorkCenter,
} from './types';

// Base API URL - in a real app, this would be configurable
const API_BASE = '/api';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// User API
export const userApi = {
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE}/users`);
      if (response.ok) {
        const users: User[] = await response.json();
        // In a real app, you'd have a way to identify the current user
        // For now, we'll return the first user or null
        return users[0] || null;
      }
      return null;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  },
  
  getAll: async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE}/users`);
    return handleResponse<User[]>(response);
  },
  
  getById: async (id: string): Promise<User> => {
    const response = await fetch(`${API_BASE}/users?id=${id}`);
    return handleResponse<User>(response);
  },
  
  create: async (userData: Omit<User, 'id'>): Promise<User> => {
    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse<User>(response);
  },
  
  update: async (userData: User): Promise<User> => {
    const response = await fetch(`${API_BASE}/users`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse<User>(response);
  },
  
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/users?id=${id}`, {
      method: 'DELETE',
    });
    await handleResponse(response);
  },
};

// Team API
export const teamApi = {
  getAll: async (): Promise<Team[]> => {
    const response = await fetch(`${API_BASE}/teams`);
    return handleResponse<Team[]>(response);
  },
  
  getById: async (id: string): Promise<Team> => {
    const response = await fetch(`${API_BASE}/teams?id=${id}`);
    return handleResponse<Team>(response);
  },
  
  create: async (teamData: Omit<Team, 'id'>): Promise<Team> => {
    const response = await fetch(`${API_BASE}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teamData),
    });
    return handleResponse<Team>(response);
  },
  
  update: async (teamData: Team): Promise<Team> => {
    const response = await fetch(`${API_BASE}/teams`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teamData),
    });
    return handleResponse<Team>(response);
  },
  
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/teams?id=${id}`, {
      method: 'DELETE',
    });
    await handleResponse(response);
  },
};

// Equipment API
export const equipmentApi = {
  getAll: async (): Promise<Equipment[]> => {
    const response = await fetch(`${API_BASE}/equipment`);
    return handleResponse<Equipment[]>(response);
  },
  
  getById: async (id: string): Promise<Equipment> => {
    const response = await fetch(`${API_BASE}/equipment?id=${id}`);
    return handleResponse<Equipment>(response);
  },
  
  getByTeam: async (teamId: string): Promise<Equipment[]> => {
    const response = await fetch(`${API_BASE}/equipment?teamId=${teamId}`);
    return handleResponse<Equipment[]>(response);
  },
  
  getByStatus: async (status: string): Promise<Equipment[]> => {
    const response = await fetch(`${API_BASE}/equipment?status=${status}`);
    return handleResponse<Equipment[]>(response);
  },
  
  getByCategory: async (category: string): Promise<Equipment[]> => {
    const response = await fetch(`${API_BASE}/equipment?category=${category}`);
    return handleResponse<Equipment[]>(response);
  },
  
  create: async (equipmentData: Omit<Equipment, 'id'>): Promise<Equipment> => {
    const response = await fetch(`${API_BASE}/equipment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(equipmentData),
    });
    return handleResponse<Equipment>(response);
  },
  
  update: async (equipmentData: Equipment): Promise<Equipment> => {
    const response = await fetch(`${API_BASE}/equipment`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(equipmentData),
    });
    return handleResponse<Equipment>(response);
  },
  
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/equipment?id=${id}`, {
      method: 'DELETE',
    });
    await handleResponse(response);
  },
};

// Maintenance Request API
export const requestApi = {
  getAll: async (): Promise<MaintenanceRequest[]> => {
    const response = await fetch(`${API_BASE}/requests`);
    return handleResponse<MaintenanceRequest[]>(response);
  },
  
  getById: async (id: string): Promise<MaintenanceRequest> => {
    const response = await fetch(`${API_BASE}/requests?id=${id}`);
    return handleResponse<MaintenanceRequest>(response);
  },
  
  getByEquipment: async (equipmentId: string): Promise<MaintenanceRequest[]> => {
    const response = await fetch(`${API_BASE}/requests?equipmentId=${equipmentId}`);
    return handleResponse<MaintenanceRequest[]>(response);
  },
  
  getByTeam: async (teamId: string): Promise<MaintenanceRequest[]> => {
    const response = await fetch(`${API_BASE}/requests?teamId=${teamId}`);
    return handleResponse<MaintenanceRequest[]>(response);
  },
  
  getByStage: async (stage: string): Promise<MaintenanceRequest[]> => {
    const response = await fetch(`${API_BASE}/requests?stage=${stage}`);
    return handleResponse<MaintenanceRequest[]>(response);
  },
  
  getByType: async (type: string): Promise<MaintenanceRequest[]> => {
    const response = await fetch(`${API_BASE}/requests?type=${type}`);
    return handleResponse<MaintenanceRequest[]>(response);
  },
  
  getByAssignedUser: async (userId: string): Promise<MaintenanceRequest[]> => {
    const response = await fetch(`${API_BASE}/requests?assignedToUserId=${userId}`);
    return handleResponse<MaintenanceRequest[]>(response);
  },
  
  create: async (requestData: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceRequest> => {
    const response = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    });
    return handleResponse<MaintenanceRequest>(response);
  },
  
  update: async (requestData: MaintenanceRequest): Promise<MaintenanceRequest> => {
    const response = await fetch(`${API_BASE}/requests`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    });
    return handleResponse<MaintenanceRequest>(response);
  },
  
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/requests?id=${id}`, {
      method: 'DELETE',
    });
    await handleResponse(response);
  },
};

// Category API
export const categoryApi = {
  getAll: async (): Promise<EquipmentCategory[]> => {
    const response = await fetch(`${API_BASE}/categories`);
    return handleResponse<EquipmentCategory[]>(response);
  },
  
  getById: async (id: string): Promise<EquipmentCategory> => {
    const response = await fetch(`${API_BASE}/categories?id=${id}`);
    return handleResponse<EquipmentCategory>(response);
  },
  
  create: async (categoryData: Omit<EquipmentCategory, 'id'>): Promise<EquipmentCategory> => {
    const response = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData),
    });
    return handleResponse<EquipmentCategory>(response);
  },
  
  update: async (categoryData: EquipmentCategory): Promise<EquipmentCategory> => {
    const response = await fetch(`${API_BASE}/categories`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData),
    });
    return handleResponse<EquipmentCategory>(response);
  },
  
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/categories?id=${id}`, {
      method: 'DELETE',
    });
    await handleResponse(response);
  },
};

// Work Center API
export const workCenterApi = {
  getAll: async (): Promise<WorkCenter[]> => {
    const response = await fetch(`${API_BASE}/workcenters`);
    return handleResponse<WorkCenter[]>(response);
  },
  
  getById: async (id: string): Promise<WorkCenter> => {
    const response = await fetch(`${API_BASE}/workcenters?id=${id}`);
    return handleResponse<WorkCenter>(response);
  },
  
  create: async (workCenterData: Omit<WorkCenter, 'id'>): Promise<WorkCenter> => {
    const response = await fetch(`${API_BASE}/workcenters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workCenterData),
    });
    return handleResponse<WorkCenter>(response);
  },
  
  update: async (workCenterData: WorkCenter): Promise<WorkCenter> => {
    const response = await fetch(`${API_BASE}/workcenters`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workCenterData),
    });
    return handleResponse<WorkCenter>(response);
  },
  
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/workcenters?id=${id}`, {
      method: 'DELETE',
    });
    await handleResponse(response);
  },
};

// Notification API
export const notificationApi = {
  getAll: async (): Promise<Notification[]> => {
    const response = await fetch(`${API_BASE}/notifications`);
    return handleResponse<Notification[]>(response);
  },
  
  getByUser: async (userId: string): Promise<Notification[]> => {
    const response = await fetch(`${API_BASE}/notifications?userId=${userId}`);
    return handleResponse<Notification[]>(response);
  },
  
  getById: async (id: string): Promise<Notification> => {
    const response = await fetch(`${API_BASE}/notifications?id=${id}`);
    return handleResponse<Notification>(response);
  },
  
  create: async (notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<Notification> => {
    const response = await fetch(`${API_BASE}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificationData),
    });
    return handleResponse<Notification>(response);
  },
  
  update: async (notificationData: Notification): Promise<Notification> => {
    const response = await fetch(`${API_BASE}/notifications`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificationData),
    });
    return handleResponse<Notification>(response);
  },
  
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/notifications?id=${id}`, {
      method: 'DELETE',
    });
    await handleResponse(response);
  },
  
  markAsRead: async (id: string): Promise<Notification> => {
    const notification = await notificationApi.getById(id);
    notification.isRead = true;
    return notificationApi.update(notification);
  },
};

// Tracking Log API
export const trackingLogApi = {
  getByRequest: async (requestId: string): Promise<TrackingLog[]> => {
    const response = await fetch(`${API_BASE}/tracking-logs?requestId=${requestId}`);
    return handleResponse<TrackingLog[]>(response);
  },
  
  getById: async (id: string): Promise<TrackingLog> => {
    const response = await fetch(`${API_BASE}/tracking-logs?id=${id}`);
    return handleResponse<TrackingLog>(response);
  },
  
  create: async (logData: Omit<TrackingLog, 'id' | 'createdAt'>): Promise<TrackingLog> => {
    const response = await fetch(`${API_BASE}/tracking-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData),
    });
    return handleResponse<TrackingLog>(response);
  },
  
  update: async (logData: TrackingLog): Promise<TrackingLog> => {
    const response = await fetch(`${API_BASE}/tracking-logs`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData),
    });
    return handleResponse<TrackingLog>(response);
  },
  
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/tracking-logs?id=${id}`, {
      method: 'DELETE',
    });
    await handleResponse(response);
  },
};

// Requirement API
export const requirementApi = {
  getByRequest: async (requestId: string): Promise<Requirement[]> => {
    const response = await fetch(`${API_BASE}/requirements?requestId=${requestId}`);
    return handleResponse<Requirement[]>(response);
  },
  
  getById: async (id: string): Promise<Requirement> => {
    const response = await fetch(`${API_BASE}/requirements?id=${id}`);
    return handleResponse<Requirement>(response);
  },
  
  create: async (requirementData: Omit<Requirement, 'id' | 'createdAt'>): Promise<Requirement> => {
    const response = await fetch(`${API_BASE}/requirements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requirementData),
    });
    return handleResponse<Requirement>(response);
  },
  
  update: async (requirementData: Requirement): Promise<Requirement> => {
    const response = await fetch(`${API_BASE}/requirements`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requirementData),
    });
    return handleResponse<Requirement>(response);
  },
  
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/requirements?id=${id}`, {
      method: 'DELETE',
    });
    await handleResponse(response);
  },
};

// Kanban API
export const kanbanApi = {
  getBoard: async (teamId?: string, userId?: string): Promise<Record<string, MaintenanceRequest[]>> => {
    let url = `${API_BASE}/kanban`;
    if (teamId) url += `?teamId=${teamId}`;
    if (userId) url += teamId ? `&userId=${userId}` : `?userId=${userId}`;
    
    const response = await fetch(url);
    return handleResponse<Record<string, MaintenanceRequest[]>>(response);
  },
  
  updateCard: async (requestId: string, newStage: string, assignedToUserId?: string): Promise<MaintenanceRequest> => {
    const response = await fetch(`${API_BASE}/kanban`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, newStage, assignedToUserId }),
    });
    return handleResponse<MaintenanceRequest>(response);
  },
};

// Calendar API
export const calendarApi = {
  getEvents: async (teamId?: string, userId?: string, startDate?: string, endDate?: string): Promise<any[]> => {
    let url = `${API_BASE}/calendar`;
    const params = new URLSearchParams();
    if (teamId) params.append('teamId', teamId);
    if (userId) params.append('userId', userId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await fetch(url);
    return handleResponse<any[]>(response);
  },
  
  createEvent: async (eventData: any): Promise<any> => {
    const response = await fetch(`${API_BASE}/calendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    return handleResponse<any>(response);
  },
};

// Equipment History API
export const equipmentHistoryApi = {
  getHistory: async (equipmentId: string): Promise<any> => {
    const response = await fetch(`${API_BASE}/equipment-history?equipmentId=${equipmentId}`);
    return handleResponse<any>(response);
  },
  
  createRequest: async (requestData: any): Promise<MaintenanceRequest> => {
    const response = await fetch(`${API_BASE}/equipment-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    });
    return handleResponse<MaintenanceRequest>(response);
  },
};