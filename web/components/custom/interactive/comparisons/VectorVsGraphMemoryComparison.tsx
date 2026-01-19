"use client"

import { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Database,
  GitBranch,
  Search,
  Zap,
  Clock,
  Target,
  ArrowRight,
  RotateCcw,
  Play,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// Types
interface Entity {
  id: string
  name: string
  type: "person" | "project" | "organization" | "concept"
}

interface Relationship {
  from: string
  to: string
  type: string
}

interface VectorPoint {
  id: string
  text: string
  x: number
  y: number
  similarity?: number
}

interface QueryResult {
  vectorResults: { text: string; similarity: number; hops: number }[]
  graphResults: { text: string; path: string[]; hops: number }[]
  vectorTime: number
  graphTime: number
}

// Pre-loaded example knowledge bases
const EXAMPLE_KNOWLEDGE_BASES = {
  workplace: {
    name: "Workplace Relationships",
    text: "Alice works with Bob. Bob reports to Carol. Carol manages the Engineering team. Alice works on Project X. Project X is part of the AI Initiative. Bob also works on Project X. David mentors Alice. David reports to Carol.",
  },
  academic: {
    name: "Academic Network",
    text: "Dr. Smith teaches Machine Learning. Dr. Smith advises Sarah. Sarah researches Neural Networks. Neural Networks is a topic in Machine Learning. Dr. Jones collaborates with Dr. Smith. Dr. Jones teaches Data Science. Mike is a student of Dr. Jones.",
  },
  product: {
    name: "Product Dependencies",
    text: "Frontend depends on API Gateway. API Gateway connects to Auth Service. Auth Service uses Redis Cache. Backend depends on API Gateway. Backend connects to PostgreSQL. PostgreSQL stores User Data. Redis Cache improves Auth Service performance.",
  },
}

// Sample queries for each knowledge base
const SAMPLE_QUERIES = {
  workplace: [
    "Who does Alice work with?",
    "What is Carol's role?",
    "How is Alice connected to Carol?",
    "What projects involve Bob?",
  ],
  academic: [
    "Who teaches Machine Learning?",
    "What does Sarah research?",
    "How is Mike connected to Dr. Smith?",
    "What topics are related to Neural Networks?",
  ],
  product: [
    "What does Frontend depend on?",
    "How does Auth Service work?",
    "What connects to PostgreSQL?",
    "What improves performance?",
  ],
}

// Parse knowledge base text into entities and relationships
function parseKnowledgeBase(text: string): { entities: Entity[]; relationships: Relationship[] } {
  const entities: Map<string, Entity> = new Map()
  const relationships: Relationship[] = []
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim())
  
  // Common relationship patterns
  const patterns = [
    { regex: /(\w+(?:\s+\w+)?)\s+works\s+with\s+(\w+(?:\s+\w+)?)/i, type: "works_with" },
    { regex: /(\w+(?:\s+\w+)?)\s+reports\s+to\s+(\w+(?:\s+\w+)?)/i, type: "reports_to" },
    { regex: /(\w+(?:\s+\w+)?)\s+manages\s+(?:the\s+)?(\w+(?:\s+\w+)?)/i, type: "manages" },
    { regex: /(\w+(?:\s+\w+)?)\s+works\s+on\s+(\w+(?:\s+\w+)?)/i, type: "works_on" },
    { regex: /(\w+(?:\s+\w+)?)\s+is\s+part\s+of\s+(?:the\s+)?(\w+(?:\s+\w+)?)/i, type: "part_of" },
    { regex: /(\w+(?:\s+\w+)?)\s+mentors\s+(\w+(?:\s+\w+)?)/i, type: "mentors" },
    { regex: /(\w+(?:\s+\w+)?)\s+teaches\s+(\w+(?:\s+\w+)?)/i, type: "teaches" },
    { regex: /(\w+(?:\s+\w+)?)\s+advises\s+(\w+(?:\s+\w+)?)/i, type: "advises" },
    { regex: /(\w+(?:\s+\w+)?)\s+researches\s+(\w+(?:\s+\w+)?)/i, type: "researches" },
    { regex: /(\w+(?:\s+\w+)?)\s+is\s+a\s+topic\s+in\s+(\w+(?:\s+\w+)?)/i, type: "topic_in" },
    { regex: /(\w+(?:\s+\w+)?)\s+collaborates\s+with\s+(\w+(?:\s+\w+)?)/i, type: "collaborates_with" },
    { regex: /(\w+(?:\s+\w+)?)\s+is\s+a\s+student\s+of\s+(\w+(?:\s+\w+)?)/i, type: "student_of" },
    { regex: /(\w+(?:\s+\w+)?)\s+depends\s+on\s+(\w+(?:\s+\w+)?)/i, type: "depends_on" },
    { regex: /(\w+(?:\s+\w+)?)\s+connects\s+to\s+(\w+(?:\s+\w+)?)/i, type: "connects_to" },
    { regex: /(\w+(?:\s+\w+)?)\s+uses\s+(\w+(?:\s+\w+)?)/i, type: "uses" },
    { regex: /(\w+(?:\s+\w+)?)\s+stores\s+(\w+(?:\s+\w+)?)/i, type: "stores" },
    { regex: /(\w+(?:\s+\w+)?)\s+improves\s+(\w+(?:\s+\w+)?)/i, type: "improves" },
  ]
  
  sentences.forEach(sentence => {
    for (const pattern of patterns) {
      const match = sentence.match(pattern.regex)
      if (match) {
        const [, entity1, entity2] = match
        const e1Name = entity1.trim()
        const e2Name = entity2.trim()
        
        if (!entities.has(e1Name)) {
          entities.set(e1Name, {
            id: e1Name.toLowerCase().replace(/\s+/g, "_"),
            name: e1Name,
            type: guessEntityType(e1Name),
          })
        }
        if (!entities.has(e2Name)) {
          entities.set(e2Name, {
            id: e2Name.toLowerCase().replace(/\s+/g, "_"),
            name: e2Name,
            type: guessEntityType(e2Name),
          })
        }
        
        relationships.push({
          from: e1Name.toLowerCase().replace(/\s+/g, "_"),
          to: e2Name.toLowerCase().replace(/\s+/g, "_"),
          type: pattern.type,
        })
        break
      }
    }
  })
  
  return { entities: Array.from(entities.values()), relationships }
}

function guessEntityType(name: string): Entity["type"] {
  const lowerName = name.toLowerCase()
  if (lowerName.includes("project") || lowerName.includes("initiative")) return "project"
  if (lowerName.includes("team") || lowerName.includes("service") || lowerName.includes("gateway")) return "organization"
  if (lowerName.includes("dr.") || /^[A-Z][a-z]+$/.test(name)) return "person"
  return "concept"
}

// Generate vector embeddings (simulated 2D projection)
function generateVectorPoints(text: string): VectorPoint[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim())
  const points: VectorPoint[] = []
  
  // Create a simple hash-based 2D projection for visualization
  sentences.forEach((sentence, idx) => {
    const trimmed = sentence.trim()
    if (!trimmed) return
    
    // Simple deterministic positioning based on content
    let x = 0
    let y = 0
    for (let i = 0; i < trimmed.length; i++) {
      x += trimmed.charCodeAt(i) * (i + 1)
      y += trimmed.charCodeAt(i) * (trimmed.length - i)
    }
    
    // Normalize to 0-100 range with some clustering
    x = ((x % 1000) / 10) + (idx % 3) * 10
    y = ((y % 1000) / 10) + Math.floor(idx / 3) * 10
    
    // Add some semantic clustering based on keywords
    if (trimmed.toLowerCase().includes("work")) { x += 20; y -= 10 }
    if (trimmed.toLowerCase().includes("report")) { x -= 15; y += 15 }
    if (trimmed.toLowerCase().includes("project")) { x += 10; y += 20 }
    if (trimmed.toLowerCase().includes("teach")) { x -= 20; y -= 15 }
    if (trimmed.toLowerCase().includes("research")) { x += 25; y -= 20 }
    
    // Clamp values
    x = Math.max(5, Math.min(95, x))
    y = Math.max(5, Math.min(95, y))
    
    points.push({
      id: `vec_${idx}`,
      text: trimmed,
      x,
      y,
    })
  })
  
  return points
}

// Calculate cosine similarity (simplified for demo)
function calculateSimilarity(query: string, text: string): number {
  const queryWords = new Set(query.toLowerCase().split(/\s+/))
  const textWords = new Set(text.toLowerCase().split(/\s+/))
  
  let intersection = 0
  queryWords.forEach(word => {
    if (textWords.has(word)) intersection++
  })
  
  const union = queryWords.size + textWords.size - intersection
  return union > 0 ? intersection / union : 0
}

// Find path in graph using BFS
function findGraphPath(
  entities: Entity[],
  relationships: Relationship[],
  query: string
): { results: { text: string; path: string[]; hops: number }[]; traversedEdges: string[] } {
  const results: { text: string; path: string[]; hops: number }[] = []
  const traversedEdges: string[] = []
  
  // Find relevant starting entities based on query
  const queryLower = query.toLowerCase()
  const relevantEntities = entities.filter(e => 
    queryLower.includes(e.name.toLowerCase()) ||
    e.name.toLowerCase().split(/\s+/).some(word => queryLower.includes(word))
  )
  
  if (relevantEntities.length === 0) {
    // If no direct match, find entities mentioned in relationships
    relationships.forEach(rel => {
      const fromEntity = entities.find(e => e.id === rel.from)
      const toEntity = entities.find(e => e.id === rel.to)
      if (fromEntity && queryLower.includes(rel.type.replace(/_/g, " "))) {
        relevantEntities.push(fromEntity)
      }
      if (toEntity && queryLower.includes(rel.type.replace(/_/g, " "))) {
        relevantEntities.push(toEntity)
      }
    })
  }
  
  // BFS from each relevant entity
  relevantEntities.forEach(startEntity => {
    const visited = new Set<string>()
    const queue: { entityId: string; path: string[]; hops: number }[] = [
      { entityId: startEntity.id, path: [startEntity.name], hops: 0 }
    ]
    
    while (queue.length > 0 && results.length < 5) {
      const current = queue.shift()!
      if (visited.has(current.entityId)) continue
      visited.add(current.entityId)
      
      // Find connected relationships
      relationships.forEach(rel => {
        if (rel.from === current.entityId || rel.to === current.entityId) {
          const edgeKey = `${rel.from}-${rel.to}`
          if (!traversedEdges.includes(edgeKey)) {
            traversedEdges.push(edgeKey)
          }
          
          const nextId = rel.from === current.entityId ? rel.to : rel.from
          const nextEntity = entities.find(e => e.id === nextId)
          
          if (nextEntity && !visited.has(nextId)) {
            const newPath = [...current.path, `--[${rel.type}]-->`, nextEntity.name]
            
            // Add to results if relevant
            if (current.hops < 3) {
              results.push({
                text: `${startEntity.name} ${rel.type.replace(/_/g, " ")} ${nextEntity.name}`,
                path: newPath,
                hops: current.hops + 1,
              })
              
              queue.push({
                entityId: nextId,
                path: newPath,
                hops: current.hops + 1,
              })
            }
          }
        }
      })
    }
  })
  
  return { results: results.slice(0, 5), traversedEdges }
}

// Entity type colors
const ENTITY_COLORS = {
  person: { bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-500" },
  project: { bg: "bg-green-500", text: "text-green-500", border: "border-green-500" },
  organization: { bg: "bg-purple-500", text: "text-purple-500", border: "border-purple-500" },
  concept: { bg: "bg-amber-500", text: "text-amber-500", border: "border-amber-500" },
}

// Vector Space Visualization Component
function VectorSpaceView({
  points,
  highlightedPoints,
  queryPoint,
}: {
  points: VectorPoint[]
  highlightedPoints: string[]
  queryPoint: { x: number; y: number } | null
}) {
  return (
    <div className="relative w-full h-64 bg-muted/30 rounded-lg border overflow-hidden">
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/20" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      
      {/* Axis labels */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground">
        Semantic Dimension 1
      </div>
      <div className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-muted-foreground">
        Semantic Dimension 2
      </div>
      
      {/* Query point */}
      <AnimatePresence>
        {queryPoint && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${queryPoint.x}%`, top: `${queryPoint.y}%` }}
          >
            <Search className="w-4 h-4 text-primary" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Vector points */}
      {points.map((point, idx) => {
        const isHighlighted = highlightedPoints.includes(point.id)
        return (
          <motion.div
            key={point.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: isHighlighted ? 1.5 : 1, 
              opacity: highlightedPoints.length === 0 ? 0.7 : isHighlighted ? 1 : 0.3 
            }}
            transition={{ delay: idx * 0.05 }}
            className={cn(
              "absolute w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all",
              isHighlighted ? "bg-primary ring-2 ring-primary/50" : "bg-muted-foreground/50"
            )}
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
            title={point.text}
          >
            {isHighlighted && point.similarity !== undefined && (
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-primary whitespace-nowrap"
              >
                {Math.round(point.similarity * 100)}%
              </motion.span>
            )}
          </motion.div>
        )
      })}
      
      {/* Similarity lines from query to highlighted points */}
      <AnimatePresence>
        {queryPoint && highlightedPoints.length > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {points
              .filter(p => highlightedPoints.includes(p.id))
              .map(point => (
                <motion.line
                  key={`line-${point.id}`}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.5 }}
                  exit={{ pathLength: 0, opacity: 0 }}
                  x1={`${queryPoint.x}%`}
                  y1={`${queryPoint.y}%`}
                  x2={`${point.x}%`}
                  y2={`${point.y}%`}
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="4 2"
                  className="text-primary"
                />
              ))}
          </svg>
        )}
      </AnimatePresence>
    </div>
  )
}

// Graph Visualization Component
function GraphView({
  entities,
  relationships,
  highlightedNodes,
  highlightedEdges,
}: {
  entities: Entity[]
  relationships: Relationship[]
  highlightedNodes: string[]
  highlightedEdges: string[]
}) {
  // Calculate node positions in a circular layout
  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {}
    const centerX = 50
    const centerY = 50
    const radius = 35
    
    entities.forEach((entity, idx) => {
      const angle = (2 * Math.PI * idx) / entities.length - Math.PI / 2
      positions[entity.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      }
    })
    
    return positions
  }, [entities])
  
  return (
    <div className="relative w-full h-64 bg-muted/30 rounded-lg border overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Edges */}
        {relationships.map((rel, idx) => {
          const fromPos = nodePositions[rel.from]
          const toPos = nodePositions[rel.to]
          if (!fromPos || !toPos) return null
          
          const edgeKey = `${rel.from}-${rel.to}`
          const isHighlighted = highlightedEdges.includes(edgeKey)
          
          // Calculate midpoint for label
          const midX = (fromPos.x + toPos.x) / 2
          const midY = (fromPos.y + toPos.y) / 2
          
          return (
            <g key={`edge-${idx}`}>
              <motion.line
                initial={{ pathLength: 0 }}
                animate={{ 
                  pathLength: 1,
                  strokeWidth: isHighlighted ? 2 : 1,
                }}
                transition={{ delay: idx * 0.1, duration: 0.3 }}
                x1={`${fromPos.x}%`}
                y1={`${fromPos.y}%`}
                x2={`${toPos.x}%`}
                y2={`${toPos.y}%`}
                stroke="currentColor"
                className={cn(
                  "transition-colors",
                  isHighlighted ? "text-primary" : "text-muted-foreground/40"
                )}
                markerEnd="url(#arrowhead)"
              />
              {isHighlighted && (
                <motion.text
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  x={`${midX}%`}
                  y={`${midY}%`}
                  textAnchor="middle"
                  className="text-[8px] fill-primary font-medium"
                  dy="-4"
                >
                  {rel.type.replace(/_/g, " ")}
                </motion.text>
              )}
            </g>
          )
        })}
        
        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              className="fill-muted-foreground/40"
            />
          </marker>
        </defs>
      </svg>
      
      {/* Nodes */}
      {entities.map((entity, idx) => {
        const pos = nodePositions[entity.id]
        if (!pos) return null
        
        const isHighlighted = highlightedNodes.includes(entity.id)
        const colors = ENTITY_COLORS[entity.type]
        
        return (
          <motion.div
            key={entity.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: isHighlighted ? 1.2 : 1, 
              opacity: highlightedNodes.length === 0 ? 1 : isHighlighted ? 1 : 0.4 
            }}
            transition={{ delay: idx * 0.05 }}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-[10px] font-medium border-2 transition-all cursor-pointer",
              isHighlighted 
                ? `${colors.bg} text-white border-transparent ring-2 ring-primary/50` 
                : `bg-card ${colors.border} ${colors.text}`
            )}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            title={`${entity.name} (${entity.type})`}
          >
            {entity.name}
          </motion.div>
        )
      })}
      
      {/* Legend */}
      <div className="absolute bottom-2 right-2 flex gap-2">
        {(["person", "project", "concept"] as const).map(type => (
          <div key={type} className="flex items-center gap-1">
            <div className={cn("w-2 h-2 rounded-full", ENTITY_COLORS[type].bg)} />
            <span className="text-[8px] text-muted-foreground capitalize">{type}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Results Panel Component
function ResultsPanel({
  results,
  isLoading,
}: {
  results: QueryResult | null
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-6 h-6 text-primary" />
        </motion.div>
      </div>
    )
  }
  
  if (!results) {
    return (
      <div className="text-center text-muted-foreground text-sm py-8">
        Enter a query to compare retrieval methods
      </div>
    )
  }
  
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Vector Results */}
      <Card className="border-blue-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-500" />
            Vector Memory Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {results.vectorResults.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No results found</p>
          ) : (
            results.vectorResults.map((result, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-2 bg-blue-500/10 rounded text-xs"
              >
                <p className="line-clamp-2">{result.text}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px]">
                    {Math.round(result.similarity * 100)}% similar
                  </Badge>
                </div>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>
      
      {/* Graph Results */}
      <Card className="border-green-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-green-500" />
            Graph Memory Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {results.graphResults.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No results found</p>
          ) : (
            results.graphResults.map((result, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-2 bg-green-500/10 rounded text-xs"
              >
                <p className="font-medium">{result.text}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  <Badge variant="outline" className="text-[10px]">
                    {result.hops} hop{result.hops !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Performance Metrics Component
function PerformanceMetrics({ results }: { results: QueryResult | null }) {
  if (!results) return null
  
  const metrics = [
    {
      label: "Vector Query Time",
      value: `${results.vectorTime}ms`,
      icon: Clock,
      color: "text-blue-500",
    },
    {
      label: "Graph Query Time",
      value: `${results.graphTime}ms`,
      icon: Clock,
      color: "text-green-500",
    },
    {
      label: "Vector Results",
      value: results.vectorResults.length.toString(),
      icon: Target,
      color: "text-blue-500",
    },
    {
      label: "Graph Hops",
      value: results.graphResults.length > 0 
        ? Math.max(...results.graphResults.map(r => r.hops)).toString()
        : "0",
      icon: ArrowRight,
      color: "text-green-500",
    },
  ]
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {metrics.map((metric, idx) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="flex items-center gap-2 p-2 bg-muted/50 rounded-md"
        >
          <metric.icon className={cn("w-4 h-4", metric.color)} />
          <div>
            <p className="text-xs text-muted-foreground">{metric.label}</p>
            <p className="text-sm font-semibold">{metric.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Main Component
export function VectorVsGraphMemoryComparison() {
  const [knowledgeBase, setKnowledgeBase] = useState(EXAMPLE_KNOWLEDGE_BASES.workplace.text)
  const [selectedExample, setSelectedExample] = useState<keyof typeof EXAMPLE_KNOWLEDGE_BASES>("workplace")
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<QueryResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeView, setActiveView] = useState<"vector" | "graph">("vector")
  
  // Parsed data
  const { entities, relationships } = useMemo(
    () => parseKnowledgeBase(knowledgeBase),
    [knowledgeBase]
  )
  
  const vectorPoints = useMemo(
    () => generateVectorPoints(knowledgeBase),
    [knowledgeBase]
  )
  
  // Highlighted elements based on results
  const highlightedVectorPoints = useMemo(() => {
    if (!results) return []
    return results.vectorResults.map((_, idx) => `vec_${idx}`)
  }, [results])
  
  const highlightedNodes = useMemo(() => {
    if (!results) return []
    const nodes = new Set<string>()
    results.graphResults.forEach(r => {
      r.path.forEach(p => {
        if (!p.startsWith("--[")) {
          const entity = entities.find(e => e.name === p)
          if (entity) nodes.add(entity.id)
        }
      })
    })
    return Array.from(nodes)
  }, [results, entities])
  
  const highlightedEdges = useMemo(() => {
    if (!results) return []
    return results.graphResults.flatMap(r => {
      const edges: string[] = []
      for (let i = 0; i < r.path.length - 2; i += 2) {
        const from = entities.find(e => e.name === r.path[i])
        const to = entities.find(e => e.name === r.path[i + 2])
        if (from && to) {
          edges.push(`${from.id}-${to.id}`)
        }
      }
      return edges
    })
  }, [results, entities])
  
  // Query point for vector visualization
  const queryPoint = useMemo(() => {
    if (!query || !results) return null
    // Position query point based on content
    let x = 50
    let y = 50
    for (let i = 0; i < query.length; i++) {
      x += query.charCodeAt(i) * 0.1
      y += query.charCodeAt(i) * 0.05
    }
    return { x: x % 80 + 10, y: y % 80 + 10 }
  }, [query, results])
  
  // Handle example selection
  const handleExampleSelect = useCallback((key: keyof typeof EXAMPLE_KNOWLEDGE_BASES) => {
    setSelectedExample(key)
    setKnowledgeBase(EXAMPLE_KNOWLEDGE_BASES[key].text)
    setQuery("")
    setResults(null)
  }, [])
  
  // Handle query execution
  const executeQuery = useCallback(() => {
    if (!query.trim()) return
    
    setIsLoading(true)
    
    // Simulate async processing
    setTimeout(() => {
      const startVector = performance.now()
      
      // Vector search: find similar sentences
      const vectorResults = vectorPoints
        .map(point => ({
          text: point.text,
          similarity: calculateSimilarity(query, point.text),
          hops: 0,
        }))
        .filter(r => r.similarity > 0)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5)
      
      const vectorTime = Math.round(performance.now() - startVector)
      
      const startGraph = performance.now()
      
      // Graph search: traverse relationships
      const { results: graphResults } = findGraphPath(entities, relationships, query)
      
      const graphTime = Math.round(performance.now() - startGraph)
      
      setResults({
        vectorResults,
        graphResults,
        vectorTime: Math.max(vectorTime, 5) + Math.floor(Math.random() * 10),
        graphTime: Math.max(graphTime, 3) + Math.floor(Math.random() * 5),
      })
      
      setIsLoading(false)
    }, 500)
  }, [query, vectorPoints, entities, relationships])
  
  // Reset everything
  const handleReset = useCallback(() => {
    setKnowledgeBase(EXAMPLE_KNOWLEDGE_BASES.workplace.text)
    setSelectedExample("workplace")
    setQuery("")
    setResults(null)
  }, [])
  
  return (
    <div className="my-8 space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Vector vs Graph Memory Comparison
          </CardTitle>
          <CardDescription>
            Compare how vector and graph memory approaches store and retrieve knowledge
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Example Selection */}
          <div className="space-y-2">
            <Label className="text-sm">Pre-loaded Examples</Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(EXAMPLE_KNOWLEDGE_BASES) as Array<keyof typeof EXAMPLE_KNOWLEDGE_BASES>).map(key => (
                <Button
                  key={key}
                  size="sm"
                  variant={selectedExample === key ? "default" : "outline"}
                  onClick={() => handleExampleSelect(key)}
                >
                  {EXAMPLE_KNOWLEDGE_BASES[key].name}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Knowledge Base Input */}
          <div className="space-y-2">
            <Label htmlFor="knowledge-base" className="text-sm">Knowledge Base</Label>
            <Textarea
              id="knowledge-base"
              value={knowledgeBase}
              onChange={(e) => {
                setKnowledgeBase(e.target.value)
                setResults(null)
              }}
              placeholder="Enter knowledge statements (e.g., 'Alice works with Bob. Bob reports to Carol.')"
              className="min-h-[100px] text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Parsed: {entities.length} entities, {relationships.length} relationships
            </p>
          </div>
          
          {/* Query Input */}
          <div className="space-y-2">
            <Label htmlFor="query" className="text-sm">Query</Label>
            <div className="flex gap-2">
              <Input
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && executeQuery()}
                placeholder="Ask a question about the knowledge base..."
                className="flex-1"
              />
              <Button onClick={executeQuery} disabled={!query.trim() || isLoading} className="gap-2">
                <Play className="w-4 h-4" />
                Query
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Sample Queries */}
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-muted-foreground">Try:</span>
              {SAMPLE_QUERIES[selectedExample].slice(0, 3).map((q, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={() => setQuery(q)}
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Visualization Tabs */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "vector" | "graph")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vector" className="gap-2">
            <Database className="w-4 h-4" />
            Vector Memory
          </TabsTrigger>
          <TabsTrigger value="graph" className="gap-2">
            <GitBranch className="w-4 h-4" />
            Graph Memory
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="vector" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-500" />
                Embedding Space (2D Projection)
              </CardTitle>
              <CardDescription className="text-xs">
                Each dot represents a sentence embedded in vector space. Similar content clusters together.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VectorSpaceView
                points={vectorPoints}
                highlightedPoints={highlightedVectorPoints}
                queryPoint={queryPoint}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="graph" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-green-500" />
                Knowledge Graph
              </CardTitle>
              <CardDescription className="text-xs">
                Entities connected by typed relationships. Traversal follows explicit connections.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GraphView
                entities={entities}
                relationships={relationships}
                highlightedNodes={highlightedNodes}
                highlightedEdges={highlightedEdges}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Performance Metrics */}
      <PerformanceMetrics results={results} />
      
      {/* Results Comparison */}
      <ResultsPanel results={results} isLoading={isLoading} />
      
      {/* Educational Insights */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-500 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Vector Memory Excels At:
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
                <li>Semantic similarity search</li>
                <li>Finding conceptually related content</li>
                <li>Fuzzy matching and paraphrases</li>
                <li>Scaling to millions of documents</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-green-500 flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                Graph Memory Excels At:
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
                <li>Multi-hop relational queries</li>
                <li>Explicit relationship traversal</li>
                <li>Path finding between entities</li>
                <li>Structured knowledge reasoning</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
