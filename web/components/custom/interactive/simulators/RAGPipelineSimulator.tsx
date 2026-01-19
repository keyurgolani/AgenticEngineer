"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText,
  Search,
  Cpu,
  Play,
  RotateCcw,
  ChevronRight,
  Loader2,
  CheckCircle,
  Settings,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface Chunk {
  id: string
  text: string
  startChar: number
  endChar: number
  tokens: number
}

interface RetrievedChunk extends Chunk {
  similarity: number
}

interface PipelineStep {
  id: string
  name: string
  status: "pending" | "running" | "complete"
  output?: string
}

const SAMPLE_DOCUMENTS = {
  "ai-agents": `AI agents are autonomous systems that can perceive their environment, make decisions, and take actions to achieve specific goals. Unlike traditional software that follows predetermined rules, agents can adapt their behavior based on context and learning.

The key components of an AI agent include: perception (gathering information from the environment), reasoning (processing information and making decisions), action (executing tasks and interacting with the world), and memory (storing and retrieving past experiences).

Modern AI agents often use Large Language Models (LLMs) as their reasoning engine. These LLM-powered agents can understand natural language instructions, break down complex tasks into subtasks, use tools and APIs, and learn from feedback.

Popular frameworks for building AI agents include LangChain, LangGraph, AutoGPT, and CrewAI. Each framework offers different approaches to agent orchestration, memory management, and tool integration.`,

  "rag-systems": `Retrieval-Augmented Generation (RAG) is a technique that enhances LLM responses by retrieving relevant information from external knowledge bases. This approach helps reduce hallucinations and keeps responses grounded in factual data.

The RAG pipeline consists of several stages: document ingestion (loading and preprocessing documents), chunking (splitting documents into smaller pieces), embedding (converting text to vector representations), indexing (storing vectors in a database), retrieval (finding relevant chunks for a query), and generation (using retrieved context to generate responses).

Chunking strategies significantly impact RAG performance. Fixed-size chunking splits text at regular intervals, while semantic chunking preserves meaning by splitting at natural boundaries. Recursive chunking combines both approaches for optimal results.

Vector databases like Pinecone, Weaviate, and ChromaDB store embeddings and enable fast similarity search. The choice of embedding model also affects retrieval quality - popular options include OpenAI's text-embedding-3, Cohere's embed-v3, and open-source models like BGE and E5.`,

  "prompt-engineering": `Prompt engineering is the practice of designing effective prompts to get desired outputs from language models. Good prompts are clear, specific, and provide appropriate context for the task at hand.

Key techniques include: zero-shot prompting (asking directly without examples), few-shot prompting (providing examples of desired input-output pairs), chain-of-thought (asking the model to show its reasoning), and role prompting (assigning a persona to the model).

System prompts set the overall behavior and constraints for the model. They typically include the model's role, capabilities, limitations, and output format requirements. Well-crafted system prompts can significantly improve response quality and consistency.

Advanced techniques like self-consistency (generating multiple responses and selecting the most common answer) and tree-of-thought (exploring multiple reasoning paths) can further improve performance on complex tasks.`,
}

export function RAGPipelineSimulator() {
  const [selectedDoc, setSelectedDoc] = useState<keyof typeof SAMPLE_DOCUMENTS>("ai-agents")
  const [chunkSize, setChunkSize] = useState(500)
  const [chunkOverlap, setChunkOverlap] = useState(50)
  const [topK, setTopK] = useState(3)
  const [query, setQuery] = useState("How do AI agents make decisions?")
  const [chunks, setChunks] = useState<Chunk[]>([])
  const [retrievedChunks, setRetrievedChunks] = useState<RetrievedChunk[]>([])
  const [generatedResponse, setGeneratedResponse] = useState("")
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [showSettings, setShowSettings] = useState(true)

  const document = SAMPLE_DOCUMENTS[selectedDoc]

  const chunkDocument = useCallback((text: string, size: number, overlap: number): Chunk[] => {
    const result: Chunk[] = []
    let start = 0
    let id = 1

    while (start < text.length) {
      const end = Math.min(start + size, text.length)
      let chunkEnd = end

      // Try to break at sentence boundary
      if (end < text.length) {
        const lastPeriod = text.lastIndexOf(".", end)
        if (lastPeriod > start + size / 2) {
          chunkEnd = lastPeriod + 1
        }
      }

      const chunkText = text.slice(start, chunkEnd).trim()
      if (chunkText) {
        result.push({
          id: `chunk-${id++}`,
          text: chunkText,
          startChar: start,
          endChar: chunkEnd,
          tokens: Math.ceil(chunkText.split(/\s+/).length * 1.3), // Rough token estimate
        })
      }

      start = chunkEnd - overlap
      if (start >= text.length - overlap) break
    }

    return result
  }, [])

  const simulateSimilarity = (chunk: Chunk, queryText: string): number => {
    const chunkWords = new Set(chunk.text.toLowerCase().split(/\W+/))
    const queryWords = queryText.toLowerCase().split(/\W+/)
    const matches = queryWords.filter(w => chunkWords.has(w)).length
    const base = matches / queryWords.length
    return Math.min(0.95, base + Math.random() * 0.3)
  }

  const runPipeline = useCallback(async () => {
    setIsRunning(true)
    setChunks([])
    setRetrievedChunks([])
    setGeneratedResponse("")
    
    const steps: PipelineStep[] = [
      { id: "1", name: "Chunking Document", status: "pending" },
      { id: "2", name: "Generating Embeddings", status: "pending" },
      { id: "3", name: "Retrieving Relevant Chunks", status: "pending" },
      { id: "4", name: "Generating Response", status: "pending" },
    ]
    setPipelineSteps(steps)

    // Step 1: Chunking
    setPipelineSteps(s => s.map(step => step.id === "1" ? { ...step, status: "running" } : step))
    await new Promise(r => setTimeout(r, 800))
    const newChunks = chunkDocument(document, chunkSize, chunkOverlap)
    setChunks(newChunks)
    setPipelineSteps(s => s.map(step => 
      step.id === "1" ? { ...step, status: "complete", output: `Created ${newChunks.length} chunks` } : step
    ))

    // Step 2: Embeddings
    setPipelineSteps(s => s.map(step => step.id === "2" ? { ...step, status: "running" } : step))
    await new Promise(r => setTimeout(r, 1000))
    setPipelineSteps(s => s.map(step => 
      step.id === "2" ? { ...step, status: "complete", output: `Generated ${newChunks.length} embeddings (1536 dims)` } : step
    ))

    // Step 3: Retrieval
    setPipelineSteps(s => s.map(step => step.id === "3" ? { ...step, status: "running" } : step))
    await new Promise(r => setTimeout(r, 600))
    const withSimilarity = newChunks
      .map(chunk => ({ ...chunk, similarity: simulateSimilarity(chunk, query) }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
    setRetrievedChunks(withSimilarity)
    setPipelineSteps(s => s.map(step => 
      step.id === "3" ? { ...step, status: "complete", output: `Retrieved top ${topK} chunks (max similarity: ${withSimilarity[0]?.similarity.toFixed(2)})` } : step
    ))

    // Step 4: Generation
    setPipelineSteps(s => s.map(step => step.id === "4" ? { ...step, status: "running" } : step))
    await new Promise(r => setTimeout(r, 1500))
    
    const response = `Based on the retrieved context, AI agents make decisions through their reasoning component, which processes information gathered from their environment. Modern AI agents typically use Large Language Models (LLMs) as their reasoning engine, allowing them to understand natural language, break down complex tasks, and adapt their behavior based on context.

The decision-making process involves:
1. Perceiving the current state and gathering relevant information
2. Processing this information through the reasoning engine
3. Considering past experiences stored in memory
4. Selecting appropriate actions to achieve goals

This approach differs from traditional rule-based systems because agents can handle novel situations and learn from feedback.`
    
    setGeneratedResponse(response)
    setPipelineSteps(s => s.map(step => 
      step.id === "4" ? { ...step, status: "complete", output: `Generated response (${response.split(/\s+/).length} words)` } : step
    ))

    setIsRunning(false)
  }, [document, chunkSize, chunkOverlap, topK, query, chunkDocument])

  const reset = () => {
    setChunks([])
    setRetrievedChunks([])
    setGeneratedResponse("")
    setPipelineSteps([])
    setIsRunning(false)
  }

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          RAG Pipeline Simulator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Settings Toggle */}
        <Button
          variant="outline"
          onClick={() => setShowSettings(!showSettings)}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          {showSettings ? "Hide" : "Show"} Settings
        </Button>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4 overflow-hidden"
            >
              <div className="grid md:grid-cols-2 gap-4">
                {/* Document Selection */}
                <div className="space-y-2">
                  <Label>Sample Document</Label>
                  <Select value={selectedDoc} onValueChange={(v) => setSelectedDoc(v as keyof typeof SAMPLE_DOCUMENTS)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ai-agents">AI Agents Overview</SelectItem>
                      <SelectItem value="rag-systems">RAG Systems</SelectItem>
                      <SelectItem value="prompt-engineering">Prompt Engineering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Top K */}
                <div className="space-y-2">
                  <Label>Top K Results: {topK}</Label>
                  <Slider
                    value={[topK]}
                    onValueChange={([v]) => setTopK(v)}
                    min={1}
                    max={5}
                    step={1}
                  />
                </div>

                {/* Chunk Size */}
                <div className="space-y-2">
                  <Label>Chunk Size: {chunkSize} chars</Label>
                  <Slider
                    value={[chunkSize]}
                    onValueChange={([v]) => setChunkSize(v)}
                    min={200}
                    max={1000}
                    step={50}
                  />
                </div>

                {/* Overlap */}
                <div className="space-y-2">
                  <Label>Chunk Overlap: {chunkOverlap} chars</Label>
                  <Slider
                    value={[chunkOverlap]}
                    onValueChange={([v]) => setChunkOverlap(v)}
                    min={0}
                    max={200}
                    step={10}
                  />
                </div>
              </div>

              {/* Document Preview */}
              <div className="space-y-2">
                <Label>Document Preview ({document.length} chars)</Label>
                <Textarea
                  value={document}
                  readOnly
                  className="h-32 text-xs font-mono"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Query Input */}
        <div className="space-y-2">
          <Label>Query</Label>
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your question..."
              disabled={isRunning}
            />
            <Button onClick={runPipeline} disabled={isRunning || !query} className="gap-2">
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Run
            </Button>
            <Button onClick={reset} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Pipeline Steps */}
        {pipelineSteps.length > 0 && (
          <div className="space-y-2">
            <Label>Pipeline Progress</Label>
            <div className="flex gap-2">
              {pipelineSteps.map((step, i) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm",
                      step.status === "running" && "border-primary bg-primary/5",
                      step.status === "complete" && "border-green-500/30 bg-green-500/5",
                      step.status === "pending" && "opacity-50"
                    )}
                  >
                    {step.status === "running" && <Loader2 className="h-4 w-4 animate-spin" />}
                    {step.status === "complete" && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {step.status === "pending" && <div className="h-4 w-4 rounded-full border-2" />}
                    <span className="hidden md:inline">{step.name}</span>
                    <span className="md:hidden">{i + 1}</span>
                  </div>
                  {i < pipelineSteps.length - 1 && (
                    <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Chunks */}
          {chunks.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Chunks ({chunks.length})
              </Label>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {chunks.map((chunk, i) => {
                  const isRetrieved = retrievedChunks.some(r => r.id === chunk.id)
                  const retrieved = retrievedChunks.find(r => r.id === chunk.id)
                  return (
                    <motion.div
                      key={chunk.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "p-2 rounded border text-xs",
                        isRetrieved ? "border-primary bg-primary/5" : "border-muted"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-[10px]">
                          Chunk {i + 1}
                        </Badge>
                        <span className="text-muted-foreground">~{chunk.tokens} tokens</span>
                      </div>
                      <p className="line-clamp-2">{chunk.text}</p>
                      {retrieved && (
                        <div className="mt-1 text-primary font-medium">
                          Similarity: {(retrieved.similarity * 100).toFixed(1)}%
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Retrieved Context */}
          {retrievedChunks.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Retrieved Context (Top {topK})
              </Label>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {retrievedChunks.map((chunk, i) => (
                  <motion.div
                    key={chunk.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3 rounded border border-primary/30 bg-primary/5"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="text-xs">#{i + 1}</Badge>
                      <span className="text-sm font-medium text-primary">
                        {(chunk.similarity * 100).toFixed(1)}% match
                      </span>
                    </div>
                    <p className="text-sm">{chunk.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Generated Response */}
        {generatedResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <Label className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Generated Response
            </Label>
            <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/5">
              <p className="text-sm whitespace-pre-wrap">{generatedResponse}</p>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        {chunks.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-xl font-bold">{chunks.length}</div>
              <div className="text-xs text-muted-foreground">Total Chunks</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-xl font-bold">{chunks.reduce((a, c) => a + c.tokens, 0)}</div>
              <div className="text-xs text-muted-foreground">Total Tokens</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-xl font-bold">{retrievedChunks.length}</div>
              <div className="text-xs text-muted-foreground">Retrieved</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-xl font-bold">
                {retrievedChunks[0] ? `${(retrievedChunks[0].similarity * 100).toFixed(0)}%` : "-"}
              </div>
              <div className="text-xs text-muted-foreground">Best Match</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
