"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, MessageSquare, CheckCircle2, XCircle, RotateCcw } from "lucide-react"

interface ReasoningStep {
  id: number
  type: "thought" | "action" | "result"
  content: string
  status: "pending" | "active" | "success" | "error"
}

const exampleSteps: ReasoningStep[] = [
  {
    id: 1,
    type: "thought",
    content: "Let me break down this problem: 347 × 89",
    status: "pending"
  },
  {
    id: 2,
    type: "thought",
    content: "I'll use the distributive property: 347 × (90 - 1)",
    status: "pending"
  },
  {
    id: 3,
    type: "action",
    content: "Calculate: 347 × 90 = 31,230",
    status: "pending"
  },
  {
    id: 4,
    type: "action",
    content: "Calculate: 347 × 1 = 347",
    status: "pending"
  },
  {
    id: 5,
    type: "thought",
    content: "Now subtract: 31,230 - 347",
    status: "pending"
  },
  {
    id: 6,
    type: "result",
    content: "Final answer: 30,883",
    status: "pending"
  }
]

export function ReasoningProcess() {
  const [steps, setSteps] = useState<ReasoningStep[]>(exampleSteps)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (isPlaying && currentStep < steps.length) {
      const timer = setTimeout(() => {
        setSteps(prev => prev.map((step, idx) => {
          if (idx === currentStep) {
            return { ...step, status: "success" }
          }
          if (idx === currentStep + 1) {
            return { ...step, status: "active" }
          }
          return step
        }))
        setCurrentStep(prev => prev + 1)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [isPlaying, currentStep, steps.length])

  useEffect(() => {
    if (currentStep >= steps.length && isPlaying) {
      // Use a microtask to avoid setState in effect
      Promise.resolve().then(() => setIsPlaying(false))
    }
  }, [currentStep, steps.length, isPlaying])

  const handleReset = () => {
    setSteps(exampleSteps)
    setCurrentStep(0)
    setIsPlaying(false)
  }

  const handlePlay = () => {
    if (currentStep >= steps.length) {
      handleReset()
    }
    setIsPlaying(true)
  }

  const getStepIcon = (type: string, status: string) => {
    if (status === "success") return <CheckCircle2 className="w-4 h-4 text-green-500" />
    if (status === "error") return <XCircle className="w-4 h-4 text-red-500" />
    if (status === "active") {
      if (type === "thought") return <Brain className="w-4 h-4 text-purple-500 animate-pulse" />
      return <MessageSquare className="w-4 h-4 text-blue-500 animate-pulse" />
    }
    return <div className="w-4 h-4 rounded-full border-2 border-muted" />
  }

  const getStepColor = (type: string, status: string) => {
    if (status === "success") return "border-green-500/20 bg-green-500/5"
    if (status === "error") return "border-red-500/20 bg-red-500/5"
    if (status === "active") {
      if (type === "thought") return "border-purple-500/20 bg-purple-500/5"
      return "border-blue-500/20 bg-blue-500/5"
    }
    return "border-border bg-card/30"
  }

  return (
    <div className="my-8 p-6 rounded-xl border border-border bg-card/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Extended Thinking Process
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlay}
            disabled={isPlaying}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          >
            {currentStep >= steps.length ? "Replay" : isPlaying ? "Playing..." : "Play"}
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-mono">{currentStep} / {steps.length} steps</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3 relative">
        {/* Connecting Line */}
        <div className="absolute left-[11px] top-6 bottom-6 w-0.5 bg-border" />

        <AnimatePresence mode="popLayout">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className={`relative pl-8 p-4 rounded-lg border transition-all ${getStepColor(step.type, step.status)}`}
            >
              {/* Icon */}
              <div className="absolute left-2 top-4 z-10 bg-card rounded-full">
                {getStepIcon(step.type, step.status)}
              </div>

              {/* Content */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase">
                      {step.type}
                    </span>
                    {step.status === "active" && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                      >
                        Processing...
                      </motion.span>
                    )}
                  </div>
                  <p className="text-sm">{step.content}</p>
                </div>

                {/* Token Count */}
                <div className="text-xs text-muted-foreground font-mono">
                  ~{Math.ceil(step.content.length / 4)} tokens
                </div>
              </div>

              {/* Pulse Effect for Active Step */}
              {step.status === "active" && (
                <motion.div
                  className="absolute inset-0 rounded-lg border-2 border-primary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Summary */}
      {currentStep >= steps.length && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-green-500 mb-1">Reasoning Complete</h4>
              <p className="text-sm text-muted-foreground">
                Generated {steps.reduce((sum, s) => sum + Math.ceil(s.content.length / 4), 0)} tokens
                across {steps.length} reasoning steps. This extended thinking process ensures accuracy
                for complex problems.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
        <p>
          <strong>How it works:</strong> Reasoning models generate internal &quot;thinking&quot; steps before
          producing a final answer. This allows them to break down complex problems, verify their work,
          and correct mistakes—similar to how humans solve difficult problems.
        </p>
      </div>
    </div>
  )
}

// Simpler inline reasoning step display
interface ReasoningStepProps {
  type: "thought" | "action" | "result"
  content: string
}

export function ReasoningStep({ type, content }: ReasoningStepProps) {
  const icons = {
    thought: Brain,
    action: MessageSquare,
    result: CheckCircle2
  }

  const colors = {
    thought: "text-purple-500 bg-purple-500/10",
    action: "text-blue-500 bg-blue-500/10",
    result: "text-green-500 bg-green-500/10"
  }

  const Icon = icons[type]

  return (
    <div className="my-3 flex items-start gap-3 p-3 rounded-lg border border-border bg-card/30">
      <div className={`p-2 rounded-lg ${colors[type]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <div className="text-xs font-medium text-muted-foreground uppercase mb-1">
          {type}
        </div>
        <p className="text-sm">{content}</p>
      </div>
    </div>
  )
}
