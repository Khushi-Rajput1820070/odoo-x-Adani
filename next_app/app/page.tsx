"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { storage } from "@/lib/storage"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Only initialize demo data if no admin exists yet (for demo/testing purposes)
    const allAdmins = storage.getAllAdmins()
    if (allAdmins.length === 0 && !localStorage.getItem("gearguard_initialized")) {
      // Only for first-time setup/demo - will be cleared when first admin signs up
      storage.initializeDemoData()
    }
    
    const currentUser = storage.getCurrentUser()
    if (currentUser) {
      router.push("/dashboard")
    } else {
      router.push("/auth/login")
    }
  }, [router])

  return null
}
