"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Zap,
  Brain,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface ClassificationResult {
  stage: "keyword" | "ml"
  classification: "simple" | "complex" | "research" | "code" | "analysis"
  confidence: number
  matchedKeywords?: string[]
  reasoning: string
  routedTo: string
}

const KEYWORD_PATTERNS: Record<string, { keywords: string[]; classification: ClassificationResult["classification"]; routedTo: string }> = {
  simple: {
    keywords: ["hello", "hi", "thanks", "bye", "help", "what time", "weather"],
    classification: "simple",
    routedTo: "Fast Response Agent",
  },
  code: {
    keywords: ["code", "function", "bug", "error", "debug", "implement", "refactor", "typescript", "python", "javascript"],
    classification: "code",
    routedTo: "Code Agent",
  },
  research: {
    keywords: ["research", "find", "search", "look up", "what is", "explain", "compare", "analyze trends"],
    classification: "research",
    routedTo: "Research Agent",
  },
  analysis: {
    keywords: ["analyze", "data", "statistics", "chart", "graph", "metrics", "performance", "benchmark"],
    classification: "analysis",
    routedTo: "Analysis Agent",
  },
}

const SAMPLE_QUERIES = [
  "Hello, how are you?",
  "Can you help me debug this Python function?",
  "Research the latest trends in AI agents",
  "Analyze the performance metrics from last month",
  "What's the difference between RAG and fine-tuning?",
  "Implement a binary search algorithm in TypeScript",
]

export function RequestClassifierDemo() {
  const [query, setQuery] = useState("")
  const [isClassifying, setIsClassifying] = useState(false)
  const [result, setResult] = useState<ClassificationResult | null>(null)
  const [stage1Complete, setStage1Complete] = useState(false)

  const classifyQuery = useCallback(async (inputQuery: string) => {
    setIsClassifying(true)
    setResult(null)
    setStage1Complete(false)

    const lowerQuery = inputQuery.toLowerCase()

    // Stage 1: Keyword matching
    await new Promise(r => setTimeout(r, 500))

    for (const [, pattern] of Object.entries(KEYWORD_PATTERNS)) {
      const matchedKeywords = pattern.keywords.filter(kw => lowerQuery.includes(kw))
      if (matchedKeywords.length > 0) {
        setStage1Complete(true)
        await new Promise(r => setTimeout(r, 300))
        
        setResult({
          stage: "keyword",
          classification: pattern.classification,
          confidence: Math.min(0.95, 0.7 + matchedKeywords.length * 0.1),
          matchedKeywords,
          reasoning: `Matched keywords: ${matchedKeywords.join(", ")}`,
          routedTo: pattern.routedTo,
        })
        setIsClassifying(false)
        return
      }
    }

    setStage1Complete(true)
    
    // Stage 2: ML classification (simulated)
    await new Promise(r => setTimeout(r, 1000))

    // Simulate ML classification based on query characteristics
    let classification: ClassificationResult["classification"] = "complex"
    let routedTo = "Orchestrator Agent"
    let confidence = 0.75

    if (lowerQuery.includes("?") && lowerQuery.split(" ").length < 10) {
      classification = "simple"
      routedTo = "Fast Response Agent"
      confidence = 0.82
    } else if (lowerQuery.length > 100) {
      classification = "complex"
      routedTo = "Orchestrator Agent"
      confidence = 0.88
    }

    setResult({
      stage: "ml",
      classification,
      confidence,
      reasoning: "No keyword matches found. Used ML model for semantic classification.",
      routedTo,
    })
    setIsClassifying(false)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      classifyQuery(query)
    }
  }

  const getClassificationColor = (classification: ClassificationResult["classification"]) => {
    switch (classification) {
      case "simple": return "bg-green-500/10 text-green-500 border-green-500/30"
      case "code": return "bg-blue-500/10 text-blue-500 border-blue-500/30"
      case "research": return "bg-purple-500/10 text-purple-500 border-purple-500/30"
      case "analysis": return "bg-amber-500/10 text-amber-500 border-amber-500/30"
      case "complex": return "bg-pink-500/10 text-pink-500 border-pink-500/30"
    }
  }

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Request Classifier Demo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter a query to classify..."
            disabled={isClassifying}
            className="flex-1"
          />
          <Button type="submit" disabled={isClassifying || !query.trim()}>
            {isClassifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Classify"}
          </Button>
        </form>

        {/* Sample Queries */}
        <div className="space-y-2">
          <span className="text-sm text-muted-foreground">Try these examples:</span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUERIES.map((sample, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery(sample)
                  classifyQuery(sample)
                }}
                disabled={isClassifying}
                className="text-xs"
              >
                {sample.length > 30 ? sample.slice(0, 30) + "..." : sample}
              </Button>
            ))}
          </div>
        </div>

        {/* Classification Pipeline */}
        {(isClassifying || result) && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Classification Pipeline</h4>
            
            <div className="flex items-center gap-4">
              {/* Stage 1: Keyword */}
              <div className={cn(
                "flex-1 p-4 rounded-lg border transition-all",
                isClassifying && !stage1Complete && "border-primary bg-primary/5",
                stage1Complete && result?.stage === "keyword" && "border-green-500 bg-green-500/5",
                stage1Complete && result?.stage === "ml" && "border-muted bg-muted/50"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4" />
                  <span className="font-medium text-sm">Stage 1: Keyword Match</span>
                  {isClassifying && !stage1Complete && (
                    <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                  )}
                  {stage1Complete && result?.stage === "keyword" && (
                    <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                  )}
                  {stage1Complete && result?.stage === "ml" && (
                    <AlertCircle className="h-4 w-4 text-muted-foreground ml-auto" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Fast pattern matching against known keywords
                </p>
                {result?.stage === "keyword" && result.matchedKeywords && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {result.matchedKeywords.map((kw, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-green-500/10">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />

              {/* Stage 2: ML */}
              <div className={cn(
                "flex-1 p-4 rounded-lg border transition-all",
                isClassifying && stage1Complete && result?.stage !== "keyword" && "border-primary bg-primary/5",
                result?.stage === "ml" && "border-green-500 bg-green-500/5",
                result?.stage === "keyword" && "opacity-50"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4" />
                  <span className="font-medium text-sm">Stage 2: ML Classification</span>
                  {isClassifying && stage1Complete && !result && (
                    <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                  )}
                  {result?.stage === "ml" && (
                    <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Semantic analysis for complex queries
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className={cn(
                "p-4 rounded-lg border",
                getClassificationColor(result.classification)
              )}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Badge className={cn("capitalize", getClassificationColor(result.classification))}>
                      {result.classification}
                    </Badge>
                    <span className="text-sm ml-2">
                      via {result.stage === "keyword" ? "Keyword Match" : "ML Model"}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {(result.confidence * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Confidence</div>
                  </div>
                </div>

                <Progress value={result.confidence * 100} className="h-2 mb-3" />

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Reasoning: </span>
                    {result.reasoning}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Routed to:</span>
                    <Badge variant="outline">{result.routedTo}</Badge>
                  </div>
                </div>
              </div>

              {/* Performance Note */}
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <span className="font-medium">Performance: </span>
                <span className="text-muted-foreground">
                  {result.stage === "keyword" 
                    ? "Fast path (~50ms) - keyword match avoided ML inference"
                    : "Slow path (~500ms) - required ML model for classification"}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
