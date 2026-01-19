"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play,
  RotateCcw,
  Database,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Zap,
  TrendingUp,
  Server,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

// Types for context fetching simulation
interface SourceState {
  id: string
  name: string
  status: "idle" | "fetching" | "success" | "failed" | "timeout"
  progress: number
  duration: number
  startTime: number
  expectedDuration: number
  result?: string
}

interface FetchMetrics {
  totalRuns: number
  successRate: number
  averageLatency: number
  timeoutCount: number
  failureCount: number
}

// Sample context source names
const SOURCE_NAMES = [
  "User Profile DB",
  "Conversation History",
  "Knowledge Base",
  "External API",
  "Vector Store",
  "Session Cache",
  "Preferences Store",
  "Activity Log",
  "Embeddings Service",
  "Document Index",
]

// Sample result data for successful fetches
const SAMPLE_RESULTS = [
  "User preferences loaded (12 items)",
  "Retrieved 5 recent conversations",
  "Found 8 relevant documents",
  "API response: 200 OK (142ms)",
  "Vector search: 15 matches",
  "Cache hit: session data",
  "Loaded 3 user preferences",
  "Activity: 24 events",
  "Generated 384-dim embedding",
  "Indexed 156 documents",
]

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9)

export function ContextFetcherSimulator() {
  // Configuration state
  const [numSources, setNumSources] = useState(5)
  const [timeoutDuration, setTimeoutDuration] = useState(5)
  const [failureProbability, setFailureProbability] = useState(20)

  // Simulation state
  const [sources, setSources] = useState<SourceState[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [totalTime, setTotalTime] = useState(0)
  const [hasRun, setHasRun] = useState(false)

  // Metrics state
  const [metrics, setMetrics] = useState<FetchMetrics>({
    totalRuns: 0,
    successRate: 100,
    averageLatency: 0,
    timeoutCount: 0,
    failureCount: 0,
  })

  // Refs for animation frames and intervals
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const sourceIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Initialize sources based on configuration
  const initializeSources = useCallback(() => {
    const newSources: SourceState[] = []
    for (let i = 0; i < numSources; i++) {
      newSources.push({
        id: generateId(),
        name: SOURCE_NAMES[i % SOURCE_NAMES.length],
        status: "idle",
        progress: 0,
        duration: 0,
        startTime: 0,
        expectedDuration: 0,
      })
    }
    return newSources
  }, [numSources])

  // Clean up intervals
  const cleanupIntervals = useCallback(() => {
    sourceIntervalsRef.current.forEach((interval) => clearInterval(interval))
    sourceIntervalsRef.current.clear()
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }, [])

  // Simulate fetching for a single source
  const simulateSourceFetch = useCallback(
    () => {
      // Determine outcome based on failure probability
      const willFail = Math.random() * 100 < failureProbability
      const willTimeout = !willFail && Math.random() * 100 < failureProbability / 2

      // Random duration between 0.5s and timeout duration
      const baseDuration = willTimeout
        ? timeoutDuration * 1000 + 500 // Exceed timeout
        : Math.random() * (timeoutDuration * 1000 - 500) + 500

      // If failing, fail at random point
      const failPoint = willFail ? Math.random() * 0.8 + 0.1 : 1

      return {
        willFail,
        willTimeout,
        baseDuration,
        failPoint,
      }
    },
    [failureProbability, timeoutDuration]
  )

  // Start the fetch simulation
  const startFetch = useCallback(() => {
    cleanupIntervals()

    const newSources = initializeSources()
    setSources(newSources)
    setIsRunning(true)
    setHasRun(true)
    setTotalTime(0)

    startTimeRef.current = performance.now()

    // Start fetching for each source
    newSources.forEach((source, index) => {
      const simulation = simulateSourceFetch()

      // Update source to fetching state
      setSources((prev) =>
        prev.map((s) =>
          s.id === source.id
            ? {
                ...s,
                status: "fetching" as const,
                startTime: startTimeRef.current,
                expectedDuration: simulation.baseDuration,
              }
            : s
        )
      )

      // Progress update interval
      const progressInterval = setInterval(() => {
        const elapsed = performance.now() - startTimeRef.current
        const progress = Math.min((elapsed / simulation.baseDuration) * 100, 100)

        setSources((prev) =>
          prev.map((s) => {
            if (s.id !== source.id || s.status !== "fetching") return s

            // Check for timeout
            if (elapsed >= timeoutDuration * 1000 && simulation.willTimeout) {
              clearInterval(progressInterval)
              sourceIntervalsRef.current.delete(source.id)
              return {
                ...s,
                status: "timeout" as const,
                progress: (timeoutDuration * 1000 / simulation.baseDuration) * 100,
                duration: timeoutDuration * 1000,
              }
            }

            // Check for failure
            if (simulation.willFail && progress >= simulation.failPoint * 100) {
              clearInterval(progressInterval)
              sourceIntervalsRef.current.delete(source.id)
              return {
                ...s,
                status: "failed" as const,
                progress: simulation.failPoint * 100,
                duration: elapsed,
              }
            }

            // Check for completion
            if (progress >= 100) {
              clearInterval(progressInterval)
              sourceIntervalsRef.current.delete(source.id)
              return {
                ...s,
                status: "success" as const,
                progress: 100,
                duration: simulation.baseDuration,
                result: SAMPLE_RESULTS[index % SAMPLE_RESULTS.length],
              }
            }

            return { ...s, progress, duration: elapsed }
          })
        )
      }, 50)

      sourceIntervalsRef.current.set(source.id, progressInterval)
    })

    // Total time tracking
    const updateTotalTime = () => {
      const elapsed = performance.now() - startTimeRef.current
      setTotalTime(elapsed)

      // Check if all sources are done
      setSources((prev) => {
        const allDone = prev.every((s) => s.status !== "fetching" && s.status !== "idle")
        if (allDone) {
          setIsRunning(false)

          // Update metrics
          const successCount = prev.filter((s) => s.status === "success").length
          const failCount = prev.filter((s) => s.status === "failed").length
          const timeoutCount = prev.filter((s) => s.status === "timeout").length
          const avgLatency =
            prev.reduce((sum, s) => sum + s.duration, 0) / prev.length

          setMetrics((m) => ({
            totalRuns: m.totalRuns + 1,
            successRate: Math.round(
              ((m.successRate * m.totalRuns + (successCount / prev.length) * 100) /
                (m.totalRuns + 1)) *
                10
            ) / 10,
            averageLatency: Math.round(
              (m.averageLatency * m.totalRuns + avgLatency) / (m.totalRuns + 1)
            ),
            timeoutCount: m.timeoutCount + timeoutCount,
            failureCount: m.failureCount + failCount,
          }))

          return prev
        }
        return prev
      })

      animationRef.current = requestAnimationFrame(updateTotalTime)
    }

    animationRef.current = requestAnimationFrame(updateTotalTime)
  }, [cleanupIntervals, initializeSources, simulateSourceFetch, timeoutDuration])

  // Reset simulation
  const resetSimulation = useCallback(() => {
    cleanupIntervals()
    setSources([])
    setIsRunning(false)
    setTotalTime(0)
    setHasRun(false)
  }, [cleanupIntervals])

  // Reset metrics
  const resetMetrics = useCallback(() => {
    setMetrics({
      totalRuns: 0,
      successRate: 100,
      averageLatency: 0,
      timeoutCount: 0,
      failureCount: 0,
    })
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupIntervals()
    }
  }, [cleanupIntervals])

  // Get status icon and color
  const getStatusDisplay = (status: SourceState["status"]) => {
    switch (status) {
      case "idle":
        return { icon: Database, color: "text-muted-foreground", bg: "bg-muted" }
      case "fetching":
        return { icon: Loader2, color: "text-blue-500", bg: "bg-blue-500/10" }
      case "success":
        return { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" }
      case "failed":
        return { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" }
      case "timeout":
        return { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" }
    }
  }

  // Calculate current results
  const successCount = sources.filter((s) => s.status === "success").length
  const failedCount = sources.filter((s) => s.status === "failed").length
  const timeoutCount = sources.filter((s) => s.status === "timeout").length

  return (
    <div className="my-8 space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Context Fetcher Simulator
          </CardTitle>
          <CardDescription>
            Simulate parallel context fetching with configurable sources, timeouts, and failure rates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration Panel */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Number of Sources */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Number of Sources</Label>
                <Badge variant="outline">{numSources}</Badge>
              </div>
              <Slider
                value={[numSources]}
                onValueChange={([v]) => setNumSources(v)}
                min={3}
                max={10}
                step={1}
                disabled={isRunning}
              />
              <p className="text-xs text-muted-foreground">
                Parallel data sources to fetch from
              </p>
            </div>

            {/* Timeout Duration */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Timeout (seconds)</Label>
                <Badge variant="outline">{timeoutDuration}s</Badge>
              </div>
              <Slider
                value={[timeoutDuration]}
                onValueChange={([v]) => setTimeoutDuration(v)}
                min={1}
                max={10}
                step={1}
                disabled={isRunning}
              />
              <p className="text-xs text-muted-foreground">
                Max wait time per source
              </p>
            </div>

            {/* Failure Probability */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Failure Probability</Label>
                <Badge variant="outline">{failureProbability}%</Badge>
              </div>
              <Slider
                value={[failureProbability]}
                onValueChange={([v]) => setFailureProbability(v)}
                min={0}
                max={50}
                step={5}
                disabled={isRunning}
              />
              <p className="text-xs text-muted-foreground">
                Chance of source failure
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={startFetch}
              disabled={isRunning}
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              {hasRun ? "Replay Fetch" : "Start Fetch"}
            </Button>

            <Button
              onClick={resetSimulation}
              variant="outline"
              disabled={isRunning}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>

            {metrics.totalRuns > 0 && (
              <Button
                onClick={resetMetrics}
                variant="ghost"
                size="sm"
                className="ml-auto text-muted-foreground"
              >
                Clear Metrics
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Visualization */}
      {(hasRun || sources.length > 0) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4" />
                Fetch Progress
              </div>
              {isRunning && (
                <Badge variant="secondary" className="animate-pulse">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Fetching...
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Source Progress Bars */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {sources.map((source, index) => {
                  const statusDisplay = getStatusDisplay(source.status)
                  const StatusIcon = statusDisplay.icon

                  return (
                    <motion.div
                      key={source.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "p-3 rounded-lg border transition-colors",
                        statusDisplay.bg,
                        source.status === "fetching" && "border-blue-500/30"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <StatusIcon
                            className={cn(
                              "w-4 h-4",
                              statusDisplay.color,
                              source.status === "fetching" && "animate-spin"
                            )}
                          />
                          <span className="text-sm font-medium">{source.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground font-mono">
                            {(source.duration / 1000).toFixed(2)}s
                          </span>
                          <Badge
                            variant={
                              source.status === "success"
                                ? "default"
                                : source.status === "failed" || source.status === "timeout"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-[10px] capitalize"
                          >
                            {source.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="relative">
                        <Progress
                          value={source.progress}
                          className={cn(
                            "h-2",
                            source.status === "failed" && "[&>div]:bg-red-500",
                            source.status === "timeout" && "[&>div]:bg-amber-500",
                            source.status === "success" && "[&>div]:bg-green-500"
                          )}
                        />
                        {source.status === "fetching" && (
                          <motion.div
                            className="absolute top-0 left-0 h-2 w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
                            animate={{ x: ["0%", "400%"] }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                        )}
                      </div>

                      {/* Result or Error Message */}
                      {source.status === "success" && source.result && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-xs text-green-600 dark:text-green-400 mt-2"
                        >
                          ✓ {source.result}
                        </motion.p>
                      )}
                      {source.status === "failed" && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-xs text-red-600 dark:text-red-400 mt-2"
                        >
                          ✗ Connection failed - using fallback data
                        </motion.p>
                      )}
                      {source.status === "timeout" && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-xs text-amber-600 dark:text-amber-400 mt-2"
                        >
                          ⚠ Request timed out after {timeoutDuration}s - proceeding without this source
                        </motion.p>
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* Total Time */}
            {hasRun && (
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">Total Elapsed Time</span>
                <span className="text-lg font-mono font-semibold">
                  {(totalTime / 1000).toFixed(2)}s
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Panel */}
      {hasRun && !isRunning && sources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Fetch Results Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {successCount}
                </div>
                <div className="text-xs text-muted-foreground">Successful</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {failedCount}
                </div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {timeoutCount}
                </div>
                <div className="text-xs text-muted-foreground">Timed Out</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.round((successCount / sources.length) * 100)}%
                </div>
                <div className="text-xs text-muted-foreground">Success Rate</div>
              </div>
            </div>

            {/* Fallback Behavior Explanation */}
            {(failedCount > 0 || timeoutCount > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-lg bg-muted/50 border"
              >
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Graceful Degradation Active
                </h4>
                <p className="text-xs text-muted-foreground">
                  {failedCount + timeoutCount} source(s) were unavailable. The system continues
                  with {successCount} successful sources, using cached or default data for
                  missing context. This demonstrates resilient context engineering - partial
                  results are better than complete failure.
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      {metrics.totalRuns > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="w-4 h-4" />
              Cumulative Performance Metrics
            </CardTitle>
            <CardDescription>
              Aggregated statistics across {metrics.totalRuns} simulation run{metrics.totalRuns !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="text-2xl font-bold">{metrics.totalRuns}</div>
                <div className="text-xs text-muted-foreground">Total Runs</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{metrics.successRate}%</div>
                <div className="text-xs text-muted-foreground">Avg Success Rate</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold font-mono">
                  {(metrics.averageLatency / 1000).toFixed(2)}s
                </div>
                <div className="text-xs text-muted-foreground">Avg Latency</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">
                  {metrics.failureCount + metrics.timeoutCount}
                </div>
                <div className="text-xs text-muted-foreground">Total Failures</div>
              </div>
            </div>

            {/* Insights */}
            <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="text-sm font-medium mb-1">💡 Key Insight</h4>
              <p className="text-xs text-muted-foreground">
                {metrics.successRate >= 80
                  ? "High success rate indicates reliable context sources. Consider reducing timeout for faster responses."
                  : metrics.successRate >= 50
                  ? "Moderate success rate. Implement caching and fallback strategies for unreliable sources."
                  : "Low success rate detected. Review source reliability and consider adding redundant data sources."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
