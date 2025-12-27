"use client"

import { Suspense } from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { storage } from "@/lib/storage"
import type { Equipment, User } from "@/lib/types"
import AppLayout from "@/components/layout/app-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

function IssueReportForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const equipmentId = searchParams.get("equipmentId")
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("Medium")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const user = storage.getCurrentUser()
    if (!user) {
      router.push("/auth/login")
      return
    }
    if (user.role !== "user") {
      router.push("/dashboard")
      return
    }
    setCurrentUser(user)

    if (equipmentId) {
      const allEquipment = storage.getEquipment()
      const item = allEquipment.find((e) => e.id === equipmentId)
      setEquipment(item || null)
    }
  }, [router, equipmentId])

  const handleSubmit = async () => {
    if (!equipment || !subject.trim() || !description.trim()) {
      alert("Please provide a subject and describe the issue")
      return
    }

    setIsSubmitting(true)

    const newRequest = {
      id: `req-${Date.now()}`,
      subject: subject.trim(),
      description: description.trim(),
      type: "Corrective" as const,
      equipmentId: equipment.id,
      requestedByUserId: currentUser!.id,
      assignedToUserId: undefined,
      teamId: equipment.maintenanceTeamId,
      stage: "New" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const requests = storage.getRequests()
    storage.setRequests([...requests, newRequest])

    const admins = storage.getUsers().filter((u) => u.role === "admin")
    admins.forEach((admin) => {
      storage.addNotification({
        id: `notif-${Date.now()}-${admin.id}`,
        userId: admin.id,
        type: "new_request",
        title: "New Equipment Issue",
        message: `New issue reported for ${equipment.name}: ${description.substring(0, 50)}...`,
        relatedId: newRequest.id,
        relatedType: "request",
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    })

    storage.addNotification({
      id: `notif-user-${Date.now()}`,
      userId: currentUser!.id,
      type: "system_alert",
      title: "Request Submitted Successfully",
      message: `Your request has been submitted successfully. Request ID: ${newRequest.id}`,
      relatedId: newRequest.id,
      relatedType: "request",
      isRead: false,
      createdAt: new Date().toISOString(),
    })

    router.push("/dashboard")
    setIsSubmitting(false)
  }

  if (!currentUser || !equipment) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">Report Equipment Issue</h2>
        <p className="text-sm text-slate-400 mt-1">Describe what's wrong with the equipment</p>
      </div>

      <Card className="bg-slate-800/30 border-slate-700/50 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Equipment</label>
          <div className="p-4 bg-slate-700/30 rounded border border-slate-600">
            <p className="font-semibold text-white">{equipment.name}</p>
            <p className="text-sm text-slate-400 mt-1">Serial Number: {equipment.serialNumber}</p>
            <p className="text-sm text-slate-400">Category: {equipment.category}</p>
            <p className="text-sm text-slate-400">Location: {equipment.location}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Subject / Title <span className="text-red-400">*</span>
          </label>
          <Input
            type="text"
            placeholder="e.g., Leaking Oil, Paper Jam, Equipment Not Starting"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-slate-700/50 border-slate-600 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Description of the Issue <span className="text-red-400">*</span>
          </label>
          <Textarea
            placeholder="What is failing or not working properly? Describe the issue in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-slate-700/50 border-slate-600 text-white min-h-32"
          />
          <p className="text-xs text-slate-400 mt-2">
            Be specific about the problem so technicians can address it properly
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded text-white"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white backdrop-blur"
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default function IssueReportPage() {
  return (
    <AppLayout activeTab="maintenance">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <IssueReportForm />
      </Suspense>
    </AppLayout>
  )
}
