"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { storage } from "@/lib/storage"
import AppLayout from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Equipment, User, Team } from "@/lib/types"

export default function NewEquipmentPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    serialNumber: "",
    category: "",
    departmentId: "",
    location: "",
    maintenanceTeamId: "",
    status: "Active" as "Active" | "Inactive" | "Scrapped",
    purchaseDate: "",
    warrantyExpiry: "",
    notes: "",
    company: "",
    usedFor: "",
    maintenanceType: "",
    assigneeDate: "",
    employee: "",
    stayDate: "",
  })
  const [error, setError] = useState("")

  useEffect(() => {
    const user = storage.getCurrentUser()
    if (!user) {
      router.push("/auth/login")
      return
    }
    if (user.role !== "admin") {
      router.push("/equipment")
      return
    }
    setCurrentUser(user)
    setTeams(storage.getTeams())
    
    const equipment = storage.getEquipment()
    const uniqueCategories = Array.from(new Set(equipment.map((e) => e.category).filter(Boolean)))
    setCategories(uniqueCategories)
  }, [router])

  if (!currentUser || currentUser.role !== "admin") return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.name.trim() || !formData.serialNumber.trim()) {
      setError("Name and Serial Number are required")
      return
    }

    const newEquipment: Equipment = {
      id: `eq-${Date.now()}`,
      name: formData.name.trim(),
      serialNumber: formData.serialNumber.trim(),
      category: formData.category || "Uncategorized",
      departmentId: formData.departmentId || `dept-${Date.now()}`,
      location: formData.location.trim(),
      maintenanceTeamId: formData.maintenanceTeamId || teams[0]?.id || "",
      status: formData.status,
      purchaseDate: formData.purchaseDate || new Date().toISOString(),
      warrantyExpiry: formData.warrantyExpiry || undefined,
      notes: formData.notes.trim() || undefined,
      company: formData.company.trim() || undefined,
      usedFor: formData.usedFor.trim() || undefined,
      maintenanceType: formData.maintenanceType.trim() || undefined,
      assigneeDate: formData.assigneeDate || undefined,
      employee: formData.employee.trim() || undefined,
      stayDate: formData.stayDate || undefined,
    }

    const equipment = storage.getEquipment()
    storage.setEquipment([...equipment, newEquipment])

    storage.addNotification({
      id: `notif-eq-${Date.now()}`,
      userId: currentUser.id,
      type: "equipment_updated",
      title: "Equipment Added",
      message: `Equipment "${newEquipment.name}" has been added`,
      relatedId: newEquipment.id,
      relatedType: "equipment",
      isRead: false,
      createdAt: new Date().toISOString(),
    })

    router.push("/equipment")
  }

  return (
    <AppLayout activeTab="equipment">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Add New Equipment</h2>
          <p className="text-sm text-slate-400 mt-1">Create a new equipment record</p>
        </div>

        <Card className="bg-slate-800/30 border-slate-700/50 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Equipment Name <span className="text-red-400">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Drill Press #1"
                  className="bg-slate-700/50 border-slate-600 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Serial Number <span className="text-red-400">*</span>
                </label>
                <Input
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  placeholder="e.g., SN-12345"
                  className="bg-slate-700/50 border-slate-600 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                <Input
                  list="categories"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Select or enter category"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
                <datalist id="categories">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Building A, Floor 2"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Maintenance Team</label>
                <select
                  value={formData.maintenanceTeamId}
                  onChange={(e) => setFormData({ ...formData, maintenanceTeamId: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded text-white"
                >
                  <option value="">Select Team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "Active" | "Inactive" | "Scrapped" })}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Scrapped">Scrapped</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Purchase Date</label>
                <Input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Warranty Expiry</label>
                <Input
                  type="date"
                  value={formData.warrantyExpiry}
                  onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Company</label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Company name"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Used For</label>
                <Input
                  value={formData.usedFor}
                  onChange={(e) => setFormData({ ...formData, usedFor: e.target.value })}
                  placeholder="Purpose of equipment"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Maintenance Type</label>
                <select
                  value={formData.maintenanceType}
                  onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded text-white"
                >
                  <option value="">Select Type</option>
                  <option value="Internal Maintenance">Internal Maintenance</option>
                  <option value="External Maintenance">External Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Assignee Date</label>
                <Input
                  type="date"
                  value={formData.assigneeDate}
                  onChange={(e) => setFormData({ ...formData, assigneeDate: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Employee</label>
                <Input
                  value={formData.employee}
                  onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                  placeholder="Employee name"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Stay Date</label>
                <Input
                  type="date"
                  value={formData.stayDate}
                  onChange={(e) => setFormData({ ...formData, stayDate: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about the equipment"
                className="bg-slate-700/50 border-slate-600 text-white min-h-24"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-sm">{error}</div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                Create Equipment
              </Button>
              <Button
                type="button"
                onClick={() => router.push("/equipment")}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
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

