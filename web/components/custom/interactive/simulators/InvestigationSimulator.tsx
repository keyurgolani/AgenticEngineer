"use client"

import { useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Play,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  FileText,
  Download,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface InvestigationStep {
  id: string
  stage: string
  description: string
  status: "pending" | "running" | "complete" | "warning"
  output?: string[]
  redFlags?: string[]
  duration: number
}

interface InvestigationResult {
  transactionId: string
  riskScore: number
  verdict: "safe" | "suspicious" | "fraudulent"
  redFlags: string[]
  recommendations: string[]
}

const SAMPLE_INVESTIGATIONS: Record<string, { steps: Omit<InvestigationStep, "status">[]; result: InvestigationResult }> = {
  "TXN-001": {
    steps: [
      {
        id: "1",
        stage: "Gathering Transaction Data",
        description: "Fetching transaction details from payment processor...",
        output: ["Amount: $2,499.99", "Merchant: Electronics Store", "Card: **** 4532", "Location: New York, NY"],
        duration: 800,
      },
      {
        id: "2",
        stage: "Checking User History",
        description: "Analyzing account history and patterns...",
        output: ["Account age: 2 years", "Avg transaction: $150", "Previous chargebacks: 0", "Verified email: Yes"],
        duration: 1200,
      },
      {
        id: "3",
        stage: "Analyzing Patterns",
        description: "Running fraud detection algorithms...",
        output: ["Velocity check: PASS", "Amount deviation: HIGH (16x average)", "Location: Consistent"],
        redFlags: ["Transaction amount 16x higher than average", "First purchase over $1000"],
        duration: 1500,
      },
      {
        id: "4",
        stage: "Generating Report",
        description: "Compiling investigation findings...",
        output: ["Risk factors identified: 2", "Confidence: 78%"],
        duration: 600,
      },
    ],
    result: {
      transactionId: "TXN-001",
      riskScore: 45,
      verdict: "suspicious",
      redFlags: ["Transaction amount 16x higher than average", "First high-value purchase"],
      recommendations: ["Request additional verification", "Send SMS confirmation", "Monitor next 3 transactions"],
    },
  },
  "TXN-002": {
    steps: [
      {
        id: "1",
        stage: "Gathering Transaction Data",
        description: "Fetching transaction details from payment processor...",
        output: ["Amount: $89.99", "Merchant: Streaming Service", "Card: **** 8821", "Location: Los Angeles, CA"],
        duration: 800,
      },
      {
        id: "2",
        stage: "Checking User History",
        description: "Analyzing account history and patterns...",
        output: ["Account age: 5 years", "Avg transaction: $75", "Previous chargebacks: 0", "Verified email: Yes"],
        duration: 1000,
      },
      {
        id: "3",
        stage: "Analyzing Patterns",
        description: "Running fraud detection algorithms...",
        output: ["Velocity check: PASS", "Amount deviation: Normal", "Location: Consistent", "Merchant: Known"],
        duration: 1200,
      },
      {
        id: "4",
        stage: "Generating Report",
        description: "Compiling investigation findings...",
        output: ["Risk factors identified: 0", "Confidence: 95%"],
        duration: 500,
      },
    ],
    result: {
      transactionId: "TXN-002",
      riskScore: 8,
      verdict: "safe",
      redFlags: [],
      recommendations: ["Auto-approve transaction", "No action required"],
    },
  },
  "TXN-003": {
    steps: [
      {
        id: "1",
        stage: "Gathering Transaction Data",
        description: "Fetching transaction details from payment processor...",
        output: ["Amount: $4,999.00", "Merchant: Gift Cards Online", "Card: **** 1234", "Location: Lagos, Nigeria"],
        duration: 900,
      },
      {
        id: "2",
        stage: "Checking User History",
        description: "Analyzing account history and patterns...",
        output: ["Account age: 3 days", "Avg transaction: N/A (first)", "Previous chargebacks: N/A", "Verified email: No"],
        redFlags: ["New account (3 days)", "Unverified email"],
        duration: 1100,
      },
      {
        id: "3",
        stage: "Analyzing Patterns",
        description: "Running fraud detection algorithms...",
        output: ["Velocity check: FAIL (5 attempts)", "Amount: Near card limit", "Location: High-risk region", "Merchant: High-risk category"],
        redFlags: ["Multiple failed attempts", "High-risk merchant category", "High-risk geographic region", "Amount near card limit"],
        duration: 1800,
      },
      {
        id: "4",
        stage: "Generating Report",
        description: "Compiling investigation findings...",
        output: ["Risk factors identified: 6", "Confidence: 92%"],
        duration: 700,
      },
    ],
    result: {
      transactionId: "TXN-003",
      riskScore: 92,
      verdict: "fraudulent",
      redFlags: [
        "New account (3 days old)",
        "Unverified email address",
        "Multiple failed payment attempts",
        "High-risk merchant category (gift cards)",
        "High-risk geographic region",
        "Transaction amount near card limit",
      ],
      recommendations: ["Block transaction immediately", "Flag account for review", "Notify card issuer", "Add to watchlist"],
    },
  },
}

export function InvestigationSimulator() {
  const [transactionId, setTransactionId] = useState("TXN-001")
  const [isRunning, setIsRunning] = useState(false)
  const [steps, setSteps] = useState<InvestigationStep[]>([])
  const [result, setResult] = useState<InvestigationResult | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const runInvestigation = useCallback(() => {
    const investigation = SAMPLE_INVESTIGATIONS[transactionId] || SAMPLE_INVESTIGATIONS["TXN-001"]
    
    setIsRunning(true)
    setResult(null)
    setSteps(investigation.steps.map(s => ({ ...s, status: "pending" as const })))

    let stepIndex = 0
    
    const runStep = () => {
      if (stepIndex >= investigation.steps.length) {
        setIsRunning(false)
        setResult(investigation.result)
        return
      }

      setSteps(prev => prev.map((s, i) => ({
        ...s,
        status: i === stepIndex ? "running" : i < stepIndex ? "complete" : "pending"
      })))

      timeoutRef.current = setTimeout(() => {
        setSteps(prev => prev.map((s, i) => ({
          ...s,
          status: i === stepIndex 
            ? (s.redFlags && s.redFlags.length > 0 ? "warning" : "complete")
            : i < stepIndex ? (prev[i].redFlags && prev[i].redFlags.length > 0 ? "warning" : "complete") : "pending"
        })))
        stepIndex++
        runStep()
      }, investigation.steps[stepIndex].duration)
    }

    runStep()
  }, [transactionId])

  const reset = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsRunning(false)
    setSteps([])
    setResult(null)
  }

  const exportReport = () => {
    if (!result) return
    const report = {
      timestamp: new Date().toISOString(),
      ...result,
      steps: steps.map(s => ({
        stage: s.stage,
        output: s.output,
        redFlags: s.redFlags,
      })),
    }
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `investigation-${result.transactionId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getVerdictColor = (verdict: InvestigationResult["verdict"]) => {
    switch (verdict) {
      case "safe": return "text-green-500"
      case "suspicious": return "text-amber-500"
      case "fraudulent": return "text-red-500"
    }
  }

  const getVerdictBg = (verdict: InvestigationResult["verdict"]) => {
    switch (verdict) {
      case "safe": return "bg-green-500/10 border-green-500/30"
      case "suspicious": return "bg-amber-500/10 border-amber-500/30"
      case "fraudulent": return "bg-red-500/10 border-red-500/30"
    }
  }

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          Fraud Investigation Simulator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter transaction ID (TXN-001, TXN-002, TXN-003)"
              disabled={isRunning}
            />
            <div className="text-xs text-muted-foreground mt-1">
              Try: TXN-001 (suspicious), TXN-002 (safe), TXN-003 (fraudulent)
            </div>
          </div>
          <Button onClick={runInvestigation} disabled={isRunning} className="gap-2">
            <Play className="h-4 w-4" /> Investigate
          </Button>
          <Button onClick={reset} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>

        {/* Investigation Steps */}
        {steps.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Investigation Progress</h4>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "p-3 rounded-lg border transition-all",
                    step.status === "running" && "border-primary bg-primary/5",
                    step.status === "complete" && "border-green-500/30 bg-green-500/5",
                    step.status === "warning" && "border-amber-500/30 bg-amber-500/5",
                    step.status === "pending" && "opacity-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="shrink-0">
                      {step.status === "running" && (
                        <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      )}
                      {step.status === "complete" && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {step.status === "warning" && (
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      )}
                      {step.status === "pending" && (
                        <div className="h-5 w-5 rounded-full border-2 border-muted" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{step.stage}</div>
                      <div className="text-xs text-muted-foreground">{step.description}</div>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {step.duration}ms
                    </Badge>
                  </div>

                  {/* Step Output */}
                  <AnimatePresence>
                    {(step.status === "complete" || step.status === "warning") && step.output && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="mt-2 pl-8 space-y-1"
                      >
                        {step.output.map((line, i) => (
                          <div key={i} className="text-xs font-mono text-muted-foreground">
                            → {line}
                          </div>
                        ))}
                        {step.redFlags && step.redFlags.map((flag, i) => (
                          <div key={`flag-${i}`} className="text-xs font-mono text-amber-500 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> {flag}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Risk Score Gauge */}
              <div className={cn("p-4 rounded-lg border", getVerdictBg(result.verdict))}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className={cn("text-lg font-bold capitalize", getVerdictColor(result.verdict))}>
                      {result.verdict}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Transaction {result.transactionId}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn("text-4xl font-bold", getVerdictColor(result.verdict))}>
                      {result.riskScore}
                    </div>
                    <div className="text-xs text-muted-foreground">Risk Score</div>
                  </div>
                </div>
                <Progress 
                  value={result.riskScore} 
                  className={cn(
                    "h-3",
                    result.riskScore > 70 && "[&>div]:bg-red-500",
                    result.riskScore > 30 && result.riskScore <= 70 && "[&>div]:bg-amber-500"
                  )} 
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Safe (0-30)</span>
                  <span>Suspicious (31-70)</span>
                  <span>Fraudulent (71-100)</span>
                </div>
              </div>

              {/* Red Flags */}
              {result.redFlags.length > 0 && (
                <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="font-medium text-red-500">Red Flags ({result.redFlags.length})</span>
                  </div>
                  <ul className="space-y-1">
                    {result.redFlags.map((flag, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-medium">Recommendations</span>
                </div>
                <ul className="space-y-1">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Export */}
              <Button onClick={exportReport} variant="outline" className="gap-2">
                <Download className="h-4 w-4" /> Export Report
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
