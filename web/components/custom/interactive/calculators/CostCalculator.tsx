"use client"

import { useState, useMemo } from "react"
import { Calculator, DollarSign, TrendingUp, BarChart3 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

// Model pricing (per 1M tokens) - Updated for 2025
const MODEL_PRICING = {
  "gpt-4o": { input: 2.50, output: 10.00, provider: "OpenAI" },
  "gpt-4o-mini": { input: 0.15, output: 0.60, provider: "OpenAI" },
  "claude-4-sonnet": { input: 3.00, output: 15.00, provider: "Anthropic" },
  "claude-4-opus": { input: 15.00, output: 75.00, provider: "Anthropic" },
  "gemini-2.5-pro": { input: 1.25, output: 5.00, provider: "Google" },
  "gemini-2.5-flash": { input: 0.075, output: 0.30, provider: "Google" },
} as const

type ModelName = keyof typeof MODEL_PRICING

interface ModelCost {
  model: ModelName
  inputCost: number
  outputCost: number
  totalCost: number
  monthlyCost: number
}

function formatCost(cost: number): string {
  if (cost < 0.01) {
    return `$${cost.toFixed(6)}`
  } else if (cost < 1) {
    return `$${cost.toFixed(4)}`
  } else if (cost < 100) {
    return `$${cost.toFixed(2)}`
  } else {
    return `$${cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
}

function calculateCost(
  model: ModelName,
  inputTokens: number,
  outputTokens: number,
  requestsPerDay: number = 1
): ModelCost {
  const pricing = MODEL_PRICING[model]
  const inputCost = (inputTokens / 1_000_000) * pricing.input
  const outputCost = (outputTokens / 1_000_000) * pricing.output
  const totalCost = inputCost + outputCost
  const monthlyCost = totalCost * requestsPerDay * 30

  return {
    model,
    inputCost,
    outputCost,
    totalCost,
    monthlyCost,
  }
}

interface CostCalculatorProps {
  defaultModel?: ModelName
  showComparison?: boolean
}

export function CostCalculator({
  defaultModel = "gpt-4o",
  showComparison = false,
}: CostCalculatorProps) {
  const [selectedModel, setSelectedModel] = useState<ModelName>(defaultModel)
  const [inputTokens, setInputTokens] = useState(1000)
  const [outputTokens, setOutputTokens] = useState(500)
  const [requestsPerDay, setRequestsPerDay] = useState(100)
  const [comparisonMode, setComparisonMode] = useState(showComparison)

  const primaryCost = useMemo(
    () => calculateCost(selectedModel, inputTokens, outputTokens, requestsPerDay),
    [selectedModel, inputTokens, outputTokens, requestsPerDay]
  )

  const allModelCosts = useMemo(() => {
    if (!comparisonMode) return []
    return (Object.keys(MODEL_PRICING) as ModelName[]).map((model) =>
      calculateCost(model, inputTokens, outputTokens, requestsPerDay)
    ).sort((a, b) => a.totalCost - b.totalCost)
  }, [comparisonMode, inputTokens, outputTokens, requestsPerDay])

  const handleInputTokensChange = (value: string) => {
    const num = parseInt(value, 10)
    if (!isNaN(num) && num >= 0) {
      setInputTokens(num)
    } else if (value === "") {
      setInputTokens(0)
    }
  }

  const handleOutputTokensChange = (value: string) => {
    const num = parseInt(value, 10)
    if (!isNaN(num) && num >= 0) {
      setOutputTokens(num)
    } else if (value === "") {
      setOutputTokens(0)
    }
  }

  const handleRequestsPerDayChange = (value: string) => {
    const num = parseInt(value, 10)
    if (!isNaN(num) && num >= 0) {
      setRequestsPerDay(num)
    } else if (value === "") {
      setRequestsPerDay(0)
    }
  }

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          LLM Cost Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Controls */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column - Inputs */}
          <div className="space-y-4">
            {/* Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="model-select">Model</Label>
              <Select
                value={selectedModel}
                onValueChange={(value) => setSelectedModel(value as ModelName)}
              >
                <SelectTrigger id="model-select" className="w-full">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>OpenAI</SelectLabel>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Anthropic</SelectLabel>
                    <SelectItem value="claude-4-sonnet">Claude 4 Sonnet</SelectItem>
                    <SelectItem value="claude-4-opus">Claude 4 Opus</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Google</SelectLabel>
                    <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                    <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Input Tokens */}
            <div className="space-y-2">
              <Label htmlFor="input-tokens">Input Tokens</Label>
              <Input
                id="input-tokens"
                type="number"
                min={0}
                value={inputTokens}
                onChange={(e) => handleInputTokensChange(e.target.value)}
                placeholder="Enter input tokens"
              />
            </div>

            {/* Output Tokens */}
            <div className="space-y-2">
              <Label htmlFor="output-tokens">Output Tokens</Label>
              <Input
                id="output-tokens"
                type="number"
                min={0}
                value={outputTokens}
                onChange={(e) => handleOutputTokensChange(e.target.value)}
                placeholder="Enter output tokens"
              />
            </div>

            {/* Requests Per Day */}
            <div className="space-y-2">
              <Label htmlFor="requests-per-day">Requests per Day</Label>
              <Input
                id="requests-per-day"
                type="number"
                min={0}
                value={requestsPerDay}
                onChange={(e) => handleRequestsPerDayChange(e.target.value)}
                placeholder="Enter requests per day"
              />
            </div>

            {/* Comparison Mode Toggle */}
            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="comparison-mode" className="cursor-pointer">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Compare All Models
                </div>
              </Label>
              <Switch
                id="comparison-mode"
                checked={comparisonMode}
                onCheckedChange={setComparisonMode}
              />
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-4">
            {/* Model Pricing Reference */}
            <div className="rounded-lg bg-muted/50 p-4">
              <h4 className="mb-3 text-sm font-medium">
                {MODEL_PRICING[selectedModel].provider} - {selectedModel}
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Input:</div>
                <div className="font-mono">
                  ${MODEL_PRICING[selectedModel].input}/1M tokens
                </div>
                <div className="text-muted-foreground">Output:</div>
                <div className="font-mono">
                  ${MODEL_PRICING[selectedModel].output}/1M tokens
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm text-muted-foreground">Input Cost</span>
                <span className="font-mono text-sm">
                  {formatCost(primaryCost.inputCost)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm text-muted-foreground">Output Cost</span>
                <span className="font-mono text-sm">
                  {formatCost(primaryCost.outputCost)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3">
                <span className="flex items-center gap-2 text-sm font-medium text-primary">
                  <DollarSign className="h-4 w-4" />
                  Total per Request
                </span>
                <span className="font-mono text-lg font-bold text-primary">
                  {formatCost(primaryCost.totalCost)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <span className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
                  <TrendingUp className="h-4 w-4" />
                  Monthly Projection
                </span>
                <span className="font-mono text-lg font-bold text-amber-600 dark:text-amber-400">
                  {formatCost(primaryCost.monthlyCost)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        {comparisonMode && (
          <div className="mt-6 space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <BarChart3 className="h-4 w-4" />
              Model Comparison (sorted by cost)
            </h4>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Model</th>
                    <th className="px-4 py-3 text-right font-medium">Input Cost</th>
                    <th className="px-4 py-3 text-right font-medium">Output Cost</th>
                    <th className="px-4 py-3 text-right font-medium">Total/Request</th>
                    <th className="px-4 py-3 text-right font-medium">Monthly</th>
                  </tr>
                </thead>
                <tbody>
                  {allModelCosts.map((cost, index) => (
                    <tr
                      key={cost.model}
                      className={cn(
                        "border-b last:border-0",
                        cost.model === selectedModel && "bg-primary/5"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {index === 0 && (
                            <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                              Cheapest
                            </span>
                          )}
                          <span className={cn(cost.model === selectedModel && "font-medium")}>
                            {cost.model}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatCost(cost.inputCost)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatCost(cost.outputCost)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium">
                        {formatCost(cost.totalCost)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatCost(cost.monthlyCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
