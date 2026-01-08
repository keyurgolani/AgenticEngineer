"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Calculator, DollarSign, Zap } from "lucide-react"

// Model pricing (per 1M tokens) - Updated for 2025/2026
const MODEL_PRICING = {
  "gpt-4o": { input: 2.50, output: 10.00, contextWindow: 128000 },
  "gpt-4o-mini": { input: 0.15, output: 0.60, contextWindow: 128000 },
  "gpt-4-turbo": { input: 10.00, output: 30.00, contextWindow: 128000 },
  "claude-3-opus": { input: 15.00, output: 75.00, contextWindow: 200000 },
  "claude-3-sonnet": { input: 3.00, output: 15.00, contextWindow: 200000 },
  "claude-3-haiku": { input: 0.25, output: 1.25, contextWindow: 200000 },
  "claude-3.5-sonnet": { input: 3.00, output: 15.00, contextWindow: 200000 },
  "gemini-1.5-pro": { input: 1.25, output: 5.00, contextWindow: 1000000 },
  "gemini-1.5-flash": { input: 0.075, output: 0.30, contextWindow: 1000000 },
  "llama-3-70b": { input: 0.90, output: 0.90, contextWindow: 8000 },
  "mistral-large": { input: 4.00, output: 12.00, contextWindow: 32000 },
} as const

type ModelName = keyof typeof MODEL_PRICING

// Simple token estimation (roughly 4 chars per token for English)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

interface TokenCalculatorProps {
  defaultModel?: ModelName
}

export function TokenCalculator({ defaultModel = "gpt-4o" }: TokenCalculatorProps) {
  const [inputText, setInputText] = useState("")
  const [outputTokens, setOutputTokens] = useState(500)
  const [selectedModel, setSelectedModel] = useState<ModelName>(defaultModel)
  const [requestsPerDay, setRequestsPerDay] = useState(100)

  const inputTokens = useMemo(() => estimateTokens(inputText), [inputText])
  const pricing = MODEL_PRICING[selectedModel]

  const costPerRequest = useMemo(() => {
    const inputCost = (inputTokens / 1_000_000) * pricing.input
    const outputCost = (outputTokens / 1_000_000) * pricing.output
    return inputCost + outputCost
  }, [inputTokens, outputTokens, pricing])

  const dailyCost = costPerRequest * requestsPerDay
  const monthlyCost = dailyCost * 30

  return (
    <div className="my-8 p-6 rounded-xl border border-border bg-card/50">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Token & Cost Calculator</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          {/* Model Selection */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as ModelName)}
              className="w-full p-2 rounded-lg border border-border bg-background text-sm"
            >
              <optgroup label="OpenAI">
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
              </optgroup>
              <optgroup label="Anthropic">
                <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                <option value="claude-3-opus">Claude 3 Opus</option>
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                <option value="claude-3-haiku">Claude 3 Haiku</option>
              </optgroup>
              <optgroup label="Google">
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              </optgroup>
              <optgroup label="Open Source">
                <option value="llama-3-70b">Llama 3 70B</option>
                <option value="mistral-large">Mistral Large</option>
              </optgroup>
            </select>
          </div>

          {/* Input Text */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Sample Input (or paste your prompt)
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your prompt here to estimate tokens..."
              className="w-full h-32 p-3 rounded-lg border border-border bg-background text-sm resize-none"
            />
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>{inputText.length} characters</span>
              <span>~{inputTokens.toLocaleString()} tokens</span>
            </div>
          </div>

          {/* Output Tokens Slider */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Expected Output Tokens: {outputTokens.toLocaleString()}
            </label>
            <input
              type="range"
              min={100}
              max={4000}
              step={100}
              value={outputTokens}
              onChange={(e) => setOutputTokens(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Requests per Day */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Requests per Day: {requestsPerDay.toLocaleString()}
            </label>
            <input
              type="range"
              min={1}
              max={10000}
              step={10}
              value={requestsPerDay}
              onChange={(e) => setRequestsPerDay(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {/* Model Info */}
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-3">Model Pricing</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Input:</span>
                <span className="ml-2 font-mono">${pricing.input}/1M tokens</span>
              </div>
              <div>
                <span className="text-muted-foreground">Output:</span>
                <span className="ml-2 font-mono">${pricing.output}/1M tokens</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Context Window:</span>
                <span className="ml-2 font-mono">{pricing.contextWindow.toLocaleString()} tokens</span>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-3">
            <div className="p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cost per Request</span>
                <span className="font-mono font-bold text-lg">
                  ${costPerRequest.toFixed(6)}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-amber-500">Daily Cost</span>
                <span className="font-mono font-bold text-lg text-amber-500">
                  ${dailyCost.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary">Monthly Cost</span>
                <span className="font-mono font-bold text-xl text-primary">
                  ${monthlyCost.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Context Usage */}
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Context Usage</span>
              <span className="text-sm font-mono">
                {((inputTokens + outputTokens) / pricing.contextWindow * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${Math.min(100, (inputTokens + outputTokens) / pricing.contextWindow * 100)}%` 
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simpler inline token counter for code blocks
interface TokenCounterProps {
  text: string
  showCost?: boolean
  model?: ModelName
}

export function TokenCounter({ text, showCost = false, model = "gpt-4o" }: TokenCounterProps) {
  const tokens = estimateTokens(text)
  const pricing = MODEL_PRICING[model]
  const cost = (tokens / 1_000_000) * pricing.input

  return (
    <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
      <Zap className="w-3 h-3" />
      <span>~{tokens.toLocaleString()} tokens</span>
      {showCost && (
        <>
          <DollarSign className="w-3 h-3 ml-1" />
          <span>${cost.toFixed(6)}</span>
        </>
      )}
    </div>
  )
}
