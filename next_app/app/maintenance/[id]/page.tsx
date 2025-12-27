"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { storage } from "@/lib/storage"
import AppLayout from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { MaintenanceRequest, Equipment, User } from "@/lib/types"

export default function RequestDetailPage() {
  const router = useRouter()
  const params = useParams()
  const requestId = params.id as string

  const [request, setRequest] = useState<MaintenanceRequest | null>(null)
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [assignedUser, setAssignedUser] = useState<User | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [durationHours, setDurationHours] = useState("")
  const [notes, setNotes] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [selectedAssignee, setSelectedAssignee] = useState("")
  const [trackingLogs, setTrackingLogs] = useState<any[]>([])
  const [requirements, setRequirements] = useState<any[]>([])
  const [showTrackingForm, setShowTrackingForm] = useState(false)
  const [trackingDescription, setTrackingDescription] = useState("")
  const [showRequirementsForm, setShowRequirementsForm] = useState(false)
  const [requirementsData, setRequirementsData] = useState({ pricing: "", products: "", notes: "" })

  useEffect(() => {
    const user = storage.getCurrentUser()
    if (!user) {
      router.push("/auth/login")
      return
    }
    setCurrentUser(user)

    const allRequests = storage.getRequests()
    const found = allRequests.find((r) => r.id === requestId)
    if (found) {
      setRequest(found)
      setNotes(found.notes || "")
      setDurationHours(found.durationHours?.toString() || "")
      setSelectedAssignee(found.assignedToUserId || "")

      const eq = storage.getEquipment().find((e) => e.id === found.equipmentId)
      setEquipment(eq || null)

      if (found.assignedToUserId) {
        const u = storage.getUsers().find((u) => u.id === found.assignedToUserId)
        setAssignedUser(u || null)
      }

      setTrackingLogs(storage.getTrackingLogs(requestId))
      setRequirements(storage.getRequirements(requestId))
    }

    setUsers(storage.getUsers())
  }, [requestId, router])

  const canViewRequest = () => {
    if (!request) return false
    if (currentUser?.role === "admin" || currentUser?.role === "manager") return true
    if (currentUser?.role === "technician" && request.assignedToUserId === currentUser?.id) return true
    if (currentUser?.role === "requester" && request.requestedByUserId === currentUser?.id) return true
    return false
  }

  const canEditAssignment = () => currentUser?.role === "admin" || currentUser?.role === "manager"
  const canChangeStage = () => {
    if (currentUser?.role === "admin" || currentUser?.role === "manager") return true
    if (currentUser?.role === "technician" && request?.assignedToUserId === currentUser?.id) return true
    return false
  }
  const canEditDetails = () => {
    if (currentUser?.role === "admin" || currentUser?.role === "manager") return true
    if (currentUser?.role === "technician" && request?.assignedToUserId === currentUser?.id) return true
    return false
  }

  const handleStageChange = (newStage: string) => {
    if (!request || !canChangeStage()) return

    const updatedRequest = { ...request, stage: newStage as any, updatedAt: new Date().toISOString() }
    const allRequests = storage.getRequests()
    storage.setRequests(allRequests.map((r) => (r.id === request.id ? updatedRequest : r)))
    setRequest(updatedRequest)

    if (newStage === "In Progress" && request.stage === "New") {
      const requester = users.find((u) => u.id === request.requestedByUserId)
      if (requester) {
        storage.addNotification({
          id: `notif-${Date.now()}-progress`,
          userId: requester.id,
          type: "request_updated",
          title: "Request In Progress",
          message: `Your request "${request.subject}" is now in progress`,
          relatedId: request.id,
          relatedType: "request",
          isRead: false,
          createdAt: new Date().toISOString(),
        })
      }
    } else if (newStage === "Repaired" && request.stage !== "Repaired") {
      const requester = users.find((u) => u.id === request.requestedByUserId)
      const assignee = users.find((u) => u.id === request.assignedToUserId)
      const adminsAndManagers = users.filter((u) => u.role === "admin" || u.role === "manager")

      if (requester) {
        storage.addNotification({
          id: `notif-${Date.now()}-completed`,
          userId: requester.id,
          type: "request_completed",
          title: "Request Completed",
          message: `Your request "${request.subject}" has been completed`,
          relatedId: request.id,
          relatedType: "request",
          isRead: false,
          createdAt: new Date().toISOString(),
        })
      }

      adminsAndManagers.forEach((admin) => {
        storage.addNotification({
          id: `notif-${Date.now()}-${admin.id}`,
          userId: admin.id,
          type: "request_completed",
          title: "Request Completed",
          message: `Request "${request.subject}" has been completed by ${assignee?.name || "technician"}`,
          relatedId: request.id,
          relatedType: "request",
          isRead: false,
          createdAt: new Date().toISOString(),
        })
      })
    }
  }

  const handleAssign = (userId: string) => {
    if (!request || !canEditAssignment()) return

    const user = users.find((u) => u.id === userId)
    const previousAssignee = users.find((u) => u.id === request.assignedToUserId)

    const updatedRequest = {
      ...request,
      assignedToUserId: userId,
      updatedAt: new Date().toISOString(),
    }

    const allRequests = storage.getRequests()
    storage.setRequests(allRequests.map((r) => (r.id === request.id ? updatedRequest : r)))
    setRequest(updatedRequest)
    setAssignedUser(user || null)
    setSelectedAssignee(userId)

    if (userId) {
      storage.addNotification({
        id: `notif-${Date.now()}-assigned`,
        userId: userId,
        type: "request_assigned",
        title: "Task Assigned to You",
        message: `You have been assigned to: ${request.subject}`,
        relatedId: request.id,
        relatedType: "request",
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    }

    if (previousAssignee && previousAssignee.id !== userId) {
      storage.addNotification({
        id: `notif-${Date.now()}-reassigned`,
        userId: previousAssignee.id,
        type: "task_reassigned",
        title: "Task Reassigned",
        message: `Task "${request.subject}" has been reassigned to ${user?.name || "another technician"}`,
        relatedId: request.id,
        relatedType: "request",
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    }
  }

  const handleSave = () => {
    if (!request || !canEditDetails()) return

    const updatedRequest = {
      ...request,
      durationHours: durationHours ? Number(durationHours) : undefined,
      notes,
      updatedAt: new Date().toISOString(),
    }

    const allRequests = storage.getRequests()
    storage.setRequests(allRequests.map((r) => (r.id === request.id ? updatedRequest : r)))
    setRequest(updatedRequest)
    setIsEditing(false)
  }

  const handleAddTrackingLog = () => {
    if (!trackingDescription.trim() || !request) return

    const log = {
      id: `log-${Date.now()}`,
      requestId: request.id,
      description: trackingDescription,
      createdBy: currentUser!.id,
      createdAt: new Date().toISOString(),
    }

    storage.addTrackingLog(request.id, log)
    setTrackingLogs([...trackingLogs, log])
    setTrackingDescription("")
    setShowTrackingForm(false)

    const requester = users.find((u) => u.id === request.requestedByUserId)
    if (requester && currentUser!.role === "technician") {
      storage.addNotification({
        id: `notif-${Date.now()}-tracking`,
        userId: requester.id,
        type: "tracking_updated",
        title: "Request Update",
        message: `Update on ${request.subject}: ${trackingDescription.substring(0, 50)}...`,
        relatedId: request.id,
        relatedType: "request",
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    }
  }

  const handleSubmitRequirements = () => {
    if (!requirementsData.products || !request) return

    const requirement = {
      id: `req-${Date.now()}`,
      requestId: request.id,
      submittedBy: currentUser!.id,
      pricing: requirementsData.pricing ? Number(requirementsData.pricing) : undefined,
      products: requirementsData.products.split(",").map((p) => p.trim()),
      notes: requirementsData.notes,
      status: "pending" as const,
      submittedAt: new Date().toISOString(),
    }

    storage.addRequirement(request.id, requirement)
    setRequirements([...requirements, requirement])
    setRequirementsData({ pricing: "", products: "", notes: "" })
    setShowRequirementsForm(false)

    const admins = users.filter((u) => u.role === "admin")
    admins.forEach((admin) => {
      storage.addNotification({
        id: `notif-${Date.now()}-${admin.id}`,
        userId: admin.id,
        type: "requirement_submitted",
        title: "Repair Requirements Submitted",
        message: `Technician submitted requirements for ${request.subject}`,
        relatedId: request.id,
        relatedType: "request",
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    })
  }

  if (!currentUser) return null

  if (!request) {
    return (
      <AppLayout activeTab="maintenance">
        <Card className="bg-slate-800/30 border-slate-700/50 p-8">
          <p className="text-slate-400">Request not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </Card>
      </AppLayout>
    )
  }

  if (!canViewRequest()) {
    return (
      <AppLayout activeTab="maintenance">
        <Card className="bg-slate-800/30 border-slate-700/50 p-8">
          <p className="text-slate-400 mb-4">You don't have permission to view this request.</p>
          <Button onClick={() => router.back()} className="bg-slate-700 hover:bg-slate-600">
            Go Back
          </Button>
        </Card>
      </AppLayout>
    )
  }

  const stageColors = {
    New: "bg-blue-500/20 text-blue-300",
    "In Progress": "bg-yellow-500/20 text-yellow-300",
    Repaired: "bg-green-500/20 text-green-300",
    Scrap: "bg-red-500/20 text-red-300",
  }

  return (
    <AppLayout activeTab="maintenance">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{request.subject}</h2>
            <p className="text-slate-400">Request ID: {request.id}</p>
          </div>
          <Button onClick={() => router.back()} className="bg-slate-700/50 border border-slate-600 text-slate-300">
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Type Badge */}
          <Card className="bg-slate-800/30 border-slate-700/50 p-4">
            <p className="text-xs font-medium text-slate-400 mb-2">Type</p>
            <Badge className={request.type === "Preventive" ? "bg-green-600" : "bg-red-600"}>{request.type}</Badge>
          </Card>

          {/* Stage Selector - Add permission check */}
          <Card className="bg-slate-800/30 border-slate-700/50 p-4">
            <p className="text-xs font-medium text-slate-400 mb-2">Stage</p>
            {canChangeStage() ? (
              <select
                value={request.stage}
                onChange={(e) => handleStageChange(e.target.value)}
                className={`w-full px-3 py-2 rounded text-sm font-medium ${stageColors[request.stage as keyof typeof stageColors]}`}
              >
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Repaired">Repaired</option>
                <option value="Scrap">Scrap</option>
              </select>
            ) : (
              <p
                className={`px-3 py-2 rounded text-sm font-medium ${stageColors[request.stage as keyof typeof stageColors]}`}
              >
                {request.stage}
              </p>
            )}
          </Card>

          {/* Created Date */}
          <Card className="bg-slate-800/30 border-slate-700/50 p-4">
            <p className="text-xs font-medium text-slate-400 mb-2">Created</p>
            <p className="text-white text-sm">{new Date(request.createdAt).toLocaleDateString()}</p>
          </Card>
        </div>

        {/* Equipment Details */}
        {equipment && (
          <Card className="bg-slate-800/30 border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Equipment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Equipment Name</p>
                <p className="text-white font-medium">{equipment.name}</p>
              </div>
              <div>
                <p className="text-slate-400">Serial Number</p>
                <p className="text-white font-medium">{equipment.serialNumber}</p>
              </div>
              <div>
                <p className="text-slate-400">Category</p>
                <p className="text-white font-medium">{equipment.category}</p>
              </div>
              <div>
                <p className="text-slate-400">Location</p>
                <p className="text-white font-medium">{equipment.location}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Assignment - Add permission check */}
        <Card className="bg-slate-800/30 border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Assignment</h3>
          {canEditAssignment() ? (
            <>
              <select
                value={selectedAssignee}
                onChange={(e) => handleAssign(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded text-white mb-3"
              >
                <option value="">Unassigned</option>
                {users
                  .filter((u) => u.role !== "admin")
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
              </select>
              {assignedUser && <p className="text-sm text-green-400">Assigned to {assignedUser.name}</p>}
            </>
          ) : (
            <p className="text-white">
              Assigned to: <span className="font-medium">{assignedUser?.name || "Unassigned"}</span>
            </p>
          )}
        </Card>

        {/* Editable Details - Add permission check */}
        <Card className="bg-slate-800/30 border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Details</h3>
            {canEditDetails() && (
              <Button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {/* Description */}
            <div>
              <p className="text-sm font-medium text-slate-400 mb-2">Description</p>
              {isEditing ? (
                <Textarea
                  value={request.description || ""}
                  onChange={(e) => setRequest({ ...request, description: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              ) : (
                <p className="text-white">{request.description || "No description"}</p>
              )}
            </div>

            {/* Duration Hours */}
            {request.stage === "Repaired" && (
              <div>
                <p className="text-sm font-medium text-slate-400 mb-2">Duration (Hours)</p>
                {isEditing ? (
                  <Input
                    type="number"
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                ) : (
                  <p className="text-white">{durationHours || "Not specified"}</p>
                )}
              </div>
            )}

            {/* Notes */}
            <div>
              <p className="text-sm font-medium text-slate-400 mb-2">Notes</p>
              {isEditing ? (
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              ) : (
                <p className="text-white">{notes || "No notes"}</p>
              )}
            </div>

            {isEditing && (
              <Button
                onClick={handleSave}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                Save Changes
              </Button>
            )}
          </div>
        </Card>

        {/* Tracking Log Section */}
        {currentUser.role !== "user" && (
          <Card className="bg-slate-800/30 border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Update Tracking</h3>
              {currentUser.role === "technician" && request.assignedToUserId === currentUser.id && (
                <Button
                  onClick={() => setShowTrackingForm(!showTrackingForm)}
                  className="bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  {showTrackingForm ? "Cancel" : "Add Update"}
                </Button>
              )}
            </div>

            {showTrackingForm && (
              <div className="space-y-3 mb-4 p-4 bg-slate-700/20 rounded border border-slate-600/30">
                <Textarea
                  placeholder="Describe the work completed (e.g., Inspected equipment, Ordered parts, Fixed leak)"
                  value={trackingDescription}
                  onChange={(e) => setTrackingDescription(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
                <Button onClick={handleAddTrackingLog} className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Add Update
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {trackingLogs.length > 0 ? (
                trackingLogs.map((log: any) => (
                  <div key={log.id} className="p-3 bg-slate-700/20 rounded border border-slate-600/30">
                    <p className="text-white text-sm font-medium mb-1">{log.description}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(log.createdAt).toLocaleString()} by{" "}
                      {users.find((u) => u.id === log.createdBy)?.name || "Unknown"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm">No updates yet</p>
              )}
            </div>
          </Card>
        )}

        {/* Requirements Section */}
        {currentUser.role === "technician" && request.assignedToUserId === currentUser.id && (
          <Card className="bg-slate-800/30 border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Repair Requirements</h3>
              <Button
                onClick={() => setShowRequirementsForm(!showRequirementsForm)}
                className="bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                {showRequirementsForm ? "Cancel" : "Submit Requirements"}
              </Button>
            </div>

            {showRequirementsForm && !requirements.some((r: any) => r.status === "pending") && (
              <div className="space-y-3 mb-4 p-4 bg-slate-700/20 rounded border border-slate-600/30">
                <div>
                  <label className="text-sm text-slate-300">Required Products (comma-separated)</label>
                  <Input
                    placeholder="Gasket, Oil seal, Bearing"
                    value={requirementsData.products}
                    onChange={(e) => setRequirementsData({ ...requirementsData, products: e.target.value })}
                    className="mt-1 bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300">Estimated Pricing</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={requirementsData.pricing}
                    onChange={(e) => setRequirementsData({ ...requirementsData, pricing: e.target.value })}
                    className="mt-1 bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300">Additional Notes</label>
                  <Textarea
                    placeholder="Any additional details..."
                    value={requirementsData.notes}
                    onChange={(e) => setRequirementsData({ ...requirementsData, notes: e.target.value })}
                    className="mt-1 bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <Button onClick={handleSubmitRequirements} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Submit to Admin
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {requirements.length > 0 ? (
                requirements.map((req: any) => (
                  <div key={req.id} className="p-3 bg-slate-700/20 rounded border border-slate-600/30">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-white text-sm font-medium">Products needed:</p>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          req.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-300"
                            : req.status === "approved"
                              ? "bg-green-500/20 text-green-300"
                              : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs mb-1">{req.products.join(", ")}</p>
                    {req.pricing && <p className="text-slate-400 text-xs">Pricing: ${req.pricing}</p>}
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm">No requirements submitted yet</p>
              )}
            </div>
          </Card>
        )}

        {/* Admin can view and approve requirements */}
        {currentUser.role === "admin" && requirements.length > 0 && (
          <Card className="bg-slate-800/30 border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Submitted Requirements</h3>
            <div className="space-y-3">
              {requirements.map((req: any) => (
                <div key={req.id} className="p-3 bg-slate-700/20 rounded border border-slate-600/30">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-white text-sm font-medium">Products: {req.products.join(", ")}</p>
                    <span className="text-xs text-slate-400">
                      Submitted by {users.find((u) => u.id === req.submittedBy)?.name}
                    </span>
                  </div>
                  {req.pricing && <p className="text-slate-300 text-sm">Pricing: ${req.pricing}</p>}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
