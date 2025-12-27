"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { storage } from "@/lib/storage"
import type { MaintenanceRequest, Equipment, User, Team, RequestStage } from "@/lib/types"
import AppLayout from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const STAGES: RequestStage[] = ["New", "In Progress", "Repaired", "Scrap"]

function MaintenanceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [draggedCard, setDraggedCard] = useState<string | null>(null)

  useEffect(() => {
    const user = storage.getCurrentUser()
    if (!user) {
      router.push("/auth/login")
      return
    }
    setCurrentUser(user)
    setRequests(storage.getRequests())
    setEquipment(storage.getEquipment())
    setUsers(storage.getUsers())
    setTeams(storage.getTeams())
  }, [router])

  const handleDragStart = (requestId: string) => {
    setDraggedCard(requestId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDropOnStage = (stage: RequestStage) => {
    if (!draggedCard || currentUser?.role !== "admin") return

    const updated = requests.map((r) =>
      r.id === draggedCard ? { ...r, stage, updatedAt: new Date().toISOString() } : r,
    )
    setRequests(updated)
    storage.setRequests(updated)
    setDraggedCard(null)
  }

  if (!currentUser) return null

  const getFilteredRequests = () => {
    let filtered = requests
    const filter = searchParams.get("filter")

    if (currentUser.role === "technician" || filter === "assigned") {
      filtered = requests.filter((r) => r.assignedToUserId === currentUser.id)
    } else if (currentUser.role === "user" || filter === "my-requests") {
      filtered = requests.filter((r) => r.requestedByUserId === currentUser.id)
    }

    return filtered
  }

  const filteredRequests = getFilteredRequests()

  const getRequestsForStage = (stage: RequestStage) => filteredRequests.filter((r) => r.stage === stage)

  const getEquipmentName = (equipmentId: string) => {
    return equipment.find((e) => e.id === equipmentId)?.name || "Unknown"
  }

  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.name || "Unassigned"
  }

  const isOverdue = (request: MaintenanceRequest) => {
    if (!request.scheduledDate || request.stage === "Repaired" || request.stage === "Scrap") return false
    return new Date(request.scheduledDate) < new Date() && request.stage !== "Repaired"
  }

  const canCreateRequest = () => {
    return currentUser.role === "admin"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">
            {currentUser.role === "technician" ? "My Tasks" : "Maintenance Requests"}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {currentUser.role === "user"
              ? "Your submitted requests"
              : currentUser.role === "technician"
                ? "Your assigned maintenance tasks"
                : "All maintenance requests"}
          </p>
        </div>
        {canCreateRequest() && (
          <Button
            onClick={() => router.push("/maintenance/new")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white backdrop-blur"
          >
            New Request
          </Button>
        )}
      </div>

      {currentUser.role === "admin" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STAGES.map((stage) => (
            <div
              key={stage}
              onDragOver={handleDragOver}
              onDrop={() => handleDropOnStage(stage)}
              className="bg-slate-800/20 border border-slate-700/50 rounded-lg p-4 min-h-96 flex flex-col"
            >
              <h3 className="font-semibold text-white mb-4 pb-4 border-b border-slate-700">{stage}</h3>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {getRequestsForStage(stage).map((request) => (
                  <Card
                    key={request.id}
                    draggable
                    onDragStart={() => handleDragStart(request.id)}
                    onClick={() => router.push(`/maintenance/${request.id}`)}
                    className={`bg-gradient-to-br from-slate-700/40 to-slate-800/40 border-slate-600/50 cursor-move hover:shadow-lg hover:shadow-blue-500/20 transition-all ${
                      isOverdue(request) ? "border-l-4 border-l-red-500" : ""
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-white text-sm leading-tight flex-1">{request.subject}</h4>
                        <span
                          className={`text-xs px-2 py-1 rounded whitespace-nowrap ml-2 ${
                            request.type === "Corrective"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-blue-500/20 text-blue-300"
                          }`}
                        >
                          {request.type}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mb-3">{getEquipmentName(request.equipmentId)}</p>

                      {isOverdue(request) && (
                        <div className="mb-3 p-2 bg-red-900/20 border border-red-500/30 rounded text-red-300 text-xs">
                          Overdue
                        </div>
                      )}

                      <div className="text-xs text-slate-400">
                        <p>Assigned to: {getUserName(request.assignedToUserId || "")}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="mt-4 text-xs text-slate-400 border-t border-slate-700/50 pt-4">
                {getRequestsForStage(stage).length} request
                {getRequestsForStage(stage).length !== 1 ? "s" : ""}
              </div>
            </div>
          ))}
        </div>
      )}

      {(currentUser.role === "technician" || currentUser.role === "user") && (
        <Card className="bg-slate-800/30 border-slate-700/50 p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Subject</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Equipment</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Type</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Stage</th>
                  {currentUser.role === "technician" && (
                    <th className="text-left py-3 px-3 font-medium text-slate-400">Scheduled</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-b border-slate-700/50 hover:bg-slate-700/20 cursor-pointer"
                      onClick={() => router.push(`/maintenance/${request.id}`)}
                    >
                      <td className="py-3 px-3 text-white font-medium">{request.subject}</td>
                      <td className="py-3 px-3 text-slate-400">{getEquipmentName(request.equipmentId)}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            request.type === "Corrective"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-blue-500/20 text-blue-300"
                          }`}
                        >
                          {request.type}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            request.stage === "New"
                              ? "bg-blue-500/20 text-blue-300"
                              : request.stage === "In Progress"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : request.stage === "Repaired"
                                  ? "bg-green-500/20 text-green-300"
                                  : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {request.stage}
                        </span>
                      </td>
                      {currentUser.role === "technician" && (
                        <td className="py-3 px-3 text-slate-400">{request.scheduledDate || "N/A"}</td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={currentUser.role === "user" ? 4 : 5} className="py-6 text-center text-slate-400">
                      {currentUser.role === "user"
                        ? "No requests found. Report an issue to get started!"
                        : "No tasks assigned yet"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

export default function MaintenancePage() {
  return (
    <AppLayout activeTab="maintenance">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <MaintenanceContent />
      </Suspense>
    </AppLayout>
  )
}
