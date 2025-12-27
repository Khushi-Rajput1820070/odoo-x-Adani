"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { storage } from "@/lib/storage"
import type { Team, User, MaintenanceRequest } from "@/lib/types"
import AppLayout from "@/components/layout/app-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function TeamsPage() {
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)

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

  if (currentUser.role === "technician" || currentUser.role === "requester") {
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

  return (
    <AppLayout activeTab="teams">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">Maintenance Teams</h2>
            <p className="text-sm text-slate-400 mt-1">Manage team members and track workload</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white backdrop-blur">
            Add Team
          </Button>
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
