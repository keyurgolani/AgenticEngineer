"use client"

import { useSyncExternalStore } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, BookOpen, Clock, Play } from "lucide-react"
import { useProgressStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Hydration-safe mounting check
const emptySubscribe = () => () => {}
const useIsMounted = () => useSyncExternalStore(emptySubscribe, () => true, () => false)

interface Module {
  slug: string
  title: string
  description: string
  week: number
  day: number
}

interface ContinueLearningProps {
  modules: Module[]
  className?: string
}

export function ContinueLearning({ modules, className }: ContinueLearningProps) {
  const { lastVisitedModule, lastVisitedAt, completedModules, moduleProgress } = useProgressStore()
  const mounted = useIsMounted()

  if (!mounted) return null

  // Find the module to continue with
  let continueModule: Module | null = null
  let nextModule: Module | null = null

  if (lastVisitedModule) {
    continueModule = modules.find(m => m.slug === lastVisitedModule) || null
  }

  // Find next uncompleted module
  const sortedModules = [...modules].sort((a, b) => a.day - b.day)
  nextModule = sortedModules.find(m => !completedModules.includes(m.slug)) || null

  // If no last visited, use next uncompleted
  if (!continueModule && nextModule) {
    continueModule = nextModule
  }

  // If everything is completed, show the first module
  if (!continueModule && modules.length > 0) {
    continueModule = sortedModules[0]
  }

  if (!continueModule) return null

  const progress = moduleProgress[continueModule.slug] || 0
  const isCompleted = completedModules.includes(continueModule.slug)
  const timeAgo = lastVisitedAt ? getTimeAgo(new Date(lastVisitedAt)) : null

  const safeTitle = (t: string) => t.split(": ")[1] || t

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background p-6",
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            {isCompleted ? (
              <span className="text-green-500">✓ Completed</span>
            ) : lastVisitedAt ? (
              <>
                <Clock className="w-4 h-4" />
                <span>Continue where you left off</span>
                {timeAgo && <span className="text-xs">• {timeAgo}</span>}
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Start your journey</span>
              </>
            )}
          </div>

          <h3 className="text-xl font-bold mb-1">
            Day {continueModule.day}: {safeTitle(continueModule.title)}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {continueModule.description}
          </p>

          {/* Progress bar */}
          {progress > 0 && !isCompleted && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <Link href={`/modules/${continueModule.slug}`}>
          <Button size="lg" className="gap-2 whitespace-nowrap">
            {isCompleted ? (
              <>
                <BookOpen className="w-4 h-4" />
                Review
              </>
            ) : progress > 0 ? (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Start Learning
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </Link>
      </div>

      {/* Quick stats */}
      <div className="flex gap-6 mt-6 pt-4 border-t border-border/50 text-sm">
        <div>
          <span className="text-muted-foreground">Completed</span>
          <p className="font-semibold">{completedModules.length} / {modules.length} modules</p>
        </div>
        <div>
          <span className="text-muted-foreground">Week</span>
          <p className="font-semibold">Week {continueModule.week}</p>
        </div>
      </div>
    </motion.div>
  )
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}

// Compact version for header
export function ContinueLearningCompact({ modules }: { modules: Module[] }) {
  const { lastVisitedModule, completedModules } = useProgressStore()
  const mounted = useIsMounted()

  if (!mounted) return null

  const sortedModules = [...modules].sort((a, b) => a.day - b.day)
  let targetModule = lastVisitedModule 
    ? modules.find(m => m.slug === lastVisitedModule)
    : sortedModules.find(m => !completedModules.includes(m.slug))

  if (!targetModule) targetModule = sortedModules[0]
  if (!targetModule) return null

  return (
    <Link href={`/modules/${targetModule.slug}`}>
      <Button variant="ghost" size="sm" className="gap-2 text-xs">
        <Play className="w-3 h-3" />
        Continue Day {targetModule.day}
      </Button>
    </Link>
  )
}
