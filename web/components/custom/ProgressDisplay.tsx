"use client"

import { useEffect, useSyncExternalStore } from "react"
import { motion } from "framer-motion"
import { Flame, Trophy, Calendar, BookOpen, CheckCircle, Clock, TrendingUp } from "lucide-react"
import { useProgressStore } from "@/lib/store"
import { cn } from "@/lib/utils"

// Hydration-safe mounting check
const emptySubscribe = () => () => {}
const useIsMounted = () => useSyncExternalStore(emptySubscribe, () => true, () => false)

// Streak Display Component
export function StreakDisplay({ compact = false }: { compact?: boolean }) {
  const { streakDays, longestStreak, recordActivity } = useProgressStore()
  const mounted = useIsMounted()

  useEffect(() => {
    if (mounted) {
      recordActivity()
    }
  }, [mounted, recordActivity])

  if (!mounted) return null

  return (
    <span className="flex items-center gap-2">
      <motion.span
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
          streakDays > 0 
            ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" 
            : "bg-muted text-muted-foreground",
          compact && "px-2 py-0.5 text-xs bg-transparent border-0"
        )}
        animate={streakDays > 0 ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Flame className={cn("w-4 h-4", streakDays > 0 && "animate-pulse", compact && "w-3.5 h-3.5")} />
        <span>{streakDays} {compact ? "" : `day${streakDays !== 1 ? "s" : ""}`}</span>
      </motion.span>
      
      {!compact && longestStreak > streakDays && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Trophy className="w-3 h-3" />
          <span>Best: {longestStreak}</span>
        </span>
      )}
    </span>
  )
}

// Activity Heatmap (GitHub-style)
interface ActivityHeatmapProps {
  className?: string
}

export function ActivityHeatmap({ className }: ActivityHeatmapProps) {
  const { activityHistory } = useProgressStore()
  const mounted = useIsMounted()

  if (!mounted) return null

  // Generate last 12 weeks of dates
  const weeks: string[][] = []
  const today = new Date()
  
  for (let w = 11; w >= 0; w--) {
    const week: string[] = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(today)
      date.setDate(date.getDate() - (w * 7 + (6 - d)))
      week.push(date.toISOString().split('T')[0])
    }
    weeks.push(week)
  }

  const activitySet = new Set(activityHistory)

  return (
    <div className={cn("p-4 rounded-lg border border-border bg-card/50", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Activity</span>
      </div>
      
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((date) => {
              const isActive = activitySet.has(date)
              const isToday = date === today.toISOString().split('T')[0]
              
              return (
                <motion.div
                  key={date}
                  className={cn(
                    "w-3 h-3 rounded-sm",
                    isActive ? "bg-green-500" : "bg-muted",
                    isToday && "ring-1 ring-primary"
                  )}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: wi * 0.02 }}
                  title={date}
                />
              )
            })}
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
        <span>12 weeks ago</span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          <div className="w-2 h-2 rounded-sm bg-muted" />
          <div className="w-2 h-2 rounded-sm bg-green-500/50" />
          <div className="w-2 h-2 rounded-sm bg-green-500" />
          <span>More</span>
        </div>
      </div>
    </div>
  )
}

// Course Progress Overview
interface CourseProgressProps {
  totalModules: number
  className?: string
}

export function CourseProgress({ totalModules, className }: CourseProgressProps) {
  const { completedModules, timeSpent } = useProgressStore()
  const mounted = useIsMounted()

  if (!mounted) return null

  const completedCount = completedModules.length
  const percentage = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0
  const totalTime = Object.values(timeSpent).reduce((a, b) => a + b, 0)
  const hours = Math.floor(totalTime / 3600)
  const minutes = Math.floor((totalTime % 3600) / 60)

  return (
    <div className={cn("p-6 rounded-xl border border-border bg-card/50", className)}>
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        Your Progress
      </h3>

      {/* Main Progress Ring */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className="text-primary"
              initial={{ strokeDasharray: "0 283" }}
              animate={{ strokeDasharray: `${percentage * 2.83} 283` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{percentage}%</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm">
              <strong>{completedCount}</strong> of {totalModules} modules
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-sm">
              <strong>{hours}h {minutes}m</strong> learning time
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-500" />
            <span className="text-sm">
              <strong>{totalModules - completedCount}</strong> modules remaining
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Course Completion</span>
          <span>{completedCount}/{totalModules}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-green-500"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  )
}

// Module Completion Badge
interface CompletionBadgeProps {
  isCompleted: boolean
  size?: "sm" | "md" | "lg"
}

export function CompletionBadge({ isCompleted, size = "md" }: CompletionBadgeProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  }

  if (!isCompleted) return null

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        "rounded-full bg-green-500 text-white flex items-center justify-center",
        sizes[size]
      )}
    >
      <CheckCircle className={cn(
        size === "sm" ? "w-3 h-3" : size === "md" ? "w-3.5 h-3.5" : "w-4 h-4"
      )} />
    </motion.div>
  )
}

// Celebration Animation (shown on module completion)
export function CompletionCelebration({ show }: { show: boolean }) {
  if (!show) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-card border border-border rounded-2xl p-8 shadow-2xl text-center"
      >
        <motion.div
          animate={{ 
            rotate: [0, -10, 10, -10, 10, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 0.5 }}
          className="text-6xl mb-4"
        >
          🎉
        </motion.div>
        <h3 className="text-xl font-bold mb-2">Module Complete!</h3>
        <p className="text-muted-foreground">Great job! Keep up the momentum.</p>
      </motion.div>
    </motion.div>
  )
}
