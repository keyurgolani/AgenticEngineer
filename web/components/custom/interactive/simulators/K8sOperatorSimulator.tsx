"use client"

import { useState, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import {
  Server,
  Activity,
  Cpu,
  HardDrive,
  AlertTriangle,
  CheckCircle,
  Play,
  RotateCcw,
  Gauge,
  Zap,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface PerformanceMetrics {
  latency: number
  memoryUsage: number
  cpuUsage: number
  throughput: number
  queueDepth: number
}

interface SimulationConfig {
  eventRate: number
  complexity: "simple" | "medium" | "complex"
  concurrentIncidents: number
}

const COMPLEXITY_MULTIPLIERS = {
  simple: { latency: 1, memory: 1, cpu: 1 },
  medium: { latency: 2.5, memory: 1.8, cpu: 2 },
  complex: { latency: 5, memory: 3, cpu: 4 },
}

export function K8sOperatorSimulator() {
  const [config, setConfig] = useState<SimulationConfig>({
    eventRate: 10,
    complexity: "medium",
    concurrentIncidents: 3,
  })
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [incidentFlow, setIncidentFlow] = useState<number[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const calculateMetrics = useCallback((cfg: SimulationConfig): PerformanceMetrics => {
    const mult = COMPLEXITY_MULTIPLIERS[cfg.complexity]
    
    const baseLatency = 50 // ms
    const latency = baseLatency * mult.latency * (1 + cfg.eventRate / 50) * (1 + cfg.concurrentIncidents / 10)
    
    const baseMemory = 256 // MB
    const memoryUsage = baseMemory + (cfg.eventRate * 5 * mult.memory) + (cfg.concurrentIncidents * 50)
    
    const baseCpu = 10 // %
    const cpuUsage = Math.min(100, baseCpu + (cfg.eventRate * mult.cpu) + (cfg.concurrentIncidents * 8))
    
    const maxThroughput = 100 / mult.latency
    const throughput = Math.min(maxThroughput, cfg.eventRate * (1 - cpuUsage / 200))
    
    const queueDepth = Math.max(0, cfg.eventRate - throughput) * cfg.concurrentIncidents

    return {
      latency: Math.round(latency),
      memoryUsage: Math.round(memoryUsage),
      cpuUsage: Math.round(cpuUsage),
      throughput: Math.round(throughput * 10) / 10,
      queueDepth: Math.round(queueDepth),
    }
  }, [])

  const runSimulation = useCallback(() => {
    setIsSimulating(true)
    setIncidentFlow([])
    
    let step = 0
    intervalRef.current = setInterval(() => {
      step++
      setIncidentFlow(prev => [...prev.slice(-20), step])
      setMetrics(calculateMetrics(config))
      
      if (step >= 30) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setIsSimulating(false)
      }
    }, 200)
  }, [config, calculateMetrics])

  const stopSimulation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setIsSimulating(false)
  }

  const reset = () => {
    stopSimulation()
    setMetrics(null)
    setIncidentFlow([])
  }

  const getStatusColor = (value: number, thresholds: { good: number; warn: number }) => {
    if (value <= thresholds.good) return "text-green-500"
    if (value <= thresholds.warn) return "text-amber-500"
    return "text-red-500"
  }

  const getStatusBg = (value: number, thresholds: { good: number; warn: number }) => {
    if (value <= thresholds.good) return "bg-green-500"
    if (value <= thresholds.warn) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5 text-primary" />
          K8s Operator Performance Simulator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Event Rate: {config.eventRate} events/sec</Label>
            <Slider
              value={[config.eventRate]}
              onValueChange={([v]) => setConfig(c => ({ ...c, eventRate: v }))}
              min={1}
              max={100}
              step={1}
              disabled={isSimulating}
            />
          </div>
          <div className="space-y-2">
            <Label>Diagnosis Complexity</Label>
            <Select
              value={config.complexity}
              onValueChange={(v) => setConfig(c => ({ ...c, complexity: v as SimulationConfig["complexity"] }))}
              disabled={isSimulating}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple (pod restarts)</SelectItem>
                <SelectItem value="medium">Medium (resource issues)</SelectItem>
                <SelectItem value="complex">Complex (multi-service)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Concurrent Incidents: {config.concurrentIncidents}</Label>
            <Slider
              value={[config.concurrentIncidents]}
              onValueChange={([v]) => setConfig(c => ({ ...c, concurrentIncidents: v }))}
              min={1}
              max={20}
              step={1}
              disabled={isSimulating}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          {!isSimulating ? (
            <Button onClick={runSimulation} className="gap-2">
              <Play className="h-4 w-4" /> Run Stress Test
            </Button>
          ) : (
            <Button onClick={stopSimulation} variant="destructive" className="gap-2">
              Stop
            </Button>
          )}
          <Button onClick={reset} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>

        {/* Incident Flow Visualization */}
        {incidentFlow.length > 0 && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Incident Pipeline Flow
            </Label>
            <div className="h-16 bg-muted rounded-lg overflow-hidden flex items-end gap-0.5 p-2">
              {incidentFlow.map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${30 + Math.random() * 70}%` }}
                  className={cn(
                    "flex-1 rounded-t",
                    metrics && metrics.cpuUsage > 80 ? "bg-red-500" :
                    metrics && metrics.cpuUsage > 50 ? "bg-amber-500" : "bg-green-500"
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* Metrics Display */}
        {metrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 lg:grid-cols-5 gap-4"
          >
            {/* Latency */}
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Latency</span>
              </div>
              <div className={cn("text-2xl font-bold", getStatusColor(metrics.latency, { good: 100, warn: 300 }))}>
                {metrics.latency}ms
              </div>
              <Progress 
                value={Math.min(100, metrics.latency / 5)} 
                className={cn("h-1.5 mt-2", `[&>div]:${getStatusBg(metrics.latency, { good: 100, warn: 300 })}`)}
              />
            </div>

            {/* Memory */}
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Memory</span>
              </div>
              <div className={cn("text-2xl font-bold", getStatusColor(metrics.memoryUsage, { good: 512, warn: 1024 }))}>
                {metrics.memoryUsage}MB
              </div>
              <Progress 
                value={Math.min(100, metrics.memoryUsage / 20)} 
                className="h-1.5 mt-2"
              />
            </div>

            {/* CPU */}
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">CPU</span>
              </div>
              <div className={cn("text-2xl font-bold", getStatusColor(metrics.cpuUsage, { good: 50, warn: 80 }))}>
                {metrics.cpuUsage}%
              </div>
              <Progress 
                value={metrics.cpuUsage} 
                className={cn("h-1.5 mt-2", metrics.cpuUsage > 80 && "[&>div]:bg-red-500")}
              />
            </div>

            {/* Throughput */}
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Throughput</span>
              </div>
              <div className="text-2xl font-bold text-primary">
                {metrics.throughput}/s
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                events processed
              </div>
            </div>

            {/* Queue Depth */}
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Queue</span>
              </div>
              <div className={cn("text-2xl font-bold", getStatusColor(metrics.queueDepth, { good: 5, warn: 20 }))}>
                {metrics.queueDepth}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                pending events
              </div>
            </div>
          </motion.div>
        )}

        {/* Status Summary */}
        {metrics && (
          <div className={cn(
            "p-4 rounded-lg border flex items-center gap-3",
            metrics.cpuUsage > 80 || metrics.queueDepth > 20 
              ? "bg-red-500/10 border-red-500/30" 
              : metrics.cpuUsage > 50 || metrics.queueDepth > 5
              ? "bg-amber-500/10 border-amber-500/30"
              : "bg-green-500/10 border-green-500/30"
          )}>
            {metrics.cpuUsage > 80 || metrics.queueDepth > 20 ? (
              <>
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <div className="font-medium text-red-500">Operator Overloaded</div>
                  <div className="text-sm text-muted-foreground">
                    Consider scaling horizontally or reducing event rate
                  </div>
                </div>
              </>
            ) : metrics.cpuUsage > 50 || metrics.queueDepth > 5 ? (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <div>
                  <div className="font-medium text-amber-500">Approaching Limits</div>
                  <div className="text-sm text-muted-foreground">
                    Monitor closely, may need optimization
                  </div>
                </div>
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium text-green-500">Healthy Operation</div>
                  <div className="text-sm text-muted-foreground">
                    Operator can handle current load
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
