"use client"

import React, { useState } from "react"
import { RefreshCw, AlertTriangle, DollarSign, FileText, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface AutonomousLoopProps {
  title: string
  description: string
  endCondition: string
  maxIterations: number
  estimatedCostPerIteration?: string
  dangerZones?: string[]
  safeUseCases?: string[]
}

export function AutonomousLoop({
  title,
  description,
  endCondition,
  maxIterations,
  estimatedCostPerIteration,
  dangerZones,
  safeUseCases
}: AutonomousLoopProps) {
  const [iteration, setIteration] = useState(0)
  const [running, setRunning] = useState(false)

  const simulateLoop = () => {
    if (running) return
    setRunning(true)
    setIteration(0)
    
    const interval = setInterval(() => {
      setIteration(prev => {
        if (prev >= maxIterations - 1) {
          clearInterval(interval)
          setRunning(false)
          return maxIterations
        }
        return prev + 1
      })
    }, 500)
  }

  return (
    <div className="my-8 p-6 border border-indigo-500/20 bg-indigo-500/5 rounded-xl">
      <div className="flex items-start gap-4 mb-5">
        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          <RefreshCw className={`w-6 h-6 text-indigo-400 ${running ? 'animate-spin' : ''}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs text-indigo-400 border-indigo-500/30">
              Autonomous Loop Pattern
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Eventual Consistency
            </Badge>
          </div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-6">{description}</p>

      <div className="space-y-4">
        {/* Loop Visualization */}
        <div className="p-4 rounded-lg bg-background/50 border border-border/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Loop Progress
            </span>
            <span className="text-sm font-mono text-indigo-400">
              {iteration} / {maxIterations} iterations
            </span>
          </div>
          <Progress value={(iteration / maxIterations) * 100} className="h-2 mb-3" />
          
          <div className="flex items-center justify-between">
            <button
              onClick={simulateLoop}
              disabled={running}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 disabled:opacity-50 transition-colors"
            >
              {running ? "Running..." : "Simulate Loop"}
            </button>
            
            {estimatedCostPerIteration && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <DollarSign className="w-3 h-3" />
                ~{estimatedCostPerIteration}/iteration
              </div>
            )}
          </div>
        </div>

        {/* End Condition */}
        <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-green-400 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3" />
            End Condition (Define &quot;Done&quot;)
          </h4>
          <p className="text-sm text-muted-foreground font-mono">{endCondition}</p>
        </div>

        {/* Danger Zones */}
        {dangerZones && dangerZones.length > 0 && (
          <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-3 h-3" />
              Danger Zones - Never Use For
            </h4>
            <ul className="space-y-2">
              {dangerZones.map((zone, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-red-400">⚠</span>
                  {zone}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Safe Use Cases */}
        {safeUseCases && safeUseCases.length > 0 && (
          <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
              <FileText className="w-3 h-3" />
              Safe Use Cases
            </h4>
            <ul className="space-y-2">
              {safeUseCases.map((useCase, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  {useCase}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
