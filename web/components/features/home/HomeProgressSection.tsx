"use client"

import { useEffect, useSyncExternalStore } from "react"
import { motion } from "framer-motion"
import { useProgressStore } from "@/lib/store"
import { ActivityHeatmap } from "@/components/custom/ProgressDisplay"
import { Flame, Trophy, Target, BookOpen } from "lucide-react"

const emptySubscribe = () => () => {}
const useIsMounted = () => useSyncExternalStore(emptySubscribe, () => true, () => false)

interface HomeProgressSectionProps {
  totalModules: number
}

export function HomeProgressSection({ totalModules }: HomeProgressSectionProps) {
  const { completedModules, streakDays, longestStreak, recordActivity } = useProgressStore()
  const mounted = useIsMounted()

  useEffect(() => {
    recordActivity()
  }, [recordActivity])

  if (!mounted) return null

  const completedCount = completedModules.length
  const percentage = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0

  // Don't show if user hasn't started
  if (completedCount === 0 && streakDays === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="pt-16 w-full max-w-4xl mx-auto"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-orange-500 mb-2">
            <Flame className="w-5 h-5" />
            <span className="text-sm font-medium">Streak</span>
          </div>
          <p className="text-2xl font-bold">{streakDays} days</p>
          {longestStreak > streakDays && (
            <p className="text-xs text-muted-foreground mt-1">Best: {longestStreak}</p>
          )}
        </div>

        {/* Completed */}
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-green-500 mb-2">
            <BookOpen className="w-5 h-5" />
            <span className="text-sm font-medium">Completed</span>
          </div>
          <p className="text-2xl font-bold">{completedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">of {totalModules} modules</p>
        </div>

        {/* Progress */}
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <Target className="w-5 h-5" />
            <span className="text-sm font-medium">Progress</span>
          </div>
          <p className="text-2xl font-bold">{percentage}%</p>
          <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        {/* Achievement */}
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-purple-500 mb-2">
            <Trophy className="w-5 h-5" />
            <span className="text-sm font-medium">Level</span>
          </div>
          <p className="text-2xl font-bold">
            {percentage < 20 ? "Beginner" : 
             percentage < 50 ? "Explorer" : 
             percentage < 80 ? "Builder" : 
             percentage < 100 ? "Architect" : "Master"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {percentage < 100 ? `${100 - percentage}% to next` : "Course complete!"}
          </p>
        </div>
      </div>

      {/* Activity Heatmap - only show if there's activity */}
      {completedCount > 0 && (
        <div className="mt-6">
          <ActivityHeatmap />
        </div>
      )}
    </motion.div>
  )
}
