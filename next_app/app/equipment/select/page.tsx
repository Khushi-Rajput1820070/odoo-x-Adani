"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { storage } from "@/lib/storage"
import type { Equipment, User } from "@/lib/types"
import AppLayout from "@/components/layout/app-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SelectEquipmentPage() {
  const router = useRouter()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const user = storage.getCurrentUser()
    if (!user) {
      router.push("/auth/login")
      return
    }
    if (user.role !== "user") {
      router.push("/dashboard")
      return
    }
    setCurrentUser(user)
    setEquipment(storage.getEquipment())
  }, [router])

  const filteredEquipment = equipment.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSelectEquipment = (equipmentId: string) => {
    router.push(`/maintenance/new/issue?equipmentId=${equipmentId}`)
  }

  if (!currentUser) return null

  return (
    <AppLayout activeTab="maintenance">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Select Equipment</h2>
          <p className="text-sm text-slate-400 mt-1">Choose the equipment that is having issues</p>
        </div>

        <div>
          <Input
            placeholder="Search by equipment name or serial number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-700/50 border-slate-600 text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEquipment.map((item) => (
            <Card
              key={item.id}
              className="bg-gradient-to-br from-slate-700/40 to-slate-800/40 border-slate-600/50 hover:border-blue-500/50 transition-all cursor-pointer"
              onClick={() => handleSelectEquipment(item.id)}
            >
              <div className="p-6">
                <h3 className="font-semibold text-white mb-2">{item.name}</h3>
                <div className="space-y-2 text-sm text-slate-400 mb-4">
                  <p>Serial: {item.serialNumber}</p>
                  <p>Category: {item.category}</p>
                  <p>Location: {item.location}</p>
                  <p>
                    Status:{" "}
                    <span
                      className={`font-medium ${
                        item.status === "Active"
                          ? "text-green-400"
                          : item.status === "Inactive"
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {item.status}
                    </span>
                  </p>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Report Issue</Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredEquipment.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">No equipment found matching your search</p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
