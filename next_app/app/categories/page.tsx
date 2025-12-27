"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { storage } from "@/lib/storage"
import AppLayout from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { EquipmentCategory, User } from "@/lib/types"

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<EquipmentCategory[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: "", description: "", company: "" })

  useEffect(() => {
    const user = storage.getCurrentUser()
    if (!user) {
      router.push("/auth/login")
      return
    }
    setCurrentUser(user)
    setCategories(storage.getCategories())
  }, [router])

  if (!currentUser) return null

  if (currentUser.role === "technician" || currentUser.role === "requester") {
    return (
      <AppLayout activeTab="categories">
        <Card className="bg-slate-800/30 border-slate-700/50 p-8 text-center">
          <p className="text-slate-400 mb-4">Category management is not available for your role.</p>
          <Button onClick={() => router.push("/dashboard")} className="bg-blue-600 hover:bg-blue-700">
            Back to Dashboard
          </Button>
        </Card>
      </AppLayout>
    )
  }

  const handleAddCategory = () => {
    if (!formData.name) return

    const newCategory: EquipmentCategory = {
      id: `cat${Date.now()}`,
      name: formData.name,
      description: formData.description,
      company: formData.company,
    }

    const updated = [...categories, newCategory]
    setCategories(updated)
    storage.setCategories(updated)
    setFormData({ name: "", description: "", company: "" })
    setShowForm(false)
  }

  const handleUpdateCategory = () => {
    if (!formData.name || !editingId) return

    const updated = categories.map((c) => (c.id === editingId ? { ...c, ...formData } : c))
    setCategories(updated)
    storage.setCategories(updated)
    setFormData({ name: "", description: "", company: "" })
    setEditingId(null)
  }

  const handleDeleteCategory = (id: string) => {
    const updated = categories.filter((c) => c.id !== id)
    setCategories(updated)
    storage.setCategories(updated)
  }

  const handleEditClick = (category: EquipmentCategory) => {
    setFormData({ name: category.name, description: category.description || "", company: category.company || "" })
    setEditingId(category.id)
    setShowForm(true)
  }

  return (
    <AppLayout activeTab="categories">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">Equipment Categories</h2>
            <p className="text-sm text-slate-400 mt-1">Manage equipment classification categories</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm)
              setEditingId(null)
              setFormData({ name: "", description: "", company: "" })
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            {showForm ? "Cancel" : "Add Category"}
          </Button>
        </div>

        {showForm && (
          <Card className="bg-slate-800/30 border-slate-700/50 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Category Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Machine, Computer, Vehicle"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this category"
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
              <div className="flex gap-2">
                <Button
                  onClick={editingId ? handleUpdateCategory : handleAddCategory}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  {editingId ? "Update" : "Create"} Category
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="bg-slate-800/30 border-slate-700/50 p-6 hover:border-slate-600/50 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                <Badge className="bg-blue-600">{category.id.slice(-3)}</Badge>
              </div>
              {category.description && <p className="text-slate-400 text-sm mb-3">{category.description}</p>}
              {category.company && <p className="text-slate-500 text-xs mb-4">Company: {category.company}</p>}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleEditClick(category)}
                  className="flex-1 bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="flex-1 bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {categories.length === 0 && !showForm && (
          <Card className="bg-slate-800/30 border-slate-700/50 p-8 text-center">
            <p className="text-slate-400 mb-4">No categories yet</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Create First Category
            </Button>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
