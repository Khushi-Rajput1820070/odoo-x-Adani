"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { storage } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [step, setStep] = useState<"email" | "reset">("email")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    storage.initializeDemoData()
  }, [])

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const users = storage.getUsers()
    const userExists = users.some((u) => u.email === email)

    if (!userExists) {
      setMessage("Email not found in system")
      setIsLoading(false)
      return
    }

    setMessage("Password reset instructions sent to your email")
    setStep("reset")
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-md border-slate-700/50">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-slate-400">Recover your account access</p>
          </div>

          {step === "email" ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              {message && (
                <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-sm">{message}</div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white backdrop-blur"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-900/20 border border-green-500/30 rounded text-green-400">
                Check your email for reset instructions. Link expires in 24 hours.
              </div>
              <Button
                onClick={() => setStep("email")}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                Back to Login
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 text-sm">
              Remember your password? Login
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
