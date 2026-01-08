"use client"

import Link from "next/link"
import { ChevronRight, Home, CheckCircle2, Circle, ArrowLeft, ArrowRight } from "lucide-react"
import { useState, useSyncExternalStore } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useProgressStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { BookmarkButton } from "./BookmarkButton"

// Hydration-safe mounting check
const emptySubscribe = () => () => {}
const useIsMounted = () => useSyncExternalStore(emptySubscribe, () => true, () => false)

interface BreadcrumbsProps {
  module: {
    week: number
    day: number
    title: string
    slug: string
  }
}

export function Breadcrumbs({ module }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center text-sm text-muted-foreground mb-4 overflow-hidden whitespace-nowrap">
      <Link href="/" className="hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      <ChevronRight className="h-4 w-4 mx-2 text-border shrink-0" />
      <span className="shrink-0">Week {module.week}</span>
      <ChevronRight className="h-4 w-4 mx-2 text-border shrink-0" />
      <span className="font-medium text-foreground truncate">{module.title}</span>
    </nav>
  )
}

export function CompletionButton({ slug }: { slug: string }) {
    const { toggleComplete, isCompleted, recordActivity } = useProgressStore()
    const mounted = useIsMounted()
    const [showCelebration, setShowCelebration] = useState(false)

    if (!mounted) return null

    const completed = isCompleted(slug)

    const handleToggle = () => {
        if (!completed) {
            setShowCelebration(true)
            recordActivity()
            setTimeout(() => setShowCelebration(false), 2000)
        }
        toggleComplete(slug)
    }

    return (
        <div className="relative">
            {/* Celebration animation */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                    >
                        <motion.div
                            animate={{ 
                                y: [0, -20, 0],
                                rotate: [0, -10, 10, 0]
                            }}
                            transition={{ duration: 0.5 }}
                            className="text-6xl"
                        >
                            🎉
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={cn(
                "flex items-center justify-center my-12 p-8 border rounded-lg transition-colors",
                completed ? "bg-green-500/5 border-green-500/20" : "bg-card/50"
            )}>
                <div className="text-center space-y-4">
                    <h3 className="text-xl font-bold">
                        {completed ? "Great job! 🎉" : "Finished this module?"}
                    </h3>
                    <p className="text-muted-foreground">
                        {completed 
                            ? "You've completed this module. Keep up the momentum!"
                            : "Mark it as complete to track your progress."
                        }
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <Button 
                            size="lg" 
                            variant={completed ? "outline" : "default"}
                            onClick={handleToggle}
                            className={cn(
                                "group",
                                completed && "border-green-500/50 text-green-500 hover:bg-green-500/10"
                            )}
                        >
                            {completed ? (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Completed
                                </>
                            ) : (
                                <>
                                    <Circle className="mr-2 h-4 w-4" />
                                    Mark as Complete
                                </>
                            )}
                        </Button>
                        <BookmarkButton slug={slug} variant="full" />
                    </div>
                </div>
            </div>
        </div>
    )
}

interface ModuleNavData {
    title: string
    slug: string
    description?: string
    day: number
}

interface ModuleNavigationProps {
    prevModule?: ModuleNavData
    nextModule?: ModuleNavData
}

export function ModuleNavigation({ prevModule, nextModule }: ModuleNavigationProps) {
    const safeTitle = (t: string) => (t || "").split(": ")[1] || t || ""

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16 pt-8 border-t border-border/50">
             {/* Previous Module Card */}
            {prevModule ? (
                <Link href={`/modules/${prevModule.slug}`} className="group block h-full">
                    <div className="h-full p-6 rounded-xl border border-border/50 bg-card/30 hover:bg-card/80 hover:border-primary/20 transition-all duration-300 relative overflow-hidden group-hover:shadow-lg group-hover:shadow-primary/5">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ArrowLeft className="w-12 h-12 -mr-4 -mt-4 text-foreground" />
                        </div>
                        
                        <div className="flex flex-col h-full justify-between relative z-10">
                            <div>
                                <div className="text-xs font-mono text-muted-foreground/70 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                                    Previous
                                </div>
                                <h3 className="font-semibold text-lg leading-tight text-foreground/90 group-hover:text-primary transition-colors">
                                    {safeTitle(prevModule.title)}
                                </h3>
                            </div>
                            <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
                                <span>Day {prevModule.day.toString().padStart(2, '0')}</span>
                            </div>
                        </div>
                    </div>
                </Link>
            ) : (
                <div className="hidden md:block" /> // Spacer
            )}

            {/* Next Module Card */}
            {nextModule ? (
                <Link href={`/modules/${nextModule.slug}`} className="group block h-full">
                    <div className="h-full p-6 rounded-xl border border-border/50 bg-card/30 hover:bg-card/80 hover:border-primary/20 transition-all duration-300 relative overflow-hidden group-hover:shadow-lg group-hover:shadow-primary/5 text-right">
                         <div className="absolute top-0 left-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ArrowRight className="w-12 h-12 -ml-4 -mt-4 text-foreground" />
                        </div>

                        <div className="flex flex-col h-full justify-between relative z-10">
                            <div>
                                <div className="text-xs font-mono text-muted-foreground/70 uppercase tracking-widest mb-3 flex items-center justify-end gap-2">
                                    Next
                                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </div>
                                <h3 className="font-semibold text-lg leading-tight text-foreground/90 group-hover:text-primary transition-colors">
                                    {safeTitle(nextModule.title)}
                                </h3>
                            </div>
                            <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
                                <span>Day {nextModule.day.toString().padStart(2, '0')}</span>
                            </div>
                        </div>
                    </div>
                </Link>
            ) : (
                <div className="hidden md:block" /> 
            )}
        </div>
    )
}
