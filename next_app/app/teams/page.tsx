"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { storage } from "@/lib/storage"
import type { Team, User, MaintenanceRequest } from "@/lib/types"
import AppLayout from "@/components/layout/app-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function TeamsPage() {
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    memberIds: [] as string[],
  })
  const [error, setError] = useState("")

  useEffect(() => {
    const user = storage.getCurrentUser()
    if (!user) {
      router.push("/auth/login")
      return
    }
    setCurrentUser(user)
    setTeams(storage.getTeams())
    setUsers(storage.getUsers())
    setRequests(storage.getRequests())
  }, [router])

  if (!currentUser) return null

  if (currentUser.role === "technician" || currentUser.role === "user") {
    return (
      <AppLayout activeTab="teams">
        <Card className="bg-slate-800/30 border-slate-700/50 p-8 text-center">
          <p className="text-slate-400 mb-4">Team management is not available for your role.</p>
          <Button onClick={() => router.push("/dashboard")} className="bg-blue-600 hover:bg-blue-700">
            Back to Dashboard
          </Button>
        </Card>
      </AppLayout>
    )
  }

  const getTeamMembers = (memberIds: string[]) => {
    return users.filter((u) => memberIds.includes(u.id))
  }

  const getTeamWorkload = (teamId: string) => {
    return requests.filter((r) => r.teamId === teamId && (r.stage === "New" || r.stage === "In Progress")).length
  }

  const getTeamCompleted = (teamId: string) => {
    return requests.filter((r) => r.teamId === teamId && r.stage === "Repaired").length
  }

  const technicians = users.filter((u) => u.role === "technician")

  const handleAddTeam = () => {
    setError("")
    
    if (!formData.name.trim()) {
      setError("Team name is required")
      return
    }

    if (formData.memberIds.length === 0) {
      setError("Please select at least one technician")
      return
    }

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      memberIds: formData.memberIds,
      createdAt: new Date().toISOString(),
    }

    const updatedTeams = [...teams, newTeam]
    storage.setTeams(updatedTeams)
    setTeams(updatedTeams)

    // Notify technicians assigned to the team
    formData.memberIds.forEach((technicianId) => {
      const technician = users.find((u) => u.id === technicianId)
      if (technician) {
        storage.addNotification({
          id: `notif-team-${Date.now()}-${technicianId}`,
          userId: technicianId,
          type: "system_alert",
          title: "Assigned to Team",
          message: `You have been assigned to team "${newTeam.name}"`,
          relatedId: newTeam.id,
          relatedType: "user",
          isRead: false,
          createdAt: new Date().toISOString(),
        })
      }
    })

    // Notify admin
    storage.addNotification({
      id: `notif-admin-team-${Date.now()}`,
      userId: currentUser!.id,
      type: "system_alert",
      title: "Team Created",
      message: `Team "${newTeam.name}" has been created with ${formData.memberIds.length} member(s)`,
      isRead: false,
      createdAt: new Date().toISOString(),
    })

    // Reset form
    setFormData({ name: "", description: "", memberIds: [] })
    setIsOpen(false)
  }

  const handleToggleMember = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(userId)
        ? prev.memberIds.filter((id) => id !== userId)
        : [...prev.memberIds, userId],
    }))
  }

  return (
    <AppLayout activeTab="teams">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">Maintenance Teams</h2>
            <p className="text-sm text-slate-400 mt-1">Manage team members and track workload</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white backdrop-blur">
                Add Team
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Team</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Create a new maintenance team and assign technicians to it
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Team Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Mechanics, Electricians, IT Support"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <Textarea
                    placeholder="Optional: Describe the team's responsibilities or specialization..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-slate-700/50 border-slate-600 text-white min-h-24"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Assign Technicians <span className="text-red-400">*</span>
                  </label>
                  <p className="text-xs text-slate-400 mb-3">
                    Select at least one technician to assign to this team
                  </p>
                  <div className="space-y-2 max-h-64 overflow-y-auto border border-slate-700 rounded p-3 bg-slate-900/50">
                    {technicians.length > 0 ? (
                      technicians.map((technician) => (
                        <div
                          key={technician.id}
                          onClick={() => handleToggleMember(technician.id)}
                          className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-colors ${
                            formData.memberIds.includes(technician.id)
                              ? "bg-blue-600/20 border border-blue-500/50"
                              : "bg-slate-700/30 border border-slate-600/50 hover:bg-slate-700/50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.memberIds.includes(technician.id)}
                            onChange={() => handleToggleMember(technician.id)}
                            className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{technician.name}</p>
                            <p className="text-xs text-slate-400">{technician.email}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 text-center py-4">
                        No technicians available. Add technicians from User Management first.
                      </p>
                    )}
                  </div>
                  {formData.memberIds.length > 0 && (
                    <p className="text-xs text-green-400 mt-2">
                      {formData.memberIds.length} technician(s) selected
                    </p>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleAddTeam}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    Create Team
                  </Button>
                  <Button
                    onClick={() => {
                      setIsOpen(false)
                      setFormData({ name: "", description: "", memberIds: [] })
                      setError("")
                    }}
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => {
            const members = getTeamMembers(team.memberIds)
            const workload = getTeamWorkload(team.id)
            const completed = getTeamCompleted(team.id)

            return (
              <Card key={team.id} className="bg-slate-800/30 border-slate-700/50 hover:border-slate-600 transition-all">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">{team.name}</h3>
                  {team.description && <p className="text-sm text-slate-400 mb-4">{team.description}</p>}

                  <div className="space-y-4">
                    {/* Team Stats */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 bg-slate-700/30 rounded">
                        <p className="text-2xl font-bold text-blue-400">{workload}</p>
                        <p className="text-xs text-slate-400">Active</p>
                      </div>
                      <div className="p-3 bg-slate-700/30 rounded">
                        <p className="text-2xl font-bold text-green-400">{completed}</p>
                        <p className="text-xs text-slate-400">Completed</p>
                      </div>
                      <div className="p-3 bg-slate-700/30 rounded">
                        <p className="text-2xl font-bold text-purple-400">{members.length}</p>
                        <p className="text-xs text-slate-400">Members</p>
                      </div>
                    </div>

                    {/* Members List */}
                    <div>
                      <p className="text-sm font-medium text-slate-300 mb-2">Team Members</p>
                      <div className="space-y-2">
                        {members.map((member) => (
                          <div key={member.id} className="flex items-center gap-2 p-2 bg-slate-700/20 rounded">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                              <span className="text-xs font-bold text-white">{member.name[0]}</span>
                            </div>
                            <div>
                              <p className="text-sm text-white font-medium">{member.name}</p>
                              <p className="text-xs text-slate-400">{member.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </AppLayout>
  )
}
