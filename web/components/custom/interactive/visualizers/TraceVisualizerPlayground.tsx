"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Clock,
  Cpu,
  MessageSquare,
  Wrench,
  Eye,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface TraceSpan {
  id: string
  name: string
  type: "llm" | "tool" | "agent" | "retrieval"
  startTime: number
  duration: number
  status: "pending" | "running" | "success" | "error"
  input?: string
  output?: string
  tokens?: { input: number; output: number }
  children?: TraceSpan[]
  metadata?: Record<string, string | number>
}

const SAMPLE_TRACE: TraceSpan = {
  id: "root",
  name: "Research Agent",
  type: "agent",
  startTime: 0,
  duration: 4500,
  status: "success",
  children: [
    {
      id: "llm-1",
      name: "Plan Generation",
      type: "llm",
      startTime: 100,
      duration: 800,
      status: "success",
      input: "Research the latest developments in quantum computing",
      output: "I'll search for recent quantum computing news and papers...",
      tokens: { input: 45, output: 120 },
    },
    {
      id: "tool-1",
      name: "web_search",
      type: "tool",
      startTime: 950,
      duration: 1200,
      status: "success",
      input: '{"query": "quantum computing breakthroughs 2025"}',
      output: '{"results": [{"title": "IBM unveils 1000-qubit processor"...}]}',
      metadata: { results_count: 5 },
    },
    {
      id: "retrieval-1",
      name: "RAG Retrieval",
      type: "retrieval",
      startTime: 2200,
      duration: 400,
      status: "success",
      input: "quantum computing error correction",
      output: "Retrieved 3 relevant documents",
      metadata: { docs_retrieved: 3, similarity: 0.89 },
    },
    {
      id: "llm-2",
      name: "Synthesis",
      type: "llm",
      startTime: 2650,
      duration: 1500,
      status: "success",
      input: "Synthesize findings from search results and retrieved documents...",
      output: "Based on my research, here are the key developments in quantum computing...",
      tokens: { input: 2500, output: 850 },
    },
  ],
}

const SPAN_COLORS = {
  llm: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-500" },
  tool: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-500" },
  agent: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-500" },
  retrieval: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-500" },
}

const SPAN_ICONS = {
  llm: Cpu,
  tool: Wrench,
  agent: MessageSquare,
  retrieval: Eye,
}

export function TraceVisualizerPlayground() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [selectedSpan, setSelectedSpan] = useState<TraceSpan | null>(null)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  const totalDuration = SAMPLE_TRACE.duration

  const getSpanStatus = useCallback((span: TraceSpan): TraceSpan["status"] => {
    if (currentTime < span.startTime) return "pending"
    if (currentTime < span.startTime + span.duration) return "running"
    return span.status
  }, [currentTime])

  const togglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false)
    } else {
      if (currentTime >= totalDuration) {
        setCurrentTime(0)
      }
      setIsPlaying(true)
      const interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 50 * playbackSpeed
          if (next >= totalDuration) {
            clearInterval(interval)
            setIsPlaying(false)
            return totalDuration
          }
          return next
        })
      }, 50)
    }
  }

  const reset = () => {
    setIsPlaying(false)
    setCurrentTime(0)
    setSelectedSpan(null)
  }

  const exportTrace = () => {
    const blob = new Blob([JSON.stringify(SAMPLE_TRACE, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "trace-export.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const renderSpan = (span: TraceSpan, depth: number = 0) => {
    const status = getSpanStatus(span)
    const colors = SPAN_COLORS[span.type]
    const Icon = SPAN_ICONS[span.type]
    const progress = status === "running"
      ? ((currentTime - span.startTime) / span.duration) * 100
      : status === "success" || status === "error" ? 100 : 0

    return (
      <div key={span.id} className="space-y-2">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            "p-3 rounded-lg border cursor-pointer transition-all",
            colors.bg,
            colors.border,
            selectedSpan?.id === span.id && "ring-2 ring-primary",
            status === "pending" && "opacity-50"
          )}
          style={{ marginLeft: depth * 24 }}
          onClick={() => setSelectedSpan(span)}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Icon className={cn("h-4 w-4", colors.text)} />
              <span className="font-medium text-sm">{span.name}</span>
              <Badge variant="outline" className="text-xs">
                {span.type}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {status === "running" && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Clock className="h-3 w-3 text-muted-foreground" />
                </motion.div>
              )}
              {status === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
              {status === "error" && <AlertCircle className="h-4 w-4 text-red-500" />}
              <span className="text-xs text-muted-foreground font-mono">
                {span.duration}ms
              </span>
            </div>
          </div>
          {status !== "pending" && (
            <Progress value={progress} className="h-1 mt-2" />
          )}
        </motion.div>
        {span.children?.map((child) => renderSpan(child, depth + 1))}
      </div>
    )
  }

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          Trace Visualizer Playground
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={togglePlayback} variant={isPlaying ? "destructive" : "default"} className="gap-2">
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button onClick={reset} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button onClick={exportTrace} variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export JSON
          </Button>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">Speed:</span>
            {[0.5, 1, 2].map((speed) => (
              <Button
                key={speed}
                size="sm"
                variant={playbackSpeed === speed ? "default" : "outline"}
                onClick={() => setPlaybackSpeed(speed)}
              >
                {speed}x
              </Button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-mono">{currentTime.toFixed(0)}ms</span>
            <span className="font-mono text-muted-foreground">{totalDuration}ms</span>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-primary rounded-full"
              style={{ width: `${(currentTime / totalDuration) * 100}%` }}
            />
            {SAMPLE_TRACE.children?.map((span) => (
              <div
                key={span.id}
                className={cn("absolute top-0 h-full opacity-30", SPAN_COLORS[span.type].bg.replace("/10", ""))}
                style={{
                  left: `${(span.startTime / totalDuration) * 100}%`,
                  width: `${(span.duration / totalDuration) * 100}%`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Trace Tree */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              Trace Spans
            </h4>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {renderSpan(SAMPLE_TRACE)}
            </div>
          </div>

          {/* Span Details */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Span Details</h4>
            <AnimatePresence mode="wait">
              {selectedSpan ? (
                <motion.div
                  key={selectedSpan.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <div className={cn("p-4 rounded-lg border", SPAN_COLORS[selectedSpan.type].bg, SPAN_COLORS[selectedSpan.type].border)}>
                    <div className="flex items-center gap-2 mb-3">
                      {(() => {
                        const Icon = SPAN_ICONS[selectedSpan.type]
                        return <Icon className={cn("h-5 w-5", SPAN_COLORS[selectedSpan.type].text)} />
                      })()}
                      <span className="font-semibold">{selectedSpan.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Start:</span>
                        <span className="ml-2 font-mono">{selectedSpan.startTime}ms</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="ml-2 font-mono">{selectedSpan.duration}ms</span>
                      </div>
                    </div>
                  </div>

                  {selectedSpan.input && (
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Input</span>
                      <pre className="p-2 rounded bg-muted text-xs overflow-x-auto max-h-24">
                        {selectedSpan.input}
                      </pre>
                    </div>
                  )}

                  {selectedSpan.output && (
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Output</span>
                      <pre className="p-2 rounded bg-muted text-xs overflow-x-auto max-h-24">
                        {selectedSpan.output}
                      </pre>
                    </div>
                  )}

                  {selectedSpan.tokens && (
                    <div className="flex gap-4 text-sm">
                      <div className="p-2 rounded bg-muted/50">
                        <span className="text-muted-foreground">Input tokens:</span>
                        <span className="ml-2 font-mono">{selectedSpan.tokens.input}</span>
                      </div>
                      <div className="p-2 rounded bg-muted/50">
                        <span className="text-muted-foreground">Output tokens:</span>
                        <span className="ml-2 font-mono">{selectedSpan.tokens.output}</span>
                      </div>
                    </div>
                  )}

                  {selectedSpan.metadata && (
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Metadata</span>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedSpan.metadata).map(([key, value]) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            {key}: {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 text-center text-muted-foreground text-sm border rounded-lg border-dashed"
                >
                  Click on a span to view details
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="text-2xl font-bold">{SAMPLE_TRACE.children?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Total Spans</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="text-2xl font-bold">{totalDuration}ms</div>
            <div className="text-xs text-muted-foreground">Total Duration</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="text-2xl font-bold">
              {SAMPLE_TRACE.children?.reduce((acc, s) => acc + (s.tokens?.input || 0) + (s.tokens?.output || 0), 0) || 0}
            </div>
            <div className="text-xs text-muted-foreground">Total Tokens</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="text-2xl font-bold text-green-500">100%</div>
            <div className="text-xs text-muted-foreground">Success Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
