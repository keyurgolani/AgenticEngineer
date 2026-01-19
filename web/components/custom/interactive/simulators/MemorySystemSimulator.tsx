"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brain,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Download,
  Search,
  Clock,
  Database,
  Lightbulb,
  Cog,
  ChevronRight,
  X,
  Zap,
  Archive,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Types for memory system
interface MemoryItem {
  id: string
  type: "working" | "episodic" | "semantic" | "procedural"
  content: string
  timestamp: number
  accessCount: number
  lastAccessed: number
  confidence: number
  consolidated: boolean
  decayRate: number
  metadata?: Record<string, string>
}

interface ConversationEvent {
  id: string
  userMessage: string
  agentResponse: string
  extractedMemories: Partial<MemoryItem>[]
  timestamp: number
}

interface SimulationStats {
  totalMemories: number
  byType: Record<string, number>
  consolidations: number
  retrievals: number
  decayed: number
}

// Sample conversation scenarios for simulation
const SAMPLE_CONVERSATIONS: Omit<ConversationEvent, "id" | "timestamp">[] = [
  {
    userMessage: "Hi! I'm Alex, a Python developer working on a machine learning project.",
    agentResponse: "Nice to meet you, Alex! I'd be happy to help with your ML project. What are you working on?",
    extractedMemories: [
      { type: "semantic", content: "User's name is Alex", confidence: 1.0 },
      { type: "semantic", content: "User is a Python developer", confidence: 0.95 },
      { type: "semantic", content: "User is working on a machine learning project", confidence: 0.9 },
    ],
  },
  {
    userMessage: "I'm building a recommendation system using collaborative filtering.",
    agentResponse: "Collaborative filtering is a great approach! Are you using user-based or item-based filtering?",
    extractedMemories: [
      { type: "episodic", content: "Discussed recommendation system architecture", confidence: 0.85 },
      { type: "semantic", content: "Project uses collaborative filtering", confidence: 0.9 },
    ],
  },
  {
    userMessage: "I prefer item-based because it scales better with our user base.",
    agentResponse: "Smart choice! Item-based CF does handle large user bases more efficiently.",
    extractedMemories: [
      { type: "semantic", content: "User prefers item-based collaborative filtering", confidence: 0.95 },
      { type: "procedural", content: "When discussing scaling: consider item-based over user-based CF", confidence: 0.8 },
    ],
  },
  {
    userMessage: "Can you help me debug this error? I'm getting a shape mismatch in my matrix.",
    agentResponse: "Shape mismatches are common in matrix operations. Can you share the dimensions you're working with?",
    extractedMemories: [
      { type: "working", content: "Current task: debugging matrix shape mismatch", confidence: 1.0 },
      { type: "episodic", content: "User encountered matrix shape mismatch error", confidence: 0.9 },
    ],
  },
  {
    userMessage: "The user matrix is 10000x50 and item matrix is 50x5000.",
    agentResponse: "Those dimensions look correct for multiplication. The issue might be in how you're indexing.",
    extractedMemories: [
      { type: "working", content: "User matrix: 10000x50, Item matrix: 50x5000", confidence: 1.0 },
      { type: "semantic", content: "System has 10000 users and 5000 items", confidence: 0.85 },
    ],
  },
  {
    userMessage: "Oh! I was transposing the wrong matrix. Thanks!",
    agentResponse: "Glad that helped! Matrix transposition issues are a classic gotcha in ML.",
    extractedMemories: [
      { type: "procedural", content: "Matrix shape errors: check transposition order first", confidence: 0.9 },
      { type: "episodic", content: "Resolved matrix error by fixing transposition", confidence: 0.95 },
    ],
  },
  {
    userMessage: "I usually work late at night, around 11pm.",
    agentResponse: "Good to know! I'll keep that in mind for our future sessions.",
    extractedMemories: [
      { type: "semantic", content: "User prefers working late at night around 11pm", confidence: 0.9 },
    ],
  },
  {
    userMessage: "What was that debugging tip you mentioned earlier?",
    agentResponse: "I suggested checking matrix transposition order when you encounter shape mismatches.",
    extractedMemories: [
      { type: "episodic", content: "User asked to recall previous debugging advice", confidence: 0.8 },
    ],
  },
  {
    userMessage: "I'm also interested in deploying this model to production.",
    agentResponse: "Great! For production ML, you'll want to consider model serving, monitoring, and A/B testing.",
    extractedMemories: [
      { type: "semantic", content: "User interested in ML production deployment", confidence: 0.9 },
      { type: "working", content: "New goal: discuss production deployment strategies", confidence: 0.85 },
    ],
  },
  {
    userMessage: "We use Kubernetes for our infrastructure.",
    agentResponse: "Perfect! K8s works great with ML serving. Consider KServe or Seldon for model deployment.",
    extractedMemories: [
      { type: "semantic", content: "User's infrastructure uses Kubernetes", confidence: 0.95 },
      { type: "procedural", content: "For K8s ML deployment: recommend KServe or Seldon", confidence: 0.85 },
    ],
  },
]

// Memory type configuration
const MEMORY_CONFIG = {
  working: {
    label: "Working Memory",
    icon: Zap,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/30",
    description: "Current task context (like RAM)",
    maxCapacity: 5,
    decayRate: 0.3,
  },
  episodic: {
    label: "Episodic Memory",
    icon: Clock,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    description: "Past experiences and interactions",
    maxCapacity: 20,
    decayRate: 0.05,
  },
  semantic: {
    label: "Semantic Memory",
    icon: Database,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    description: "Facts and knowledge",
    maxCapacity: 30,
    decayRate: 0.02,
  },
  procedural: {
    label: "Procedural Memory",
    icon: Cog,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    description: "Learned patterns and workflows",
    maxCapacity: 15,
    decayRate: 0.01,
  },
}

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9)

// Speed configurations (ms per step)
const SPEED_CONFIG = {
  slow: 2000,
  normal: 1000,
  fast: 400,
}

export function MemorySystemSimulator() {
  // Core state
  const [memories, setMemories] = useState<MemoryItem[]>([])
  const [conversationHistory, setConversationHistory] = useState<ConversationEvent[]>([])
  const [currentConversationIndex, setCurrentConversationIndex] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [speed, setSpeed] = useState<"slow" | "normal" | "fast">("normal")
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null)
  const [queryInput, setQueryInput] = useState("")
  const [retrievedMemories, setRetrievedMemories] = useState<MemoryItem[]>([])
  const [showTimeline, setShowTimeline] = useState(false)
  const [stats, setStats] = useState<SimulationStats>({
    totalMemories: 0,
    byType: { working: 0, episodic: 0, semantic: 0, procedural: 0 },
    consolidations: 0,
    retrievals: 0,
    decayed: 0,
  })
  const [consolidationAnimation, setConsolidationAnimation] = useState<string | null>(null)
  const [recentlyAdded, setRecentlyAdded] = useState<string[]>([])

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const simulationTime = useRef(0)

  // Simulate memory consolidation (working → long-term)
  const consolidateMemories = useCallback(() => {
    setMemories((prev) => {
      const updated = [...prev]
      let consolidationCount = 0

      // Find working memories that should be consolidated
      updated.forEach((mem) => {
        if (mem.type === "working" && !mem.consolidated && mem.accessCount >= 2) {
          mem.consolidated = true
          consolidationCount++
          setConsolidationAnimation(mem.id)
          setTimeout(() => setConsolidationAnimation(null), 1000)
        }
      })

      if (consolidationCount > 0) {
        setStats((s) => ({ ...s, consolidations: s.consolidations + consolidationCount }))
      }

      return updated
    })
  }, [])

  // Simulate memory decay
  const applyMemoryDecay = useCallback(() => {
    setMemories((prev) => {
      const now = simulationTime.current
      let decayedCount = 0

      const updated = prev.filter((mem) => {
        const timeSinceAccess = now - mem.lastAccessed
        const decayFactor = mem.decayRate * (timeSinceAccess / 10000)
        const newConfidence = mem.confidence - decayFactor

        if (newConfidence <= 0.3 && mem.type === "working") {
          decayedCount++
          return false // Remove decayed working memories
        }

        mem.confidence = Math.max(0.3, newConfidence)
        return true
      })

      if (decayedCount > 0) {
        setStats((s) => ({ ...s, decayed: s.decayed + decayedCount }))
      }

      return updated
    })
  }, [])

  // Add a new conversation and extract memories
  const addConversation = useCallback(() => {
    if (currentConversationIndex >= SAMPLE_CONVERSATIONS.length) {
      setIsRunning(false)
      return
    }

    const conversation = SAMPLE_CONVERSATIONS[currentConversationIndex]
    const timestamp = simulationTime.current

    const event: ConversationEvent = {
      id: generateId(),
      ...conversation,
      timestamp,
    }

    setConversationHistory((prev) => [...prev, event])

    // Extract and add memories
    const newMemoryIds: string[] = []
    const newMemories: MemoryItem[] = conversation.extractedMemories.map((mem) => {
      const id = generateId()
      newMemoryIds.push(id)
      return {
        id,
        type: mem.type!,
        content: mem.content!,
        timestamp,
        accessCount: 1,
        lastAccessed: timestamp,
        confidence: mem.confidence || 0.8,
        consolidated: false,
        decayRate: MEMORY_CONFIG[mem.type!].decayRate,
      }
    })

    setRecentlyAdded(newMemoryIds)
    setTimeout(() => setRecentlyAdded([]), 1500)

    setMemories((prev) => {
      // Check capacity limits
      const byType: Record<string, MemoryItem[]> = {
        working: [],
        episodic: [],
        semantic: [],
        procedural: [],
      }

      prev.forEach((m) => byType[m.type].push(m))
      newMemories.forEach((m) => byType[m.type].push(m))

      // Enforce capacity limits (remove oldest if over)
      Object.keys(byType).forEach((type) => {
        const config = MEMORY_CONFIG[type as keyof typeof MEMORY_CONFIG]
        if (byType[type].length > config.maxCapacity) {
          byType[type] = byType[type]
            .sort((a, b) => b.lastAccessed - a.lastAccessed)
            .slice(0, config.maxCapacity)
        }
      })

      const allMemories = Object.values(byType).flat()

      // Update stats
      setStats((s) => ({
        ...s,
        totalMemories: allMemories.length,
        byType: {
          working: byType.working.length,
          episodic: byType.episodic.length,
          semantic: byType.semantic.length,
          procedural: byType.procedural.length,
        },
      }))

      return allMemories
    })

    setCurrentConversationIndex((prev) => prev + 1)
    simulationTime.current += 1000
  }, [currentConversationIndex])

  // Run simulation step
  const runSimulationStep = useCallback(() => {
    addConversation()
    consolidateMemories()
    applyMemoryDecay()
  }, [addConversation, consolidateMemories, applyMemoryDecay])

  // Start/stop simulation
  const toggleSimulation = useCallback(() => {
    if (isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setIsRunning(false)
    } else {
      setIsRunning(true)
      intervalRef.current = setInterval(runSimulationStep, SPEED_CONFIG[speed])
    }
  }, [isRunning, speed, runSimulationStep])

  // Run batch simulation
  const runBatchSimulation = useCallback(() => {
    const remaining = SAMPLE_CONVERSATIONS.length - currentConversationIndex
    const toRun = Math.min(10, remaining)

    for (let i = 0; i < toRun; i++) {
      setTimeout(() => {
        runSimulationStep()
      }, i * 200)
    }
  }, [currentConversationIndex, runSimulationStep])

  // Reset simulation
  const resetSimulation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRunning(false)
    setMemories([])
    setConversationHistory([])
    setCurrentConversationIndex(0)
    setSelectedMemory(null)
    setRetrievedMemories([])
    setQueryInput("")
    simulationTime.current = 0
    setStats({
      totalMemories: 0,
      byType: { working: 0, episodic: 0, semantic: 0, procedural: 0 },
      consolidations: 0,
      retrievals: 0,
      decayed: 0,
    })
  }, [])

  // Handle speed change
  useEffect(() => {
    if (isRunning && intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = setInterval(runSimulationStep, SPEED_CONFIG[speed])
    }
  }, [speed, isRunning, runSimulationStep])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Query memories (simulated retrieval)
  const queryMemories = useCallback(() => {
    if (!queryInput.trim()) return

    const query = queryInput.toLowerCase()
    const results = memories
      .filter((mem) => mem.content.toLowerCase().includes(query))
      .map((mem) => ({
        ...mem,
        accessCount: mem.accessCount + 1,
        lastAccessed: simulationTime.current,
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5)

    setRetrievedMemories(results)
    setStats((s) => ({ ...s, retrievals: s.retrievals + 1 }))

    // Update access counts in main memory store
    setMemories((prev) =>
      prev.map((mem) => {
        const retrieved = results.find((r) => r.id === mem.id)
        if (retrieved) {
          return { ...mem, accessCount: mem.accessCount + 1, lastAccessed: simulationTime.current }
        }
        return mem
      })
    )
  }, [queryInput, memories])

  // Export memory state as JSON
  const exportMemoryState = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      simulationTime: simulationTime.current,
      stats,
      memories,
      conversationHistory,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `memory-state-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [stats, memories, conversationHistory])

  // Get memories grouped by type
  const memoriesByType = memories.reduce(
    (acc, mem) => {
      acc[mem.type].push(mem)
      return acc
    },
    { working: [], episodic: [], semantic: [], procedural: [] } as Record<string, MemoryItem[]>
  )

  const canSimulate = currentConversationIndex < SAMPLE_CONVERSATIONS.length

  return (
    <div className="my-8 space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Memory System Simulator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={toggleSimulation}
              disabled={!canSimulate}
              variant={isRunning ? "destructive" : "default"}
              className="gap-2"
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Simulate Conversation
                </>
              )}
            </Button>

            <Button
              onClick={runBatchSimulation}
              disabled={!canSimulate || isRunning}
              variant="outline"
              className="gap-2"
            >
              <FastForward className="w-4 h-4" /> Run 10 Conversations
            </Button>

            <Button onClick={resetSimulation} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" /> Reset
            </Button>

            <Button onClick={exportMemoryState} variant="outline" className="gap-2">
              <Download className="w-4 h-4" /> Export JSON
            </Button>
          </div>

          {/* Speed Control */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Speed:</span>
            <div className="flex gap-2">
              {(["slow", "normal", "fast"] as const).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={speed === s ? "default" : "outline"}
                  onClick={() => setSpeed(s)}
                  className="capitalize"
                >
                  {s}
                </Button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-2">
              ({currentConversationIndex}/{SAMPLE_CONVERSATIONS.length} conversations)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.totalMemories}</div>
            <div className="text-sm text-muted-foreground">Total Memories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.consolidations}</div>
            <div className="text-sm text-muted-foreground">Consolidations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.retrievals}</div>
            <div className="text-sm text-muted-foreground">Retrievals</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.decayed}</div>
            <div className="text-sm text-muted-foreground">Decayed</div>
          </CardContent>
        </Card>
      </div>

      {/* Memory Visualization */}
      <div className="grid md:grid-cols-2 gap-4">
        {(Object.keys(MEMORY_CONFIG) as Array<keyof typeof MEMORY_CONFIG>).map((type) => {
          const config = MEMORY_CONFIG[type]
          const Icon = config.icon
          const typeMemories = memoriesByType[type]
          const capacityPercent = (typeMemories.length / config.maxCapacity) * 100

          return (
            <Card key={type} className={cn("border", config.borderColor)}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("w-4 h-4", config.color)} />
                    {config.label}
                  </div>
                  <Badge variant="outline" className={config.color}>
                    {typeMemories.length}/{config.maxCapacity}
                  </Badge>
                </CardTitle>
                <p className="text-xs text-muted-foreground">{config.description}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Capacity Bar */}
                <Progress value={capacityPercent} className="h-1.5" />

                {/* Memory Items */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <AnimatePresence mode="popLayout">
                    {typeMemories.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic py-4 text-center">
                        No memories yet
                      </p>
                    ) : (
                      typeMemories.map((mem) => (
                        <motion.div
                          key={mem.id}
                          initial={{ opacity: 0, scale: 0.8, y: -10 }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            boxShadow:
                              consolidationAnimation === mem.id
                                ? "0 0 20px rgba(var(--primary), 0.5)"
                                : "none",
                          }}
                          exit={{ opacity: 0, scale: 0.8, x: 20 }}
                          transition={{ duration: 0.3 }}
                          onClick={() => setSelectedMemory(mem)}
                          className={cn(
                            "p-2 rounded-md cursor-pointer transition-all text-sm",
                            config.bgColor,
                            "hover:ring-2 hover:ring-primary/30",
                            recentlyAdded.includes(mem.id) && "ring-2 ring-primary animate-pulse"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs line-clamp-2 flex-1">{mem.content}</p>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span className="text-[10px] text-muted-foreground">
                                {Math.round(mem.confidence * 100)}%
                              </span>
                              {mem.consolidated && (
                                <Archive className="w-3 h-3 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Query Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="w-4 h-4" />
            Test Memory Retrieval
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && queryMemories()}
              placeholder="Search memories (e.g., 'Python', 'debugging', 'user')"
              className="flex-1"
            />
            <Button onClick={queryMemories} disabled={!queryInput.trim()}>
              Search
            </Button>
          </div>

          {/* Retrieved Results */}
          <AnimatePresence>
            {retrievedMemories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <p className="text-sm text-muted-foreground">
                  Retrieved {retrievedMemories.length} memories:
                </p>
                {retrievedMemories.map((mem, idx) => {
                  const config = MEMORY_CONFIG[mem.type]
                  const Icon = config.icon
                  return (
                    <motion.div
                      key={mem.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={cn("p-3 rounded-md flex items-start gap-3", config.bgColor)}
                    >
                      <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", config.color)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{mem.content}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px]">
                            {config.label}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            Confidence: {Math.round(mem.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Timeline View Toggle */}
      <Card>
        <CardHeader>
          <CardTitle
            className="text-base flex items-center justify-between cursor-pointer"
            onClick={() => setShowTimeline(!showTimeline)}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Memory Timeline
            </div>
            <ChevronRight
              className={cn("w-4 h-4 transition-transform", showTimeline && "rotate-90")}
            />
          </CardTitle>
        </CardHeader>
        <AnimatePresence>
          {showTimeline && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <CardContent className="space-y-3 max-h-64 overflow-y-auto">
                {conversationHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic text-center py-4">
                    Run the simulation to see conversation history
                  </p>
                ) : (
                  conversationHistory.map((event, idx) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-l-2 border-primary/30 pl-4 py-2"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px]">
                          Conv #{idx + 1}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          +{event.extractedMemories.length} memories
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        <span className="font-medium">User:</span> {event.userMessage}
                      </p>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Memory Detail Modal */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedMemory(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border rounded-lg p-6 max-w-md w-full shadow-xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Memory Details</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMemory(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-xs text-muted-foreground">Type</span>
                  <Badge className="ml-2">{MEMORY_CONFIG[selectedMemory.type].label}</Badge>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Content</span>
                  <p className="text-sm bg-muted p-2 rounded">{selectedMemory.content}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block">Confidence</span>
                    <span className="font-mono">
                      {Math.round(selectedMemory.confidence * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Access Count</span>
                    <span className="font-mono">{selectedMemory.accessCount}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Consolidated</span>
                    <span>{selectedMemory.consolidated ? "Yes" : "No"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Decay Rate</span>
                    <span className="font-mono">{selectedMemory.decayRate}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
