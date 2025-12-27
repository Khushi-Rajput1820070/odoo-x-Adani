"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { storage } from "@/lib/storage"
import type { User } from "@/lib/types"
import { Button } from "@/components/ui/button"

interface AppLayoutProps {
  children: React.ReactNode
  activeTab: string
}

export default function AppLayout({ children, activeTab }: AppLayoutProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const currentUser = storage.getCurrentUser()
    if (!currentUser) {
      router.push("/auth/login")
      return
    }
    setUser(currentUser)
    const count = storage.getUnreadNotificationCount(currentUser.id)
    setUnreadCount(count)

    const interval = setInterval(() => {
      const updatedCount = storage.getUnreadNotificationCount(currentUser.id)
      setUnreadCount(updatedCount)
    }, 2000)

    return () => clearInterval(interval)
  }, [router])

  const handleLogout = () => {
    storage.setCurrentUser(null)
    router.push("/auth/login")
  }

  if (!user) return null

  const getNavItems = () => {
    const baseItems = [{ id: "dashboard", label: "Dashboard", href: "/dashboard" }]

    const roleItems = {
      admin: [
        { id: "maintenance", label: "Maintenance", href: "/maintenance" },
        { id: "calendar", label: "Calendar", href: "/calendar" },
        { id: "equipment", label: "Equipment", href: "/equipment" },
        { id: "work-centers", label: "Work Centers", href: "/work-centers" },
        { id: "categories", label: "Categories", href: "/categories" },
        { id: "teams", label: "Teams", href: "/teams" },
        { id: "users", label: "Users", href: "/users" },
        { id: "reporting", label: "Reporting", href: "/reporting" },
      ],
      technician: [
        { id: "maintenance", label: "Tasks", href: "/maintenance?filter=assigned" },
        { id: "calendar", label: "Schedule", href: "/calendar" },
      ],
      user: [
        { id: "maintenance", label: "My Requests", href: "/maintenance?filter=my-requests" },
      ],
    }

    return [...baseItems, ...(roleItems[user.role] || [])]
  }

  const navItems = getNavItems()

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">GearGuard</h1>
            <p className="text-xs text-slate-400 mt-1">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => router.push("/notifications")}
                className="relative p-2 text-slate-400 hover:text-white transition-colors"
                title="Notifications"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </div>

            <span className="text-slate-400">{user.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-400 hover:text-white">
              Logout
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 flex gap-0 overflow-x-auto">
            {navItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => router.push(tab.href)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">{children}</main>
    </div>
  )
}
