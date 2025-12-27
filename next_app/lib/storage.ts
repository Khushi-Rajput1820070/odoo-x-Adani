// LocalStorage management for GearGuard
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
} from "./types"

const STORAGE_PREFIX = "gearguard_"

export const storage = {
  // User management
  getUsers: (): User[] => {
    const data = localStorage.getItem(`${STORAGE_PREFIX}users`)
    return data ? JSON.parse(data) : []
  },
  setUsers: (users: User[]) => {
    localStorage.setItem(`${STORAGE_PREFIX}users`, JSON.stringify(users))
  },
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(`${STORAGE_PREFIX}currentUser`)
    return data ? JSON.parse(data) : null
  },
  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(`${STORAGE_PREFIX}currentUser`, JSON.stringify(user))
    } else {
      localStorage.removeItem(`${STORAGE_PREFIX}currentUser`)
    }
  },

  // Teams
  getTeams: (): Team[] => {
    const data = localStorage.getItem(`${STORAGE_PREFIX}teams`)
    return data ? JSON.parse(data) : []
  },
  setTeams: (teams: Team[]) => {
    localStorage.setItem(`${STORAGE_PREFIX}teams`, JSON.stringify(teams))
  },

  // Equipment
  getEquipment: (): Equipment[] => {
    const data = localStorage.getItem(`${STORAGE_PREFIX}equipment`)
    return data ? JSON.parse(data) : []
  },
  setEquipment: (equipment: Equipment[]) => {
    localStorage.setItem(`${STORAGE_PREFIX}equipment`, JSON.stringify(equipment))
  },

  // Maintenance Requests
  getRequests: (): MaintenanceRequest[] => {
    const data = localStorage.getItem(`${STORAGE_PREFIX}requests`)
    return data ? JSON.parse(data) : []
  },
  setRequests: (requests: MaintenanceRequest[]) => {
    localStorage.setItem(`${STORAGE_PREFIX}requests`, JSON.stringify(requests))
  },

  // Equipment Categories
  getCategories: (): EquipmentCategory[] => {
    const data = localStorage.getItem(`${STORAGE_PREFIX}categories`)
    return data ? JSON.parse(data) : []
  },
  setCategories: (categories: EquipmentCategory[]) => {
    localStorage.setItem(`${STORAGE_PREFIX}categories`, JSON.stringify(categories))
  },
  
  // Work Centers
  getWorkCenters: (): WorkCenter[] => {
    const data = localStorage.getItem(`${STORAGE_PREFIX}workcenters`)
    return data ? JSON.parse(data) : []
  },
  setWorkCenters: (workcenters: WorkCenter[]) => {
    localStorage.setItem(`${STORAGE_PREFIX}workcenters`, JSON.stringify(workcenters))
  },

  // Notification management
  getNotifications: (): Notification[] => {
    const data = localStorage.getItem(`${STORAGE_PREFIX}notifications`)
    return data ? JSON.parse(data) : []
  },
  setNotifications: (notifications: Notification[]) => {
    localStorage.setItem(`${STORAGE_PREFIX}notifications`, JSON.stringify(notifications))
  },
  addNotification: (notification: Notification) => {
    const notifications = storage.getNotifications()
    notifications.push(notification)
    storage.setNotifications(notifications)
  },
  getUserNotifications: (userId: string): Notification[] => {
    return storage.getNotifications().filter((n) => n.userId === userId)
  },
  getUnreadNotificationCount: (userId: string): number => {
    return storage.getNotifications().filter((n) => n.userId === userId && !n.isRead).length
  },
  markNotificationRead: (notificationId: string) => {
    const notifications = storage.getNotifications()
    const notification = notifications.find((n) => n.id === notificationId)
    if (notification) {
      notification.isRead = true
      storage.setNotifications(notifications)
    }
  },
  markAllNotificationsRead: (userId: string) => {
    const notifications = storage.getNotifications()
    notifications.forEach((n) => {
      if (n.userId === userId) {
        n.isRead = true
      }
    })
    storage.setNotifications(notifications)
  },
  clearUserNotifications: (userId: string) => {
    const notifications = storage.getNotifications()
    storage.setNotifications(notifications.filter((n) => n.userId !== userId))
  },

  // Tracking Logs management
  getTrackingLogs: (requestId: string): TrackingLog[] => {
    const logs = localStorage.getItem(`${STORAGE_PREFIX}tracking_${requestId}`)
    return logs ? JSON.parse(logs) : []
  },
  addTrackingLog: (requestId: string, log: TrackingLog) => {
    const logs = storage.getTrackingLogs(requestId)
    logs.push(log)
    localStorage.setItem(`${STORAGE_PREFIX}tracking_${requestId}`, JSON.stringify(logs))
  },

  // Requirements management
  getRequirements: (requestId: string): Requirement[] => {
    const reqs = localStorage.getItem(`${STORAGE_PREFIX}requirements_${requestId}`)
    return reqs ? JSON.parse(reqs) : []
  },
  addRequirement: (requestId: string, requirement: Requirement) => {
    const reqs = storage.getRequirements(requestId)
    reqs.push(requirement)
    localStorage.setItem(`${STORAGE_PREFIX}requirements_${requestId}`, JSON.stringify(reqs))
  },
  updateRequirement: (requestId: string, requirementId: string, updates: Partial<Requirement>) => {
    const reqs = storage.getRequirements(requestId)
    const req = reqs.find((r) => r.id === requirementId)
    if (req) {
      Object.assign(req, updates)
      localStorage.setItem(`${STORAGE_PREFIX}requirements_${requestId}`, JSON.stringify(reqs))
    }
  },

  // Initialize demo data
  initializeDemoData: () => {
    if (localStorage.getItem(`${STORAGE_PREFIX}initialized`)) return

    const demoUsers: User[] = [
      {
        id: "1",
        email: "admin@gearguard.com",
        name: "Admin User",
        role: "admin",
      },
      {
        id: "2",
        email: "manager@gearguard.com",
        name: "John Manager",
        role: "manager",
      },
      {
        id: "3",
        email: "tech1@gearguard.com",
        name: "Alex Foster",
        role: "technician",
      },
      {
        id: "4",
        email: "tech2@gearguard.com",
        name: "Sarah Johnson",
        role: "technician",
      },
      {
        id: "5",
        email: "requester@gearguard.com",
        name: "Mike Requester",
        role: "requester",
      },
    ]

    const demoTeams: Team[] = [
      { id: "t1", name: "Internal Maintenance", memberIds: ["3"] },
      { id: "t2", name: "Radiology", memberIds: ["4"] },
      { id: "t3", name: "Admin", memberIds: ["3", "4"] },
    ]

    const demoWorkCenters: WorkCenter[] = [
      {
        id: "wc1",
        name: "Assembly 1",
        code: "ASSEMBLY1",
        costPerHour: 100,
        capacityTimeEfficiency: 100,
        oeeTarget: 34.59,
        company: "My Company (San Francisco)",
      },
      {
        id: "wc2",
        name: "Drill 1",
        code: "DRILL1",
        costPerHour: 100,
        capacityTimeEfficiency: 100,
        oeeTarget: 90.00,
        company: "My Company (San Francisco)",
      },
    ]

    const demoEquipment: Equipment[] = [
      {
        id: "e1",
        name: "Samsung Monitor 15\"",
        serialNumber: "V7SD21239853F",
        category: "Monitors",
        company: "My Company (San Francisco)",
        usedBy: "Mitchell Admin",
        maintenanceTeamId: "t1",
        assignedDate: "2023-12-24",
        technicianId: "3",
        status: "Active",
      },
      {
        id: "e2",
        name: "Acer Laptop",
        serialNumber: "AC9322PR3222",
        category: "Computers",
        company: "My Company (San Francisco)",
        usedBy: "Abigail Peterson",
        maintenanceTeamId: "t1",
        technicianId: "4",
        status: "Active",
      },
    ]

    const demoRequests: MaintenanceRequest[] = [
      {
        id: "r1",
        subject: "Test activity",
        maintenanceFor: "Equipment",
        equipmentId: "e2",
        type: "Corrective",
        category: "Computers",
        requestedByUserId: "1",
        assignedToUserId: "3",
        teamId: "t1",
        stage: "In Progress",
        scheduledDate: "2023-12-24T14:33:00",
        durationHours: 10,
        priority: "High",
        company: "My Company (San Francisco)",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    const demoCategories: EquipmentCategory[] = [
      { id: "cat1", name: "Computers", description: "All computer equipment", company: "My Company (San Francisco)" },
      { id: "cat2", name: "Software", description: "Software licenses", company: "My Company (San Francisco)" },
      { id: "cat3", name: "Monitors", description: "Display monitors", company: "My Company (San Francisco)" },
    ]

    const demoNotifications: Notification[] = [
      { 
        id: "n1", 
        userId: "1", 
        type: "new_request",
        title: "New Request",
        message: "New maintenance request for Acer Laptop", 
        isRead: false,
        createdAt: new Date().toISOString()
      },
    ]

    storage.setUsers(demoUsers)
    storage.setTeams(demoTeams)
    storage.setWorkCenters(demoWorkCenters)
    storage.setEquipment(demoEquipment)
    storage.setRequests(demoRequests)
    storage.setCategories(demoCategories)
    storage.setNotifications(demoNotifications)

    localStorage.setItem(`${STORAGE_PREFIX}initialized`, "true")
  },
}
