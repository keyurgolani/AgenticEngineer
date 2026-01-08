"use client"

import { useState, useEffect, useSyncExternalStore } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, CheckCircle, Circle, Bookmark, X } from "lucide-react"
import { useProgressStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Hydration-safe mounting check
const emptySubscribe = () => () => {}
const useIsMounted = () => useSyncExternalStore(emptySubscribe, () => true, () => false)

type FilterType = "all" | "completed" | "incomplete" | "bookmarked"
type WeekFilter = number | "all"

interface ModuleFiltersProps {
  weeks: number[]
  onFilterChange: (filters: { status: FilterType; week: WeekFilter }) => void
  className?: string
}

export function ModuleFilters({ weeks, onFilterChange, className }: ModuleFiltersProps) {
  const [statusFilter, setStatusFilter] = useState<FilterType>("all")
  const [weekFilter, setWeekFilter] = useState<WeekFilter>("all")
  const [isOpen, setIsOpen] = useState(false)
  const { completedModules, bookmarkedModules } = useProgressStore()
  const mounted = useIsMounted()

  useEffect(() => {
    onFilterChange({ status: statusFilter, week: weekFilter })
  }, [statusFilter, weekFilter, onFilterChange])

  const hasActiveFilters = statusFilter !== "all" || weekFilter !== "all"

  const clearFilters = () => {
    setStatusFilter("all")
    setWeekFilter("all")
  }

  if (!mounted) return null

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-2">
        <Button
          variant={hasActiveFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {(statusFilter !== "all" ? 1 : 0) + (weekFilter !== "all" ? 1 : 0)}
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}

        {/* Quick filter badges */}
        <div className="hidden md:flex items-center gap-2 ml-2">
          <Badge
            variant={statusFilter === "completed" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setStatusFilter(statusFilter === "completed" ? "all" : "completed")}
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed ({completedModules.length})
          </Badge>
          <Badge
            variant={statusFilter === "bookmarked" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setStatusFilter(statusFilter === "bookmarked" ? "all" : "bookmarked")}
          >
            <Bookmark className="w-3 h-3 mr-1" />
            Bookmarked ({bookmarkedModules.length})
          </Badge>
        </div>
      </div>

      {/* Filter dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 p-4 rounded-lg border border-border bg-card shadow-lg z-20 min-w-[280px]"
          >
            {/* Status filters */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Status
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "all", label: "All", icon: null },
                  { value: "completed", label: "Completed", icon: CheckCircle },
                  { value: "incomplete", label: "In Progress", icon: Circle },
                  { value: "bookmarked", label: "Bookmarked", icon: Bookmark },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value as FilterType)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                      statusFilter === option.value
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    {option.icon && <option.icon className="w-4 h-4" />}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Week filters */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Week
              </h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setWeekFilter("all")}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm transition-colors",
                    weekFilter === "all"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  All
                </button>
                {weeks.map((week) => (
                  <button
                    key={week}
                    onClick={() => setWeekFilter(week)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm transition-colors",
                      weekFilter === week
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    Week {week}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Hook to filter modules based on current filters
export function useModuleFilter(
  modules: { slug: string; week: number }[],
  filters: { status: FilterType; week: WeekFilter }
) {
  const { completedModules, bookmarkedModules } = useProgressStore()

  return modules.filter((module) => {
    // Week filter
    if (filters.week !== "all" && module.week !== filters.week) {
      return false
    }

    // Status filter
    switch (filters.status) {
      case "completed":
        return completedModules.includes(module.slug)
      case "incomplete":
        return !completedModules.includes(module.slug)
      case "bookmarked":
        return bookmarkedModules.includes(module.slug)
      default:
        return true
    }
  })
}
