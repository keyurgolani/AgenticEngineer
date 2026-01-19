"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import {
  User,
  Bot,
  Keyboard,
  Mouse,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  Play,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface KeystrokeMetrics {
  avgInterval: number
  variance: number
  wpm: number
  pauseCount: number
}

interface MouseMetrics {
  avgSpeed: number
  pathLength: number
  straightness: number
  clickCount: number
}

interface BehaviorProfile {
  keystroke: KeystrokeMetrics
  mouse: MouseMetrics
  anomalyScore: number
  verdict: "legitimate" | "suspicious" | "bot"
}

export function BehaviorSimulator() {
  const [mode, setMode] = useState<"legitimate" | "bot">("legitimate")
  const [isRecording, setIsRecording] = useState(false)
  const [text, setText] = useState("")
  const [keystrokes, setKeystrokes] = useState<number[]>([])
  const [mousePositions, setMousePositions] = useState<{ x: number; y: number; t: number }[]>([])
  const [profile, setProfile] = useState<BehaviorProfile | null>(null)
  
  const lastKeystrokeRef = useRef<number>(0)
  const mouseAreaRef = useRef<HTMLDivElement>(null)
  const botIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const calculateProfile = useCallback((): BehaviorProfile => {
    // Keystroke analysis
    const intervals = keystrokes.slice(1).map((t, i) => t - keystrokes[i])
    const avgInterval = intervals.length > 0 
      ? intervals.reduce((a, b) => a + b, 0) / intervals.length 
      : 0
    const variance = intervals.length > 0
      ? Math.sqrt(intervals.reduce((acc, i) => acc + Math.pow(i - avgInterval, 2), 0) / intervals.length)
      : 0
    const totalTime = keystrokes.length > 1 ? (keystrokes[keystrokes.length - 1] - keystrokes[0]) / 1000 / 60 : 1
    const wpm = text.split(/\s+/).filter(Boolean).length / Math.max(totalTime, 0.01)
    const pauseCount = intervals.filter(i => i > 500).length

    // Mouse analysis
    let pathLength = 0
    let straightLineDistance = 0
    const speeds: number[] = []
    
    for (let i = 1; i < mousePositions.length; i++) {
      const dx = mousePositions[i].x - mousePositions[i - 1].x
      const dy = mousePositions[i].y - mousePositions[i - 1].y
      const dt = mousePositions[i].t - mousePositions[i - 1].t
      const dist = Math.sqrt(dx * dx + dy * dy)
      pathLength += dist
      if (dt > 0) speeds.push(dist / dt * 1000)
    }

    if (mousePositions.length > 1) {
      const first = mousePositions[0]
      const last = mousePositions[mousePositions.length - 1]
      straightLineDistance = Math.sqrt(
        Math.pow(last.x - first.x, 2) + Math.pow(last.y - first.y, 2)
      )
    }

    const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0
    const straightness = pathLength > 0 ? straightLineDistance / pathLength : 0

    // Calculate anomaly score
    let anomalyScore = 0
    
    // Low variance = suspicious
    if (variance < 20) anomalyScore += 25
    else if (variance < 35) anomalyScore += 10
    
    // Very fast typing = suspicious
    if (wpm > 100) anomalyScore += 25
    else if (wpm > 80) anomalyScore += 10
    
    // No pauses = suspicious
    if (pauseCount === 0 && text.length > 20) anomalyScore += 20
    
    // Very straight mouse paths = suspicious
    if (straightness > 0.9) anomalyScore += 20
    else if (straightness > 0.8) anomalyScore += 10
    
    // Very fast mouse = suspicious
    if (avgSpeed > 1000) anomalyScore += 10

    const verdict: BehaviorProfile["verdict"] = 
      anomalyScore >= 60 ? "bot" : anomalyScore >= 35 ? "suspicious" : "legitimate"

    return {
      keystroke: { avgInterval, variance, wpm, pauseCount },
      mouse: { avgSpeed, pathLength, straightness, clickCount: 0 },
      anomalyScore,
      verdict,
    }
  }, [keystrokes, mousePositions, text])

  const handleKeyDown = useCallback(() => {
    if (!isRecording) return
    const now = Date.now()
    setKeystrokes(prev => [...prev, now])
    lastKeystrokeRef.current = now
  }, [isRecording])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isRecording || !mouseAreaRef.current) return
    const rect = mouseAreaRef.current.getBoundingClientRect()
    setMousePositions(prev => [...prev, {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      t: Date.now(),
    }])
  }, [isRecording])

  const simulateBot = useCallback(() => {
    const sampleText = "The quick brown fox jumps over the lazy dog. This is automated typing."
    let index = 0
    
    botIntervalRef.current = setInterval(() => {
      if (index < sampleText.length) {
        setText(prev => prev + sampleText[index])
        setKeystrokes(prev => [...prev, Date.now()])
        index++
      } else {
        if (botIntervalRef.current) clearInterval(botIntervalRef.current)
        setIsRecording(false)
        setProfile(calculateProfile())
      }
    }, 50 + Math.random() * 10) // Very consistent timing

    // Simulate straight-line mouse movement
    let mouseX = 50
    const mouseInterval = setInterval(() => {
      if (mouseX < 350) {
        setMousePositions(prev => [...prev, { x: mouseX, y: 100, t: Date.now() }])
        mouseX += 10
      } else {
        clearInterval(mouseInterval)
      }
    }, 30)
  }, [calculateProfile])

  const startRecording = () => {
    setText("")
    setKeystrokes([])
    setMousePositions([])
    setProfile(null)
    setIsRecording(true)

    if (mode === "bot") {
      simulateBot()
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    if (botIntervalRef.current) clearInterval(botIntervalRef.current)
    setProfile(calculateProfile())
  }

  const reset = () => {
    setIsRecording(false)
    if (botIntervalRef.current) clearInterval(botIntervalRef.current)
    setText("")
    setKeystrokes([])
    setMousePositions([])
    setProfile(null)
  }

  useEffect(() => {
    return () => {
      if (botIntervalRef.current) clearInterval(botIntervalRef.current)
    }
  }, [])

  const getVerdictColor = (verdict: BehaviorProfile["verdict"]) => {
    switch (verdict) {
      case "legitimate": return "text-green-500"
      case "suspicious": return "text-amber-500"
      case "bot": return "text-red-500"
    }
  }

  const getVerdictBg = (verdict: BehaviorProfile["verdict"]) => {
    switch (verdict) {
      case "legitimate": return "bg-green-500/10 border-green-500/30"
      case "suspicious": return "bg-amber-500/10 border-amber-500/30"
      case "bot": return "bg-red-500/10 border-red-500/30"
    }
  }

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Keyboard className="h-5 w-5 text-primary" />
          Behavioral Biometrics Simulator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode Selection */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Mode:</span>
          <div className="flex gap-2">
            <Button
              variant={mode === "legitimate" ? "default" : "outline"}
              onClick={() => { setMode("legitimate"); reset() }}
              className="gap-2"
            >
              <User className="h-4 w-4" /> Legitimate User
            </Button>
            <Button
              variant={mode === "bot" ? "default" : "outline"}
              onClick={() => { setMode("bot"); reset() }}
              className="gap-2"
            >
              <Bot className="h-4 w-4" /> Bot/Fraudster
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          {!isRecording ? (
            <Button onClick={startRecording} className="gap-2">
              <Play className="h-4 w-4" /> Start Recording
            </Button>
          ) : (
            <Button onClick={stopRecording} variant="destructive" className="gap-2">
              Stop & Analyze
            </Button>
          )}
          <Button onClick={reset} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>

        {/* Input Areas */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Typing Area */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Keyboard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Typing Area</span>
              {isRecording && <Badge variant="outline" className="animate-pulse">Recording</Badge>}
            </div>
            <Textarea
              value={text}
              onChange={(e) => mode === "legitimate" && setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={mode === "legitimate" 
                ? "Type something here to analyze your typing patterns..." 
                : "Bot will type automatically..."}
              disabled={mode === "bot" || !isRecording}
              className="min-h-[120px] font-mono"
            />
            <div className="text-xs text-muted-foreground">
              Characters: {text.length} | Keystrokes: {keystrokes.length}
            </div>
          </div>

          {/* Mouse Tracking Area */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mouse className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Mouse Tracking Area</span>
            </div>
            <div
              ref={mouseAreaRef}
              onMouseMove={handleMouseMove}
              className={cn(
                "relative h-[120px] rounded-lg border-2 border-dashed overflow-hidden",
                isRecording ? "border-primary bg-primary/5" : "border-muted"
              )}
            >
              {mousePositions.length > 1 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <path
                    d={mousePositions.map((p, i) => 
                      `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
                    ).join(' ')}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    strokeOpacity="0.5"
                  />
                </svg>
              )}
              <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                {isRecording ? "Move mouse here" : "Start recording first"}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Points recorded: {mousePositions.length}
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Verdict */}
            <div className={cn("p-4 rounded-lg border", getVerdictBg(profile.verdict))}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {profile.verdict === "legitimate" ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <AlertTriangle className={cn("h-6 w-6", getVerdictColor(profile.verdict))} />
                  )}
                  <div>
                    <div className={cn("font-semibold capitalize", getVerdictColor(profile.verdict))}>
                      {profile.verdict} Behavior Detected
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Anomaly Score: {profile.anomalyScore.toFixed(0)}%
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{profile.anomalyScore.toFixed(0)}</div>
                  <div className="text-xs text-muted-foreground">Risk Score</div>
                </div>
              </div>
              <Progress 
                value={profile.anomalyScore} 
                className={cn("h-2 mt-3", profile.anomalyScore > 60 && "[&>div]:bg-red-500")} 
              />
            </div>

            {/* Metrics Comparison */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Keystroke Metrics */}
              <div className="p-4 rounded-lg border space-y-3">
                <div className="flex items-center gap-2">
                  <Keyboard className="h-4 w-4" />
                  <span className="font-medium">Keystroke Analysis</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Interval</span>
                    <span className="font-mono">{profile.keystroke.avgInterval.toFixed(0)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Variance</span>
                    <span className={cn("font-mono", profile.keystroke.variance < 20 && "text-red-500")}>
                      {profile.keystroke.variance.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">WPM</span>
                    <span className={cn("font-mono", profile.keystroke.wpm > 100 && "text-red-500")}>
                      {profile.keystroke.wpm.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pauses</span>
                    <span className={cn("font-mono", profile.keystroke.pauseCount === 0 && text.length > 20 && "text-red-500")}>
                      {profile.keystroke.pauseCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mouse Metrics */}
              <div className="p-4 rounded-lg border space-y-3">
                <div className="flex items-center gap-2">
                  <Mouse className="h-4 w-4" />
                  <span className="font-medium">Mouse Analysis</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Speed</span>
                    <span className={cn("font-mono", profile.mouse.avgSpeed > 1000 && "text-red-500")}>
                      {profile.mouse.avgSpeed.toFixed(0)} px/s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Path Length</span>
                    <span className="font-mono">{profile.mouse.pathLength.toFixed(0)} px</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Straightness</span>
                    <span className={cn("font-mono", profile.mouse.straightness > 0.9 && "text-red-500")}>
                      {(profile.mouse.straightness * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Baseline Comparison */}
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <span className="font-medium">Reference: </span>
              <span className="text-muted-foreground">
                Legitimate users typically have keystroke variance &gt;40, WPM 30-60, and mouse straightness &lt;70%.
                Bots show low variance (&lt;20), high WPM (&gt;100), and very straight mouse paths (&gt;90%).
              </span>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
