"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { storage } from "@/lib/storage"
import type { MaintenanceRequest, Equipment, User } from "@/lib/types"
import AppLayout from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function CalendarPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1))
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [scheduleEquipment, setScheduleEquipment] = useState("")
  const [scheduleSubject, setScheduleSubject] = useState("")
  const [requestDescription, setRequestDescription] = useState("")

  useEffect(() => {
    const user = storage.getCurrentUser()
    if (!user) {
      router.push("/auth/login")
      return
    }
    setCurrentUser(user)
    setRequests(storage.getRequests())
    setEquipment(storage.getEquipment())
    setUsers(storage.getUsers())
  }, [router])

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" })

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const getRequestsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    let filtered = requests.filter((r) => r.scheduledDate === dateStr && r.type === "Preventive")
    
    // Technicians only see their assigned tasks
    if (isTechnician && currentUser) {
      filtered = filtered.filter((r) => r.assignedToUserId === currentUser.id)
    }
    
    return filtered
  }

  if (!currentUser) return null

  const isAdmin = currentUser.role === "admin"
  const isTechnician = currentUser.role === "technician"

  const handleScheduleRequest = () => {
    if (!selectedDate || !scheduleEquipment || !scheduleSubject) return

    const eq = equipment.find((e) => e.id === scheduleEquipment)
    if (!eq) return

    const newRequest: MaintenanceRequest = {
      id: `r${Date.now()}`,
      subject: scheduleSubject,
      type: "Preventive",
      equipmentId: scheduleEquipment,
      requestedByUserId: currentUser.id,
      teamId: eq.maintenanceTeamId,
      stage: "New",
      scheduledDate: selectedDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updated = [...requests, newRequest]
    setRequests(updated)
    storage.setRequests(updated)

    // Notify admins
    const admins = users.filter((u) => u.role === "admin")
    admins.forEach((admin) => {
      storage.addNotification({
        id: `notif-schedule-${Date.now()}-${admin.id}`,
        userId: admin.id,
        type: "new_request",
        title: "New Scheduled Maintenance",
        message: `New preventive maintenance scheduled: ${scheduleSubject} on ${selectedDate}`,
        relatedId: newRequest.id,
        relatedType: "request",
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    })

    setSelectedDate("")
    setScheduleEquipment("")
    setScheduleSubject("")
    setShowScheduleForm(false)
  }

  const handleRequestSchedule = () => {
    if (!selectedDate || !scheduleEquipment || !scheduleSubject || !requestDescription.trim()) {
      alert("Please fill in all fields")
      return
    }

    const eq = equipment.find((e) => e.id === scheduleEquipment)
    if (!eq) return

    // Create a request for scheduling (not yet scheduled)
    const scheduleRequest: MaintenanceRequest = {
      id: `schedule-req-${Date.now()}`,
      subject: scheduleSubject,
      description: requestDescription,
      type: "Preventive",
      equipmentId: scheduleEquipment,
      requestedByUserId: currentUser.id,
      teamId: eq.maintenanceTeamId,
      stage: "New",
      // No scheduledDate yet - admin will set it after approval
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updated = [...requests, scheduleRequest]
    setRequests(updated)
    storage.setRequests(updated)

    // Notify all admins about the schedule request
    const admins = users.filter((u) => u.role === "admin")
    admins.forEach((admin) => {
      storage.addNotification({
        id: `notif-schedule-req-${Date.now()}-${admin.id}`,
        userId: admin.id,
        type: "new_request",
        title: "Schedule Request from Technician",
        message: `${currentUser.name} requested to schedule: ${scheduleSubject} for ${selectedDate}. Equipment: ${eq.name}`,
        relatedId: scheduleRequest.id,
        relatedType: "request",
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    })

    // Notify technician
    storage.addNotification({
      id: `notif-schedule-req-tech-${Date.now()}`,
      userId: currentUser.id,
      type: "system_alert",
      title: "Schedule Request Submitted",
      message: `Your schedule request for ${scheduleSubject} on ${selectedDate} has been sent to Admin for approval`,
      relatedId: scheduleRequest.id,
      relatedType: "request",
      isRead: false,
      createdAt: new Date().toISOString(),
    })

    setSelectedDate("")
    setScheduleEquipment("")
    setScheduleSubject("")
    setRequestDescription("")
    setShowRequestForm(false)
  }

  const getEquipmentName = (equipmentId: string) => equipment.find((e) => e.id === equipmentId)?.name || "Unknown"

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  return (
    <AppLayout activeTab="calendar">
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-white">Maintenance Calendar</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2 bg-slate-800/30 border-slate-700/50 p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-6">
                <Button
                  onClick={handlePrevMonth}
                  variant="outline"
                  className="border-slate-600 text-slate-400 hover:text-white bg-transparent"
                >
                  ←
                </Button>
                <h3 className="text-xl font-semibold text-white">{monthName}</h3>
                <Button
                  onClick={handleNextMonth}
                  variant="outline"
                  className="border-slate-600 text-slate-400 hover:text-white bg-transparent"
                >
                  →
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center font-semibold text-slate-400 text-sm py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {emptyDays.map((i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                {days.map((day) => {
                  const dayRequests = getRequestsForDate(day)
                  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                  const isToday = new Date().toISOString().split("T")[0] === dateStr

                  return (
                    <button
                      key={day}
                      onClick={() => {
                        if (isAdmin) {
                          setSelectedDate(dateStr)
                          setShowScheduleForm(true)
                        } else if (isTechnician) {
                          setSelectedDate(dateStr)
                          setShowRequestForm(true)
                        }
                        // Users can't click to schedule
                      }}
                      disabled={currentUser.role === "user"}
                      className={`aspect-square rounded border p-2 text-sm flex flex-col items-start justify-start transition-all ${
                        isToday
                          ? "bg-blue-600/20 border-blue-500 "
                          : dayRequests.length > 0
                            ? "bg-green-600/20 border-green-500/50"
                            : "bg-slate-700/20 border-slate-600/50 hover:border-slate-500"
                      } ${currentUser.role === "user" ? "cursor-default opacity-60" : "cursor-pointer"}`}
                    >
                      <span className={isToday ? "text-blue-300 font-bold" : "text-slate-300 font-semibold"}>
                        {day}
                      </span>
                      {dayRequests.length > 0 && (
                        <span className="text-xs text-green-300 mt-1">{dayRequests.length}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </Card>

          {/* Schedule Form - Admin Only */}
          <div className="space-y-4">
            {isAdmin && showScheduleForm && selectedDate && (
              <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Schedule Maintenance</h3>
                <div className="text-sm text-slate-300 mb-4">
                  Date: <span className="font-semibold text-blue-300">{selectedDate}</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Equipment</label>
                    <select
                      value={scheduleEquipment}
                      onChange={(e) => setScheduleEquipment(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white text-sm"
                    >
                      <option value="">Select Equipment</option>
                      {equipment.map((eq) => (
                        <option key={eq.id} value={eq.id}>
                          {eq.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                    <Input
                      placeholder="Routine checkup, Oil change..."
                      value={scheduleSubject}
                      onChange={(e) => setScheduleSubject(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleScheduleRequest}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      Schedule
                    </Button>
                    <Button
                      onClick={() => {
                        setShowScheduleForm(false)
                        setSelectedDate("")
                        setScheduleEquipment("")
                        setScheduleSubject("")
                      }}
                      variant="outline"
                      className="flex-1 border-slate-600"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Request Schedule Form - Technician Only */}
            {isTechnician && showRequestForm && selectedDate && (
              <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/30 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Request Schedule</h3>
                <div className="text-sm text-slate-300 mb-4">
                  Requested Date: <span className="font-semibold text-yellow-300">{selectedDate}</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Your request will be sent to Admin for approval. Admin will schedule it after review.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Equipment <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={scheduleEquipment}
                      onChange={(e) => setScheduleEquipment(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white text-sm"
                    >
                      <option value="">Select Equipment</option>
                      {equipment.map((eq) => (
                        <option key={eq.id} value={eq.id}>
                          {eq.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Subject <span className="text-red-400">*</span>
                    </label>
                    <Input
                      placeholder="Routine checkup, Oil change, Inspection..."
                      value={scheduleSubject}
                      onChange={(e) => setScheduleSubject(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Description / Reason <span className="text-red-400">*</span>
                    </label>
                    <Textarea
                      placeholder="Describe why this maintenance needs to be scheduled..."
                      value={requestDescription}
                      onChange={(e) => setRequestDescription(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white text-sm min-h-24"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleRequestSchedule}
                      className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                    >
                      Request Schedule
                    </Button>
                    <Button
                      onClick={() => {
                        setShowRequestForm(false)
                        setSelectedDate("")
                        setScheduleEquipment("")
                        setScheduleSubject("")
                        setRequestDescription("")
                      }}
                      variant="outline"
                      className="flex-1 border-slate-600"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Upcoming Requests */}
            <Card className="bg-slate-800/30 border-slate-700/50 p-6">
              <h3 className="font-semibold text-white mb-4">
                {isTechnician ? "My Scheduled Tasks" : "Scheduled Maintenance"}
              </h3>
              <div className="space-y-3">
                {requests
                  .filter((r) => {
                    if (r.type !== "Preventive" || !r.scheduledDate) return false
                    // Technicians only see their assigned tasks
                    if (isTechnician) {
                      return r.assignedToUserId === currentUser.id
                    }
                    return true
                  })
                  .sort((a, b) => (a.scheduledDate || "").localeCompare(b.scheduledDate || ""))
                  .slice(0, 5)
                  .map((request) => (
                    <div key={request.id} className="p-3 bg-slate-700/30 rounded border border-slate-600/50">
                      <p className="text-sm font-medium text-white">{request.subject}</p>
                      <p className="text-xs text-slate-400">{getEquipmentName(request.equipmentId)}</p>
                      <p className="text-xs text-slate-500 mt-1">{request.scheduledDate}</p>
                    </div>
                  ))}
                {requests.filter((r) => {
                  if (r.type !== "Preventive" || !r.scheduledDate) return false
                  if (isTechnician) return r.assignedToUserId === currentUser.id
                  return true
                }).length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">
                    {isTechnician ? "No scheduled tasks assigned to you" : "No scheduled maintenance"}
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
