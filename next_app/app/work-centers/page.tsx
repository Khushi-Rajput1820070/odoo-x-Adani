"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { storage } from "@/lib/storage"
import type { WorkCenter, User } from "@/lib/types"
import AppLayout from "@/components/layout/app-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function WorkCentersPage() {
  const router = useRouter()
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    cost: "",
    quantity: "",
    allocatedManHours: "",
    costPerHour: "",
    estimateTotalPrice: "",
    costTarget: "",
    description: "",
  })
  const [error, setError] = useState("")

  useEffect(() => {
    const user = storage.getCurrentUser()
    if (!user) {
      router.push("/auth/login")
      return
    }
    if (user.role !== "admin") {
      router.push("/dashboard")
      return
    }
    setCurrentUser(user)
    setWorkCenters(storage.getWorkCenters())
  }, [router])

  if (!currentUser || currentUser.role !== "admin") return null

  const handleAddWorkCenter = () => {
    setError("")
    
    if (!formData.name.trim()) {
      setError("Work Center name is required")
      return
    }

    const newWorkCenter: WorkCenter = {
      id: `wc-${Date.now()}`,
      name: formData.name.trim(),
      cost: formData.cost ? Number(formData.cost) : undefined,
      quantity: formData.quantity ? Number(formData.quantity) : undefined,
      allocatedManHours: formData.allocatedManHours ? Number(formData.allocatedManHours) : undefined,
      costPerHour: formData.costPerHour ? Number(formData.costPerHour) : undefined,
      estimateTotalPrice: formData.estimateTotalPrice ? Number(formData.estimateTotalPrice) : undefined,
      costTarget: formData.costTarget ? Number(formData.costTarget) : undefined,
      description: formData.description.trim() || undefined,
      skills: [],
      createdAt: new Date().toISOString(),
      companyId: currentUser.companyId,
    }

    const updated = [...workCenters, newWorkCenter]
    storage.setWorkCenters(updated)
    setWorkCenters(updated)

    storage.addNotification({
      id: `notif-wc-${Date.now()}`,
      userId: currentUser.id,
      type: "system_alert",
      title: "Work Center Created",
      message: `Work Center "${newWorkCenter.name}" has been created`,
      isRead: false,
      createdAt: new Date().toISOString(),
    })

    setFormData({
      name: "",
      cost: "",
      quantity: "",
      allocatedManHours: "",
      costPerHour: "",
      estimateTotalPrice: "",
      costTarget: "",
      description: "",
    })
    setIsOpen(false)
  }

  const handleDeleteWorkCenter = (id: string) => {
    const updated = workCenters.filter((wc) => wc.id !== id)
    storage.setWorkCenters(updated)
    setWorkCenters(updated)
  }

  return (
    <AppLayout activeTab="work-centers">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">Work Centers</h2>
            <p className="text-sm text-slate-400 mt-1">
              Manage work centers for better tracking of work orders and maintenance requests
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white backdrop-blur">
                New Work Center
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Work Center</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Create a work center for tracking maintenance requests and work orders
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Work Center Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Assembly, Production Line A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Cost</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Quantity</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Allocated Man Hours</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.allocatedManHours}
                      onChange={(e) => setFormData({ ...formData, allocatedManHours: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Cost per Hour</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.costPerHour}
                      onChange={(e) => setFormData({ ...formData, costPerHour: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Estimate Total Price</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.estimateTotalPrice}
                      onChange={(e) => setFormData({ ...formData, estimateTotalPrice: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Cost Target</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.costTarget}
                      onChange={(e) => setFormData({ ...formData, costTarget: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <Textarea
                    placeholder="Optional: Describe the work center..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-slate-700/50 border-slate-600 text-white min-h-24"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-sm">{error}</div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleAddWorkCenter}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    Create Work Center
                  </Button>
                  <Button
                    onClick={() => {
                      setIsOpen(false)
                      setFormData({
                        name: "",
                        cost: "",
                        quantity: "",
                        allocatedManHours: "",
                        costPerHour: "",
                        estimateTotalPrice: "",
                        costTarget: "",
                        description: "",
                      })
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

        <Card className="bg-slate-800/30 border-slate-700/50 p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Work Center</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Cost</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Qty</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Allocated Man Hours</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Cost per Hour</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Estimate Total Price</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Cost Target</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {workCenters.length > 0 ? (
                  workCenters.map((wc) => (
                    <tr key={wc.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="py-3 px-3 text-white font-medium">{wc.name}</td>
                      <td className="py-3 px-3 text-slate-400">{wc.cost?.toFixed(2) || "0.00"}</td>
                      <td className="py-3 px-3 text-slate-400">{wc.quantity || "0"}</td>
                      <td className="py-3 px-3 text-slate-400">{wc.allocatedManHours?.toFixed(2) || "0.00"}</td>
                      <td className="py-3 px-3 text-slate-400">{wc.costPerHour?.toFixed(2) || "0.00"}</td>
                      <td className="py-3 px-3 text-slate-400">{wc.estimateTotalPrice?.toFixed(2) || "0.00"}</td>
                      <td className="py-3 px-3 text-slate-400">{wc.costTarget?.toFixed(2) || "0.00"}</td>
                      <td className="py-3 px-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteWorkCenter(wc.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-400">
                      No work centers found. Create your first work center to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}

