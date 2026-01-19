"use client"

import { useState, useMemo, useCallback } from "react"
import { AlertTriangle, Download, RotateCcw, Shield, ShieldAlert, ShieldCheck } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// Risk factor definitions with weights and scoring logic
interface RiskFactor {
  id: string
  name: string
  description: string
  weight: number
  type: "slider" | "boolean"
  min?: number
  max?: number
  unit?: string
  invertScore?: boolean // Lower value = higher risk
}

const RISK_FACTORS: RiskFactor[] = [
  {
    id: "accountAge",
    name: "Account Age",
    description: "Hours since account creation",
    weight: 25,
    type: "slider",
    min: 0,
    max: 720,
    unit: "hours",
    invertScore: true, // Lower age = higher risk
  },
  {
    id: "amountNearLimit",
    name: "Amount Near Limit",
    description: "Transaction amount % of reporting threshold",
    weight: 20,
    type: "slider",
    min: 0,
    max: 100,
    unit: "%",
    invertScore: false,
  },
  {
    id: "roundAmount",
    name: "Round Amount",
    description: "Transaction is a round number (e.g., $1000)",
    weight: 10,
    type: "boolean",
    invertScore: false,
  },
  {
    id: "highVelocity",
    name: "High Velocity",
    description: "Transactions per hour",
    weight: 20,
    type: "slider",
    min: 0,
    max: 50,
    unit: "tx/hr",
    invertScore: false,
  },
  {
    id: "noCommunication",
    name: "No Communication History",
    description: "No prior communication with account",
    weight: 15,
    type: "boolean",
    invertScore: false,
  },
  {
    id: "disposableEmail",
    name: "Disposable Email",
    description: "Email from disposable domain",
    weight: 10,
    type: "boolean",
    invertScore: false,
  },
]

const DEFAULT_VALUES: Record<string, number | boolean> = {
  accountAge: 360,
  amountNearLimit: 50,
  roundAmount: false,
  highVelocity: 10,
  noCommunication: false,
  disposableEmail: false,
}

// Calculate individual factor score (0-100)
function calculateFactorScore(factor: RiskFactor, value: number | boolean): number {
  if (factor.type === "boolean") {
    return value ? 100 : 0
  }

  const numValue = value as number
  const range = (factor.max ?? 100) - (factor.min ?? 0)
  const normalized = (numValue - (factor.min ?? 0)) / range

  if (factor.invertScore) {
    return Math.round((1 - normalized) * 100)
  }
  return Math.round(normalized * 100)
}

// Get color based on score
function getScoreColor(score: number): string {
  if (score <= 30) return "text-green-500"
  if (score <= 69) return "text-yellow-500"
  return "text-red-500"
}

function getScoreBorderColor(score: number): string {
  if (score <= 30) return "border-green-500"
  if (score <= 69) return "border-yellow-500"
  return "border-red-500"
}

function getRecommendation(score: number): { label: string; color: string; icon: React.ReactNode } {
  if (score <= 30) {
    return { label: "APPROVE", color: "text-green-500", icon: <ShieldCheck className="h-5 w-5" /> }
  }
  if (score <= 69) {
    return { label: "REVIEW", color: "text-yellow-500", icon: <Shield className="h-5 w-5" /> }
  }
  return { label: "BLOCK", color: "text-red-500", icon: <ShieldAlert className="h-5 w-5" /> }
}

// Circular gauge component
function CircularGauge({ score, size = 200 }: { score: number; size?: number }) {
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const recommendation = getRecommendation(score)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className={cn("transition-all duration-500", getScoreColor(score))}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-5xl font-bold transition-colors duration-300", getScoreColor(score))}>
          {score}
        </span>
        <span className="text-sm text-muted-foreground mt-1">Risk Score</span>
        <div className={cn("flex items-center gap-1 mt-2 font-semibold", recommendation.color)}>
          {recommendation.icon}
          <span>{recommendation.label}</span>
        </div>
      </div>
    </div>
  )
}

// Mini gauge for factor cards
function MiniGauge({ score, size = 48 }: { score: number; size?: number }) {
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className={cn("transition-all duration-300", getScoreColor(score))}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("text-xs font-bold", getScoreColor(score))}>{score}</span>
      </div>
    </div>
  )
}

// Factor card component
function FactorCard({
  factor,
  value,
  onChange,
  factorScore,
  contribution,
}: {
  factor: RiskFactor
  value: number | boolean
  onChange: (value: number | boolean) => void
  factorScore: number
  contribution: number
}) {
  return (
    <Card className={cn("transition-all duration-300", getScoreBorderColor(factorScore), "border-l-4")}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Label className="font-medium text-sm">{factor.name}</Label>
              <span className="text-xs text-muted-foreground">({factor.weight}%)</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{factor.description}</p>

            {factor.type === "slider" ? (
              <div className="space-y-2">
                <Slider
                  value={[value as number]}
                  onValueChange={([v]) => onChange(v)}
                  min={factor.min}
                  max={factor.max}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{factor.min} {factor.unit}</span>
                  <span className="font-mono font-medium text-foreground">
                    {value} {factor.unit}
                  </span>
                  <span>{factor.max} {factor.unit}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Switch
                  checked={value as boolean}
                  onCheckedChange={onChange}
                />
                <span className="text-sm text-muted-foreground">
                  {value ? "Yes" : "No"}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-1">
            <MiniGauge score={factorScore} />
            <span className="text-xs text-muted-foreground">+{contribution.toFixed(1)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function RiskScoreCalculator() {
  const [values, setValues] = useState<Record<string, number | boolean>>(DEFAULT_VALUES)
  const [lastChange, setLastChange] = useState<string | null>(null)

  // Calculate scores for each factor
  const factorScores = useMemo(() => {
    return RISK_FACTORS.reduce((acc, factor) => {
      acc[factor.id] = calculateFactorScore(factor, values[factor.id])
      return acc
    }, {} as Record<string, number>)
  }, [values])

  // Calculate contributions (weighted scores)
  const contributions = useMemo(() => {
    return RISK_FACTORS.reduce((acc, factor) => {
      acc[factor.id] = (factorScores[factor.id] * factor.weight) / 100
      return acc
    }, {} as Record<string, number>)
  }, [factorScores])

  // Calculate total risk score
  const totalScore = useMemo(() => {
    return Math.round(
      RISK_FACTORS.reduce((sum, factor) => sum + contributions[factor.id], 0)
    )
  }, [contributions])

  // Handle value change
  const handleValueChange = useCallback((factorId: string, value: number | boolean) => {
    setValues((prev) => ({ ...prev, [factorId]: value }))
    setLastChange(factorId)
  }, [])

  // Reset to defaults
  const handleReset = useCallback(() => {
    setValues(DEFAULT_VALUES)
    setLastChange(null)
  }, [])

  // Export as JSON
  const handleExport = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      riskScore: totalScore,
      recommendation: getRecommendation(totalScore).label,
      factors: RISK_FACTORS.map((factor) => ({
        id: factor.id,
        name: factor.name,
        value: values[factor.id],
        unit: factor.unit || (factor.type === "boolean" ? "boolean" : undefined),
        weight: factor.weight,
        factorScore: factorScores[factor.id],
        contribution: contributions[factor.id],
      })),
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `risk-assessment-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [totalScore, values, factorScores, contributions])

  // Get explanation for last change
  const explanation = useMemo(() => {
    if (!lastChange) return null
    const factor = RISK_FACTORS.find((f) => f.id === lastChange)
    if (!factor) return null

    const score = factorScores[lastChange]
    const contrib = contributions[lastChange]

    if (factor.type === "boolean") {
      return values[lastChange]
        ? `${factor.name} is enabled, adding ${contrib.toFixed(1)} points to the risk score.`
        : `${factor.name} is disabled, contributing 0 points.`
    }

    if (factor.invertScore) {
      return `${factor.name} of ${values[lastChange]} ${factor.unit} results in a factor score of ${score} (lower values = higher risk), contributing ${contrib.toFixed(1)} points.`
    }

    return `${factor.name} of ${values[lastChange]} ${factor.unit} results in a factor score of ${score}, contributing ${contrib.toFixed(1)} points.`
  }, [lastChange, values, factorScores, contributions])

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          Risk Score Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main layout: Gauge in center, factors around */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column - factors 1-3 */}
          <div className="flex-1 space-y-4">
            {RISK_FACTORS.slice(0, 3).map((factor) => (
              <FactorCard
                key={factor.id}
                factor={factor}
                value={values[factor.id]}
                onChange={(v) => handleValueChange(factor.id, v)}
                factorScore={factorScores[factor.id]}
                contribution={contributions[factor.id]}
              />
            ))}
          </div>

          {/* Center - Main gauge */}
          <div className="flex flex-col items-center justify-center py-4 lg:py-0">
            <CircularGauge score={totalScore} size={220} />

            {/* Explanation panel */}
            {explanation && (
              <div className="mt-4 p-3 rounded-lg bg-muted/50 max-w-[280px] text-center">
                <p className="text-sm text-muted-foreground">{explanation}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" />
                Export JSON
              </Button>
            </div>
          </div>

          {/* Right column - factors 4-6 */}
          <div className="flex-1 space-y-4">
            {RISK_FACTORS.slice(3, 6).map((factor) => (
              <FactorCard
                key={factor.id}
                factor={factor}
                value={values[factor.id]}
                onChange={(v) => handleValueChange(factor.id, v)}
                factorScore={factorScores[factor.id]}
                contribution={contributions[factor.id]}
              />
            ))}
          </div>
        </div>

        {/* Score breakdown */}
        <div className="rounded-lg border p-4 bg-muted/30">
          <h4 className="text-sm font-medium mb-3">Score Breakdown</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {RISK_FACTORS.map((factor) => (
              <div key={factor.id} className="text-center">
                <div className={cn("text-lg font-bold", getScoreColor(factorScores[factor.id]))}>
                  {contributions[factor.id].toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground truncate">{factor.name}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t flex items-center justify-between">
            <span className="text-sm font-medium">Total Risk Score</span>
            <span className={cn("text-2xl font-bold", getScoreColor(totalScore))}>{totalScore}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", "bg-green-500")} />
            <span className="text-muted-foreground">Low Risk (0-30)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", "bg-yellow-500")} />
            <span className="text-muted-foreground">Medium Risk (31-69)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", "bg-red-500")} />
            <span className="text-muted-foreground">High Risk (70-100)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
