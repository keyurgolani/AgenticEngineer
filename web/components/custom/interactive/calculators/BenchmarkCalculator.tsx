"use client"

import { useState, useMemo, useCallback } from "react"
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Download, 
  Copy, 
  Check,
  BarChart3,
  Trophy
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts"

// Calculate binomial coefficient C(n, k)
function binomial(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  if (k === 0 || k === n) return 1
  
  // Use the multiplicative formula for efficiency
  let result = 1
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1)
  }
  return Math.round(result)
}

// Calculate Pass@k using the formula: Pass@k = 1 - C(n-c, k) / C(n, k)
function calculatePassAtK(n: number, c: number, k: number): number {
  if (n <= 0 || k <= 0) return 0
  if (c >= n) return 1 // All runs successful
  if (c <= 0) return 0 // No successful runs
  if (k > n) return c > 0 ? 1 : 0 // k exceeds total samples
  
  const numerator = binomial(n - c, k)
  const denominator = binomial(n, k)
  
  if (denominator === 0) return 0
  
  return 1 - (numerator / denominator)
}

// Get color based on performance
function getPerformanceColor(value: number): string {
  if (value >= 0.8) return "text-green-500"
  if (value >= 0.5) return "text-yellow-500"
  return "text-red-500"
}

function getPerformanceBgColor(value: number): string {
  if (value >= 0.8) return "bg-green-500"
  if (value >= 0.5) return "bg-yellow-500"
  return "bg-red-500"
}

function getPerformanceBarColor(value: number): string {
  if (value >= 0.8) return "#22c55e" // green-500
  if (value >= 0.5) return "#eab308" // yellow-500
  return "#ef4444" // red-500
}

interface AgentResult {
  id: string
  name: string
  totalRuns: number
  successfulRuns: number
}

interface PassAtKResult {
  k: number
  value: number
}

const DEFAULT_K_VALUES = [1, 5, 10]

export function BenchmarkCalculator() {
  // Single agent mode state
  const [totalRuns, setTotalRuns] = useState(100)
  const [successfulRuns, setSuccessfulRuns] = useState(65)
  const [selectedKValues, setSelectedKValues] = useState<number[]>([1, 5, 10])
  const [customK, setCustomK] = useState("")
  
  // Comparison mode state
  const [comparisonMode, setComparisonMode] = useState(false)
  const [agents, setAgents] = useState<AgentResult[]>([
    { id: "1", name: "Agent A", totalRuns: 100, successfulRuns: 65 },
    { id: "2", name: "Agent B", totalRuns: 100, successfulRuns: 72 },
  ])
  
  // Copy state
  const [copied, setCopied] = useState(false)

  // Calculate success rate
  const successRate = useMemo(() => {
    if (totalRuns <= 0) return 0
    return successfulRuns / totalRuns
  }, [totalRuns, successfulRuns])

  // Calculate Pass@k for all selected k values
  const passAtKResults = useMemo((): PassAtKResult[] => {
    return selectedKValues
      .filter(k => k > 0)
      .sort((a, b) => a - b)
      .map(k => ({
        k,
        value: calculatePassAtK(totalRuns, successfulRuns, k)
      }))
  }, [totalRuns, successfulRuns, selectedKValues])

  // Calculate Pass@k for all agents in comparison mode
  const agentPassAtKResults = useMemo(() => {
    if (!comparisonMode) return []
    
    return agents.map(agent => ({
      ...agent,
      successRate: agent.totalRuns > 0 ? agent.successfulRuns / agent.totalRuns : 0,
      passAtK: selectedKValues
        .filter(k => k > 0)
        .sort((a, b) => a - b)
        .map(k => ({
          k,
          value: calculatePassAtK(agent.totalRuns, agent.successfulRuns, k)
        }))
    }))
  }, [comparisonMode, agents, selectedKValues])

  // Find best performer for each k value
  const bestPerformers = useMemo(() => {
    if (!comparisonMode || agentPassAtKResults.length === 0) return {}
    
    const best: Record<number, string> = {}
    selectedKValues.forEach(k => {
      let maxValue = -1
      let bestAgent = ""
      agentPassAtKResults.forEach(agent => {
        const result = agent.passAtK.find(r => r.k === k)
        if (result && result.value > maxValue) {
          maxValue = result.value
          bestAgent = agent.id
        }
      })
      best[k] = bestAgent
    })
    return best
  }, [comparisonMode, agentPassAtKResults, selectedKValues])

  // Chart data for single agent
  const chartData = useMemo(() => {
    return passAtKResults.map(result => ({
      name: `Pass@${result.k}`,
      value: result.value * 100,
      k: result.k,
    }))
  }, [passAtKResults])

  // Chart data for comparison mode
  const comparisonChartData = useMemo(() => {
    if (!comparisonMode) return []
    
    return selectedKValues
      .filter(k => k > 0)
      .sort((a, b) => a - b)
      .map(k => {
        const dataPoint: Record<string, string | number> = { name: `Pass@${k}` }
        agentPassAtKResults.forEach(agent => {
          const result = agent.passAtK.find(r => r.k === k)
          dataPoint[agent.name] = result ? result.value * 100 : 0
        })
        return dataPoint
      })
  }, [comparisonMode, selectedKValues, agentPassAtKResults])

  // Handle k value toggle
  const toggleKValue = useCallback((k: number) => {
    setSelectedKValues(prev => {
      if (prev.includes(k)) {
        return prev.filter(v => v !== k)
      }
      return [...prev, k]
    })
  }, [])

  // Handle custom k value add
  const addCustomK = useCallback(() => {
    const k = parseInt(customK, 10)
    if (!isNaN(k) && k > 0 && !selectedKValues.includes(k)) {
      setSelectedKValues(prev => [...prev, k])
      setCustomK("")
    }
  }, [customK, selectedKValues])

  // Handle agent add
  const addAgent = useCallback(() => {
    const newId = (Math.max(...agents.map(a => parseInt(a.id, 10)), 0) + 1).toString()
    setAgents(prev => [
      ...prev,
      { id: newId, name: `Agent ${String.fromCharCode(65 + prev.length)}`, totalRuns: 100, successfulRuns: 50 }
    ])
  }, [agents])

  // Handle agent remove
  const removeAgent = useCallback((id: string) => {
    setAgents(prev => prev.filter(a => a.id !== id))
  }, [])

  // Handle agent update
  const updateAgent = useCallback((id: string, field: keyof AgentResult, value: string | number) => {
    setAgents(prev => prev.map(a => {
      if (a.id !== id) return a
      return { ...a, [field]: value }
    }))
  }, [])

  // Export as CSV
  const exportCSV = useCallback(() => {
    let csv = ""
    
    if (comparisonMode) {
      // Header
      csv = "Agent,Total Runs,Successful Runs,Success Rate," + 
        selectedKValues.filter(k => k > 0).sort((a, b) => a - b).map(k => `Pass@${k}`).join(",") + "\n"
      
      // Data rows
      agentPassAtKResults.forEach(agent => {
        csv += `${agent.name},${agent.totalRuns},${agent.successfulRuns},${(agent.successRate * 100).toFixed(2)}%,`
        csv += agent.passAtK.map(r => `${(r.value * 100).toFixed(2)}%`).join(",") + "\n"
      })
    } else {
      csv = "Metric,Value\n"
      csv += `Total Runs,${totalRuns}\n`
      csv += `Successful Runs,${successfulRuns}\n`
      csv += `Success Rate,${(successRate * 100).toFixed(2)}%\n`
      passAtKResults.forEach(result => {
        csv += `Pass@${result.k},${(result.value * 100).toFixed(2)}%\n`
      })
    }

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `benchmark-results-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [comparisonMode, totalRuns, successfulRuns, successRate, passAtKResults, selectedKValues, agentPassAtKResults])

  // Copy to clipboard
  const copyToClipboard = useCallback(() => {
    let text = ""
    
    if (comparisonMode) {
      text = "Benchmark Comparison Results\n"
      text += "=".repeat(40) + "\n\n"
      
      agentPassAtKResults.forEach(agent => {
        text += `${agent.name}:\n`
        text += `  Total Runs: ${agent.totalRuns}\n`
        text += `  Successful: ${agent.successfulRuns}\n`
        text += `  Success Rate: ${(agent.successRate * 100).toFixed(2)}%\n`
        agent.passAtK.forEach(r => {
          text += `  Pass@${r.k}: ${(r.value * 100).toFixed(2)}%\n`
        })
        text += "\n"
      })
    } else {
      text = "Benchmark Results\n"
      text += "=".repeat(30) + "\n"
      text += `Total Runs: ${totalRuns}\n`
      text += `Successful Runs: ${successfulRuns}\n`
      text += `Success Rate: ${(successRate * 100).toFixed(2)}%\n\n`
      passAtKResults.forEach(result => {
        text += `Pass@${result.k}: ${(result.value * 100).toFixed(2)}%\n`
      })
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [comparisonMode, totalRuns, successfulRuns, successRate, passAtKResults, agentPassAtKResults])

  // Chart colors for comparison mode
  const CHART_COLORS = ["#3b82f6", "#22c55e", "#eab308", "#ef4444", "#8b5cf6", "#ec4899"]

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Benchmark Calculator (Pass@k)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="comparison-mode" className="cursor-pointer">
              Comparison Mode
            </Label>
          </div>
          <Switch
            id="comparison-mode"
            checked={comparisonMode}
            onCheckedChange={setComparisonMode}
          />
        </div>

        {/* K Value Selection */}
        <div className="space-y-3">
          <Label>Select k values to calculate</Label>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_K_VALUES.map(k => (
              <Button
                key={k}
                variant={selectedKValues.includes(k) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleKValue(k)}
              >
                k = {k}
              </Button>
            ))}
            {selectedKValues
              .filter(k => !DEFAULT_K_VALUES.includes(k))
              .map(k => (
                <Button
                  key={k}
                  variant="default"
                  size="sm"
                  onClick={() => toggleKValue(k)}
                  className="gap-1"
                >
                  k = {k}
                  <Trash2 className="h-3 w-3" />
                </Button>
              ))}
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              min={1}
              placeholder="Custom k value"
              value={customK}
              onChange={(e) => setCustomK(e.target.value)}
              className="w-32"
              onKeyDown={(e) => e.key === "Enter" && addCustomK()}
            />
            <Button variant="outline" size="sm" onClick={addCustomK}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {!comparisonMode ? (
          /* Single Agent Mode */
          <div className="grid gap-6 md:grid-cols-2">
            {/* Input Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="total-runs">Total Test Runs (n)</Label>
                <Input
                  id="total-runs"
                  type="number"
                  min={1}
                  value={totalRuns}
                  onChange={(e) => setTotalRuns(Math.max(1, parseInt(e.target.value, 10) || 1))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="successful-runs">Successful Runs (c)</Label>
                <Input
                  id="successful-runs"
                  type="number"
                  min={0}
                  max={totalRuns}
                  value={successfulRuns}
                  onChange={(e) => setSuccessfulRuns(Math.min(totalRuns, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                />
              </div>

              {/* Success Rate Visualization */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Success Rate</span>
                  <span className={cn("font-mono font-bold", getPerformanceColor(successRate))}>
                    {(successRate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full transition-all duration-300", getPerformanceBgColor(successRate))}
                    style={{ width: `${successRate * 100}%` }}
                  />
                </div>
              </div>

              {/* Formula Reference */}
              <div className="rounded-lg bg-muted/50 p-4 mt-4">
                <h4 className="text-sm font-medium mb-2">Pass@k Formula</h4>
                <code className="text-xs text-muted-foreground block">
                  Pass@k = 1 - C(n-c, k) / C(n, k)
                </code>
                <p className="text-xs text-muted-foreground mt-2">
                  Where n = total runs, c = successful runs, k = samples
                </p>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Pass@k Results</h4>
              
              {passAtKResults.length === 0 ? (
                <p className="text-sm text-muted-foreground">Select at least one k value</p>
              ) : (
                <div className="space-y-3">
                  {passAtKResults.map(result => (
                    <div key={result.k} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Pass@{result.k}</span>
                        <span className={cn("font-mono font-bold text-lg", getPerformanceColor(result.value))}>
                          {(result.value * 100).toFixed(2)}%
                        </span>
                      </div>
                      <Progress 
                        value={result.value * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Bar Chart */}
              {chartData.length > 0 && (
                <div className="h-48 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} className="text-xs" />
                      <Tooltip 
                        formatter={(value) => [`${Number(value).toFixed(2)}%`, "Pass Rate"]}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getPerformanceBarColor(entry.value / 100)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Comparison Mode */
          <div className="space-y-6">
            {/* Agent Inputs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Agents / Models</Label>
                <Button variant="outline" size="sm" onClick={addAgent}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Agent
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {agents.map((agent, index) => (
                  <Card key={agent.id} className="relative">
                    <CardContent className="p-4 space-y-3">
                      {agents.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => removeAgent(agent.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                      
                      <Input
                        value={agent.name}
                        onChange={(e) => updateAgent(agent.id, "name", e.target.value)}
                        placeholder="Agent name"
                        className="font-medium"
                        style={{ borderColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Total Runs</Label>
                          <Input
                            type="number"
                            min={1}
                            value={agent.totalRuns}
                            onChange={(e) => updateAgent(agent.id, "totalRuns", Math.max(1, parseInt(e.target.value, 10) || 1))}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Successful</Label>
                          <Input
                            type="number"
                            min={0}
                            max={agent.totalRuns}
                            value={agent.successfulRuns}
                            onChange={(e) => updateAgent(agent.id, "successfulRuns", Math.min(agent.totalRuns, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Comparison Chart */}
            {comparisonChartData.length > 0 && agents.length > 0 && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} className="text-xs" />
                    <Tooltip 
                      formatter={(value) => [`${Number(value).toFixed(2)}%`]}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    {agents.map((agent, index) => (
                      <Bar 
                        key={agent.id} 
                        dataKey={agent.name} 
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        radius={[4, 4, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Comparison Table */}
            {agentPassAtKResults.length > 0 && selectedKValues.length > 0 && (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium">Agent</th>
                      <th className="px-4 py-3 text-right font-medium">Total</th>
                      <th className="px-4 py-3 text-right font-medium">Success</th>
                      <th className="px-4 py-3 text-right font-medium">Rate</th>
                      {selectedKValues
                        .filter(k => k > 0)
                        .sort((a, b) => a - b)
                        .map(k => (
                          <th key={k} className="px-4 py-3 text-right font-medium">
                            Pass@{k}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {agentPassAtKResults.map((agent, index) => (
                      <tr key={agent.id} className="border-b last:border-0">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                            />
                            <span className="font-medium">{agent.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono">{agent.totalRuns}</td>
                        <td className="px-4 py-3 text-right font-mono">{agent.successfulRuns}</td>
                        <td className={cn("px-4 py-3 text-right font-mono", getPerformanceColor(agent.successRate))}>
                          {(agent.successRate * 100).toFixed(1)}%
                        </td>
                        {agent.passAtK.map(result => (
                          <td 
                            key={result.k} 
                            className={cn(
                              "px-4 py-3 text-right font-mono",
                              getPerformanceColor(result.value),
                              bestPerformers[result.k] === agent.id && "font-bold"
                            )}
                          >
                            <div className="flex items-center justify-end gap-1">
                              {bestPerformers[result.k] === agent.id && (
                                <Trophy className="h-3 w-3 text-yellow-500" />
                              )}
                              {(result.value * 100).toFixed(2)}%
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Export Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                Copy Results
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 text-sm pt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">High (&gt;80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">Medium (50-80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Low (&lt;50%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
