"use client"

import { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Sparkles, Hash, Combine, Eye, EyeOff } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// Sample corpus of AI/ML documents
const SAMPLE_DOCUMENTS = [
  {
    id: "doc1",
    title: "Introduction to Neural Networks",
    content: "Neural networks are computing systems inspired by biological neural networks. They consist of layers of interconnected nodes that process information using connectionist approaches to computation.",
    keywords: ["neural", "networks", "deep learning", "layers", "nodes", "computation"]
  },
  {
    id: "doc2",
    title: "Transformer Architecture Explained",
    content: "The transformer architecture revolutionized NLP with self-attention mechanisms. Unlike RNNs, transformers process all tokens in parallel, enabling efficient training on large datasets.",
    keywords: ["transformer", "attention", "NLP", "parallel", "tokens", "architecture"]
  },
  {
    id: "doc3",
    title: "Vector Embeddings for Search",
    content: "Vector embeddings represent text as dense numerical vectors in high-dimensional space. Similar concepts cluster together, enabling semantic search beyond keyword matching.",
    keywords: ["vector", "embeddings", "semantic", "search", "similarity", "dense"]
  },
  {
    id: "doc4",
    title: "BM25 Ranking Algorithm",
    content: "BM25 is a probabilistic ranking function used in information retrieval. It considers term frequency, inverse document frequency, and document length normalization.",
    keywords: ["BM25", "ranking", "TF-IDF", "retrieval", "probabilistic", "frequency"]
  },
  {
    id: "doc5",
    title: "Retrieval Augmented Generation",
    content: "RAG combines retrieval systems with generative models. It retrieves relevant documents and uses them as context for generating accurate, grounded responses.",
    keywords: ["RAG", "retrieval", "generation", "context", "grounded", "documents"]
  },
  {
    id: "doc6",
    title: "Fine-tuning Large Language Models",
    content: "Fine-tuning adapts pre-trained models to specific tasks. Techniques include full fine-tuning, LoRA, and prompt tuning for efficient adaptation.",
    keywords: ["fine-tuning", "LLM", "LoRA", "adaptation", "pre-trained", "prompt"]
  },
  {
    id: "doc7",
    title: "Hybrid Search Strategies",
    content: "Hybrid search combines dense vector retrieval with sparse keyword matching. Reciprocal Rank Fusion merges results from multiple retrieval methods effectively.",
    keywords: ["hybrid", "search", "RRF", "fusion", "dense", "sparse"]
  },
  {
    id: "doc8",
    title: "Attention Mechanisms Deep Dive",
    content: "Attention allows models to focus on relevant parts of input. Self-attention, cross-attention, and multi-head attention are key variants in modern architectures.",
    keywords: ["attention", "self-attention", "multi-head", "focus", "mechanisms", "models"]
  },
  {
    id: "doc9",
    title: "Semantic Similarity Metrics",
    content: "Cosine similarity measures the angle between vectors. Other metrics include Euclidean distance, dot product, and learned similarity functions for retrieval.",
    keywords: ["cosine", "similarity", "distance", "metrics", "vectors", "semantic"]
  },
  {
    id: "doc10",
    title: "Query Expansion Techniques",
    content: "Query expansion improves retrieval by adding related terms. Methods include synonym expansion, pseudo-relevance feedback, and neural query rewriting.",
    keywords: ["query", "expansion", "synonyms", "rewriting", "feedback", "retrieval"]
  }
]

const SAMPLE_QUERIES = [
  "How do transformers use attention?",
  "vector search similarity",
  "BM25 ranking algorithm",
  "hybrid retrieval fusion",
  "neural network architecture",
  "semantic embeddings search"
]

interface SearchResult {
  docId: string
  title: string
  snippet: string
  score: number
  rank: number
}

interface FusedResult extends SearchResult {
  vectorRank?: number
  keywordRank?: number
  vectorScore?: number
  keywordScore?: number
  rrfScore: number
}

// Simulate vector similarity scores based on semantic overlap
function simulateVectorSearch(query: string, docs: typeof SAMPLE_DOCUMENTS): SearchResult[] {
  const queryTerms = query.toLowerCase().split(/\s+/)
  
  const results = docs.map(doc => {
    const contentLower = doc.content.toLowerCase()
    const titleLower = doc.title.toLowerCase()
    
    // Simulate semantic similarity with some randomness for realism
    let score = 0
    queryTerms.forEach(term => {
      if (contentLower.includes(term)) score += 0.15
      if (titleLower.includes(term)) score += 0.2
      // Check for semantic related terms
      doc.keywords.forEach(kw => {
        if (kw.toLowerCase().includes(term) || term.includes(kw.toLowerCase())) {
          score += 0.1
        }
      })
    })
    
    // Add some variance to simulate embedding similarity
    score = Math.min(0.98, score + Math.random() * 0.1)
    
    return {
      docId: doc.id,
      title: doc.title,
      snippet: doc.content.slice(0, 120) + "...",
      score: parseFloat(score.toFixed(3)),
      rank: 0
    }
  })
  
  // Sort by score and assign ranks
  results.sort((a, b) => b.score - a.score)
  results.forEach((r, i) => r.rank = i + 1)
  
  return results.slice(0, 8)
}

// Simulate BM25 keyword search scores
function simulateKeywordSearch(query: string, docs: typeof SAMPLE_DOCUMENTS): SearchResult[] {
  const queryTerms = query.toLowerCase().split(/\s+/)
  
  const results = docs.map(doc => {
    const contentLower = doc.content.toLowerCase()
    const titleLower = doc.title.toLowerCase()
    
    // Simulate BM25 scoring
    let score = 0
    queryTerms.forEach(term => {
      // Term frequency component
      const tfContent = (contentLower.match(new RegExp(term, 'g')) || []).length
      const tfTitle = (titleLower.match(new RegExp(term, 'g')) || []).length
      
      // IDF-like boost for less common terms
      const idfBoost = term.length > 5 ? 1.5 : 1.0
      
      score += (tfContent * 0.8 + tfTitle * 2.0) * idfBoost
    })
    
    // Normalize to reasonable BM25 range
    score = Math.min(15, score * 1.5)
    
    return {
      docId: doc.id,
      title: doc.title,
      snippet: doc.content.slice(0, 120) + "...",
      score: parseFloat(score.toFixed(2)),
      rank: 0
    }
  })
  
  // Sort by score and assign ranks
  results.sort((a, b) => b.score - a.score)
  results.forEach((r, i) => r.rank = i + 1)
  
  return results.filter(r => r.score > 0).slice(0, 8)
}

// Reciprocal Rank Fusion
function computeRRF(
  vectorResults: SearchResult[],
  keywordResults: SearchResult[],
  k: number
): FusedResult[] {
  const scores: Map<string, FusedResult> = new Map()
  
  // Process vector results
  vectorResults.forEach((result) => {
    const rrfContribution = 1 / (k + result.rank)
    const existing = scores.get(result.docId)
    
    if (existing) {
      existing.rrfScore += rrfContribution
      existing.vectorRank = result.rank
      existing.vectorScore = result.score
    } else {
      scores.set(result.docId, {
        ...result,
        vectorRank: result.rank,
        vectorScore: result.score,
        rrfScore: rrfContribution
      })
    }
  })
  
  // Process keyword results
  keywordResults.forEach((result) => {
    const rrfContribution = 1 / (k + result.rank)
    const existing = scores.get(result.docId)
    
    if (existing) {
      existing.rrfScore += rrfContribution
      existing.keywordRank = result.rank
      existing.keywordScore = result.score
    } else {
      scores.set(result.docId, {
        ...result,
        keywordRank: result.rank,
        keywordScore: result.score,
        rrfScore: rrfContribution
      })
    }
  })
  
  // Sort by RRF score
  const fusedResults = Array.from(scores.values())
  fusedResults.sort((a, b) => b.rrfScore - a.rrfScore)
  fusedResults.forEach((r, i) => r.rank = i + 1)
  
  return fusedResults
}

export function HybridSearchVisualizer() {
  const [query, setQuery] = useState("")
  const [searchExecuted, setSearchExecuted] = useState(false)
  const [kParam, setKParam] = useState(60)
  const [showScores, setShowScores] = useState(true)
  const [comparisonMode, setComparisonMode] = useState<"hybrid" | "vector" | "keyword">("hybrid")

  const vectorResults = useMemo(() => {
    if (!searchExecuted || !query.trim()) return []
    return simulateVectorSearch(query, SAMPLE_DOCUMENTS)
  }, [query, searchExecuted])

  const keywordResults = useMemo(() => {
    if (!searchExecuted || !query.trim()) return []
    return simulateKeywordSearch(query, SAMPLE_DOCUMENTS)
  }, [query, searchExecuted])

  const fusedResults = useMemo(() => {
    if (!searchExecuted || !query.trim()) return []
    return computeRRF(vectorResults, keywordResults, kParam)
  }, [vectorResults, keywordResults, kParam, searchExecuted, query])

  const handleSearch = useCallback(() => {
    if (!query.trim()) return
    setSearchExecuted(true)
  }, [query])

  const handleSampleQuery = useCallback((sampleQuery: string) => {
    setQuery(sampleQuery)
    setSearchExecuted(false)
  }, [])

  return (
    <div className="my-8 space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Combine className="w-5 h-5 text-primary" />
            Hybrid Search Visualizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSearchExecuted(false)
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Enter a search query..."
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={!query.trim()}>
              Search
            </Button>
          </div>

          {/* Sample Queries */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Try:</span>
            {SAMPLE_QUERIES.map((sq) => (
              <button
                key={sq}
                onClick={() => handleSampleQuery(sq)}
                className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              >
                {sq}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-6">
            {/* K Parameter Slider */}
            <div className="flex-1 min-w-[200px] space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">RRF k parameter</span>
                <span className="font-mono font-medium">{kParam}</span>
              </div>
              <Slider
                value={[kParam]}
                onValueChange={([v]) => setKParam(v)}
                min={1}
                max={100}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                Higher k reduces the impact of rank differences
              </p>
            </div>

            {/* Show Scores Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowScores(!showScores)}
              className="gap-2"
            >
              {showScores ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showScores ? "Hide" : "Show"} Scores
            </Button>

            {/* Comparison Mode */}
            <Tabs value={comparisonMode} onValueChange={(v) => setComparisonMode(v as typeof comparisonMode)}>
              <TabsList>
                <TabsTrigger value="hybrid">Hybrid</TabsTrigger>
                <TabsTrigger value="vector">Vector Only</TabsTrigger>
                <TabsTrigger value="keyword">Keyword Only</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <AnimatePresence mode="wait">
        {searchExecuted && query.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Dual Result Panels */}
            {comparisonMode === "hybrid" && (
              <div className="grid md:grid-cols-2 gap-4">
                {/* Vector Search Results */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      Vector Search
                      <span className="text-xs font-normal text-muted-foreground ml-auto">
                        Similarity Scores (0-1)
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {vectorResults.slice(0, 5).map((result, idx) => (
                      <motion.div
                        key={result.docId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono bg-purple-500/20 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded">
                                #{result.rank}
                              </span>
                              <span className="font-medium text-sm truncate">{result.title}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {result.snippet}
                            </p>
                          </div>
                          {showScores && (
                            <div className="text-right shrink-0">
                              <div className="text-sm font-mono font-bold text-purple-600 dark:text-purple-400">
                                {result.score.toFixed(3)}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>

                {/* Keyword Search Results */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Hash className="w-4 h-4 text-orange-500" />
                      Keyword Search (BM25)
                      <span className="text-xs font-normal text-muted-foreground ml-auto">
                        BM25 Scores
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {keywordResults.slice(0, 5).map((result, idx) => (
                      <motion.div
                        key={result.docId}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono bg-orange-500/20 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded">
                                #{result.rank}
                              </span>
                              <span className="font-medium text-sm truncate">{result.title}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {result.snippet}
                            </p>
                          </div>
                          {showScores && (
                            <div className="text-right shrink-0">
                              <div className="text-sm font-mono font-bold text-orange-600 dark:text-orange-400">
                                {result.score.toFixed(2)}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Single Mode Results */}
            {comparisonMode !== "hybrid" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {comparisonMode === "vector" ? (
                      <>
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        Vector Search Results
                      </>
                    ) : (
                      <>
                        <Hash className="w-4 h-4 text-orange-500" />
                        Keyword Search Results (BM25)
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(comparisonMode === "vector" ? vectorResults : keywordResults).map((result, idx) => (
                    <motion.div
                      key={result.docId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={cn(
                        "p-3 rounded-lg border",
                        comparisonMode === "vector"
                          ? "bg-purple-500/5 border-purple-500/20"
                          : "bg-orange-500/5 border-orange-500/20"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-xs font-mono px-1.5 py-0.5 rounded",
                              comparisonMode === "vector"
                                ? "bg-purple-500/20 text-purple-600 dark:text-purple-400"
                                : "bg-orange-500/20 text-orange-600 dark:text-orange-400"
                            )}>
                              #{result.rank}
                            </span>
                            <span className="font-medium text-sm">{result.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {result.snippet}
                          </p>
                        </div>
                        {showScores && (
                          <div className={cn(
                            "text-sm font-mono font-bold",
                            comparisonMode === "vector"
                              ? "text-purple-600 dark:text-purple-400"
                              : "text-orange-600 dark:text-orange-400"
                          )}>
                            {result.score.toFixed(comparisonMode === "vector" ? 3 : 2)}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* RRF Fusion Visualization */}
            {comparisonMode === "hybrid" && (
              <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Combine className="w-5 h-5 text-primary" />
                    Reciprocal Rank Fusion (RRF)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Formula Display */}
                  <div className="p-4 rounded-lg bg-muted/50 font-mono text-sm">
                    <div className="text-center mb-2 text-muted-foreground">RRF Formula:</div>
                    <div className="text-center text-lg">
                      RRF(d) = Σ <span className="text-primary">1 / (k + rank(d))</span>
                    </div>
                    <div className="text-center text-xs text-muted-foreground mt-2">
                      where k = {kParam} (adjustable above)
                    </div>
                  </div>

                  {/* Animated Score Contributions */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Combined Rankings with Score Contributions
                    </h4>
                    {fusedResults.slice(0, 6).map((result, idx) => (
                      <motion.div
                        key={result.docId}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + idx * 0.15 }}
                        className="p-4 rounded-lg bg-card border border-primary/20"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.7 + idx * 0.15, type: "spring" }}
                                className="text-sm font-mono bg-primary text-primary-foreground px-2 py-0.5 rounded font-bold"
                              >
                                #{result.rank}
                              </motion.span>
                              <span className="font-medium">{result.title}</span>
                            </div>
                            
                            {showScores && (
                              <div className="flex flex-wrap gap-3 text-xs">
                                {result.vectorRank && (
                                  <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 + idx * 0.15 }}
                                    className="flex items-center gap-1"
                                  >
                                    <Sparkles className="w-3 h-3 text-purple-500" />
                                    <span className="text-muted-foreground">Vector rank #{result.vectorRank}:</span>
                                    <span className="font-mono text-purple-600 dark:text-purple-400">
                                      1/({kParam}+{result.vectorRank}) = {(1 / (kParam + result.vectorRank)).toFixed(4)}
                                    </span>
                                  </motion.div>
                                )}
                                {result.keywordRank && (
                                  <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.9 + idx * 0.15 }}
                                    className="flex items-center gap-1"
                                  >
                                    <Hash className="w-3 h-3 text-orange-500" />
                                    <span className="text-muted-foreground">Keyword rank #{result.keywordRank}:</span>
                                    <span className="font-mono text-orange-600 dark:text-orange-400">
                                      1/({kParam}+{result.keywordRank}) = {(1 / (kParam + result.keywordRank)).toFixed(4)}
                                    </span>
                                  </motion.div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1 + idx * 0.15, type: "spring" }}
                            className="text-right"
                          >
                            <div className="text-xs text-muted-foreground mb-1">RRF Score</div>
                            <div className="text-lg font-mono font-bold text-primary">
                              {result.rrfScore.toFixed(4)}
                            </div>
                          </motion.div>
                        </div>

                        {/* Score Bar Visualization */}
                        {showScores && (
                          <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden flex">
                            {result.vectorRank && (
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ 
                                  width: `${(1 / (kParam + result.vectorRank)) / result.rrfScore * 100}%` 
                                }}
                                transition={{ delay: 1.1 + idx * 0.15, duration: 0.5 }}
                                className="h-full bg-purple-500"
                              />
                            )}
                            {result.keywordRank && (
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ 
                                  width: `${(1 / (kParam + result.keywordRank)) / result.rrfScore * 100}%` 
                                }}
                                transition={{ delay: 1.2 + idx * 0.15, duration: 0.5 }}
                                className="h-full bg-orange-500"
                              />
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex justify-center gap-6 pt-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-purple-500" />
                      <span className="text-muted-foreground">Vector contribution</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-orange-500" />
                      <span className="text-muted-foreground">Keyword contribution</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!searchExecuted && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              Enter a search query above to see how hybrid search combines vector and keyword results
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
