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
}

export interface Team {
  id: string
  name: string
  description?: string
  memberIds: string[]
  createdAt?: string
}

export interface WorkCenter {
  id: string
  name: string
  code: string
  tag?: string
  alternativeWorkcenters?: string[]
  costPerHour?: number
  capacityTimeEfficiency?: number
  oeeTarget?: number
  company?: string
}

export interface Equipment {
  id: string
  name: string
  serialNumber: string
  category: string
  company?: string
  usedBy?: string // Employee name or ID
  maintenanceTeamId: string
  assignedDate?: string
  description?: string
  technicianId?: string // Responsible technician
  scrapDate?: string
  usedInLocation?: string
  workCenterId?: string
  status: "Active" | "Inactive" | "Scrapped"
  notes?: string
  departmentId?: string
}

export interface MaintenanceRequest {
  id: string
  subject: string
  description?: string
  maintenanceFor: "Equipment" | "WorkCenter"
  equipmentId?: string
  workCenterId?: string
  type: RequestType
  category: string
  requestedByUserId: string
  assignedToUserId?: string
  teamId: string
  stage: RequestStage
  scheduledDate?: string
  completedDate?: string
  durationHours?: number
  priority: "Low" | "Medium" | "High" | "Critical"
  company?: string
  notes?: string
  instructions?: string
  createdAt: string
  updatedAt: string
  isOverdue?: boolean
  trackingLogs?: TrackingLog[]
  requirements?: Requirement[]
  acceptedAt?: string
}

export interface EquipmentCategory {
  id: string
  name: string
  description?: string
  company?: string
}
