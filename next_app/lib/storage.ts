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
      { id: "t1", name: "Mechanics", memberIds: ["3"] },
      { id: "t2", name: "Electricians", memberIds: ["4"] },
      { id: "t3", name: "IT Support", memberIds: ["3", "4"] },
    ]

    const demoEquipment: Equipment[] = [
      {
        id: "e1",
        name: "CNC Machine 01",
        serialNumber: "CNM-2024-001",
        category: "Machine",
        departmentId: "prod",
        purchaseDate: "2023-01-15",
        warrantyExpiry: "2025-01-15",
        location: "Production Floor - Bay 1",
        maintenanceTeamId: "t1",
        status: "Active",
      },
      {
        id: "e2",
        name: "Printer 01",
        serialNumber: "PRT-2024-001",
        category: "Computer",
        departmentId: "office",
        purchaseDate: "2022-06-20",
        location: "Main Office - Room 101",
        maintenanceTeamId: "t3",
        status: "Active",
      },
      {
        id: "e3",
        name: "Forklift A",
        serialNumber: "FRK-2024-001",
        category: "Vehicle",
        departmentId: "warehouse",
        purchaseDate: "2021-11-10",
        location: "Warehouse - Loading Bay",
        maintenanceTeamId: "t1",
        status: "Active",
      },
    ]

    const demoRequests: MaintenanceRequest[] = [
      {
        id: "r1",
        subject: "Leaking Oil",
        type: "Corrective",
        equipmentId: "e1",
        requestedByUserId: "2",
        assignedToUserId: "3",
        teamId: "t1",
        stage: "In Progress",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        isOverdue: true,
      },
      {
        id: "r2",
        subject: "Paper Jam",
        type: "Corrective",
        equipmentId: "e2",
        requestedByUserId: "2",
        teamId: "t3",
        stage: "New",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "r3",
        subject: "Routine Maintenance",
        type: "Preventive",
        equipmentId: "e3",
        requestedByUserId: "2",
        teamId: "t1",
        stage: "New",
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    const demoCategories: EquipmentCategory[] = [
      { id: "cat1", name: "Machine", description: "Industrial machines and CNC equipment" },
      { id: "cat2", name: "Computer", description: "Computers, printers, and IT equipment" },
      { id: "cat3", name: "Vehicle", description: "Vehicles and transport equipment" },
      { id: "cat4", name: "Tool", description: "Hand tools and power tools" },
    ]

    const demoNotifications: Notification[] = [
      { id: "n1", userId: "1", message: "New maintenance request for CNC Machine 01", isRead: false },
      { id: "n2", userId: "2", message: "Paper Jam resolved on Printer 01", isRead: true },
      { id: "n3", userId: "3", message: "Scheduled maintenance for Forklift A", isRead: false },
    ]

    storage.setUsers(demoUsers)
    storage.setTeams(demoTeams)
    storage.setEquipment(demoEquipment)
    storage.setRequests(demoRequests)
    storage.setCategories(demoCategories)
    storage.setNotifications(demoNotifications)

    localStorage.setItem(`${STORAGE_PREFIX}initialized`, "true")
  },
}
