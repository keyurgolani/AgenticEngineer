"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Command, Search, Home, BookOpen, Lightbulb, StickyNote, 
  Moon, Sun, Maximize2, Keyboard, ArrowRight,
  Bookmark
} from "lucide-react"
import { useUIStore, useProgressStore } from "@/lib/store"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface CommandItem {
  id: string
  title: string
  description?: string
  icon: React.ReactNode
  action: () => void
  category: "navigation" | "actions" | "settings"
  keywords?: string[]
}

export function CommandPalette() {
  const router = useRouter()
  const { setTheme } = useTheme()
  const { 
    isCommandPaletteOpen, 
    closeCommandPalette, 
    openNotes, 
    openSearch,
    toggleSidebar 
  } = useUIStore()
  const { bookmarkedModules } = useProgressStore()
  
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)

  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    {
      id: "home",
      title: "Go to Home",
      icon: <Home className="w-4 h-4" />,
      action: () => router.push("/"),
      category: "navigation",
      keywords: ["home", "main", "start"]
    },
    {
      id: "modules",
      title: "Go to Modules",
      icon: <BookOpen className="w-4 h-4" />,
      action: () => router.push("/modules/day-01-interface-of-agentic-ai"),
      category: "navigation",
      keywords: ["modules", "lessons", "course"]
    },
    {
      id: "projects",
      title: "Go to Projects",
      icon: <Lightbulb className="w-4 h-4" />,
      action: () => router.push("/projects"),
      category: "navigation",
      keywords: ["projects", "capstone", "build"]
    },
    {
      id: "bookmarks",
      title: `View Bookmarks (${bookmarkedModules.length})`,
      icon: <Bookmark className="w-4 h-4" />,
      action: () => router.push("/notes"),
      category: "navigation",
      keywords: ["bookmarks", "saved", "favorites"]
    },
    // Actions
    {
      id: "search",
      title: "Search Modules",
      description: "Find modules by title or content",
      icon: <Search className="w-4 h-4" />,
      action: () => { closeCommandPalette(); setTimeout(openSearch, 100) },
      category: "actions",
      keywords: ["search", "find", "lookup"]
    },
    {
      id: "notes",
      title: "Open Notes",
      description: "View and edit your notes",
      icon: <StickyNote className="w-4 h-4" />,
      action: () => { closeCommandPalette(); openNotes() },
      category: "actions",
      keywords: ["notes", "write", "annotations"]
    },
    {
      id: "zen",
      title: "Toggle Zen Mode",
      description: "Distraction-free reading",
      icon: <Maximize2 className="w-4 h-4" />,
      action: () => { closeCommandPalette(); toggleSidebar() },
      category: "actions",
      keywords: ["zen", "focus", "distraction"]
    },
    // Settings
    {
      id: "theme-dark",
      title: "Switch to Dark Theme",
      icon: <Moon className="w-4 h-4" />,
      action: () => setTheme("dark"),
      category: "settings",
      keywords: ["dark", "theme", "night"]
    },
    {
      id: "theme-light",
      title: "Switch to Light Theme",
      icon: <Sun className="w-4 h-4" />,
      action: () => setTheme("light"),
      category: "settings",
      keywords: ["light", "theme", "day"]
    },
  ], [router, closeCommandPalette, openNotes, openSearch, toggleSidebar, setTheme, bookmarkedModules.length])

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands
    
    const searchTerm = query.toLowerCase()
    return commands.filter(cmd => 
      cmd.title.toLowerCase().includes(searchTerm) ||
      cmd.description?.toLowerCase().includes(searchTerm) ||
      cmd.keywords?.some(k => k.includes(searchTerm))
    )
  }, [query, commands])

  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {
      navigation: [],
      actions: [],
      settings: []
    }
    filteredCommands.forEach(cmd => {
      groups[cmd.category].push(cmd)
    })
    return groups
  }, [filteredCommands])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isCommandPaletteOpen) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex(i => Math.max(i - 1, 0))
        break
      case "Enter":
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action()
          closeCommandPalette()
        }
        break
      case "Escape":
        closeCommandPalette()
        break
    }
  }, [isCommandPaletteOpen, filteredCommands, selectedIndex, closeCommandPalette])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredCommands])

  useEffect(() => {
    if (!isCommandPaletteOpen) {
      setQuery("")
      setSelectedIndex(0)
    }
  }, [isCommandPaletteOpen])

  if (!isCommandPaletteOpen) return null

  const categoryLabels: Record<string, string> = {
    navigation: "Navigation",
    actions: "Actions",
    settings: "Settings"
  }

  let flatIndex = 0

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={closeCommandPalette}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15 }}
          className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-lg"
          onClick={e => e.stopPropagation()}
        >
          <div className="mx-4 overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
            {/* Input */}
            <div className="flex items-center gap-3 px-4 border-b border-border">
              <Command className="w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Type a command or search..."
                className="flex-1 py-4 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                autoFocus
              />
              <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border bg-muted px-2 font-mono text-xs text-muted-foreground">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto py-2">
              {filteredCommands.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p>No commands found</p>
                </div>
              ) : (
                Object.entries(groupedCommands).map(([category, items]) => {
                  if (items.length === 0) return null
                  return (
                    <div key={category}>
                      <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {categoryLabels[category]}
                      </div>
                      {items.map(cmd => {
                        const currentIndex = flatIndex++
                        return (
                          <button
                            key={cmd.id}
                            onClick={() => {
                              cmd.action()
                              closeCommandPalette()
                            }}
                            onMouseEnter={() => setSelectedIndex(currentIndex)}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                              selectedIndex === currentIndex ? "bg-muted" : "hover:bg-muted/50"
                            )}
                          >
                            <div className="p-1.5 rounded bg-muted">
                              {cmd.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">{cmd.title}</div>
                              {cmd.description && (
                                <div className="text-xs text-muted-foreground truncate">
                                  {cmd.description}
                                </div>
                              )}
                            </div>
                            <ArrowRight className={cn(
                              "w-4 h-4 text-muted-foreground transition-opacity",
                              selectedIndex === currentIndex ? "opacity-100" : "opacity-0"
                            )} />
                          </button>
                        )
                      })}
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted">↑↓</kbd> Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted">↵</kbd> Select
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Keyboard className="w-3 h-3" />
                <span>? for shortcuts</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
