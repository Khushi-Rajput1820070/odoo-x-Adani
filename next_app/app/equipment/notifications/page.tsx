"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { storage } from "@/lib/storage"
import type { Notification, User } from "@/lib/types"
import AppLayout from "@/components/layout/app-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function NotificationsPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const user = storage.getCurrentUser()
    if (!user) {
      router.push("/auth/login")
      return
    }
    setCurrentUser(user)
    setNotifications(
      storage
        .getUserNotifications(user.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    )
  }, [router])

  const handleNotificationClick = (notification: Notification) => {
    storage.markNotificationRead(notification.id)
    setNotifications(notifications.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)))

    if (notification.relatedId && notification.relatedType === "request") {
      router.push(`/maintenance/${notification.relatedId}`)
    } else if (notification.relatedId && notification.relatedType === "equipment") {
      router.push(`/equipment/${notification.relatedId}`)
    }
  }

  const handleMarkAllRead = () => {
    storage.markAllNotificationsRead(currentUser?.id || "")
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
  }

  const handleClearAll = () => {
    storage.clearUserNotifications(currentUser?.id || "")
    setNotifications([])
  }

  if (!currentUser) return null

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <AppLayout activeTab="notifications">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">Notifications</h2>
            <p className="text-sm text-slate-400 mt-1">{unreadCount} unread</p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllRead}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
              >
                Mark All Read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                onClick={handleClearAll}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <Card className="bg-slate-800/30 border-slate-700/50 p-12 text-center">
            <p className="text-slate-400">No notifications yet</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`bg-slate-800/30 border-slate-700/50 p-4 cursor-pointer transition-all hover:bg-slate-800/50 ${
                  !notification.isRead ? "border-blue-500/50 bg-blue-900/10" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{notification.title}</h3>
                      {!notification.isRead && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>}
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{notification.message}</p>
                    <p className="text-xs text-slate-500 mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      storage.markNotificationRead(notification.id)
                      setNotifications(notifications.filter((n) => n.id !== notification.id))
                    }}
                    className="text-slate-400 hover:text-white transition-colors p-2"
                    title="Dismiss"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
