"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { storage } from "@/lib/storage"
import type { User } from "@/lib/types"
import AppLayout from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user" as "admin" | "technician" | "user",
  })

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
    setUsers(storage.getUsers())
  }, [router])

  const handleAddUser = () => {
    if (!formData.name || !formData.email) {
      alert("Please fill in all fields")
      return
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      createdAt: new Date().toISOString(),
    }

    const updatedUsers = [...users, newUser]
    storage.setUsers(updatedUsers)
    setUsers(updatedUsers)

    storage.addNotification({
      id: `notif-${Date.now()}`,
      userId: newUser.id,
      type: "new_user_registered",
      title: "Account Created",
      message: `Welcome ${newUser.name}! Your account has been created. Email: ${newUser.email}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    })

    storage.addNotification({
      id: `notif-admin-${Date.now()}`,
      userId: currentUser!.id,
      type: "system_alert",
      title: "User Added",
      message: `New user added: ${newUser.name} (${formData.role})`,
      isRead: false,
      createdAt: new Date().toISOString(),
    })

    setFormData({ name: "", email: "", role: "user" })
    setIsOpen(false)
  }

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      alert("Cannot delete your own account")
      return
    }
    const updatedUsers = users.filter((u) => u.id !== userId)
    storage.setUsers(updatedUsers)
    setUsers(updatedUsers)
  }

  if (!currentUser || currentUser.role !== "admin") return null

  return (
    <AppLayout activeTab="users">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">User Management</h2>
            <p className="text-sm text-slate-400 mt-1">Add and manage employees and technicians</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white backdrop-blur">
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Add New User</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Create a new user account for an employee or technician
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                  <Input
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <Input
                    type="email"
                    placeholder="john@gearguard.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value as any })}
                  >
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="user" className="text-white">
                        User (Equipment Owner)
                      </SelectItem>
                      <SelectItem value="technician" className="text-white">
                        Technician
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddUser} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Create Account
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-slate-800/30 border-slate-700/50 p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Name</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Email</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Role</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Created</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="py-3 px-3 text-white font-medium">{user.name}</td>
                      <td className="py-3 px-3 text-slate-400">{user.email}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-red-500/20 text-red-300"
                              : user.role === "technician"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : "bg-blue-500/20 text-blue-300"
                          }`}
                        >
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-3 px-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No users found
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
