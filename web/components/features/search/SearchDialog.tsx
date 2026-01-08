"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, FileText, Hash, ArrowRight, Command, X } from "lucide-react"
import { useUIStore } from "@/lib/store"
import { cn } from "@/lib/utils"

interface SearchResult {
  type: "module" | "heading" | "content"
  title: string
  description?: string
  slug: string
  headingId?: string
  week?: number
  day?: number
}

interface SearchDialogProps {
  modules: {
    slug: string
    title: string
    description: string
    week: number
    day: number
  }[]
}

export function SearchDialog({ modules }: SearchDialogProps) {
  const router = useRouter()
  const { isSearchOpen, closeSearch, openSearch } = useUIStore()
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Search logic
  const results = useMemo(() => {
    if (!query.trim()) return []

    const searchTerm = query.toLowerCase()
    const matches: SearchResult[] = []

    modules.forEach((module) => {
      const titleMatch = module.title.toLowerCase().includes(searchTerm)
      const descMatch = module.description.toLowerCase().includes(searchTerm)

      if (titleMatch || descMatch) {
        matches.push({
          type: "module",
          title: module.title,
          description: module.description,
          slug: module.slug,
          week: module.week,
          day: module.day
        })
      }
    })

    // Sort by relevance (title matches first, then by day)
    return matches
      .sort((a, b) => {
        const aTitle = a.title.toLowerCase().includes(searchTerm)
        const bTitle = b.title.toLowerCase().includes(searchTerm)
        if (aTitle && !bTitle) return -1
        if (!aTitle && bTitle) return 1
        return (a.day || 0) - (b.day || 0)
      })
      .slice(0, 10)
  }, [query, modules])

  const navigateToResult = useCallback((result: SearchResult) => {
    const url = result.headingId 
      ? `/modules/${result.slug}#${result.headingId}`
      : `/modules/${result.slug}`
    router.push(url)
    closeSearch()
  }, [router, closeSearch])

  // Keyboard navigation
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        if (isSearchOpen) closeSearch()
        else openSearch()
      }
      // Forward slash /
      if (e.key === "/" && !isSearchOpen && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault()
        openSearch()
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown)
    return () => window.removeEventListener("keydown", handleGlobalKeyDown)
  }, [isSearchOpen, openSearch, closeSearch])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isSearchOpen) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
        break
      case "Enter":
        e.preventDefault()
        if (results[selectedIndex]) {
          navigateToResult(results[selectedIndex])
        }
        break
      case "Escape":
        closeSearch()
        break
    }
  }, [isSearchOpen, results, selectedIndex, closeSearch, navigateToResult])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])


  if (!isSearchOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={closeSearch}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15 }}
          className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-4 overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 border-b border-border">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search modules, topics, concepts..."
                className="flex-1 py-4 bg-transparent text-lg outline-none placeholder:text-muted-foreground"
                autoFocus
              />
              <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border bg-muted px-2 font-mono text-xs text-muted-foreground">
                ESC
              </kbd>
              <button
                onClick={closeSearch}
                className="sm:hidden p-1 hover:bg-muted rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {query.trim() === "" ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Start typing to search modules</p>
                  <div className="flex justify-center gap-4 mt-4 text-xs">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-muted">↑↓</kbd> Navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-muted">↵</kbd> Select
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-muted">esc</kbd> Close
                    </span>
                  </div>
                </div>
              ) : results.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p>No results found for &quot;{query}&quot;</p>
                </div>
              ) : (
                <div className="py-2">
                  {results.map((result, index) => (
                    <button
                      key={`${result.slug}-${result.headingId || index}`}
                      onClick={() => navigateToResult(result)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors",
                        selectedIndex === index ? "bg-muted" : "hover:bg-muted/50"
                      )}
                    >
                      <div className={cn(
                        "mt-0.5 p-1.5 rounded",
                        result.type === "module" ? "bg-primary/10 text-primary" : "bg-muted"
                      )}>
                        {result.type === "module" ? (
                          <FileText className="w-4 h-4" />
                        ) : (
                          <Hash className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {result.title.split(": ")[1] || result.title}
                          </span>
                          {result.day && (
                            <span className="text-xs text-muted-foreground font-mono">
                              Day {result.day}
                            </span>
                          )}
                        </div>
                        {result.description && (
                          <p className="text-sm text-muted-foreground truncate mt-0.5">
                            {result.description}
                          </p>
                        )}
                      </div>
                      <ArrowRight className={cn(
                        "w-4 h-4 text-muted-foreground transition-opacity",
                        selectedIndex === index ? "opacity-100" : "opacity-0"
                      )} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
              <span>{results.length} results</span>
              <div className="flex items-center gap-1">
                <Command className="w-3 h-3" />
                <span>K to open anytime</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
