"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brain,
  Zap,
  Clock,
  Database,
  Cog,
  ChevronRight,
  Lightbulb,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type MemoryType = "working" | "episodic" | "semantic" | "procedural"

interface MemoryTypeInfo {
  label: string
  icon: typeof Brain
  color: string
  bgColor: string
  borderColor: string
  description: string
  humanAnalogy: string
  agentUseCase: string
  duration: string
  capacity: string
  examples: string[]
  scenario: {
    title: string
    steps: string[]
  }
}

const MEMORY_TYPES: Record<MemoryType, MemoryTypeInfo> = {
  working: {
    label: "Working Memory",
    icon: Zap,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/30",
    description: "Short-term, active memory for current task context",
    humanAnalogy: "Like holding a phone number in your head while dialing",
    agentUseCase: "Tracks current conversation context, active goals, and immediate task state",
    duration: "Seconds to minutes",
    capacity: "Limited (5-9 items)",
    examples: [
      "Current user query being processed",
      "Active tool call parameters",
      "Intermediate calculation results",
      "Recent conversation turns",
    ],
    scenario: {
      title: "Debugging Session",
      steps: [
        "User asks: 'Why is my function returning null?'",
        "Working memory holds: current function name, error context",
        "Agent retrieves code, stores relevant lines in working memory",
        "Analyzes and responds, then clears working memory for next task",
      ],
    },
  },
  episodic: {
    label: "Episodic Memory",
    icon: Clock,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    description: "Records of specific past experiences and interactions",
    humanAnalogy: "Like remembering your first day at a new job",
    agentUseCase: "Stores conversation history, past problem-solving sessions, user interactions",
    duration: "Hours to permanent",
    capacity: "Large but decays over time",
    examples: [
      "Previous debugging sessions with this user",
      "Past project discussions",
      "Error patterns encountered before",
      "Successful solution approaches used",
    ],
    scenario: {
      title: "Recurring Issue",
      steps: [
        "User reports: 'My API is timing out again'",
        "Agent recalls: 'Last week, similar issue was rate limiting'",
        "Retrieves episodic memory of previous solution",
        "Suggests: 'Last time this was rate limiting. Should we check that first?'",
      ],
    },
  },
  semantic: {
    label: "Semantic Memory",
    icon: Database,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    description: "General knowledge and facts about the world",
    humanAnalogy: "Like knowing that Paris is the capital of France",
    agentUseCase: "Stores user preferences, project facts, domain knowledge, learned patterns",
    duration: "Long-term to permanent",
    capacity: "Very large",
    examples: [
      "User prefers TypeScript over JavaScript",
      "Project uses PostgreSQL database",
      "Team follows trunk-based development",
      "API rate limit is 100 requests/minute",
    ],
    scenario: {
      title: "Personalized Assistance",
      steps: [
        "User asks: 'Help me write a database query'",
        "Agent retrieves semantic memory: 'User's project uses PostgreSQL'",
        "Also recalls: 'User prefers CTEs over subqueries'",
        "Generates PostgreSQL query using CTE syntax automatically",
      ],
    },
  },
  procedural: {
    label: "Procedural Memory",
    icon: Cog,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    description: "Learned skills, patterns, and how to perform tasks",
    humanAnalogy: "Like knowing how to ride a bike without thinking about it",
    agentUseCase: "Stores learned workflows, debugging patterns, code generation templates",
    duration: "Permanent once consolidated",
    capacity: "Moderate, highly optimized",
    examples: [
      "When user says 'deploy', run these 5 steps",
      "For React errors, check hooks rules first",
      "Database timeouts usually mean connection pool issues",
      "Always run tests before suggesting PR merge",
    ],
    scenario: {
      title: "Automated Workflow",
      steps: [
        "User says: 'Deploy to staging'",
        "Procedural memory activates learned deployment workflow",
        "Automatically: lint → test → build → deploy → verify",
        "No need to ask for each step - pattern is internalized",
      ],
    },
  },
}

export function MemoryTypeExplorer() {
  const [selectedType, setSelectedType] = useState<MemoryType>("working")
  const [showScenario, setShowScenario] = useState(false)
  const [scenarioStep, setScenarioStep] = useState(0)

  const currentMemory = MEMORY_TYPES[selectedType]
  const Icon = currentMemory.icon

  const runScenario = () => {
    setShowScenario(true)
    setScenarioStep(0)
    const interval = setInterval(() => {
      setScenarioStep((prev) => {
        if (prev >= currentMemory.scenario.steps.length - 1) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 1500)
  }

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Memory Type Explorer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Type Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Memory Type</label>
          <Select value={selectedType} onValueChange={(v) => {
            setSelectedType(v as MemoryType)
            setShowScenario(false)
          }}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(MEMORY_TYPES) as MemoryType[]).map((type) => {
                const info = MEMORY_TYPES[type]
                const TypeIcon = info.icon
                return (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center gap-2">
                      <TypeIcon className={cn("h-4 w-4", info.color)} />
                      {info.label}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Memory Type Cards - Quick Reference */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(Object.keys(MEMORY_TYPES) as MemoryType[]).map((type) => {
            const info = MEMORY_TYPES[type]
            const TypeIcon = info.icon
            const isSelected = type === selectedType
            return (
              <button
                key={type}
                onClick={() => {
                  setSelectedType(type)
                  setShowScenario(false)
                }}
                className={cn(
                  "p-3 rounded-lg border transition-all text-left",
                  isSelected
                    ? cn(info.bgColor, info.borderColor, "ring-2 ring-primary/30")
                    : "hover:bg-muted/50"
                )}
              >
                <TypeIcon className={cn("h-5 w-5 mb-1", info.color)} />
                <div className="text-xs font-medium">{info.label}</div>
              </button>
            )
          })}
        </div>

        {/* Detailed View */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedType}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Header */}
            <div className={cn("p-4 rounded-lg", currentMemory.bgColor, currentMemory.borderColor, "border")}>
              <div className="flex items-center gap-3 mb-2">
                <Icon className={cn("h-6 w-6", currentMemory.color)} />
                <h3 className="text-lg font-semibold">{currentMemory.label}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{currentMemory.description}</p>
            </div>

            {/* Properties Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground mb-1">Human Analogy</div>
                  <p className="text-sm">{currentMemory.humanAnalogy}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground mb-1">Agent Use Case</div>
                  <p className="text-sm">{currentMemory.agentUseCase}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1 p-3 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground mb-1">Duration</div>
                    <p className="text-sm font-medium">{currentMemory.duration}</p>
                  </div>
                  <div className="flex-1 p-3 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground mb-1">Capacity</div>
                    <p className="text-sm font-medium">{currentMemory.capacity}</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground mb-2">Examples</div>
                  <ul className="space-y-1">
                    {currentMemory.examples.map((ex, i) => (
                      <li key={i} className="text-xs flex items-start gap-2">
                        <ChevronRight className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
                        {ex}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Interactive Scenario */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Try It: {currentMemory.scenario.title}</span>
                </div>
                <Button size="sm" onClick={runScenario} variant="outline">
                  {showScenario ? "Restart" : "Run Scenario"}
                </Button>
              </div>

              <div className="space-y-2 min-h-[120px]">
                {showScenario ? (
                  currentMemory.scenario.steps.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: i <= scenarioStep ? 1 : 0.3, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={cn(
                        "flex items-start gap-2 p-2 rounded text-sm",
                        i <= scenarioStep ? currentMemory.bgColor : "bg-muted/30"
                      )}
                    >
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {i + 1}
                      </Badge>
                      <span>{step}</span>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Click &quot;Run Scenario&quot; to see how {currentMemory.label.toLowerCase()} works in action
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
