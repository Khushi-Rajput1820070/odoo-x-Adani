// API-based storage management for GearGuard
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
} from "./types";
import {
  userApi,
  teamApi,
  equipmentApi,
  requestApi,
  categoryApi,
  notificationApi,
  trackingLogApi,
  requirementApi,
  workCenterApi,
} from "./api";

// In-memory cache for current user (since we can't store auth in localStorage in Next.js app)
let currentUser: User | null = null;

export const storage = {
  // User management
  getUsers: async (): Promise<User[]> => {
    return await userApi.getAll();
  },
  setUsers: async (users: User[]) => {
    // In API-based storage, we update individual users
    for (const user of users) {
      await userApi.update(user);
    }
  },
  getCurrentUser: (): User | null => {
    // For now, return the cached current user
    // In a real app, this would be managed through authentication
    return currentUser;
  },
  setCurrentUser: (user: User | null) => {
    currentUser = user;
  },

  // Teams
  getTeams: async (): Promise<Team[]> => {
    return await teamApi.getAll();
  },
  setTeams: async (teams: Team[]) => {
    for (const team of teams) {
      if (team.id) {
        await teamApi.update(team);
      } else {
        await teamApi.create(team);
      }
    }
  },

  // Equipment
  getEquipment: async (): Promise<Equipment[]> => {
    return await equipmentApi.getAll();
  },
  setEquipment: async (equipment: Equipment[]) => {
    for (const eq of equipment) {
      if (eq.id) {
        await equipmentApi.update(eq);
      } else {
        await equipmentApi.create(eq);
      }
    }
  },

  // Maintenance Requests
  getRequests: async (): Promise<MaintenanceRequest[]> => {
    return await requestApi.getAll();
  },
  setRequests: async (requests: MaintenanceRequest[]) => {
    for (const req of requests) {
      if (req.id) {
        await requestApi.update(req);
      } else {
        await requestApi.create(req);
      }
    }
  },

  // Equipment Categories
  getCategories: async (): Promise<EquipmentCategory[]> => {
    return await categoryApi.getAll();
  },
  setCategories: async (categories: EquipmentCategory[]) => {
    for (const cat of categories) {
      if (cat.id) {
        await categoryApi.update(cat);
      } else {
        await categoryApi.create(cat);
      }
    }
  },
  
  // Work Centers
  getWorkCenters: async (): Promise<WorkCenter[]> => {
    return await workCenterApi.getAll();
  },
  setWorkCenters: async (workcenters: WorkCenter[]) => {
    for (const wc of workcenters) {
      if (wc.id) {
        await workCenterApi.update(wc);
      } else {
        await workCenterApi.create(wc);
      }
    }
  },

  // Notification management
  getNotifications: async (): Promise<Notification[]> => {
    // Get all notifications (in a real app, you might want to filter by current user)
    return await notificationApi.getAll();
  },
  setNotifications: async (notifications: Notification[]) => {
    for (const notif of notifications) {
      if (notif.id) {
        await notificationApi.update(notif);
      } else {
        await notificationApi.create(notif);
      }
    }
  },
  addNotification: async (notification: Notification) => {
    await notificationApi.create(notification);
  },
  getUserNotifications: async (userId: string): Promise<Notification[]> => {
    return await notificationApi.getByUser(userId);
  },
  getUnreadNotificationCount: async (userId: string): Promise<number> => {
    const notifications = await notificationApi.getByUser(userId);
    return notifications.filter((n) => !n.isRead).length;
  },
  markNotificationRead: async (notificationId: string) => {
    await notificationApi.markAsRead(notificationId);
  },
  markAllNotificationsRead: async (userId: string) => {
    const notifications = await notificationApi.getByUser(userId);
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    for (const notification of unreadNotifications) {
      await notificationApi.markAsRead(notification.id);
    }
  },
  clearUserNotifications: async (userId: string) => {
    // In a real app, you would have an API endpoint for this
    // For now, we'll mark all as read
    await storage.markAllNotificationsRead(userId);
  },

  // Tracking Logs management
  getTrackingLogs: async (requestId: string): Promise<TrackingLog[]> => {
    return await trackingLogApi.getByRequest(requestId);
  },
  addTrackingLog: async (requestId: string, log: TrackingLog) => {
    await trackingLogApi.create({ ...log, requestId });
  },

  // Requirements management
  getRequirements: async (requestId: string): Promise<Requirement[]> => {
    return await requirementApi.getByRequest(requestId);
  },
  addRequirement: async (requestId: string, requirement: Requirement) => {
    await requirementApi.create({ ...requirement, requestId });
  },
  updateRequirement: async (requestId: string, requirementId: string, updates: Partial<Requirement>) => {
    const requirement = await requirementApi.getById(requirementId);
    Object.assign(requirement, updates);
    await requirementApi.update(requirement);
  },

  // Initialize demo data is not needed when using API storage
  initializeDemoData: () => {
    // No-op when using API storage
    console.log("Using API-based storage, skipping demo data initialization");
  },
};