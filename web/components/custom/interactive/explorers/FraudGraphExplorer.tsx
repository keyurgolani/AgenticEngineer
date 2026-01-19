"use client"

import { useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Network,
  Plus,
  Trash2,
  AlertTriangle,
  Download,
  RotateCcw,
  Search,
  CircleDot,
  ArrowRight,
  Shield,
  Zap,
  RefreshCw,
  ChevronDown,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// Types
interface Node {
  id: string
  x: number
  y: number
  label: string
  type: "normal" | "suspicious" | "mule" | "source"
  riskLevel: number
  accountType: "personal" | "business" | "shell" | "offshore"
}

interface Edge {
  id: string
  from: string
  to: string
  amount: number
  timestamp: Date
  status: "completed" | "pending" | "flagged"
}

interface DetectedPattern {
  id: string
  type: "ring" | "layering" | "burst" | "mule_chain"
  nodes: string[]
  edges: string[]
  riskScore: number
  description: string
}

// Account type colors
const ACCOUNT_TYPE_COLORS: Record<Node["accountType"], string> = {
  personal: "bg-blue-500",
  business: "bg-green-500",
  shell: "bg-orange-500",
  offshore: "bg-purple-500",
}

const NODE_TYPE_STYLES: Record<Node["type"], { border: string; glow: string }> = {
  normal: { border: "stroke-muted-foreground", glow: "" },
  suspicious: { border: "stroke-yellow-500", glow: "drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" },
  mule: { border: "stroke-red-500", glow: "drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" },
  source: { border: "stroke-purple-500", glow: "drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" },
}


// Preset scenarios for demonstration
const PRESET_SCENARIOS = [
  {
    name: "Circular Money Flow",
    description: "Classic ring pattern where money flows in a circle",
    nodes: [
      { id: "A1", x: 200, y: 100, label: "Account A", type: "source" as const, riskLevel: 30, accountType: "business" as const },
      { id: "B1", x: 350, y: 150, label: "Account B", type: "normal" as const, riskLevel: 20, accountType: "personal" as const },
      { id: "C1", x: 350, y: 280, label: "Account C", type: "suspicious" as const, riskLevel: 60, accountType: "shell" as const },
      { id: "D1", x: 200, y: 330, label: "Account D", type: "mule" as const, riskLevel: 85, accountType: "personal" as const },
      { id: "E1", x: 50, y: 280, label: "Account E", type: "normal" as const, riskLevel: 25, accountType: "business" as const },
      { id: "F1", x: 50, y: 150, label: "Account F", type: "normal" as const, riskLevel: 15, accountType: "personal" as const },
    ],
    edges: [
      { id: "e1", from: "A1", to: "B1", amount: 50000, timestamp: new Date("2024-01-15T10:00:00"), status: "completed" as const },
      { id: "e2", from: "B1", to: "C1", amount: 49500, timestamp: new Date("2024-01-15T10:30:00"), status: "completed" as const },
      { id: "e3", from: "C1", to: "D1", amount: 49000, timestamp: new Date("2024-01-15T11:00:00"), status: "flagged" as const },
      { id: "e4", from: "D1", to: "E1", amount: 48500, timestamp: new Date("2024-01-15T11:30:00"), status: "completed" as const },
      { id: "e5", from: "E1", to: "F1", amount: 48000, timestamp: new Date("2024-01-15T12:00:00"), status: "completed" as const },
      { id: "e6", from: "F1", to: "A1", amount: 47500, timestamp: new Date("2024-01-15T12:30:00"), status: "completed" as const },
    ],
  },
  {
    name: "Mule Account Chain",
    description: "Linear chain through multiple mule accounts",
    nodes: [
      { id: "S1", x: 50, y: 200, label: "Source", type: "source" as const, riskLevel: 40, accountType: "business" as const },
      { id: "M1", x: 150, y: 200, label: "Mule 1", type: "mule" as const, riskLevel: 90, accountType: "personal" as const },
      { id: "M2", x: 250, y: 200, label: "Mule 2", type: "mule" as const, riskLevel: 85, accountType: "personal" as const },
      { id: "M3", x: 350, y: 200, label: "Mule 3", type: "mule" as const, riskLevel: 80, accountType: "personal" as const },
      { id: "D2", x: 450, y: 200, label: "Destination", type: "suspicious" as const, riskLevel: 70, accountType: "offshore" as const },
    ],
    edges: [
      { id: "e1", from: "S1", to: "M1", amount: 100000, timestamp: new Date("2024-01-15T09:00:00"), status: "completed" as const },
      { id: "e2", from: "M1", to: "M2", amount: 95000, timestamp: new Date("2024-01-15T09:15:00"), status: "flagged" as const },
      { id: "e3", from: "M2", to: "M3", amount: 90000, timestamp: new Date("2024-01-15T09:30:00"), status: "flagged" as const },
      { id: "e4", from: "M3", to: "D2", amount: 85000, timestamp: new Date("2024-01-15T09:45:00"), status: "flagged" as const },
    ],
  },
  {
    name: "Velocity Spike (Burst)",
    description: "Multiple rapid transactions from single source",
    nodes: [
      { id: "HUB", x: 200, y: 200, label: "Hub Account", type: "suspicious" as const, riskLevel: 95, accountType: "shell" as const },
      { id: "T1", x: 350, y: 80, label: "Target 1", type: "normal" as const, riskLevel: 20, accountType: "personal" as const },
      { id: "T2", x: 400, y: 180, label: "Target 2", type: "normal" as const, riskLevel: 25, accountType: "personal" as const },
      { id: "T3", x: 380, y: 300, label: "Target 3", type: "normal" as const, riskLevel: 15, accountType: "business" as const },
      { id: "T4", x: 280, y: 350, label: "Target 4", type: "normal" as const, riskLevel: 30, accountType: "personal" as const },
      { id: "T5", x: 120, y: 350, label: "Target 5", type: "mule" as const, riskLevel: 75, accountType: "personal" as const },
      { id: "T6", x: 50, y: 280, label: "Target 6", type: "normal" as const, riskLevel: 20, accountType: "business" as const },
    ],
    edges: [
      { id: "e1", from: "HUB", to: "T1", amount: 9999, timestamp: new Date("2024-01-15T14:00:00"), status: "completed" as const },
      { id: "e2", from: "HUB", to: "T2", amount: 9998, timestamp: new Date("2024-01-15T14:01:00"), status: "completed" as const },
      { id: "e3", from: "HUB", to: "T3", amount: 9997, timestamp: new Date("2024-01-15T14:02:00"), status: "completed" as const },
      { id: "e4", from: "HUB", to: "T4", amount: 9996, timestamp: new Date("2024-01-15T14:03:00"), status: "flagged" as const },
      { id: "e5", from: "HUB", to: "T5", amount: 9995, timestamp: new Date("2024-01-15T14:04:00"), status: "flagged" as const },
      { id: "e6", from: "HUB", to: "T6", amount: 9994, timestamp: new Date("2024-01-15T14:05:00"), status: "completed" as const },
    ],
  },
]


// Helper to generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}



// Pattern detection algorithms
function detectCircularFlows(nodes: Node[], edges: Edge[]): DetectedPattern[] {
  const patterns: DetectedPattern[] = []
  const adjacencyList = new Map<string, string[]>()

  // Build adjacency list
  edges.forEach((edge) => {
    if (!adjacencyList.has(edge.from)) {
      adjacencyList.set(edge.from, [])
    }
    adjacencyList.get(edge.from)!.push(edge.to)
  })

  // DFS to find cycles
  const visited = new Set<string>()
  const recursionStack = new Set<string>()
  const path: string[] = []

  function dfs(nodeId: string, startId: string): boolean {
    visited.add(nodeId)
    recursionStack.add(nodeId)
    path.push(nodeId)

    const neighbors = adjacencyList.get(nodeId) || []
    for (const neighbor of neighbors) {
      if (neighbor === startId && path.length >= 3) {
        // Found a cycle back to start
        const cycleNodes = [...path]
        const cycleEdges = edges
          .filter((e) => {
            const fromIdx = cycleNodes.indexOf(e.from)
            const toIdx = cycleNodes.indexOf(e.to)
            return fromIdx !== -1 && (toIdx === (fromIdx + 1) % cycleNodes.length || (e.to === startId && fromIdx === cycleNodes.length - 1))
          })
          .map((e) => e.id)

        patterns.push({
          id: generateId(),
          type: "ring",
          nodes: cycleNodes,
          edges: cycleEdges,
          riskScore: 85 + Math.min(cycleNodes.length * 2, 15),
          description: `Circular money flow detected through ${cycleNodes.length} accounts`,
        })
        return true
      }

      if (!recursionStack.has(neighbor)) {
        dfs(neighbor, startId)
      }
    }

    path.pop()
    recursionStack.delete(nodeId)
    return false
  }

  nodes.forEach((node) => {
    visited.clear()
    recursionStack.clear()
    path.length = 0
    dfs(node.id, node.id)
  })

  return patterns
}


function detectMuleChains(nodes: Node[], edges: Edge[]): DetectedPattern[] {
  const patterns: DetectedPattern[] = []
  const muleNodes = nodes.filter((n) => n.type === "mule")

  if (muleNodes.length < 2) return patterns

  // Find chains of mule accounts
  const adjacencyList = new Map<string, string[]>()
  edges.forEach((edge) => {
    if (!adjacencyList.has(edge.from)) {
      adjacencyList.set(edge.from, [])
    }
    adjacencyList.get(edge.from)!.push(edge.to)
  })

  // Find paths through mule accounts
  const muleIds = new Set(muleNodes.map((n) => n.id))
  const visited = new Set<string>()

  function findMuleChain(startId: string, chain: string[]): string[][] {
    const results: string[][] = []
    const neighbors = adjacencyList.get(startId) || []

    for (const neighbor of neighbors) {
      if (muleIds.has(neighbor) && !visited.has(neighbor)) {
        visited.add(neighbor)
        const newChain = [...chain, neighbor]
        results.push(newChain)
        results.push(...findMuleChain(neighbor, newChain))
      }
    }

    return results
  }

  muleNodes.forEach((mule) => {
    visited.clear()
    visited.add(mule.id)
    const chains = findMuleChain(mule.id, [mule.id])
    chains
      .filter((c) => c.length >= 2)
      .forEach((chain) => {
        const chainEdges = edges
          .filter((e) => {
            const fromIdx = chain.indexOf(e.from)
            const toIdx = chain.indexOf(e.to)
            return fromIdx !== -1 && toIdx === fromIdx + 1
          })
          .map((e) => e.id)

        patterns.push({
          id: generateId(),
          type: "mule_chain",
          nodes: chain,
          edges: chainEdges,
          riskScore: 75 + chain.length * 5,
          description: `Mule account chain detected: ${chain.length} linked mule accounts`,
        })
      })
  })

  return patterns
}

function detectVelocitySpikes(nodes: Node[], edges: Edge[]): DetectedPattern[] {
  const patterns: DetectedPattern[] = []

  // Group edges by source node
  const edgesBySource = new Map<string, Edge[]>()
  edges.forEach((edge) => {
    if (!edgesBySource.has(edge.from)) {
      edgesBySource.set(edge.from, [])
    }
    edgesBySource.get(edge.from)!.push(edge)
  })

  // Check for velocity spikes (multiple transactions in short time)
  edgesBySource.forEach((nodeEdges, sourceId) => {
    if (nodeEdges.length < 3) return

    // Sort by timestamp
    const sorted = [...nodeEdges].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    )

    // Check for burst (3+ transactions within 10 minutes)
    const windowMs = 10 * 60 * 1000 // 10 minutes
    for (let i = 0; i <= sorted.length - 3; i++) {
      const windowEdges = sorted.filter(
        (e) =>
          e.timestamp.getTime() >= sorted[i].timestamp.getTime() &&
          e.timestamp.getTime() <= sorted[i].timestamp.getTime() + windowMs
      )

      if (windowEdges.length >= 3) {
        const targetNodes = windowEdges.map((e) => e.to)
        patterns.push({
          id: generateId(),
          type: "burst",
          nodes: [sourceId, ...targetNodes],
          edges: windowEdges.map((e) => e.id),
          riskScore: 70 + windowEdges.length * 5,
          description: `Velocity spike: ${windowEdges.length} transactions in ${Math.round(windowMs / 60000)} minutes from single source`,
        })
        break // Only report one burst per source
      }
    }
  })

  return patterns
}


// Node Properties Panel Component
function NodePropertiesPanel({
  node,
  onUpdate,
  onDelete,
  onClose,
}: {
  node: Node
  onUpdate: (node: Node) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute right-4 top-4 w-64 p-4 rounded-lg border bg-background/95 backdrop-blur shadow-lg z-20"
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold flex items-center gap-2">
          <CircleDot className="h-4 w-4" />
          Node Properties
        </h4>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ×
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-xs">Account ID</Label>
          <Input
            value={node.id}
            disabled
            className="h-8 text-xs bg-muted"
          />
        </div>

        <div>
          <Label className="text-xs">Label</Label>
          <Input
            value={node.label}
            onChange={(e) => onUpdate({ ...node, label: e.target.value })}
            className="h-8 text-xs"
          />
        </div>

        <div>
          <Label className="text-xs">Account Type</Label>
          <Select
            value={node.accountType}
            onValueChange={(v) => onUpdate({ ...node, accountType: v as Node["accountType"] })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="shell">Shell Company</SelectItem>
              <SelectItem value="offshore">Offshore</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Node Type</Label>
          <Select
            value={node.type}
            onValueChange={(v) => onUpdate({ ...node, type: v as Node["type"] })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="suspicious">Suspicious</SelectItem>
              <SelectItem value="mule">Mule Account</SelectItem>
              <SelectItem value="source">Source</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Risk Level: {node.riskLevel}%</Label>
          <input
            type="range"
            min="0"
            max="100"
            value={node.riskLevel}
            onChange={(e) => onUpdate({ ...node, riskLevel: parseInt(e.target.value) })}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={() => onDelete(node.id)}
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Delete Node
        </Button>
      </div>
    </motion.div>
  )
}


// Edge Properties Panel Component
function EdgePropertiesPanel({
  edge,
  nodes,
  onUpdate,
  onDelete,
  onClose,
}: {
  edge: Edge
  nodes: Node[]
  onUpdate: (edge: Edge) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  const fromNode = nodes.find((n) => n.id === edge.from)
  const toNode = nodes.find((n) => n.id === edge.to)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute right-4 top-4 w-64 p-4 rounded-lg border bg-background/95 backdrop-blur shadow-lg z-20"
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold flex items-center gap-2">
          <ArrowRight className="h-4 w-4" />
          Transaction
        </h4>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ×
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">{fromNode?.label || edge.from}</span>
          <ArrowRight className="h-3 w-3" />
          <span className="font-medium">{toNode?.label || edge.to}</span>
        </div>

        <div>
          <Label className="text-xs">Amount ($)</Label>
          <Input
            type="number"
            value={edge.amount}
            onChange={(e) => onUpdate({ ...edge, amount: parseFloat(e.target.value) || 0 })}
            className="h-8 text-xs"
          />
        </div>

        <div>
          <Label className="text-xs">Timestamp</Label>
          <Input
            type="datetime-local"
            value={edge.timestamp.toISOString().slice(0, 16)}
            onChange={(e) => onUpdate({ ...edge, timestamp: new Date(e.target.value) })}
            className="h-8 text-xs"
          />
        </div>

        <div>
          <Label className="text-xs">Status</Label>
          <Select
            value={edge.status}
            onValueChange={(v) => onUpdate({ ...edge, status: v as Edge["status"] })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={() => onDelete(edge.id)}
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Delete Transaction
        </Button>
      </div>
    </motion.div>
  )
}


// Main Component
export function FraudGraphExplorer() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null)
  const [detectedPatterns, setDetectedPatterns] = useState<DetectedPattern[]>([])
  const [highlightedPattern, setHighlightedPattern] = useState<DetectedPattern | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showPresets, setShowPresets] = useState(false)

  // Edge creation state
  const [edgeStart, setEdgeStart] = useState<string | null>(null)
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)

  // Mode state
  const [mode, setMode] = useState<"select" | "add" | "connect">("select")

  // Node counter for auto-naming
  const nodeCounter = useRef(1)

  // Get SVG coordinates from mouse event
  const getSvgCoords = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) return { x: 0, y: 0 }
      const rect = svgRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 500
      const y = ((e.clientY - rect.top) / rect.height) * 400
      return { x, y }
    },
    []
  )

  // Handle canvas click to add node
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (mode !== "add") return

      const { x, y } = getSvgCoords(e)
      const newNode: Node = {
        id: `ACC${nodeCounter.current++}`,
        x,
        y,
        label: `Account ${nodeCounter.current - 1}`,
        type: "normal",
        riskLevel: 20,
        accountType: "personal",
      }
      setNodes((prev) => [...prev, newNode])
      setSelectedNode(newNode)
      setSelectedEdge(null)
    },
    [mode, getSvgCoords]
  )

  // Handle node click
  const handleNodeClick = useCallback(
    (e: React.MouseEvent, node: Node) => {
      e.stopPropagation()

      if (mode === "connect") {
        if (!edgeStart) {
          setEdgeStart(node.id)
        } else if (edgeStart !== node.id) {
          // Create edge
          const newEdge: Edge = {
            id: generateId(),
            from: edgeStart,
            to: node.id,
            amount: 10000,
            timestamp: new Date(),
            status: "completed",
          }
          setEdges((prev) => [...prev, newEdge])
          setEdgeStart(null)
          setDragPos(null)
          setSelectedEdge(newEdge)
          setSelectedNode(null)
        }
      } else {
        setSelectedNode(node)
        setSelectedEdge(null)
      }
    },
    [mode, edgeStart]
  )

  // Handle edge click
  const handleEdgeClick = useCallback(
    (e: React.MouseEvent, edge: Edge) => {
      e.stopPropagation()
      if (mode === "select") {
        setSelectedEdge(edge)
        setSelectedNode(null)
      }
    },
    [mode]
  )

  // Handle mouse move for edge preview
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (mode === "connect" && edgeStart) {
        setDragPos(getSvgCoords(e))
      }
    },
    [mode, edgeStart, getSvgCoords]
  )


  // Update node
  const updateNode = useCallback((updatedNode: Node) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === updatedNode.id ? updatedNode : n))
    )
    setSelectedNode(updatedNode)
  }, [])

  // Delete node
  const deleteNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id))
    setEdges((prev) => prev.filter((e) => e.from !== id && e.to !== id))
    setSelectedNode(null)
    setDetectedPatterns([])
  }, [])

  // Update edge
  const updateEdge = useCallback((updatedEdge: Edge) => {
    setEdges((prev) =>
      prev.map((e) => (e.id === updatedEdge.id ? updatedEdge : e))
    )
    setSelectedEdge(updatedEdge)
  }, [])

  // Delete edge
  const deleteEdge = useCallback((id: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== id))
    setSelectedEdge(null)
    setDetectedPatterns([])
  }, [])

  // Run pattern detection
  const analyzePatterns = useCallback(() => {
    setIsAnalyzing(true)
    setHighlightedPattern(null)

    // Simulate analysis delay
    setTimeout(() => {
      const patterns: DetectedPattern[] = [
        ...detectCircularFlows(nodes, edges),
        ...detectMuleChains(nodes, edges),
        ...detectVelocitySpikes(nodes, edges),
      ]

      // Remove duplicates based on node sets
      const uniquePatterns = patterns.filter(
        (p, i, arr) =>
          arr.findIndex(
            (p2) =>
              p2.type === p.type &&
              p2.nodes.length === p.nodes.length &&
              p2.nodes.every((n) => p.nodes.includes(n))
          ) === i
      )

      setDetectedPatterns(uniquePatterns)
      setIsAnalyzing(false)
    }, 800)
  }, [nodes, edges])

  // Load preset scenario
  const loadPreset = useCallback((preset: typeof PRESET_SCENARIOS[0]) => {
    setNodes(preset.nodes)
    setEdges(preset.edges)
    setSelectedNode(null)
    setSelectedEdge(null)
    setDetectedPatterns([])
    setHighlightedPattern(null)
    setShowPresets(false)
    nodeCounter.current = preset.nodes.length + 1
  }, [])

  // Reset graph
  const resetGraph = useCallback(() => {
    setNodes([])
    setEdges([])
    setSelectedNode(null)
    setSelectedEdge(null)
    setDetectedPatterns([])
    setHighlightedPattern(null)
    setEdgeStart(null)
    setDragPos(null)
    nodeCounter.current = 1
  }, [])

  // Export graph as JSON
  const exportGraph = useCallback(() => {
    const data = {
      nodes,
      edges: edges.map((e) => ({
        ...e,
        timestamp: e.timestamp.toISOString(),
      })),
      patterns: detectedPatterns,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "fraud-graph-export.json"
    a.click()
    URL.revokeObjectURL(url)
  }, [nodes, edges, detectedPatterns])

  // Check if node/edge is highlighted
  const isNodeHighlighted = useCallback(
    (nodeId: string) => {
      if (!highlightedPattern) return false
      return highlightedPattern.nodes.includes(nodeId)
    },
    [highlightedPattern]
  )

  const isEdgeHighlighted = useCallback(
    (edgeId: string) => {
      if (!highlightedPattern) return false
      return highlightedPattern.edges.includes(edgeId)
    },
    [highlightedPattern]
  )


  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5 text-primary" />
          Fraud Graph Explorer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode buttons */}
          <div className="flex rounded-lg border p-1 gap-1">
            <Button
              variant={mode === "select" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setMode("select")
                setEdgeStart(null)
                setDragPos(null)
              }}
            >
              <Search className="h-4 w-4 mr-1" />
              Select
            </Button>
            <Button
              variant={mode === "add" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setMode("add")
                setEdgeStart(null)
                setDragPos(null)
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Node
            </Button>
            <Button
              variant={mode === "connect" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMode("connect")}
            >
              <ArrowRight className="h-4 w-4 mr-1" />
              Connect
            </Button>
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Preset scenarios */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPresets(!showPresets)}
            >
              Load Scenario
              <ChevronDown
                className={cn(
                  "h-4 w-4 ml-1 transition-transform",
                  showPresets && "rotate-180"
                )}
              />
            </Button>
            <AnimatePresence>
              {showPresets && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-1 z-30 w-72 p-2 rounded-lg border bg-background shadow-lg"
                >
                  {PRESET_SCENARIOS.map((scenario) => (
                    <button
                      key={scenario.name}
                      onClick={() => loadPreset(scenario)}
                      className="w-full text-left p-2 rounded hover:bg-muted transition-colors"
                    >
                      <div className="font-medium text-sm">{scenario.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {scenario.description}
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button variant="outline" size="sm" onClick={resetGraph}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>

          <div className="flex-1" />

          <Button
            variant="default"
            size="sm"
            onClick={analyzePatterns}
            disabled={nodes.length < 2 || isAnalyzing}
          >
            {isAnalyzing ? (
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Shield className="h-4 w-4 mr-1" />
            )}
            Analyze
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={exportGraph}
            disabled={nodes.length === 0}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>


        {/* Graph Canvas */}
        <div className="relative border rounded-lg bg-muted/20 overflow-hidden">
          <svg
            ref={svgRef}
            viewBox="0 0 500 400"
            className={cn(
              "w-full h-[400px]",
              mode === "add" && "cursor-crosshair",
              mode === "connect" && "cursor-pointer"
            )}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
          >
            {/* Grid pattern */}
            <defs>
              <pattern
                id="grid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="0.5"
                  strokeOpacity="0.3"
                />
              </pattern>
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
                  fill="hsl(var(--muted-foreground))"
                />
              </marker>
              <marker
                id="arrowhead-highlighted"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--primary))" />
              </marker>
              <marker
                id="arrowhead-flagged"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="rgb(239 68 68)" />
              </marker>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Edges */}
            {edges.map((edge) => {
              const fromNode = nodes.find((n) => n.id === edge.from)
              const toNode = nodes.find((n) => n.id === edge.to)
              if (!fromNode || !toNode) return null

              const highlighted = isEdgeHighlighted(edge.id)
              const selected = selectedEdge?.id === edge.id

              // Calculate edge path with offset for arrow
              const dx = toNode.x - fromNode.x
              const dy = toNode.y - fromNode.y
              const len = Math.sqrt(dx * dx + dy * dy)
              const offsetX = (dx / len) * 20
              const offsetY = (dy / len) * 20

              return (
                <g key={edge.id}>
                  <motion.line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x - offsetX}
                    y2={toNode.y - offsetY}
                    stroke={
                      highlighted
                        ? "hsl(var(--primary))"
                        : edge.status === "flagged"
                        ? "rgb(239 68 68)"
                        : "hsl(var(--muted-foreground))"
                    }
                    strokeWidth={highlighted || selected ? 3 : 2}
                    strokeOpacity={highlighted ? 1 : 0.6}
                    markerEnd={
                      highlighted
                        ? "url(#arrowhead-highlighted)"
                        : edge.status === "flagged"
                        ? "url(#arrowhead-flagged)"
                        : "url(#arrowhead)"
                    }
                    className="cursor-pointer"
                    onClick={(e) => handleEdgeClick(e, edge)}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  {/* Edge label */}
                  <text
                    x={(fromNode.x + toNode.x) / 2}
                    y={(fromNode.y + toNode.y) / 2 - 8}
                    textAnchor="middle"
                    className="text-[10px] fill-muted-foreground pointer-events-none"
                  >
                    {formatCurrency(edge.amount)}
                  </text>
                </g>
              )
            })}


            {/* Edge preview while connecting */}
            {edgeStart && dragPos && (
              <line
                x1={nodes.find((n) => n.id === edgeStart)?.x || 0}
                y1={nodes.find((n) => n.id === edgeStart)?.y || 0}
                x2={dragPos.x}
                y2={dragPos.y}
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeDasharray="5,5"
                strokeOpacity="0.5"
              />
            )}

            {/* Nodes */}
            {nodes.map((node) => {
              const highlighted = isNodeHighlighted(node.id)
              const selected = selectedNode?.id === node.id
              const isEdgeStartNode = edgeStart === node.id
              const styles = NODE_TYPE_STYLES[node.type]

              return (
                <g
                  key={node.id}
                  className="cursor-pointer"
                  onClick={(e) => handleNodeClick(e, node)}
                >
                  {/* Highlight ring */}
                  {(highlighted || selected || isEdgeStartNode) && (
                    <motion.circle
                      cx={node.x}
                      cy={node.y}
                      r={24}
                      fill="none"
                      stroke={
                        highlighted
                          ? "hsl(var(--primary))"
                          : isEdgeStartNode
                          ? "hsl(var(--primary))"
                          : "hsl(var(--ring))"
                      }
                      strokeWidth="2"
                      strokeDasharray={isEdgeStartNode ? "4,4" : "none"}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}

                  {/* Node circle */}
                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r={18}
                    className={cn(
                      "fill-background",
                      styles.border,
                      styles.glow
                    )}
                    strokeWidth="3"
                    stroke={
                      node.type === "normal"
                        ? "hsl(var(--muted-foreground))"
                        : node.type === "suspicious"
                        ? "rgb(234 179 8)"
                        : node.type === "mule"
                        ? "rgb(239 68 68)"
                        : "rgb(168 85 247)"
                    }
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  />

                  {/* Account type indicator */}
                  <circle
                    cx={node.x + 12}
                    cy={node.y - 12}
                    r={5}
                    className={ACCOUNT_TYPE_COLORS[node.accountType]}
                  />

                  {/* Risk level indicator */}
                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor="middle"
                    className={cn(
                      "text-[10px] font-bold pointer-events-none",
                      node.riskLevel >= 70
                        ? "fill-red-500"
                        : node.riskLevel >= 40
                        ? "fill-yellow-500"
                        : "fill-muted-foreground"
                    )}
                  >
                    {node.riskLevel}
                  </text>

                  {/* Node label */}
                  <text
                    x={node.x}
                    y={node.y + 32}
                    textAnchor="middle"
                    className="text-[11px] fill-foreground pointer-events-none font-medium"
                  >
                    {node.label}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Mode indicator */}
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-background/90 border text-xs">
            {mode === "add" && "Click to add node"}
            {mode === "connect" &&
              (edgeStart
                ? "Click target node to connect"
                : "Click source node to start")}
            {mode === "select" && "Click node or edge to select"}
          </div>

          {/* Properties panels */}
          <AnimatePresence>
            {selectedNode && (
              <NodePropertiesPanel
                node={selectedNode}
                onUpdate={updateNode}
                onDelete={deleteNode}
                onClose={() => setSelectedNode(null)}
              />
            )}
            {selectedEdge && (
              <EdgePropertiesPanel
                edge={selectedEdge}
                nodes={nodes}
                onUpdate={updateEdge}
                onDelete={deleteEdge}
                onClose={() => setSelectedEdge(null)}
              />
            )}
          </AnimatePresence>
        </div>


        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-4">
            <span className="font-medium text-muted-foreground">Node Types:</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full border-2 border-muted-foreground" />
              <span>Normal</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full border-2 border-yellow-500" />
              <span>Suspicious</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full border-2 border-red-500" />
              <span>Mule</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full border-2 border-purple-500" />
              <span>Source</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-medium text-muted-foreground">Account Types:</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Personal</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Business</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>Shell</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span>Offshore</span>
            </div>
          </div>
        </div>

        {/* Detected Patterns */}
        <AnimatePresence>
          {detectedPatterns.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <h4 className="font-semibold">
                  Detected Patterns ({detectedPatterns.length})
                </h4>
              </div>

              <div className="grid gap-2">
                {detectedPatterns.map((pattern) => (
                  <motion.div
                    key={pattern.id}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-colors",
                      highlightedPattern?.id === pattern.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() =>
                      setHighlightedPattern(
                        highlightedPattern?.id === pattern.id ? null : pattern
                      )
                    }
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            pattern.type === "ring"
                              ? "default"
                              : pattern.type === "mule_chain"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {pattern.type === "ring" && (
                            <RefreshCw className="h-3 w-3 mr-1" />
                          )}
                          {pattern.type === "mule_chain" && (
                            <ArrowRight className="h-3 w-3 mr-1" />
                          )}
                          {pattern.type === "burst" && (
                            <Zap className="h-3 w-3 mr-1" />
                          )}
                          {pattern.type === "ring"
                            ? "Circular Flow"
                            : pattern.type === "mule_chain"
                            ? "Mule Chain"
                            : pattern.type === "burst"
                            ? "Velocity Spike"
                            : "Layering"}
                        </Badge>
                        <span className="text-sm">{pattern.description}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Risk Score:
                        </span>
                        <Badge
                          variant={
                            pattern.riskScore >= 80
                              ? "destructive"
                              : pattern.riskScore >= 60
                              ? "default"
                              : "secondary"
                          }
                        >
                          {pattern.riskScore}%
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Involved accounts: {pattern.nodes.join(" → ")}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info */}
        <div className="text-xs text-muted-foreground p-3 rounded bg-muted/30">
          <strong>How it works:</strong> This tool uses graph analysis algorithms
          to detect suspicious patterns in financial transaction networks. It
          identifies circular money flows (ring patterns), mule account chains,
          and velocity spikes (burst transactions). Click &quot;Analyze&quot; to run
          pattern detection on your graph, then click on detected patterns to
          highlight them in the visualization.
        </div>
      </CardContent>
    </Card>
  )
}