"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { storage } from "@/lib/storage"
import type { Equipment, MaintenanceRequest, User } from "@/lib/types"
import AppLayout from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function EquipmentPage() {
  const router = useRouter()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("")
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    const user = storage.getCurrentUser()
    if (!user) {
      router.push("/auth/login")
      return
    }
    setCurrentUser(user)

    const eq = storage.getEquipment()
    setEquipment(eq)
    const req = storage.getRequests()
    setRequests(req)
  }, [router])

  if (!currentUser) return null

  if (currentUser.role === "user") {
    return (
      <AppLayout activeTab="maintenance">
        <Card className="bg-slate-800/30 border-slate-700/50 p-8 text-center space-y-4">
          <p className="text-slate-400">
            To report an equipment issue, use the "Report Issue" button on your Dashboard.
          </p>
          <Button onClick={() => router.push("/equipment/select")} className="bg-blue-600 hover:bg-blue-700 text-white">
            Report Equipment Issue
          </Button>
        </Card>
      </AppLayout>
    )
  }

  if (currentUser.role === "technician") {
    return (
      <AppLayout activeTab="maintenance">
        <Card className="bg-slate-800/30 border-slate-700/50 p-8 text-center">
          <p className="text-slate-400 mb-4">Equipment management is available for Admin only.</p>
          <Button onClick={() => router.push("/dashboard")} className="bg-blue-600 hover:bg-blue-700">
            Back to Dashboard
          </Button>
        </Card>
      </AppLayout>
    )
  }

  const filteredEquipment = equipment.filter((eq) => {
    const matchesSearch =
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || eq.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(equipment.map((e) => e.category)))

  const getOpenRequestsCount = (equipmentId: string) => {
    return requests.filter((r) => r.equipmentId === equipmentId && (r.stage === "New" || r.stage === "In Progress"))
      .length
  }

  return (
    <AppLayout activeTab="equipment">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">Equipment Management</h2>
            <p className="text-sm text-slate-400 mt-1">Manage and track all company assets</p>
          </div>
          <Button
            onClick={() => router.push("/equipment/new")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white backdrop-blur"
          >
            Add Equipment
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <Input
            placeholder="Search by name or serial number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-64 bg-slate-800/50 border-slate-700 text-white"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded text-white"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEquipment.map((eq) => {
            const openCount = getOpenRequestsCount(eq.id)
            return (
              <Card
                key={eq.id}
                className="bg-slate-800/30 border-slate-700/50 hover:border-slate-600 transition-all hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 cursor-pointer" onClick={() => router.push(`/equipment/${eq.id}`)}>
                      <h3 className="text-lg font-semibold text-white mb-1 hover:text-blue-400">{eq.name}</h3>
                      <p className="text-sm text-slate-400">{eq.serialNumber}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        eq.status === "Active"
                          ? "bg-green-500/20 text-green-400"
                          : eq.status === "Inactive"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {eq.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-slate-400 mb-4">
                    <p>
                      <span className="text-slate-300 font-medium">Category:</span> {eq.category}
                    </p>
                    <p>
                      <span className="text-slate-300 font-medium">Location:</span> {eq.location}
                    </p>
                    <p>
                      <span className="text-slate-300 font-medium">Purchased:</span> {eq.purchaseDate}
                    </p>
                  </div>

                  <Button
                    onClick={() => router.push(`/equipment/${eq.id}`)}
                    className={`w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white backdrop-blur relative ${
                      openCount > 0 ? "ring-2 ring-orange-500/50" : ""
                    }`}
                  >
                    <span>Maintenance</span>
                    {openCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-orange-500/30 rounded-full">
                        {openCount}
                      </span>
                    )}
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>

        {filteredEquipment.length === 0 && (
          <Card className="bg-slate-800/30 border-slate-700/50 p-12 text-center">
            <p className="text-slate-400">No equipment found matching your search.</p>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
