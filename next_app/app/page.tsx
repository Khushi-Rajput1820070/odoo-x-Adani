"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { storage } from "@/lib/storage"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    storage.initializeDemoData()
    const currentUser = storage.getCurrentUser()
    if (currentUser) {
      router.push("/dashboard")
    } else {
      router.push("/auth/login")
    }
  }, [router])

  return null
}
