"use client"

import { useEffect } from "react"
import { useProgressStore } from "@/lib/store"

interface ModuleTrackerProps {
  slug: string
}

export function ModuleTracker({ slug }: ModuleTrackerProps) {
  const { setLastVisited, recordActivity } = useProgressStore()

  useEffect(() => {
    setLastVisited(slug)
    recordActivity()
  }, [slug, setLastVisited, recordActivity])

  return null
}
