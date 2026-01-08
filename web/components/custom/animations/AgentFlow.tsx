"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, RotateCcw, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ReAct Loop Visualization
interface ReActStep {
  type: "thought" | "action" | "observation" | "answer"
  content: string
}

interface ReActLoopProps {
  steps: ReActStep[]
  autoPlay?: boolean
  speed?: number
}

export function ReActLoop({ steps, autoPlay = false, speed = 2000 }: ReActLoopProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)

  useEffect(() => {
    if (!isPlaying) return

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, speed)

    return () => clearInterval(timer)
  }, [isPlaying, steps.length, speed])

  const stepStyles = {
    thought: {
      bg: "bg-blue-500/10 border-blue-500/30",
      icon: "🧠",
      label: "Thought",
      color: "text-blue-400"
    },
    action: {
      bg: "bg-amber-500/10 border-amber-500/30",
      icon: "⚡",
      label: "Action",
      color: "text-amber-400"
    },
    observation: {
      bg: "bg-green-500/10 border-green-500/30",
      icon: "👁️",
      label: "Observation",
      color: "text-green-400"
    },
    answer: {
      bg: "bg-purple-500/10 border-purple-500/30",
      icon: "✅",
      label: "Final Answer",
      color: "text-purple-400"
    }
  }

  return (
    <div className="my-8 p-6 rounded-xl border border-border bg-card/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold flex items-center gap-2">
          <span className="text-xl">🔄</span>
          ReAct Loop Visualization
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentStep(0)
              setIsPlaying(false)
            }}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex gap-1 mb-6">
        {steps.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i <= currentStep ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Steps display */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {steps.slice(0, currentStep + 1).map((step, i) => {
            const style = stepStyles[step.type]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "p-4 rounded-lg border",
                  style.bg,
                  i === currentStep && "ring-2 ring-primary/50"
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{style.icon}</span>
                  <div className="flex-1">
                    <span className={cn("text-xs font-semibold uppercase tracking-wider", style.color)}>
                      {style.label}
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">{step.content}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Step controls */}
      <div className="flex justify-center gap-2 mt-6">
        <Button
          variant="ghost"
          size="sm"
          disabled={currentStep === 0}
          onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground py-2">
          Step {currentStep + 1} of {steps.length}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={currentStep >= steps.length - 1}
          onClick={() => setCurrentStep((p) => Math.min(steps.length - 1, p + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

// Tool Execution Timeline
interface ToolCall {
  tool: string
  input: string
  output: string
  duration?: string
  status: "success" | "error" | "pending"
}

interface ToolTimelineProps {
  calls: ToolCall[]
}

export function ToolTimeline({ calls }: ToolTimelineProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const statusStyles = {
    success: "bg-green-500",
    error: "bg-red-500",
    pending: "bg-amber-500 animate-pulse"
  }

  return (
    <div className="my-8 p-6 rounded-xl border border-border bg-card/50">
      <h3 className="font-semibold mb-6 flex items-center gap-2">
        <span className="text-xl">🔧</span>
        Tool Execution Timeline
      </h3>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-4">
          {calls.map((call, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-10"
            >
              {/* Timeline dot */}
              <div className={cn(
                "absolute left-2.5 top-3 w-3 h-3 rounded-full border-2 border-background",
                statusStyles[call.status]
              )} />

              <div
                className={cn(
                  "p-4 rounded-lg border bg-card cursor-pointer transition-colors",
                  expandedIndex === i ? "border-primary" : "border-border hover:border-primary/50"
                )}
                onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-primary">{call.tool}</span>
                    {call.duration && (
                      <span className="text-xs text-muted-foreground">({call.duration})</span>
                    )}
                  </div>
                  <ChevronRight className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform",
                    expandedIndex === i && "rotate-90"
                  )} />
                </div>

                <AnimatePresence>
                  {expandedIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 pt-3 border-t border-border space-y-3">
                        <div>
                          <span className="text-xs text-muted-foreground uppercase">Input</span>
                          <pre className="mt-1 p-2 rounded bg-muted text-xs overflow-x-auto">
                            {call.input}
                          </pre>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground uppercase">Output</span>
                          <pre className={cn(
                            "mt-1 p-2 rounded text-xs overflow-x-auto",
                            call.status === "error" ? "bg-red-500/10 text-red-400" : "bg-muted"
                          )}>
                            {call.output}
                          </pre>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Multi-Agent Communication Visualization
interface AgentMessage {
  from: string
  to: string
  message: string
  type: "request" | "response" | "broadcast"
}

interface MultiAgentFlowProps {
  agents: string[]
  messages: AgentMessage[]
}

export function MultiAgentFlow({ agents, messages }: MultiAgentFlowProps) {
  const [visibleMessages, setVisibleMessages] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (!isPlaying) return

    const timer = setInterval(() => {
      setVisibleMessages((prev) => {
        if (prev >= messages.length) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 1500)

    return () => clearInterval(timer)
  }, [isPlaying, messages.length])

  const agentColors: Record<string, string> = {}
  const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-amber-500", "bg-pink-500"]
  agents.forEach((agent, i) => {
    agentColors[agent] = colors[i % colors.length]
  })

  return (
    <div className="my-8 p-6 rounded-xl border border-border bg-card/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold flex items-center gap-2">
          <span className="text-xl">🤖</span>
          Multi-Agent Communication
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setVisibleMessages(0)
              setIsPlaying(false)
            }}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Agent headers */}
      <div className="flex justify-around mb-6">
        {agents.map((agent) => (
          <div key={agent} className="text-center">
            <div className={cn(
              "w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold",
              agentColors[agent]
            )}>
              {agent[0]}
            </div>
            <span className="text-sm font-medium">{agent}</span>
          </div>
        ))}
      </div>

      {/* Messages */}
      <div className="space-y-3 min-h-[200px]">
        <AnimatePresence>
          {messages.slice(0, visibleMessages).map((msg, i) => {
            const fromIndex = agents.indexOf(msg.from)
            const toIndex = agents.indexOf(msg.to)
            const isLeftToRight = fromIndex < toIndex

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex items-center gap-2",
                  isLeftToRight ? "flex-row" : "flex-row-reverse"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold",
                  agentColors[msg.from]
                )}>
                  {msg.from[0]}
                </div>
                <div className={cn(
                  "flex-1 p-3 rounded-lg text-sm",
                  msg.type === "request" && "bg-blue-500/10 border border-blue-500/20",
                  msg.type === "response" && "bg-green-500/10 border border-green-500/20",
                  msg.type === "broadcast" && "bg-purple-500/10 border border-purple-500/20"
                )}>
                  <span className="text-xs text-muted-foreground">
                    {msg.from} → {msg.to}
                  </span>
                  <p className="mt-1">{msg.message}</p>
                </div>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold",
                  agentColors[msg.to]
                )}>
                  {msg.to[0]}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
