"use client"

import { useEffect, useRef } from "react"
import { useProgressStore } from "@/lib/store"

interface TimeTrackerProps {
  slug: string
}

export function TimeTracker({ slug }: TimeTrackerProps) {
  const { addTimeSpent } = useProgressStore()
  const startTimeRef = useRef<number | null>(null)
  const lastUpdateRef = useRef<number | null>(null)

  useEffect(() => {
    const now = Date.now()
    startTimeRef.current = now
    lastUpdateRef.current = now

    // Update time every 30 seconds while page is visible
    const interval = setInterval(() => {
      if (document.visibilityState === "visible" && lastUpdateRef.current !== null) {
        const currentTime = Date.now()
        const elapsed = Math.floor((currentTime - lastUpdateRef.current) / 1000)
        if (elapsed > 0) {
          addTimeSpent(slug, elapsed)
          lastUpdateRef.current = currentTime
        }
      }
    }, 30000)

    // Track visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && lastUpdateRef.current !== null) {
        // Save time when leaving
        const elapsed = Math.floor((Date.now() - lastUpdateRef.current) / 1000)
        if (elapsed > 0) {
          addTimeSpent(slug, elapsed)
        }
      } else {
        // Reset timer when returning
        lastUpdateRef.current = Date.now()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Save time on unmount
    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      
      if (lastUpdateRef.current !== null) {
        const elapsed = Math.floor((Date.now() - lastUpdateRef.current) / 1000)
        if (elapsed > 0) {
          addTimeSpent(slug, elapsed)
        }
      }
    }
  }, [slug, addTimeSpent])

  return null
}
