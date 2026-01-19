"use client"

import { useState, useEffect, useCallback, useSyncExternalStore } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, TrendingUp, Lightbulb, AlertTriangle, CheckCircle2, Trash2, Download, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLocalStorage } from "@/hooks/use-local-storage"

// Hydration-safe mounting check
const emptySubscribe = () => () => {}
const useIsMounted = () => useSyncExternalStore(emptySubscribe, () => true, () => false)

interface PlaybookEntry {
  id: string
  content: string
  category: "strategy" | "pitfall" | "example"
  helpfulness: number
  usageCount: number
  iteration: number
}

const initialEntries: PlaybookEntry[] = [
  {
    id: "1",
    content: "Always validate user input before processing",
    category: "strategy",
    helpfulness: 0.8,
    usageCount: 5,
    iteration: 1
  },
  {
    id: "2",
    content: "Never use string formatting for SQL queries",
    category: "pitfall",
    helpfulness: 0.9,
    usageCount: 8,
    iteration: 1
  }
]

export function ACEPlaybookVisualizer() {
  const [entries, setEntries] = useLocalStorage<PlaybookEntry[]>("ace-playbook-entries", initialEntries)
  const [iteration, setIteration] = useLocalStorage<number>("ace-playbook-iteration", 1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const isMounted = useIsMounted()

  const simulateIteration = useCallback(() => {
    setIteration((prevIteration: number) => {
      const newIteration = prevIteration + 1

      // Simulate learning: add new entry or update existing
      const scenarios = [
        {
          content: "Use parameterized queries with prepared statements",
          category: "strategy" as const,
          helpfulness: 0.7,
          usageCount: 1
        },
        {
          content: "Hash passwords with bcrypt before storing",
          category: "strategy" as const,
          helpfulness: 0.85,
          usageCount: 1
        },
        {
          content: "Avoid exposing stack traces in production",
          category: "pitfall" as const,
          helpfulness: 0.75,
          usageCount: 1
        },
        {
          content: "Use cursor.execute('SELECT * FROM users WHERE id=?', (user_id,))",
          category: "example" as const,
          helpfulness: 0.8,
          usageCount: 1
        }
      ]

      const newEntry = scenarios[Math.floor(Math.random() * scenarios.length)]
      
      setEntries((prev: PlaybookEntry[]) => [
        ...(prev || []),
        {
          id: `${Date.now()}`,
          ...newEntry,
          iteration: newIteration
        }
      ])

      // Update helpfulness scores
      setEntries((prev: PlaybookEntry[]) => (prev || []).map((entry: PlaybookEntry) => ({
        ...entry,
        helpfulness: Math.min(1, entry.helpfulness + (Math.random() * 0.1 - 0.05)),
        usageCount: entry.usageCount + (Math.random() > 0.5 ? 1 : 0)
      })))

      return newIteration
    })
  }, [setIteration, setEntries])

  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        simulateIteration()
      }, 2000)
      return () => clearInterval(timer)
    }
  }, [isPlaying, simulateIteration])

  const categoryIcons = {
    strategy: Lightbulb,
    pitfall: AlertTriangle,
    example: CheckCircle2
  }

  const categoryColors = {
    strategy: "from-blue-500 to-cyan-500",
    pitfall: "from-red-500 to-orange-500",
    example: "from-green-500 to-emerald-500"
  }

  if (!isMounted) {
    return <div className="my-8 p-6 rounded-xl border border-border bg-card/50 min-h-[400px] flex items-center justify-center">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  }

  const removeEntry = (id: string) => {
    setEntries((prev: PlaybookEntry[]) => (prev || []).filter((e: PlaybookEntry) => e.id !== id))
  }

  const handleExport = () => {
    const data = JSON.stringify({ entries: safeEntries, iteration }, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ace-playbook-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string
        const data = JSON.parse(result)
        if (data.entries && typeof data.iteration === 'number') {
          setEntries(data.entries)
          setIteration(data.iteration)
        } else {
          alert("Invalid playbook file format")
        }
      } catch {
        alert("Error reading file")
      }
    }
    reader.readAsText(file)
    // Reset input
    event.target.value = ""
  }

  const safeEntries = entries || initialEntries

  const filteredEntries = selectedCategory
    ? safeEntries.filter(e => e.category === selectedCategory)
    : safeEntries

  const avgHelpfulness = safeEntries.length > 0
    ? safeEntries.reduce((sum: number, e: PlaybookEntry) => sum + e.helpfulness, 0) / safeEntries.length
    : 0

  return (
    <div className="my-8 p-6 rounded-xl border border-border bg-card/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          ACE Playbook Evolution
        </h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isPlaying ? "destructive" : "default"}
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? "Stop simulation" : "Start simulation"}
          >
            {isPlaying ? "Stop" : "Simulate Learning"}
          </Button>
          
          <div className="flex items-center gap-1 border-l pl-2 ml-2 border-border">
             <Button
              size="sm"
              variant="outline"
              onClick={handleExport}
              title="Export Playbook"
              aria-label="Export playbook to JSON"
            >
              <Download className="w-4 h-4" />
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Import playbook from JSON"
              />
              <Button
                size="sm"
                variant="outline"
                title="Import Playbook"
                className="pointer-events-none"
              >
                <Upload className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (confirm("Reset playbook to defaults?")) {
                setEntries(initialEntries)
                setIteration(1)
                setIsPlaying(false)
              }
            }}
            aria-label="Reset playbook"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6" role="status" aria-label="Playbook statistics">
        <div className="p-4 rounded-lg bg-muted/50">
          <div className="text-sm text-muted-foreground mb-1">Iteration</div>
          <div className="text-2xl font-bold" aria-live="polite">{iteration}</div>
        </div>
        <div className="p-4 rounded-lg bg-muted/50">
          <div className="text-sm text-muted-foreground mb-1">Entries</div>
          <div className="text-2xl font-bold" aria-live="polite">{safeEntries.length}</div>
        </div>
        <div className="p-4 rounded-lg bg-muted/50">
          <div className="text-sm text-muted-foreground mb-1">Avg Helpfulness</div>
          <div className="text-2xl font-bold" aria-live="polite">{(avgHelpfulness * 100).toFixed(0)}%</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-4" role="tablist" aria-label="Filter by category">
        <button
          onClick={() => setSelectedCategory(null)}
          role="tab"
          aria-selected={selectedCategory === null}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
            selectedCategory === null
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          )}
        >
          All
        </button>
        {Object.entries(categoryIcons).map(([category, Icon]) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            role="tab"
            aria-selected={selectedCategory === category}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
              selectedCategory === category
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Playbook Entries */}
      <div 
        className="space-y-3 max-h-96 overflow-y-auto"
        role="feed"
        aria-label="Playbook entries list"
        aria-busy={isPlaying}
      >
        <AnimatePresence mode="popLayout">
          {filteredEntries.map((entry, index) => {
            const Icon = categoryIcons[entry.category]
            const gradient = categoryColors[entry.category]

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="group relative p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-all focus-within:border-primary"
                tabIndex={0}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg bg-gradient-to-br",
                    gradient,
                    "bg-opacity-10"
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase">
                        {entry.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Iteration {entry.iteration}
                      </span>
                    </div>
                    <p className="text-sm">{entry.content}</p>
                    
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {(entry.helpfulness * 100).toFixed(0)}% helpful
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Used {entry.usageCount}x
                      </div>
                    </div>

                    {/* Helpfulness bar */}
                    <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuenow={entry.helpfulness * 100} aria-label="Helpfulness score">
                      <motion.div
                        className={cn("h-full bg-gradient-to-r", gradient)}
                        initial={{ width: 0 }}
                        animate={{ width: `${entry.helpfulness * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded hover:bg-destructive/10 transition-all focus:outline-none focus:ring-2 focus:ring-destructive"
                    aria-label="Delete entry"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
        <p>
          <strong>How it works:</strong> The ACE framework learns from experience by adding new entries
          to the playbook and updating helpfulness scores based on task success. Click &quot;Simulate Learning&quot;
          to watch the playbook evolve over iterations.
        </p>
      </div>
    </div>
  )
}

// Simpler playbook entry display
interface PlaybookEntryCardProps {
  category: "strategy" | "pitfall" | "example"
  content: string
  helpfulness?: number
}

export function PlaybookEntryCard({ category, content, helpfulness = 0.8 }: PlaybookEntryCardProps) {
  const icons = {
    strategy: Lightbulb,
    pitfall: AlertTriangle,
    example: CheckCircle2
  }

  const colors = {
    strategy: "text-blue-500 bg-blue-500/10",
    pitfall: "text-red-500 bg-red-500/10",
    example: "text-green-500 bg-green-500/10"
  }

  const Icon = icons[category]

  return (
    <div className="my-3 p-3 rounded-lg border border-border bg-card/30 flex items-start gap-3">
      <div className={cn("p-2 rounded-lg", colors[category])}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <div className="text-xs font-medium text-muted-foreground uppercase mb-1">
          {category}
        </div>
        <p className="text-sm">{content}</p>
        {helpfulness && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary"
                style={{ width: `${helpfulness * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {(helpfulness * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
