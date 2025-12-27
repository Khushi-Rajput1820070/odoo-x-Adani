"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { storage } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSignUpLink, setShowSignUpLink] = useState(false)

  useEffect(() => {
    storage.initializeDemoData()
    const users = storage.getUsers()
    const admins = users.filter((u) => u.role === "admin")
    setShowSignUpLink(admins.length === 0)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!email || !password) {
      setError("Email and password are required")
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError("Invalid credentials")
      setIsLoading(false)
      return
    }

    const users = storage.getUsers()
    const user = users.find((u) => u.email === email && email.includes("@"))

    if (user) {
      storage.setCurrentUser(user)

      storage.addNotification({
        id: `notif-login-${Date.now()}`,
        userId: user.id,
        type: "system_alert",
        title: "Welcome Back",
        message: `You're logged in as ${user.name}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      })

      const redirectPath = {
        admin: "/dashboard",
        technician: "/maintenance?filter=assigned",
        user: "/dashboard",
        manager: "/dashboard",
        requester: "/dashboard",
      }[user.role] || "/dashboard"

      router.push(redirectPath)
    } else {
      setError("Invalid credentials")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-md border-slate-700/50">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">GearGuard</h1>
            <p className="text-slate-400">Maintenance Management System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <Input
                type="email"
                placeholder="admin@gearguard.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-sm">{error}</div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white backdrop-blur"
            >
              {isLoading ? "Logging in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="p-4 bg-slate-700/30 rounded border border-slate-600/50 text-sm text-slate-300">
              <p className="font-semibold mb-3">Demo Credentials (any 8+ char password):</p>
              <div className="space-y-2 text-xs">
                <p>
                  <span className="text-blue-400 font-medium">Admin:</span> admin@gearguard.com
                </p>
                <p>
                  <span className="text-yellow-400 font-medium">Technician:</span> tech1@gearguard.com
                </p>
                <p>
                  <span className="text-green-400 font-medium">User:</span> requester@gearguard.com
                </p>
              </div>
            </div>

            <div className="flex gap-2 text-sm">
              {showSignUpLink && (
                <Link
                  href="/auth/signup"
                  className="flex-1 text-center px-3 py-2 rounded border border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                >
                  Sign Up
                </Link>
              )}
              <Link
                href="/auth/forgot-password"
                className={`${showSignUpLink ? "flex-1" : "w-full"} text-center px-3 py-2 rounded border border-slate-500/30 text-slate-400 hover:bg-slate-500/10`}
              >
                Forgot Password
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
