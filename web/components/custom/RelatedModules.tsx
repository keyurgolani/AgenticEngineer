"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface Module {
  slug: string
  title: string
  description: string
  week: number
  day: number
}

interface RelatedModulesProps {
  currentSlug: string
  currentWeek: number
  modules: Module[]
  className?: string
}

export function RelatedModules({ currentSlug, currentWeek, modules, className }: RelatedModulesProps) {
  // Get modules from the same week, excluding current
  const sameWeekModules = modules
    .filter(m => m.week === currentWeek && m.slug !== currentSlug)
    .slice(0, 3)

  // Get modules from adjacent weeks if not enough
  const adjacentModules = modules
    .filter(m => 
      (m.week === currentWeek - 1 || m.week === currentWeek + 1) && 
      m.slug !== currentSlug
    )
    .slice(0, 3 - sameWeekModules.length)

  const relatedModules = [...sameWeekModules, ...adjacentModules].slice(0, 3)

  if (relatedModules.length === 0) return null

  const safeTitle = (t: string) => t.split(": ")[1] || t

  return (
    <div className={cn("mt-12 pt-8 border-t border-border", className)}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-primary" />
        Related Modules
      </h3>
      
      <div className="grid gap-3">
        {relatedModules.map((module, index) => (
          <motion.div
            key={module.slug}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/modules/${module.slug}`}>
              <div className="group flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-mono text-sm font-bold">
                  {module.day.toString().padStart(2, '0')}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                    {safeTitle(module.title)}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    Week {module.week} • {module.description}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
