"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { storage } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { User } from "@/lib/types"

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [signupDisabled, setSignupDisabled] = useState(false)

  useEffect(() => {
    storage.initializeDemoData()
    const users = storage.getUsers()
    const adminExists = users.some((u) => u.role === "admin")
    setSignupDisabled(adminExists)
  }, [])

  if (signupDisabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <div className="p-8 text-center space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Registration Closed</h1>
              <p className="text-slate-400">
                New user accounts are now managed by your Administrator through the User Management page.
              </p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded border border-slate-600/50 text-sm text-slate-300">
              <p className="font-semibold mb-2">Please contact your administrator to request an account.</p>
            </div>
            <Button
              onClick={() => router.push("/auth/login")}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white backdrop-blur"
            >
              Return to Login
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required")
      return false
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return false
    }
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
      setError("Password must contain both uppercase and lowercase letters")
      return false
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number")
      return false
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email")
      return false
    }
    return true
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!validateForm()) {
      setIsLoading(false)
      return
    }

    const users = storage.getUsers()
    if (users.some((u) => u.email === email)) {
      setError("Email already exists")
      setIsLoading(false)
      return
    }

    const isFirstUser = users.length === 0
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role: isFirstUser ? "admin" : "technician",
      createdAt: new Date().toISOString(),
    }

    storage.setUsers([...users, newUser])

    if (isFirstUser) {
      storage.addNotification({
        id: `notif-${Date.now()}`,
        userId: newUser.id,
        type: "system_alert",
        title: "Welcome, Admin",
        message: "Your admin account has been created. You can now manage users and equipment.",
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    } else {
      const admins = users.filter((u) => u.role === "admin")
      admins.forEach((admin) => {
        storage.addNotification({
          id: `notif-${Date.now()}-${Math.random()}`,
          userId: admin.id,
          type: "new_user_registered",
          title: "New User Registration",
          message: `New user registered: ${name} (${email})`,
          relatedId: newUser.id,
          relatedType: "user",
          isRead: false,
          createdAt: new Date().toISOString(),
        })
      })

      storage.addNotification({
        id: `notif-${Date.now()}-user`,
        userId: newUser.id,
        type: "system_alert",
        title: "Welcome to GearGuard",
        message: "Your account has been created. Please log in to continue.",
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    }

    setIsLoading(false)
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-md border-slate-700/50">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-slate-400">Join GearGuard Maintenance System</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <Input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <Input
                type="password"
                placeholder="Min 8 chars, mix case & numbers"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
              <Input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-sm">{error}</div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white backdrop-blur"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
