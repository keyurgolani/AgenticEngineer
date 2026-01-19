"use client"

import React, { useState } from "react"
import { Brain, GitBranch, Layers, Minimize2, ChevronDown, ChevronUp, Sparkles, Gamepad2, Focus, ArrowRightLeft, Shield, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type AnalogyType = "svm" | "ensemble" | "neural" | "pca" | "rl" | "attention" | "transfer" | "regularization" | "optimization"

interface MLAnalogyProps {
  type: AnalogyType
  title: string
  mlConcept: string
  agenticParallel: string
  keyInsight: string
  codeExample?: string
}

const iconMap = {
  svm: Brain,
  ensemble: GitBranch,
  neural: Layers,
  pca: Minimize2,
  rl: Gamepad2,
  attention: Focus,
  transfer: ArrowRightLeft,
  regularization: Shield,
  optimization: TrendingUp
}

const colorMap = {
  svm: { border: "border-violet-500/20", bg: "bg-violet-500/5", text: "text-violet-400", badge: "border-violet-500/30" },
  ensemble: { border: "border-amber-500/20", bg: "bg-amber-500/5", text: "text-amber-400", badge: "border-amber-500/30" },
  neural: { border: "border-rose-500/20", bg: "bg-rose-500/5", text: "text-rose-400", badge: "border-rose-500/30" },
  pca: { border: "border-teal-500/20", bg: "bg-teal-500/5", text: "text-teal-400", badge: "border-teal-500/30" },
  rl: { border: "border-green-500/20", bg: "bg-green-500/5", text: "text-green-400", badge: "border-green-500/30" },
  attention: { border: "border-blue-500/20", bg: "bg-blue-500/5", text: "text-blue-400", badge: "border-blue-500/30" },
  transfer: { border: "border-orange-500/20", bg: "bg-orange-500/5", text: "text-orange-400", badge: "border-orange-500/30" },
  regularization: { border: "border-cyan-500/20", bg: "bg-cyan-500/5", text: "text-cyan-400", badge: "border-cyan-500/30" },
  optimization: { border: "border-pink-500/20", bg: "bg-pink-500/5", text: "text-pink-400", badge: "border-pink-500/30" }
}

const labelMap = {
  svm: "Feature Engineering",
  ensemble: "Ensemble Methods",
  neural: "Deep Learning",
  pca: "Dimensionality Reduction",
  rl: "Reinforcement Learning",
  attention: "Attention Mechanisms",
  transfer: "Transfer Learning",
  regularization: "Regularization",
  optimization: "Optimization"
}

export function MLAnalogy({ type, title, mlConcept, agenticParallel, keyInsight, codeExample }: MLAnalogyProps) {
  const [showCode, setShowCode] = useState(false)
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
            <Badge variant="outline" className={`text-xs ${colors.text} ${colors.badge}`}>
              ML Analogy
            </Badge>
            <Badge variant="outline" className={`text-xs text-muted-foreground border-border`}>
              {labelMap[type]}
            </Badge>
          </div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-background/50 border border-border/50">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Classical ML Concept
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{mlConcept}</p>
          </div>
          
          <div className="p-4 rounded-lg bg-background/50 border border-border/50">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Agentic Parallel
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{agenticParallel}</p>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${colors.bg} border ${colors.border}`}>
          <h4 className={`text-xs font-semibold uppercase tracking-wider ${colors.text} mb-2 flex items-center gap-2`}>
            <Sparkles className="w-3 h-3" />
            Key Insight for Senior Engineers
          </h4>
          <p className="text-sm text-foreground leading-relaxed">{keyInsight}</p>
        </div>

        {codeExample && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCode(!showCode)}
              className={`${colors.text} hover:${colors.bg} p-0 h-auto`}
            >
              {showCode ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
              {showCode ? "Hide" : "Show"} Code Example
            </Button>
            
            {showCode && (
              <pre className="p-4 rounded-lg bg-[#0d1117] border border-zinc-800 overflow-x-auto">
                <code className="text-sm text-zinc-300 font-mono">{codeExample}</code>
              </pre>
            )}
          </>
        )}
      </div>
    </div>
  )
}
