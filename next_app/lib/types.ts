// Core data types for GearGuard
export type RequestStage = "New" | "In Progress" | "Repaired" | "Scrap"
export type RequestType = "Corrective" | "Preventive"
export type UserRole = "admin" | "technician" | "user"
export type NotificationType =
  | "new_request"
  | "request_assigned"
  | "request_updated"
  | "request_completed"
  | "task_reassigned"
  | "equipment_updated"
  | "new_user_registered"
  | "system_alert"
  | "requirement_submitted"
  | "tracking_updated"

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  relatedId?: string
  relatedType?: "request" | "equipment" | "user"
  isRead: boolean
  createdAt: string
}

export interface TrackingLog {
  id: string
  requestId: string
  description: string
  createdBy: string
  createdAt: string
}

export interface Requirement {
  id: string
  requestId: string
  submittedBy: string
  pricing?: number
  products: string[]
  notes?: string
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  approvedAt?: string
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  department?: string
  createdAt?: string
  companyId: string // ID of the admin who owns this company (for admin, this is their own ID)
}

export interface Team {
  id: string
  name: string
  description?: string
  memberIds: string[]
  createdAt?: string
  companyId?: string
}

export interface Equipment {
  id: string
  name: string
  serialNumber: string
  category: string
  departmentId: string
  assignedToUserId?: string
  purchaseDate: string
  warrantyExpiry?: string
  location: string
  maintenanceTeamId: string
  status: "Active" | "Inactive" | "Scrapped"
  notes?: string
  // New fields from wireframe
  company?: string
  usedFor?: string
  maintenanceType?: string // e.g., "External Maintenance"
  assigneeDate?: string
  employee?: string
  stayDate?: string
  workOrderId?: string
}

export interface MaintenanceRequest {
  id: string
  subject: string
  description?: string
  type: RequestType
  equipmentId: string
  requestedByUserId: string
  assignedToUserId?: string
  teamId: string
  stage: RequestStage
  scheduledDate?: string
  completedDate?: string
  durationHours?: number
  notes?: string
  createdAt: string
  updatedAt: string
  isOverdue?: boolean
  trackingLogs?: TrackingLog[]
  requirements?: Requirement[]
  acceptedAt?: string
  // New fields from wireframe
  cost?: number
  costPerHour?: number
  quantity?: number
  quantityUnit?: string
  dateTarget?: string
  alternativeInformation?: string
  frequency?: string // e.g., "Daily", "Weekly", "Monthly"
  location?: string
  time?: string // Time field (HH:mm format)
  attachments?: string[] // URLs or file paths
  workCenterId?: string // Reference to work center
}

export interface WorkCenter {
  id: string
  name: string
  cost?: number
  quantity?: number
  allocatedManHours?: number
  costPerHour?: number
  estimateTotalPrice?: number
  costTarget?: number
  description?: string
  skills?: WorkCenterSkill[] // Skills/tasks/methods/processes for this work center
  createdAt?: string
  companyId?: string
}

export interface WorkCenterSkill {
  id: string
  workCenterId: string
  name: string
  description?: string
  cost?: number
  costPerHour?: number
}

export interface EquipmentCategory {
  id: string
  name: string
  description?: string
  responsible?: string // e.g., "Director", "Manager", "Engineer"
  company?: string
}
