"use client"

import { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Minimize2,
  Play,
  RotateCcw,
  Copy,
  Check,
  Loader2,
  FileText,
  Sparkles,
  Target,
  BarChart3,
  Zap,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// Sample context about AI/ML topics
const SAMPLE_CONTEXT = `Large Language Models (LLMs) have revolutionized natural language processing by demonstrating remarkable capabilities in understanding and generating human-like text. These models, built on the transformer architecture introduced by Vaswani et al. in 2017, use self-attention mechanisms to process input sequences in parallel, enabling efficient training on massive datasets.

The training process for LLMs typically involves two main phases: pre-training and fine-tuning. During pre-training, the model learns general language patterns from vast amounts of unlabeled text data using objectives like next-token prediction or masked language modeling. This phase requires significant computational resources, often involving thousands of GPUs running for weeks or months.

Fine-tuning adapts the pre-trained model to specific tasks or domains. Techniques like Reinforcement Learning from Human Feedback (RLHF) have proven particularly effective for aligning model outputs with human preferences. This involves training a reward model on human comparisons and then using reinforcement learning to optimize the language model against this reward signal.

Context windows represent a critical limitation of transformer-based models. The attention mechanism has quadratic complexity with respect to sequence length, making it computationally expensive to process very long documents. Recent innovations like sparse attention, sliding window attention, and retrieval-augmented generation (RAG) help mitigate these limitations.

Prompt engineering has emerged as a crucial skill for effectively utilizing LLMs. Techniques include few-shot learning, chain-of-thought prompting, and structured output formatting. The quality of prompts significantly impacts model performance, often more than model size or architecture choices.

Vector embeddings enable semantic search and retrieval by representing text as dense numerical vectors in high-dimensional space. Similar concepts cluster together in this embedding space, allowing for efficient similarity search using algorithms like approximate nearest neighbors (ANN). Popular embedding models include OpenAI's text-embedding-ada-002 and open-source alternatives like sentence-transformers.

Agentic systems combine LLMs with external tools and memory to create autonomous AI assistants. These systems can break down complex tasks, use APIs, search the web, and maintain conversation history. Frameworks like LangChain, AutoGPT, and CrewAI provide abstractions for building such systems.

Safety and alignment remain active research areas. Techniques like constitutional AI, red-teaming, and careful prompt design help reduce harmful outputs. However, challenges persist around hallucination, bias, and misuse potential. Responsible deployment requires ongoing monitoring and human oversight.`

type CompressionMethod = "llmlingua" | "extractive" | "query-focused"

interface CompressionResult {
  compressedText: string
  originalTokens: number
  compressedTokens: number
  compressionRatio: number
  retentionScore: number
  relevanceScore: number
  keptSentences: number[]
}

// Simple token estimation (roughly 4 chars per token for English)
function estimateTokens(text: string): number {
  if (!text) return 0
  // More accurate estimation: split by whitespace and punctuation
  const words = text.split(/\s+/).filter(Boolean)
  // Average English word is ~1.3 tokens
  return Math.ceil(words.length * 1.3)
}

// Split text into sentences
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

// Calculate simple relevance score between query and sentence
function calculateRelevance(sentence: string, query: string): number {
  if (!query) return 0.5
  const queryWords = query.toLowerCase().split(/\s+/)
  const sentenceWords = sentence.toLowerCase().split(/\s+/)
  
  let matches = 0
  for (const qWord of queryWords) {
    if (qWord.length < 3) continue
    for (const sWord of sentenceWords) {
      if (sWord.includes(qWord) || qWord.includes(sWord)) {
        matches++
        break
      }
    }
  }
  
  return Math.min(1, matches / Math.max(1, queryWords.length))
}

// Simulate token importance scoring (LLMLingua-style)
function scoreTokenImportance(sentence: string, query: string): number {
  const baseScore = 0.3 + Math.random() * 0.4
  const relevanceBoost = calculateRelevance(sentence, query) * 0.3
  
  // Boost for sentences with technical terms
  const technicalTerms = [
    "transformer", "attention", "embedding", "LLM", "model", "training",
    "fine-tuning", "RLHF", "RAG", "vector", "prompt", "agent", "API"
  ]
  const hasTechnical = technicalTerms.some((term) =>
    sentence.toLowerCase().includes(term.toLowerCase())
  )
  const technicalBoost = hasTechnical ? 0.15 : 0
  
  return Math.min(1, baseScore + relevanceBoost + technicalBoost)
}

// Simulate compression based on method
function simulateCompression(
  context: string,
  query: string,
  targetRatio: number,
  method: CompressionMethod
): CompressionResult {
  const sentences = splitSentences(context)
  const originalTokens = estimateTokens(context)
  const targetTokens = Math.floor(originalTokens * targetRatio)
  
  // Score each sentence
  const scoredSentences = sentences.map((sentence, index) => {
    let score: number
    
    switch (method) {
      case "llmlingua":
        score = scoreTokenImportance(sentence, query)
        break
      case "extractive":
        // Prefer sentences at beginning and end (primacy/recency)
        const positionScore = index < 2 || index >= sentences.length - 2 ? 0.3 : 0
        score = 0.4 + Math.random() * 0.3 + positionScore
        break
      case "query-focused":
        score = calculateRelevance(sentence, query) * 0.6 + 0.2 + Math.random() * 0.2
        break
      default:
        score = 0.5
    }
    
    return { sentence, index, score, tokens: estimateTokens(sentence) }
  })
  
  // Sort by score and select sentences until we hit target
  const sorted = [...scoredSentences].sort((a, b) => b.score - a.score)
  
  const selected: typeof sorted = []
  let currentTokens = 0
  
  for (const item of sorted) {
    if (currentTokens + item.tokens <= targetTokens) {
      selected.push(item)
      currentTokens += item.tokens
    }
  }
  
  // Sort selected by original order for coherent output
  selected.sort((a, b) => a.index - b.index)
  
  const compressedText = selected.map((s) => s.sentence).join(" ")
  const compressedTokens = estimateTokens(compressedText)
  const keptSentences = selected.map((s) => s.index)
  
  // Calculate quality metrics
  const avgScore = selected.reduce((sum, s) => sum + s.score, 0) / Math.max(1, selected.length)
  const retentionScore = Math.min(100, Math.round(avgScore * 100 + Math.random() * 10))
  
  const relevanceScore = query
    ? Math.min(100, Math.round(
        (selected.reduce((sum, s) => sum + calculateRelevance(s.sentence, query), 0) /
          Math.max(1, selected.length)) * 100 + Math.random() * 15
      ))
    : 75 + Math.round(Math.random() * 15)
  
  return {
    compressedText,
    originalTokens,
    compressedTokens,
    compressionRatio: compressedTokens / originalTokens,
    retentionScore,
    relevanceScore,
    keptSentences,
  }
}

export function ContextCompressionPlayground() {
  const [context, setContext] = useState(SAMPLE_CONTEXT)
  const [query, setQuery] = useState("")
  const [compressionRatio, setCompressionRatio] = useState(0.5)
  const [method, setMethod] = useState<CompressionMethod>("llmlingua")
  const [result, setResult] = useState<CompressionResult | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [copied, setCopied] = useState(false)

  const inputTokens = useMemo(() => estimateTokens(context), [context])
  const sentences = useMemo(() => splitSentences(context), [context])

  const handleCompress = useCallback(async () => {
    setIsCompressing(true)
    setResult(null)
    
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400))
    
    const compressionResult = simulateCompression(context, query, compressionRatio, method)
    setResult(compressionResult)
    setIsCompressing(false)
  }, [context, query, compressionRatio, method])

  const handleReset = useCallback(() => {
    setContext(SAMPLE_CONTEXT)
    setQuery("")
    setCompressionRatio(0.5)
    setResult(null)
  }, [])

  const handleCopy = useCallback(async () => {
    if (result?.compressedText) {
      await navigator.clipboard.writeText(result.compressedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [result])

  const methodDescriptions: Record<CompressionMethod, string> = {
    llmlingua: "Scores token importance using perplexity-based metrics",
    extractive: "Selects most informative sentences based on position and content",
    "query-focused": "Prioritizes content relevant to your specific query",
  }

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Minimize2 className="h-5 w-5 text-primary" />
          Context Compression Playground
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Experiment with different compression strategies to fit large contexts into token budgets
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="context-input">Context Input</Label>
              <span className="text-xs text-muted-foreground font-mono">
                ~{inputTokens.toLocaleString()} tokens
              </span>
            </div>
            <Textarea
              id="context-input"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Paste your context here (up to ~5000 tokens)..."
              className="min-h-[150px] font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="query-input">Query (for query-focused compression)</Label>
            <Input
              id="query-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., How do transformers handle long sequences?"
              className="font-mono text-sm"
            />
          </div>
        </div>

        {/* Compression Controls */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Target Compression Ratio</Label>
              <span className="text-sm font-mono text-primary">
                {(compressionRatio * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              value={[compressionRatio]}
              onValueChange={([value]) => setCompressionRatio(value)}
              min={0.2}
              max={0.8}
              step={0.05}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Keep ~{Math.round(inputTokens * compressionRatio).toLocaleString()} of {inputTokens.toLocaleString()} tokens
            </p>
          </div>

          <div className="space-y-2">
            <Label>Compression Method</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as CompressionMethod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="llmlingua">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    LLMLingua-style
                  </div>
                </SelectItem>
                <SelectItem value="extractive">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Extractive Summarization
                  </div>
                </SelectItem>
                <SelectItem value="query-focused">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Query-Focused
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{methodDescriptions[method]}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleCompress}
            disabled={isCompressing || !context.trim()}
            className="flex-1"
          >
            {isCompressing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Compressing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Compress
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Side-by-Side Comparison */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Quality Metrics */}
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-lg border bg-muted/30 p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                    <FileText className="h-3 w-3" />
                    Original
                  </div>
                  <div className="text-lg font-bold font-mono">
                    {result.originalTokens.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">tokens</div>
                </div>
                
                <div className="rounded-lg border bg-primary/10 border-primary/30 p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                    <Minimize2 className="h-3 w-3" />
                    Compressed
                  </div>
                  <div className="text-lg font-bold font-mono text-primary">
                    {result.compressedTokens.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">tokens</div>
                </div>
                
                <div className="rounded-lg border bg-muted/30 p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                    <BarChart3 className="h-3 w-3" />
                    Retention
                  </div>
                  <div className={cn(
                    "text-lg font-bold font-mono",
                    result.retentionScore >= 80 ? "text-green-500" :
                    result.retentionScore >= 60 ? "text-yellow-500" : "text-red-500"
                  )}>
                    {result.retentionScore}%
                  </div>
                  <div className="text-xs text-muted-foreground">info kept</div>
                </div>
                
                <div className="rounded-lg border bg-muted/30 p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                    <Target className="h-3 w-3" />
                    Relevance
                  </div>
                  <div className={cn(
                    "text-lg font-bold font-mono",
                    result.relevanceScore >= 80 ? "text-green-500" :
                    result.relevanceScore >= 60 ? "text-yellow-500" : "text-red-500"
                  )}>
                    {result.relevanceScore}%
                  </div>
                  <div className="text-xs text-muted-foreground">to query</div>
                </div>
              </div>

              {/* Compression Efficiency Banner */}
              <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <span className="font-medium">Compression Achieved</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-primary font-mono">
                    {((1 - result.compressionRatio) * 100).toFixed(0)}%
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">
                    reduction ({result.originalTokens - result.compressedTokens} tokens saved)
                  </span>
                </div>
              </div>

              {/* Side-by-Side Panels */}
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Original Context */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Original Context
                    </Label>
                    <span className="text-xs text-muted-foreground font-mono">
                      {sentences.length} sentences
                    </span>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3 max-h-[300px] overflow-y-auto">
                    <div className="text-sm leading-relaxed space-y-1">
                      {sentences.map((sentence, index) => (
                        <span
                          key={index}
                          className={cn(
                            "inline",
                            result.keptSentences.includes(index)
                              ? "bg-green-500/20 text-foreground"
                              : "text-muted-foreground/60 line-through decoration-muted-foreground/30"
                          )}
                        >
                          {sentence}{" "}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="inline-block w-3 h-3 bg-green-500/20 rounded mr-1" />
                    Highlighted = kept,{" "}
                    <span className="line-through text-muted-foreground/60">strikethrough</span> = removed
                  </p>
                </div>

                {/* Compressed Context */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Minimize2 className="h-4 w-4 text-primary" />
                      Compressed Context
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="h-7 text-xs"
                    >
                      {copied ? (
                        <>
                          <Check className="mr-1 h-3 w-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 h-3 w-3" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 max-h-[300px] overflow-y-auto">
                    <p className="text-sm leading-relaxed">
                      {result.compressedText}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {result.keptSentences.length} of {sentences.length} sentences retained
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!result && !isCompressing && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <Minimize2 className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              Click &quot;Compress&quot; to see the compression results
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Try different methods and ratios to compare results
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
