"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { storage } from "@/lib/storage"
import AppLayout from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { MaintenanceRequest, Equipment, Team, User } from "@/lib/types"

export default function NewRequestPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    type: "Corrective" as "Corrective" | "Preventive",
    equipmentId: "",
    scheduledDate: "",
    priority: "Medium",
  })
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedTeam, setSelectedTeam] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const user = storage.getCurrentUser()
    if (!user) {
      router.push("/auth/login")
      return
    }
    setCurrentUser(user)
    setEquipment(storage.getEquipment())
    setTeams(storage.getTeams())
    setUsers(storage.getUsers())
  }, [router])

  if (!currentUser) return null

  if (!["admin", "manager", "requester"].includes(currentUser.role)) {
    return (
      <AppLayout activeTab="maintenance">
        <Card className="bg-slate-800/30 border-slate-700/50 p-8 text-center">
          <p className="text-slate-400 mb-4">You don't have permission to create requests.</p>
          <Button onClick={() => router.push("/dashboard")} className="bg-blue-600 hover:bg-blue-700">
            Back to Dashboard
          </Button>
        </Card>
      </AppLayout>
    )
  }

  const handleEquipmentChange = (equipmentId: string) => {
    setFormData({ ...formData, equipmentId })
    const selectedEquip = equipment.find((e) => e.id === equipmentId)
    if (selectedEquip) {
      setSelectedTeam(selectedEquip.maintenanceTeamId)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!formData.subject || !formData.equipmentId) {
      setError("Subject and Equipment are required")
      setIsLoading(false)
      return
    }

    if (formData.type === "Preventive" && !formData.scheduledDate) {
      setError("Scheduled Date is required for Preventive maintenance")
      setIsLoading(false)
      return
    }

    const newRequest: MaintenanceRequest = {
      id: `r${Date.now()}`,
      subject: formData.subject,
      description: formData.description,
      type: formData.type,
      equipmentId: formData.equipmentId,
      requestedByUserId: currentUser.id,
      teamId: selectedTeam,
      stage: "New",
      scheduledDate: formData.scheduledDate || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const requests = storage.getRequests()
    storage.setRequests([...requests, newRequest])

    const adminsAndManagers = users.filter((u) => u.role === "admin" || u.role === "manager")
    adminsAndManagers.forEach((admin) => {
      storage.addNotification({
        id: `notif-${Date.now()}-${Math.random()}`,
        userId: admin.id,
        type: "new_request",
        title: "New Request Created",
        message: `New request created by ${currentUser.name}: ${formData.subject}`,
        relatedId: newRequest.id,
        relatedType: "request",
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    })

    if (currentUser.role !== "admin" && currentUser.role !== "manager") {
      storage.addNotification({
        id: `notif-${Date.now()}-requester`,
        userId: currentUser.id,
        type: "system_alert",
        title: "Request Submitted",
        message: `Your request "${formData.subject}" has been submitted`,
        relatedId: newRequest.id,
        relatedType: "request",
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    }

    router.push("/maintenance")
  }

  const selectedEquipment = equipment.find((e) => e.id === formData.equipmentId)
  const selectedTeamData = teams.find((t) => t.id === selectedTeam)

  return (
    <AppLayout activeTab="maintenance">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Create Maintenance Request</h2>
          <p className="text-slate-400">Submit a new maintenance or repair request</p>
        </div>

        <Card className="bg-slate-800/30 border-slate-700/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Request Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Request Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as "Corrective" | "Preventive" })}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded text-white"
                >
                  <option value="Corrective">Corrective (Breakdown)</option>
                  <option value="Preventive">Preventive (Routine)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded text-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Subject *</label>
              <Input
                placeholder="e.g., Leaking Oil, Paper Jam"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>

            {/* Equipment Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Equipment *</label>
              <select
                value={formData.equipmentId}
                onChange={(e) => handleEquipmentChange(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded text-white"
              >
                <option value="">Select equipment</option>
                {equipment.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.serialNumber})
                  </option>
                ))}
              </select>

              {selectedEquipment && (
                <div className="mt-3 p-4 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded text-sm text-slate-300 space-y-2">
                  <p>
                    <span className="font-medium text-blue-300">Category:</span> {selectedEquipment.category}
                  </p>
                  <p>
                    <span className="font-medium text-blue-300">Location:</span> {selectedEquipment.location}
                  </p>
                  {selectedTeamData && (
                    <p>
                      <span className="font-medium text-blue-300">Assigned Team:</span> {selectedTeamData.name}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Scheduled Date for Preventive */}
            {formData.type === "Preventive" && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Scheduled Date *</label>
                <Input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <Textarea
                placeholder="Describe the issue or maintenance needs..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-slate-700/50 border-slate-600 text-white min-h-32"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-sm">{error}</div>
            )}

            {/* Buttons */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {isLoading ? "Creating..." : "Create Request"}
              </Button>
              <Button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  )
}
