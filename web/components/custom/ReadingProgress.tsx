"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { motion, useScroll, useSpring } from "framer-motion"
import { usePreferencesStore } from "@/lib/store"

// Hydration-safe mounting check
const emptySubscribe = () => () => {}
const useIsMounted = () => useSyncExternalStore(emptySubscribe, () => true, () => false)

export function ReadingProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })
  
  const showReadingProgress = usePreferencesStore((s) => s.showReadingProgress)
  const mounted = useIsMounted()
  
  if (!mounted || !showReadingProgress) return null

  return (
    <motion.div
      className="fixed top-14 left-0 right-0 h-1 bg-transparent z-50 origin-left"
    >
      <motion.div
        className="h-full bg-gradient-to-r from-primary/10 via-primary/60 to-primary origin-left"
        style={{ scaleX }}
      />
    </motion.div>
  )
}

// Circular progress variant for mobile/compact view
export function ReadingProgressCircle() {
  const { scrollYProgress } = useScroll()
  const [progress, setProgress] = useState(0)
  const showReadingProgress = usePreferencesStore((s) => s.showReadingProgress)
  const mounted = useIsMounted()
  
  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      setProgress(Math.round(latest * 100))
    })
  }, [scrollYProgress])
  
  if (!mounted || !showReadingProgress) return null

  const circumference = 2 * Math.PI * 18
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="relative w-10 h-10 flex items-center justify-center">
      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-muted/30"
        />
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-primary transition-all duration-300"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset
          }}
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-muted-foreground">
        {progress}%
      </span>
    </div>
  )
}
