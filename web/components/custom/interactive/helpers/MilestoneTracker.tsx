"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle,
  Circle,
  ChevronDown,
  Clock,
  Target,
  Link2,
  Trophy,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface Milestone {
  id: string
  title: string
  description: string
  deliverables: string[]
  timeEstimate: string
  dependencies: string[]
  completed: boolean
}

const MILESTONES: Milestone[] = [
  {
    id: "m1",
    title: "Project Setup & Architecture",
    description: "Initialize the project structure, set up development environment, and define the system architecture.",
    deliverables: [
      "Project repository with monorepo structure",
      "Development environment configuration",
      "Architecture decision records (ADRs)",
      "API contract definitions",
    ],
    timeEstimate: "2-3 days",
    dependencies: [],
    completed: false,
  },
  {
    id: "m2",
    title: "Core Agent Framework",
    description: "Build the foundational agent framework with basic reasoning and tool execution capabilities.",
    deliverables: [
      "Base agent class with ReAct loop",
      "Tool registry and execution engine",
      "Basic memory interface",
      "Agent configuration system",
    ],
    timeEstimate: "3-4 days",
    dependencies: ["m1"],
    completed: false,
  },
  {
    id: "m3",
    title: "Specialized Agents",
    description: "Implement the five specialized agents: Research, Code, Analysis, Writing, and Orchestrator.",
    deliverables: [
      "Research Agent with web search",
      "Code Agent with execution sandbox",
      "Analysis Agent with data processing",
      "Writing Agent with templates",
      "Orchestrator Agent for coordination",
    ],
    timeEstimate: "5-7 days",
    dependencies: ["m2"],
    completed: false,
  },
  {
    id: "m4",
    title: "Memory & RAG Service",
    description: "Implement persistent memory and retrieval-augmented generation capabilities.",
    deliverables: [
      "Vector database integration",
      "Memory consolidation pipeline",
      "RAG retrieval service",
      "Context management system",
    ],
    timeEstimate: "3-4 days",
    dependencies: ["m2"],
    completed: false,
  },
  {
    id: "m5",
    title: "LLM Router & Prompt Library",
    description: "Build the intelligent LLM routing system and centralized prompt management.",
    deliverables: [
      "Multi-provider LLM client",
      "Cost-aware routing logic",
      "Prompt template system",
      "A/B testing framework",
    ],
    timeEstimate: "2-3 days",
    dependencies: ["m2"],
    completed: false,
  },
  {
    id: "m6",
    title: "API Gateway & Web Interface",
    description: "Create the REST API and web dashboard for interacting with the agent ecosystem.",
    deliverables: [
      "FastAPI/Express API server",
      "Authentication & rate limiting",
      "React dashboard UI",
      "Real-time updates via WebSocket",
    ],
    timeEstimate: "4-5 days",
    dependencies: ["m3", "m4", "m5"],
    completed: false,
  },
  {
    id: "m7",
    title: "Testing & Observability",
    description: "Implement comprehensive testing and monitoring infrastructure.",
    deliverables: [
      "Unit and integration tests",
      "End-to-end test scenarios",
      "Metrics and tracing setup",
      "Alerting configuration",
    ],
    timeEstimate: "3-4 days",
    dependencies: ["m6"],
    completed: false,
  },
  {
    id: "m8",
    title: "Documentation & Deployment",
    description: "Complete documentation and prepare for production deployment.",
    deliverables: [
      "API documentation",
      "User guide and tutorials",
      "Docker deployment configs",
      "CI/CD pipeline",
    ],
    timeEstimate: "2-3 days",
    dependencies: ["m7"],
    completed: false,
  },
]

export function MilestoneTracker() {
  const [milestones, setMilestones] = useState<Milestone[]>(MILESTONES)
  const [expandedId, setExpandedId] = useState<string | null>("m1")

  const completedCount = milestones.filter(m => m.completed).length
  const progress = (completedCount / milestones.length) * 100

  const toggleComplete = (id: string) => {
    setMilestones(prev => prev.map(m => 
      m.id === id ? { ...m, completed: !m.completed } : m
    ))
  }

  const canStart = (milestone: Milestone): boolean => {
    if (milestone.dependencies.length === 0) return true
    return milestone.dependencies.every(depId => 
      milestones.find(m => m.id === depId)?.completed
    )
  }

  const resetProgress = () => {
    setMilestones(MILESTONES.map(m => ({ ...m, completed: false })))
  }

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Project Milestone Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="p-4 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedCount} of {milestones.length} milestones
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              Est. total: 24-33 days
            </span>
            {completedCount === milestones.length && (
              <Badge className="gap-1 bg-green-500">
                <Trophy className="h-3 w-3" /> Complete!
              </Badge>
            )}
          </div>
        </div>

        {/* Reset Button */}
        <Button variant="outline" size="sm" onClick={resetProgress}>
          Reset Progress
        </Button>

        {/* Milestones List */}
        <div className="space-y-3">
          {milestones.map((milestone, index) => {
            const isExpanded = expandedId === milestone.id
            const canStartMilestone = canStart(milestone)
            const isBlocked = !canStartMilestone && !milestone.completed

            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "border rounded-lg overflow-hidden transition-all",
                  milestone.completed && "border-green-500/30 bg-green-500/5",
                  isBlocked && "opacity-60"
                )}
              >
                {/* Header */}
                <div
                  className="p-4 cursor-pointer flex items-center gap-3"
                  onClick={() => setExpandedId(isExpanded ? null : milestone.id)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (canStartMilestone || milestone.completed) {
                        toggleComplete(milestone.id)
                      }
                    }}
                    disabled={isBlocked}
                    className="shrink-0"
                  >
                    {milestone.completed ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <Circle className={cn(
                        "h-6 w-6",
                        canStartMilestone ? "text-primary" : "text-muted-foreground"
                      )} />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-medium",
                        milestone.completed && "line-through text-muted-foreground"
                      )}>
                        {index + 1}. {milestone.title}
                      </span>
                      {isBlocked && (
                        <Badge variant="outline" className="text-xs">Blocked</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {milestone.timeEstimate}
                      </span>
                      {milestone.dependencies.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Link2 className="h-3 w-3" />
                          {milestone.dependencies.length} dependencies
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronDown className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform",
                    isExpanded && "rotate-180"
                  )} />
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t"
                    >
                      <div className="p-4 space-y-4">
                        <p className="text-sm text-muted-foreground">
                          {milestone.description}
                        </p>

                        {/* Deliverables */}
                        <div>
                          <h4 className="text-sm font-medium mb-2">Deliverables</h4>
                          <ul className="space-y-1">
                            {milestone.deliverables.map((item, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <CheckCircle className={cn(
                                  "h-4 w-4 shrink-0 mt-0.5",
                                  milestone.completed ? "text-green-500" : "text-muted-foreground"
                                )} />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Dependencies */}
                        {milestone.dependencies.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Dependencies</h4>
                            <div className="flex flex-wrap gap-2">
                              {milestone.dependencies.map(depId => {
                                const dep = milestones.find(m => m.id === depId)
                                return (
                                  <Badge
                                    key={depId}
                                    variant={dep?.completed ? "default" : "outline"}
                                    className={cn(
                                      "text-xs",
                                      dep?.completed && "bg-green-500"
                                    )}
                                  >
                                    {dep?.title}
                                  </Badge>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
