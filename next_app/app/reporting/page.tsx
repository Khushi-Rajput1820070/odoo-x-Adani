"use client"

import { useEffect, useState } from "react"
import { storage } from "@/lib/storage"
import type { MaintenanceRequest, Equipment, Team, User } from "@/lib/types"
import AppLayout from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function ReportingPage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [reportType, setReportType] = useState<"team" | "equipment" | "timeline">("team")

  useEffect(() => {
    setRequests(storage.getRequests())
    setEquipment(storage.getEquipment())
    setTeams(storage.getTeams())
    setUsers(storage.getUsers())
  }, [])

  const getTeamStats = () => {
    return teams.map((team) => {
      const teamRequests = requests.filter((r) => r.teamId === team.id)
      return {
        name: team.name,
        total: teamRequests.length,
        new: teamRequests.filter((r) => r.stage === "New").length,
        inProgress: teamRequests.filter((r) => r.stage === "In Progress").length,
        repaired: teamRequests.filter((r) => r.stage === "Repaired").length,
        scrap: teamRequests.filter((r) => r.stage === "Scrap").length,
      }
    })
  }

  const getEquipmentStats = () => {
    return equipment.map((eq) => {
      const eqRequests = requests.filter((r) => r.equipmentId === eq.id)
      return {
        name: eq.name,
        category: eq.category,
        total: eqRequests.length,
        preventive: eqRequests.filter((r) => r.type === "Preventive").length,
        corrective: eqRequests.filter((r) => r.type === "Corrective").length,
        status: eq.status,
      }
    })
  }

  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0] || {})
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header]
            return typeof value === "string" && value.includes(",") ? `"${value}"` : value
          })
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const teamStats = getTeamStats()
  const equipmentStats = getEquipmentStats()

  return (
    <AppLayout activeTab="reporting">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white">Maintenance Reports</h2>
          <Button
            onClick={() => {
              if (reportType === "team") exportToCSV(teamStats, "team-report")
              else if (reportType === "equipment") exportToCSV(equipmentStats, "equipment-report")
              else
                exportToCSV(
                  requests.map((r) => ({
                    id: r.id,
                    subject: r.subject,
                    type: r.type,
                    stage: r.stage,
                    equipment: equipment.find((e) => e.id === r.equipmentId)?.name || "Unknown",
                    team: teams.find((t) => t.id === r.teamId)?.name || "Unknown",
                    date: new Date(r.createdAt).toLocaleDateString(),
                  })),
                  "timeline-report",
                )
            }}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
          >
            Export to CSV
          </Button>
        </div>

        {/* Report Type Selector */}
        <div className="flex gap-2">
          {[
            { id: "team", label: "By Team" },
            { id: "equipment", label: "By Equipment" },
            { id: "timeline", label: "Timeline" },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setReportType(type.id as "team" | "equipment" | "timeline")}
              className={`px-4 py-2 rounded transition-all ${
                reportType === type.id
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800/50 text-slate-400 hover:text-slate-300"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Team Report */}
        {reportType === "team" && (
          <Card className="bg-slate-800/30 border-slate-700/50 p-6 overflow-x-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Requests by Team</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Team Name</th>
                  <th className="text-center py-3 px-3 font-medium text-slate-400">Total</th>
                  <th className="text-center py-3 px-3 font-medium text-slate-400">New</th>
                  <th className="text-center py-3 px-3 font-medium text-slate-400">In Progress</th>
                  <th className="text-center py-3 px-3 font-medium text-slate-400">Repaired</th>
                  <th className="text-center py-3 px-3 font-medium text-slate-400">Scrapped</th>
                </tr>
              </thead>
              <tbody>
                {teamStats.map((stat) => (
                  <tr key={stat.name} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="py-3 px-3 text-white font-medium">{stat.name}</td>
                    <td className="py-3 px-3 text-center text-slate-300">{stat.total}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">{stat.new}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">
                        {stat.inProgress}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">{stat.repaired}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">{stat.scrap}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* Equipment Report */}
        {reportType === "equipment" && (
          <Card className="bg-slate-800/30 border-slate-700/50 p-6 overflow-x-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Requests by Equipment</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Equipment</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Category</th>
                  <th className="text-center py-3 px-3 font-medium text-slate-400">Total</th>
                  <th className="text-center py-3 px-3 font-medium text-slate-400">Preventive</th>
                  <th className="text-center py-3 px-3 font-medium text-slate-400">Corrective</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {equipmentStats.map((stat) => (
                  <tr key={stat.name} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="py-3 px-3 text-white font-medium">{stat.name}</td>
                    <td className="py-3 px-3 text-slate-400">{stat.category}</td>
                    <td className="py-3 px-3 text-center text-slate-300">{stat.total}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">{stat.preventive}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">{stat.corrective}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          stat.status === "Active"
                            ? "bg-green-500/20 text-green-300"
                            : stat.status === "Inactive"
                              ? "bg-yellow-500/20 text-yellow-300"
                              : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {stat.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* Timeline Report */}
        {reportType === "timeline" && (
          <div className="space-y-4">
            <Card className="bg-slate-800/30 border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Request Timeline</h3>
              <div className="space-y-2">
                {requests
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 10)
                  .map((request) => (
                    <div key={request.id} className="flex items-start gap-4 p-3 bg-slate-700/20 rounded">
                      <div className="text-xs text-slate-400 min-w-fit">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{request.subject}</p>
                        <p className="text-xs text-slate-400">
                          {request.type === "Preventive" ? "Scheduled" : "Reported"} • {request.stage}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                          request.type === "Corrective" ? "bg-red-500/20 text-red-300" : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {request.type}
                      </span>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
