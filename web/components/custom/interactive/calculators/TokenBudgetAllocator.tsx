"use client"

import { useState, useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Sliders, AlertTriangle, Check, Download, RotateCcw } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const CONTEXT_WINDOWS = {
  "32K": 32000,
  "128K": 128000,
  "200K": 200000,
  "1M": 1000000,
} as const

type ContextWindowSize = keyof typeof CONTEXT_WINDOWS

interface BudgetCategory {
  id: string
  name: string
  color: string
  description: string
}

const CATEGORIES: BudgetCategory[] = [
  { id: "system", name: "System Prompt", color: "#8b5cf6", description: "Instructions and persona" },
  { id: "user", name: "User Query", color: "#3b82f6", description: "Current user input" },
  { id: "context", name: "Retrieved Context", color: "#10b981", description: "RAG/knowledge base results" },
  { id: "history", name: "Conversation History", color: "#f59e0b", description: "Previous messages" },
  { id: "output", name: "Output Buffer", color: "#ef4444", description: "Reserved for response" },
]

interface Preset {
  name: string
  allocations: Record<string, number>
}

const PRESETS: Record<string, Preset> = {
  balanced: {
    name: "Balanced",
    allocations: { system: 5, user: 5, context: 50, history: 25, output: 15 },
  },
  ragHeavy: {
    name: "RAG-Heavy",
    allocations: { system: 3, user: 2, context: 70, history: 10, output: 15 },
  },
  chatHeavy: {
    name: "Chat-Heavy",
    allocations: { system: 5, user: 5, context: 20, history: 55, output: 15 },
  },
  agentMode: {
    name: "Agent Mode",
    allocations: { system: 10, user: 5, context: 40, history: 20, output: 25 },
  },
}

function formatTokens(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`
  } else if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`
  }
  return tokens.toString()
}

export function TokenBudgetAllocator() {
  const [contextWindow, setContextWindow] = useState<ContextWindowSize>("128K")
  const [allocations, setAllocations] = useState<Record<string, number>>(
    PRESETS.balanced.allocations
  )

  const totalTokens = CONTEXT_WINDOWS[contextWindow]
  const totalPercentage = useMemo(
    () => Object.values(allocations).reduce((sum, val) => sum + val, 0),
    [allocations]
  )

  const isOverAllocated = totalPercentage > 100
  const isUnderAllocated = totalPercentage < 100

  const chartData = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      name: cat.name,
      value: allocations[cat.id] || 0,
      tokens: Math.round((totalTokens * (allocations[cat.id] || 0)) / 100),
      color: cat.color,
    }))
  }, [allocations, totalTokens])

  const handleAllocationChange = (categoryId: string, value: number[]) => {
    setAllocations((prev) => ({
      ...prev,
      [categoryId]: value[0],
    }))
  }

  const applyPreset = (presetKey: string) => {
    setAllocations(PRESETS[presetKey].allocations)
  }

  const exportConfig = () => {
    const config = {
      contextWindow,
      totalTokens,
      allocations: CATEGORIES.map((cat) => ({
        category: cat.name,
        percentage: allocations[cat.id],
        tokens: Math.round((totalTokens * allocations[cat.id]) / 100),
      })),
    }
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "token-budget-config.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-primary" />
          Token Budget Allocator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls Row */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-1.5">
            <Label>Context Window</Label>
            <Select
              value={contextWindow}
              onValueChange={(v) => setContextWindow(v as ContextWindowSize)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(CONTEXT_WINDOWS).map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Presets</Label>
            <div className="flex gap-2">
              {Object.entries(PRESETS).map(([key, preset]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(key)}
                  className="text-xs"
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Sliders */}
          <div className="space-y-4">
            {CATEGORIES.map((category) => (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <Label className="text-sm font-medium">{category.name}</Label>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-medium">
                      {allocations[category.id]}%
                    </span>
                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                      ({formatTokens(Math.round((totalTokens * allocations[category.id]) / 100))})
                    </span>
                  </div>
                </div>
                <Slider
                  value={[allocations[category.id]]}
                  onValueChange={(v) => handleAllocationChange(category.id, v)}
                  max={100}
                  step={1}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">{category.description}</p>
              </div>
            ))}

            {/* Total & Status */}
            <div
              className={cn(
                "mt-4 flex items-center justify-between rounded-lg border p-3",
                isOverAllocated && "border-destructive bg-destructive/10",
                isUnderAllocated && "border-amber-500 bg-amber-500/10",
                !isOverAllocated && !isUnderAllocated && "border-green-500 bg-green-500/10"
              )}
            >
              <div className="flex items-center gap-2">
                {isOverAllocated ? (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                ) : isUnderAllocated ? (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                ) : (
                  <Check className="h-4 w-4 text-green-500" />
                )}
                <span className="text-sm font-medium">
                  {isOverAllocated
                    ? "Over-allocated!"
                    : isUnderAllocated
                      ? "Under-allocated"
                      : "Perfectly allocated"}
                </span>
              </div>
              <span
                className={cn(
                  "font-mono text-lg font-bold",
                  isOverAllocated && "text-destructive",
                  isUnderAllocated && "text-amber-500",
                  !isOverAllocated && !isUnderAllocated && "text-green-500"
                )}
              >
                {totalPercentage}%
              </span>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ value }) => (value > 5 ? `${value}%` : "")}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    `${Number(value)}% (${formatTokens((props as { payload: { tokens: number } }).payload.tokens)} tokens)`,
                    String(name),
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            {/* Summary */}
            <div className="mt-2 text-center">
              <p className="text-sm text-muted-foreground">
                Total: <span className="font-mono font-medium">{formatTokens(totalTokens)}</span> tokens
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyPreset("balanced")}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={exportConfig}>
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
