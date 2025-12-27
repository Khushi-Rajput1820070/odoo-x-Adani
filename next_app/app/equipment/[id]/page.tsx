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
import type { Equipment, MaintenanceRequest } from "@/lib/types"

export default function EquipmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const equipmentId = params.id as string

  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    serialNumber: "",
    category: "",
    location: "",
    notes: "",
    company: "",
    usedFor: "",
    maintenanceType: "",
    assigneeDate: "",
    employee: "",
    stayDate: "",
  })

  useEffect(() => {
    const allEquipment = storage.getEquipment()
    const found = allEquipment.find((e) => e.id === equipmentId)
    if (found) {
      setEquipment(found)
      setFormData({
        name: found.name,
        serialNumber: found.serialNumber,
        category: found.category,
        location: found.location,
        notes: found.notes || "",
        company: found.company || "",
        usedFor: found.usedFor || "",
        maintenanceType: found.maintenanceType || "",
        assigneeDate: found.assigneeDate || "",
        employee: found.employee || "",
        stayDate: found.stayDate || "",
      })

      const equipmentRequests = storage.getRequests().filter((r) => r.equipmentId === equipmentId)
      setRequests(equipmentRequests)
    }
  }, [equipmentId])

  const handleSave = () => {
    if (!equipment) return

    const updated: Equipment = {
      ...equipment,
      ...formData,
    }

    const allEquipment = storage.getEquipment()
    storage.setEquipment(allEquipment.map((e) => (e.id === equipment.id ? updated : e)))
    setEquipment(updated)
    setIsEditing(false)
  }

  if (!equipment) {
    return (
      <AppLayout activeTab="equipment">
        <Card className="bg-slate-800/30 border-slate-700/50 p-8">
          <p className="text-slate-400">Equipment not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </Card>
      </AppLayout>
    )
  }

  const openRequests = requests.filter((r) => r.stage === "New" || r.stage === "In Progress")

  return (
    <AppLayout activeTab="equipment">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{equipment.name}</h2>
            <p className="text-slate-400">Serial: {equipment.serialNumber}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30"
            >
              {isEditing ? "Cancel" : "Edit"}
            </Button>
            <Button onClick={() => router.back()} className="bg-slate-700/50 border border-slate-600 text-slate-300">
              Back
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-slate-800/30 border-slate-700/50 p-4">
            <p className="text-xs font-medium text-slate-400 mb-2">Status</p>
            <Badge className={equipment.status === "Active" ? "bg-green-600" : "bg-red-600"}>{equipment.status}</Badge>
          </Card>
          <Card className="bg-slate-800/30 border-slate-700/50 p-4">
            <p className="text-xs font-medium text-slate-400 mb-2">Category</p>
            <p className="text-white font-medium">{equipment.category}</p>
          </Card>
          <Card className="bg-slate-800/30 border-slate-700/50 p-4">
            <p className="text-xs font-medium text-slate-400 mb-2">Location</p>
            <p className="text-white font-medium">{equipment.location}</p>
          </Card>
          <Card className="bg-slate-800/30 border-slate-700/50 p-4">
            <p className="text-xs font-medium text-slate-400 mb-2">Open Requests</p>
            <p className="text-white font-medium text-lg">{openRequests.length}</p>
          </Card>
        </div>

        {/* Editable Details */}
        <Card className="bg-slate-800/30 border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Details</h3>
          <div className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Equipment Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Serial Number</label>
                  <Input
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Company</label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Used For</label>
                  <Input
                    value={formData.usedFor}
                    onChange={(e) => setFormData({ ...formData, usedFor: e.target.value })}
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
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <Button
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">Equipment Name</p>
                  <p className="text-white">{equipment.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">Serial Number</p>
                  <p className="text-white">{equipment.serialNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">Category</p>
                  <p className="text-white">{equipment.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">Location</p>
                  <p className="text-white">{equipment.location}</p>
                </div>
                {equipment.company && (
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Company</p>
                    <p className="text-white">{equipment.company}</p>
                  </div>
                )}
                {equipment.usedFor && (
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Used For</p>
                    <p className="text-white">{equipment.usedFor}</p>
                  </div>
                )}
                {equipment.maintenanceType && (
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Maintenance Type</p>
                    <p className="text-white">{equipment.maintenanceType}</p>
                  </div>
                )}
                {equipment.assigneeDate && (
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Assignee Date</p>
                    <p className="text-white">{new Date(equipment.assigneeDate).toLocaleDateString()}</p>
                  </div>
                )}
                {equipment.employee && (
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Employee</p>
                    <p className="text-white">{equipment.employee}</p>
                  </div>
                )}
                {equipment.stayDate && (
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Stay Date</p>
                    <p className="text-white">{new Date(equipment.stayDate).toLocaleDateString()}</p>
                  </div>
                )}
                {equipment.notes && (
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Notes</p>
                    <p className="text-white">{equipment.notes}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Related Requests */}
        <Card className="bg-slate-800/30 border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Related Maintenance Requests ({requests.length})</h3>
          {requests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-3 font-medium text-slate-400">Subject</th>
                    <th className="text-left py-3 px-3 font-medium text-slate-400">Type</th>
                    <th className="text-left py-3 px-3 font-medium text-slate-400">Stage</th>
                    <th className="text-left py-3 px-3 font-medium text-slate-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="py-3 px-3 text-white">{req.subject}</td>
                      <td className="py-3 px-3 text-slate-400">
                        <Badge className={req.type === "Preventive" ? "bg-green-600" : "bg-red-600"}>{req.type}</Badge>
                      </td>
                      <td className="py-3 px-3 text-slate-400">{req.stage}</td>
                      <td className="py-3 px-3">
                        <Button
                          onClick={() => router.push(`/maintenance/${req.id}`)}
                          className="bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 text-xs"
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-400">No maintenance requests for this equipment</p>
          )}
        </Card>
      </div>
    </AppLayout>
  )
}
