"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { storage } from "@/lib/storage"
import type { MaintenanceRequest, Equipment, User, Team } from "@/lib/types"
import AppLayout from "@/components/layout/app-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)

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

  if (!currentUser) return null

  const getFilteredRequests = () => {
    let filtered = requests

    if (currentUser.role === "technician") {
      filtered = requests.filter((r) => r.assignedToUserId === currentUser.id)
    } else if (currentUser.role === "user") {
      filtered = requests.filter((r) => r.requestedByUserId === currentUser.id)
    }

    return filtered
  }

  const filteredRequests = getFilteredRequests()

  const stats = {
    criticalEquipment: equipment.filter((e) => {
      const openRequests = requests.filter(
        (r) => r.equipmentId === e.id && (r.stage === "New" || r.stage === "In Progress"),
      ).length
      return openRequests > 2 && e.status === "Active"
    }).length,
    technicianLoad: Math.round(
      (requests.filter((r) => r.stage === "In Progress").length / Math.max(requests.length, 1)) * 100,
    ),
    openRequests: filteredRequests.filter((r) => r.stage === "New" || r.stage === "In Progress").length,
    overdueRequests: filteredRequests.filter(
      (r) => r.scheduledDate && r.stage !== "Repaired" && r.stage !== "Scrap" && new Date(r.scheduledDate) < new Date(),
    ).length,
  }

  const recentRequests = filteredRequests
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const getEquipmentName = (equipmentId: string) => equipment.find((e) => e.id === equipmentId)?.name || "Unknown"
  const getUserName = (userId: string) => users.find((u) => u.id === userId)?.name || "Unknown"

  const dashboardTitle = {
    admin: "Maintenance Dashboard",
    technician: "My Assigned Tasks",
    user: "My Equipment & Requests",
  }[currentUser.role]

  const dashboardSubtitle = {
    admin: "System overview and management",
    technician: "Track your assigned maintenance tasks",
    user: "View your equipment and submitted requests",
  }[currentUser.role]

  return (
    <AppLayout activeTab="dashboard">
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-white">{dashboardTitle}</h2>
          <p className="text-sm text-slate-400 mt-1">{dashboardSubtitle}</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          {currentUser.role === "user" && (
            <Button
              onClick={() => router.push("/equipment/select")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white backdrop-blur"
            >
              Report Issue
            </Button>
          )}
          {currentUser.role === "admin" && (
            <>
              <Button
                onClick={() => router.push("/maintenance/new")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white backdrop-blur"
              >
                New Request
              </Button>
              <Button
                onClick={() => router.push("/equipment")}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                View Equipment
              </Button>
            </>
          )}
        </div>

        {/* Stats Cards - Hide for user role */}
        {(currentUser.role === "admin" || currentUser.role === "technician") && (
          <div
            className={`grid gap-4 ${
              currentUser.role === "admin" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-3"
            }`}
          >
            {currentUser.role === "admin" && (
              <Card className="bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-500/30 hover:border-red-500/50 transition-all">
                <div className="p-6">
                  <h3 className="text-sm font-medium text-red-300 mb-2">Critical Equipment</h3>
                  <div className="text-3xl font-bold text-red-400">{stats.criticalEquipment}</div>
                  <p className="text-xs text-red-400/60 mt-2">Health less than 30%</p>
                </div>
              </Card>
            )}

            {currentUser.role === "admin" && (
              <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/30 hover:border-blue-500/50 transition-all">
                <div className="p-6">
                  <h3 className="text-sm font-medium text-blue-300 mb-2">Technician Load</h3>
                  <div className="text-3xl font-bold text-blue-400">{stats.technicianLoad}%</div>
                  <p className="text-xs text-blue-400/60 mt-2">Currently in progress</p>
                </div>
              </Card>
            )}

            <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/30 hover:border-green-500/50 transition-all">
              <div className="p-6">
                <h3 className="text-sm font-medium text-green-300 mb-2">Open Requests</h3>
                <div className="text-3xl font-bold text-green-400">{stats.openRequests}</div>
                <p className="text-xs text-green-400/60 mt-2">Pending + In Progress</p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-500/30 hover:border-orange-500/50 transition-all">
              <div className="p-6">
                <h3 className="text-sm font-medium text-orange-300 mb-2">
                  {currentUser.role === "admin" ? "Overdue" : "My Overdue"}
                </h3>
                <div className="text-3xl font-bold text-orange-400">{stats.overdueRequests}</div>
                <p className="text-xs text-orange-400/60 mt-2">Needs Attention</p>
              </div>
            </Card>
          </div>
        )}

        {/* User Dashboard - My Equipment and My Requests */}
        {currentUser.role === "user" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My Equipment Section */}
            <Card className="bg-slate-800/30 border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">My Equipment</h3>
                <Button
                  onClick={() => router.push("/equipment")}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {equipment.slice(0, 5).map((eq) => (
                  <div
                    key={eq.id}
                    onClick={() => router.push(`/equipment/${eq.id}`)}
                    className="p-3 bg-slate-700/30 rounded border border-slate-600/30 hover:bg-slate-700/50 cursor-pointer transition-colors"
                  >
                    <p className="font-medium text-white text-sm">{eq.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{eq.category} • {eq.location}</p>
                    <p className="text-xs text-slate-500 mt-1">Serial: {eq.serialNumber}</p>
                  </div>
                ))}
                {equipment.length === 0 && (
                  <p className="text-slate-400 text-sm text-center py-4">No equipment available</p>
                )}
              </div>
            </Card>

            {/* My Requests Section */}
            <Card className="bg-slate-800/30 border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">My Requests</h3>
                <Button
                  onClick={() => router.push("/maintenance?filter=my-requests")}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  View All
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-2 px-2 font-medium text-slate-400 text-xs">Subject</th>
                      <th className="text-left py-2 px-2 font-medium text-slate-400 text-xs">Status</th>
                      <th className="text-left py-2 px-2 font-medium text-slate-400 text-xs">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.length > 0 ? (
                      filteredRequests
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 5)
                        .map((request) => (
                          <tr
                            key={request.id}
                            className="border-b border-slate-700/50 hover:bg-slate-700/20 cursor-pointer"
                            onClick={() => router.push(`/maintenance/${request.id}`)}
                          >
                            <td className="py-2 px-2 text-white text-xs">{request.subject}</td>
                            <td className="py-2 px-2">
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
                            <td className="py-2 px-2 text-slate-400 text-xs">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-slate-400 text-sm">
                          No requests found. Report an issue to get started!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        ) : (
          /* Admin/Technician Dashboard */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Requests */}
            <Card className="lg:col-span-2 bg-slate-800/30 border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Requests</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-3 font-medium text-slate-400">Subject</th>
                    <th className="text-left py-3 px-3 font-medium text-slate-400">Equipment</th>
                    <th className="text-left py-3 px-3 font-medium text-slate-400">Requested By</th>
                    <th className="text-left py-3 px-3 font-medium text-slate-400">Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRequests.length > 0 ? (
                    recentRequests.map((request) => (
                      <tr
                        key={request.id}
                        className="border-b border-slate-700/50 hover:bg-slate-700/20 cursor-pointer"
                        onClick={() => router.push(`/maintenance/${request.id}`)}
                      >
                        <td className="py-3 px-3 text-white">{request.subject}</td>
                        <td className="py-3 px-3 text-slate-400">{getEquipmentName(request.equipmentId)}</td>
                        <td className="py-3 px-3 text-slate-400">{getUserName(request.requestedByUserId)}</td>
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
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400">
                        No requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Quick Stats - Show team performance for admins, schedule for technicians */}
          <Card className="bg-slate-800/30 border-slate-700/50 p-6">
            {currentUser.role === "technician" ? (
              <>
                <h3 className="text-lg font-semibold text-white mb-4">Your Schedule</h3>
                <div className="space-y-3 text-sm">
                  {filteredRequests
                    .filter((r) => r.scheduledDate)
                    .slice(0, 5)
                    .map((req) => (
                      <div key={req.id} className="p-3 bg-slate-700/30 rounded border border-slate-600/30">
                        <p className="font-medium text-white text-xs mb-1">{req.subject}</p>
                        <p className="text-xs text-slate-400">{req.scheduledDate}</p>
                      </div>
                    ))}
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-white mb-4">Team Performance</h3>
                <div className="space-y-4">
                  {teams.map((team) => {
                    const teamRequests = requests.filter(
                      (r) => r.teamId === team.id && (r.stage === "Repaired" || r.stage === "In Progress"),
                    )
                    return (
                      <div key={team.id} className="p-3 bg-slate-700/30 rounded">
                        <p className="font-medium text-white text-sm mb-2">{team.name}</p>
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>Completed: {teamRequests.length}</span>
                          <span>Members: {team.memberIds.length}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </Card>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
