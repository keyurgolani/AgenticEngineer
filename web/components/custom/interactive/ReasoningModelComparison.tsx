"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Brain, Zap, DollarSign, Clock, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface ModelMetrics {
  name: string
  provider: string
  thinkingTokens: number
  latency: number // seconds
  costMultiplier: number // vs standard model
  accuracy: number // percentage
  color: string
}

const models: ModelMetrics[] = [
  {
    name: "o3-mini",
    provider: "OpenAI",
    thinkingTokens: 5000,
    latency: 8,
    costMultiplier: 15,
    accuracy: 92,
    color: "from-blue-500 to-cyan-500"
  },
  {
    name: "DeepSeek-R1",
    provider: "DeepSeek",
    thinkingTokens: 12000,
    latency: 15,
    costMultiplier: 8,
    accuracy: 90,
    color: "from-purple-500 to-pink-500"
  },
  {
    name: "Qwen3-Thinking",
    provider: "Alibaba",
    thinkingTokens: 8000,
    latency: 10,
    costMultiplier: 6,
    accuracy: 88,
    color: "from-orange-500 to-red-500"
  },
  {
    name: "GPT-4o (Standard)",
    provider: "OpenAI",
    thinkingTokens: 0,
    latency: 2,
    costMultiplier: 1,
    accuracy: 75,
    color: "from-gray-500 to-gray-600"
  }
]

export function ReasoningModelComparison() {
  const [selectedMetric, setSelectedMetric] = useLocalStorage<"thinking" | "latency" | "cost" | "accuracy">("reasoning-model-metric-preference", "accuracy")
  const [hoveredModel, setHoveredModel] = useState<string | null>(null)

  const getMetricValue = (model: ModelMetrics) => {
    switch (selectedMetric) {
      case "thinking": return model.thinkingTokens
      case "latency": return model.latency
      case "cost": return model.costMultiplier
      case "accuracy": return model.accuracy
    }
  }

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case "thinking": return "Thinking Tokens"
      case "latency": return "Latency (seconds)"
      case "cost": return "Cost Multiplier"
      case "accuracy": return "Accuracy (%)"
    }
  }

  const maxValue = Math.max(...models.map(getMetricValue))

  return (
    <div className="my-8 p-6 rounded-xl border border-border bg-card/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Reasoning Model Comparison
        </h3>
      </div>

      {/* Metric Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "accuracy", label: "Accuracy", icon: CheckCircle2 },
          { key: "thinking", label: "Thinking Tokens", icon: Brain },
          { key: "latency", label: "Latency", icon: Clock },
          { key: "cost", label: "Cost", icon: DollarSign }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSelectedMetric(key as typeof selectedMetric)}
            aria-pressed={selectedMetric === key}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              selectedMetric === key
                ? "bg-primary text-primary-foreground shadow-lg"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="space-y-4">
        {models.map((model, index) => {
          const value = getMetricValue(model)
          const percentage = (value / maxValue) * 100
          const isHovered = hoveredModel === model.name

          return (
            <motion.div
              key={model.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setHoveredModel(model.name)}
              onMouseLeave={() => setHoveredModel(null)}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{model.name}</span>
                  <span className="text-xs text-muted-foreground">{model.provider}</span>
                </div>
                <span className="font-mono font-bold">
                  {value.toLocaleString()}
                  {selectedMetric === "accuracy" && "%"}
                  {selectedMetric === "latency" && "s"}
                  {selectedMetric === "cost" && "x"}
                </span>
              </div>
              
              <div className="relative h-12 bg-muted rounded-lg overflow-hidden">
                <motion.div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-lg bg-gradient-to-r",
                    model.color
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
                
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center text-white font-medium text-sm backdrop-blur-sm bg-black/20"
                  >
                    {getMetricLabel()}: {value.toLocaleString()}
                    {selectedMetric === "accuracy" && "%"}
                    {selectedMetric === "latency" && "s"}
                    {selectedMetric === "cost" && "x"}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
        <p className="font-medium mb-2">Understanding the Metrics:</p>
        <ul className="space-y-1 text-xs">
          <li><strong>Thinking Tokens:</strong> Average tokens generated during internal reasoning</li>
          <li><strong>Latency:</strong> Time to first response (higher for reasoning models)</li>
          <li><strong>Cost:</strong> Multiplier vs standard GPT-4o (1x baseline)</li>
          <li><strong>Accuracy:</strong> Performance on complex reasoning benchmarks (AIME, GPQA)</li>
        </ul>
      </div>
    </div>
  )
}

// Simpler inline comparison
interface ModelComparisonCardProps {
  model1: string
  model2: string
  metric: string
  value1: string
  value2: string
  winner: 1 | 2
}

export function ModelComparisonCard({ 
  model1, 
  model2, 
  metric, 
  value1, 
  value2, 
  winner 
}: ModelComparisonCardProps) {
  return (
    <div className="my-4 p-4 rounded-lg border border-border bg-card/30">
      <div className="text-sm font-medium text-muted-foreground mb-3">{metric}</div>
      <div className="grid grid-cols-2 gap-4">
        <div className={cn(
          "p-3 rounded-lg text-center",
          winner === 1 ? "bg-green-500/10 border border-green-500/20" : "bg-muted/50"
        )}>
          <div className="text-xs text-muted-foreground mb-1">{model1}</div>
          <div className="font-mono font-bold">{value1}</div>
          {winner === 1 && <Zap className="w-4 h-4 text-green-500 mx-auto mt-1" />}
        </div>
        <div className={cn(
          "p-3 rounded-lg text-center",
          winner === 2 ? "bg-green-500/10 border border-green-500/20" : "bg-muted/50"
        )}>
          <div className="text-xs text-muted-foreground mb-1">{model2}</div>
          <div className="font-mono font-bold">{value2}</div>
          {winner === 2 && <Zap className="w-4 h-4 text-green-500 mx-auto mt-1" />}
        </div>
      </div>
    </div>
  )
}
