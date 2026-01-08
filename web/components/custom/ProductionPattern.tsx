"use client"

import React, { useState } from "react"
import { Shield, Flag, DollarSign, Gauge, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type PatternType = "secrets" | "feature-flags" | "billing" | "performance"

interface ProductionPatternProps {
  type: PatternType
  title: string
  problem: string
  solution: string
  implementation: string
  antiPatterns?: string[]
  bestPractices?: string[]
}

const iconMap = {
  secrets: Shield,
  "feature-flags": Flag,
  billing: DollarSign,
  performance: Gauge
}

const colorMap = {
  secrets: { border: "border-red-500/20", bg: "bg-red-500/5", text: "text-red-400" },
  "feature-flags": { border: "border-blue-500/20", bg: "bg-blue-500/5", text: "text-blue-400" },
  billing: { border: "border-green-500/20", bg: "bg-green-500/5", text: "text-green-400" },
  performance: { border: "border-yellow-500/20", bg: "bg-yellow-500/5", text: "text-yellow-400" }
}

const labelMap = {
  secrets: "Security",
  "feature-flags": "Deployment",
  billing: "Monetization",
  performance: "Optimization"
}

export function ProductionPattern({ 
  type, 
  title, 
  problem, 
  solution, 
  implementation,
  antiPatterns,
  bestPractices 
}: ProductionPatternProps) {
  const [expanded, setExpanded] = useState(false)
  const Icon = iconMap[type]
  const colors = colorMap[type]

  return (
    <div className={`my-8 p-6 border ${colors.border} ${colors.bg} rounded-xl`}>
      <div className="flex items-start gap-4 mb-5">
        <div className={`p-3 rounded-xl ${colors.bg} border ${colors.border}`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={`text-xs ${colors.text}`}>
              Production Pattern
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {labelMap[type]}
            </Badge>
          </div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-2">
            ⚠️ The Problem
          </h4>
          <p className="text-sm text-muted-foreground">{problem}</p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
            ✅ The Solution
          </h4>
          <p className="text-sm text-muted-foreground">{solution}</p>
        </div>

        <div className="p-4 rounded-lg bg-background/50 border border-border/50">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            🔧 Implementation
          </h4>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{implementation}</p>
        </div>

        {(antiPatterns || bestPractices) && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className={`${colors.text} p-0 h-auto`}
            >
              {expanded ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
              {expanded ? "Hide" : "Show"} Patterns & Anti-Patterns
            </Button>

            {expanded && (
              <div className="grid md:grid-cols-2 gap-4">
                {antiPatterns && (
                  <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3" />
                      Anti-Patterns
                    </h4>
                    <ul className="space-y-2">
                      {antiPatterns.map((item, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-red-400">✗</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {bestPractices && (
                  <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-green-400 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3" />
                      Best Practices
                    </h4>
                    <ul className="space-y-2">
                      {bestPractices.map((item, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-green-400">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
