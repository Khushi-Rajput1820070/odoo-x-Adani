// LocalStorage management for GearGuard - Multi-Company Support
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

// Helper to get company ID from current user
const getCompanyId = (): string | null => {
  const currentUser = storage.getCurrentUser()
  if (!currentUser) return null
  // For admin, companyId is their own ID. For others, it's their companyId
  return currentUser.companyId || (currentUser.role === "admin" ? currentUser.id : null)
}

// Helper to get company-scoped storage key
const getCompanyKey = (key: string, companyId: string | null): string => {
  if (!companyId) return `${STORAGE_PREFIX}${key}` // Fallback for backward compatibility
  return `${STORAGE_PREFIX}company_${companyId}_${key}`
}

export const storage = {
  // User management - company-scoped
  getUsers: (): User[] => {
    const companyId = getCompanyId()
    if (!companyId) return []
    const data = localStorage.getItem(getCompanyKey("users", companyId))
    return data ? JSON.parse(data) : []
  },
  setUsers: (users: User[]) => {
    const companyId = getCompanyId()
    if (!companyId) return
    localStorage.setItem(getCompanyKey("users", companyId), JSON.stringify(users))
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
  // Get all admins (for checking if signup should be disabled)
  getAllAdmins: (): User[] => {
    const allAdmins: User[] = []
    // Get all company keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(`${STORAGE_PREFIX}company_`) && key.endsWith("_users")) {
        const data = localStorage.getItem(key)
        if (data) {
          const users: User[] = JSON.parse(data)
          const admins = users.filter((u) => u.role === "admin")
          allAdmins.push(...admins)
        }
      }
    }
    return allAdmins
  },

  // Teams - company-scoped
  getTeams: (): Team[] => {
    const companyId = getCompanyId()
    if (!companyId) return []
    const data = localStorage.getItem(getCompanyKey("teams", companyId))
    return data ? JSON.parse(data) : []
  },
  setTeams: (teams: Team[]) => {
    const companyId = getCompanyId()
    if (!companyId) return
    localStorage.setItem(getCompanyKey("teams", companyId), JSON.stringify(teams))
  },

  // Work Centers - company-scoped
  getWorkCenters: (): WorkCenter[] => {
    const companyId = getCompanyId()
    if (!companyId) return []
    const data = localStorage.getItem(getCompanyKey("workCenters", companyId))
    return data ? JSON.parse(data) : []
  },
  setWorkCenters: (workCenters: WorkCenter[]) => {
    const companyId = getCompanyId()
    if (!companyId) return
    localStorage.setItem(getCompanyKey("workCenters", companyId), JSON.stringify(workCenters))
  },

  // Equipment - company-scoped
  getEquipment: (): Equipment[] => {
    const companyId = getCompanyId()
    if (!companyId) return []
    const data = localStorage.getItem(getCompanyKey("equipment", companyId))
    return data ? JSON.parse(data) : []
  },
  setEquipment: (equipment: Equipment[]) => {
    const companyId = getCompanyId()
    if (!companyId) return
    localStorage.setItem(getCompanyKey("equipment", companyId), JSON.stringify(equipment))
  },

  // Maintenance Requests - company-scoped
  getRequests: (): MaintenanceRequest[] => {
    const companyId = getCompanyId()
    if (!companyId) return []
    const data = localStorage.getItem(getCompanyKey("requests", companyId))
    return data ? JSON.parse(data) : []
  },
  setRequests: (requests: MaintenanceRequest[]) => {
    const companyId = getCompanyId()
    if (!companyId) return
    localStorage.setItem(getCompanyKey("requests", companyId), JSON.stringify(requests))
  },

  // Equipment Categories - company-scoped
  getCategories: (): EquipmentCategory[] => {
    const companyId = getCompanyId()
    if (!companyId) return []
    const data = localStorage.getItem(getCompanyKey("categories", companyId))
    return data ? JSON.parse(data) : []
  },
  setCategories: (categories: EquipmentCategory[]) => {
    const companyId = getCompanyId()
    if (!companyId) return
    localStorage.setItem(getCompanyKey("categories", companyId), JSON.stringify(categories))
  },

  // Notification management - company-scoped
  getNotifications: (): Notification[] => {
    const companyId = getCompanyId()
    if (!companyId) return []
    const data = localStorage.getItem(getCompanyKey("notifications", companyId))
    return data ? JSON.parse(data) : []
  },
  setNotifications: (notifications: Notification[]) => {
    const companyId = getCompanyId()
    if (!companyId) return
    localStorage.setItem(getCompanyKey("notifications", companyId), JSON.stringify(notifications))
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

  // Tracking Logs management - company-scoped
  getTrackingLogs: (requestId: string): TrackingLog[] => {
    const companyId = getCompanyId()
    if (!companyId) return []
    const logs = localStorage.getItem(getCompanyKey(`tracking_${requestId}`, companyId))
    return logs ? JSON.parse(logs) : []
  },
  addTrackingLog: (requestId: string, log: TrackingLog) => {
    const logs = storage.getTrackingLogs(requestId)
    logs.push(log)
    const companyId = getCompanyId()
    if (!companyId) return
    localStorage.setItem(getCompanyKey(`tracking_${requestId}`, companyId), JSON.stringify(logs))
  },

  // Requirements management - company-scoped
  getRequirements: (requestId: string): Requirement[] => {
    const companyId = getCompanyId()
    if (!companyId) return []
    const reqs = localStorage.getItem(getCompanyKey(`requirements_${requestId}`, companyId))
    return reqs ? JSON.parse(reqs) : []
  },
  addRequirement: (requestId: string, requirement: Requirement) => {
    const reqs = storage.getRequirements(requestId)
    reqs.push(requirement)
    const companyId = getCompanyId()
    if (!companyId) return
    localStorage.setItem(getCompanyKey(`requirements_${requestId}`, companyId), JSON.stringify(reqs))
  },
  updateRequirement: (requestId: string, requirementId: string, updates: Partial<Requirement>) => {
    const reqs = storage.getRequirements(requestId)
    const req = reqs.find((r) => r.id === requirementId)
    if (req) {
      Object.assign(req, updates)
      const companyId = getCompanyId()
      if (!companyId) return
      localStorage.setItem(getCompanyKey(`requirements_${requestId}`, companyId), JSON.stringify(reqs))
    }
  },

  // Initialize company data (called when first admin signs up)
  initializeCompanyData: (companyId: string) => {
    // Initialize empty data for the new company
    localStorage.setItem(getCompanyKey("users", companyId), JSON.stringify([]))
    localStorage.setItem(getCompanyKey("teams", companyId), JSON.stringify([]))
    localStorage.setItem(getCompanyKey("workCenters", companyId), JSON.stringify([]))
    localStorage.setItem(getCompanyKey("equipment", companyId), JSON.stringify([]))
    localStorage.setItem(getCompanyKey("requests", companyId), JSON.stringify([]))
    localStorage.setItem(getCompanyKey("categories", companyId), JSON.stringify([]))
    localStorage.setItem(getCompanyKey("notifications", companyId), JSON.stringify([]))
  },

  // Initialize demo data (only for testing - should not be used in production)
  initializeDemoData: () => {
    if (localStorage.getItem(`${STORAGE_PREFIX}initialized`)) return

    const demoCompanyId = "demo_company_1"
    const demoKey = (key: string) => `${STORAGE_PREFIX}company_${demoCompanyId}_${key}`
    const demoUsers: User[] = [
      {
        id: "1",
        email: "admin@gearguard.com",
        name: "Admin User",
        role: "admin",
        companyId: demoCompanyId,
        createdAt: new Date().toISOString(),
      },
      {
        id: "3",
        email: "tech1@gearguard.com",
        name: "Alex Foster",
        role: "technician",
        companyId: demoCompanyId,
        createdAt: new Date().toISOString(),
      },
      {
        id: "4",
        email: "tech2@gearguard.com",
        name: "Sarah Johnson",
        role: "technician",
        companyId: demoCompanyId,
        createdAt: new Date().toISOString(),
      },
      {
        id: "5",
        email: "user@gearguard.com",
        name: "Mike User",
        role: "user",
        companyId: demoCompanyId,
        createdAt: new Date().toISOString(),
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
        requestedByUserId: "5",
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
        requestedByUserId: "5",
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
        requestedByUserId: "5",
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
      {
        id: "n1",
        userId: "1",
        type: "new_request",
        title: "New Maintenance Request",
        message: "New maintenance request for CNC Machine 01",
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "n2",
        userId: "5",
        type: "request_completed",
        title: "Request Completed",
        message: "Paper Jam resolved on Printer 01",
        isRead: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "n3",
        userId: "3",
        type: "request_assigned",
        title: "Task Assigned",
        message: "Scheduled maintenance for Forklift A",
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ]

    // Store demo data with company scope
    localStorage.setItem(getCompanyKey("users", demoCompanyId), JSON.stringify(demoUsers))
    localStorage.setItem(getCompanyKey("teams", demoCompanyId), JSON.stringify(demoTeams))
    localStorage.setItem(getCompanyKey("equipment", demoCompanyId), JSON.stringify(demoEquipment))
    localStorage.setItem(getCompanyKey("requests", demoCompanyId), JSON.stringify(demoRequests))
    localStorage.setItem(getCompanyKey("categories", demoCompanyId), JSON.stringify(demoCategories))
    localStorage.setItem(getCompanyKey("notifications", demoCompanyId), JSON.stringify(demoNotifications))

    localStorage.setItem(`${STORAGE_PREFIX}initialized`, "true")
  },
}
