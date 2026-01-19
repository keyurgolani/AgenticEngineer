"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Box,
  Cpu,
  Database,
  Globe,
  MessageSquare,
  Search,
  Code,
  FileText,
  Layers,
  ArrowRight,
  X,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Component {
  id: string
  name: string
  icon: typeof Box
  color: string
  layer: "interface" | "core" | "services" | "providers"
  description: string
  responsibilities: string[]
  apiEndpoints?: string[]
  dependencies: string[]
}

const COMPONENTS: Component[] = [
  // Interface Layer
  {
    id: "web-dashboard",
    name: "Web Dashboard",
    icon: Globe,
    color: "text-blue-500",
    layer: "interface",
    description: "React-based web interface for interacting with the agent ecosystem",
    responsibilities: [
      "User authentication and session management",
      "Real-time chat interface with agents",
      "Task monitoring and history",
      "Configuration and settings management",
    ],
    apiEndpoints: ["GET /api/tasks", "POST /api/chat", "GET /api/status"],
    dependencies: ["api-gateway"],
  },
  {
    id: "rest-api",
    name: "REST API",
    icon: Code,
    color: "text-green-500",
    layer: "interface",
    description: "RESTful API for programmatic access to agent capabilities",
    responsibilities: [
      "Request validation and authentication",
      "Rate limiting and quota management",
      "Response formatting and error handling",
      "API versioning",
    ],
    apiEndpoints: ["POST /v1/agents/invoke", "GET /v1/tasks/{id}", "POST /v1/chat/completions"],
    dependencies: ["api-gateway"],
  },
  {
    id: "cli",
    name: "CLI Tool",
    icon: FileText,
    color: "text-purple-500",
    layer: "interface",
    description: "Command-line interface for developers and automation",
    responsibilities: [
      "Interactive agent sessions",
      "Batch task execution",
      "Configuration management",
      "Local development support",
    ],
    dependencies: ["rest-api"],
  },
  // Core Layer
  {
    id: "api-gateway",
    name: "API Gateway",
    icon: Layers,
    color: "text-amber-500",
    layer: "core",
    description: "Central entry point for all requests with routing and middleware",
    responsibilities: [
      "Request routing to appropriate agents",
      "Authentication and authorization",
      "Request/response logging",
      "Load balancing",
    ],
    dependencies: ["orchestrator"],
  },
  {
    id: "orchestrator",
    name: "Smart Orchestrator",
    icon: Cpu,
    color: "text-pink-500",
    layer: "core",
    description: "Intelligent request classifier and agent coordinator",
    responsibilities: [
      "Request classification (keyword + ML)",
      "Agent selection and routing",
      "Multi-agent coordination",
      "Task decomposition",
    ],
    dependencies: ["research-agent", "code-agent", "analysis-agent", "writing-agent", "llm-router"],
  },
  {
    id: "research-agent",
    name: "Research Agent",
    icon: Search,
    color: "text-blue-400",
    layer: "core",
    description: "Specialized agent for information gathering and research tasks",
    responsibilities: [
      "Web search and content extraction",
      "Document summarization",
      "Fact verification",
      "Source citation",
    ],
    dependencies: ["rag-service", "llm-router", "memory-service"],
  },
  {
    id: "code-agent",
    name: "Code Agent",
    icon: Code,
    color: "text-green-400",
    layer: "core",
    description: "Specialized agent for code generation and debugging",
    responsibilities: [
      "Code generation and completion",
      "Bug detection and fixing",
      "Code review and refactoring",
      "Test generation",
    ],
    dependencies: ["llm-router", "memory-service"],
  },
  {
    id: "analysis-agent",
    name: "Analysis Agent",
    icon: Database,
    color: "text-amber-400",
    layer: "core",
    description: "Specialized agent for data analysis and insights",
    responsibilities: [
      "Data processing and transformation",
      "Statistical analysis",
      "Visualization generation",
      "Trend identification",
    ],
    dependencies: ["llm-router", "memory-service"],
  },
  {
    id: "writing-agent",
    name: "Writing Agent",
    icon: FileText,
    color: "text-purple-400",
    layer: "core",
    description: "Specialized agent for content creation and editing",
    responsibilities: [
      "Document generation",
      "Content editing and proofreading",
      "Style adaptation",
      "Template-based generation",
    ],
    dependencies: ["prompt-library", "llm-router", "memory-service"],
  },
  // Services Layer
  {
    id: "prompt-library",
    name: "Prompt Library",
    icon: MessageSquare,
    color: "text-indigo-500",
    layer: "services",
    description: "Centralized prompt template management and versioning",
    responsibilities: [
      "Prompt template storage",
      "Version control and A/B testing",
      "Variable interpolation",
      "Performance tracking",
    ],
    dependencies: [],
  },
  {
    id: "memory-service",
    name: "Memory Service",
    icon: Database,
    color: "text-cyan-500",
    layer: "services",
    description: "Persistent memory and context management for agents",
    responsibilities: [
      "Short-term conversation memory",
      "Long-term knowledge storage",
      "Memory consolidation",
      "Context retrieval",
    ],
    dependencies: ["rag-service"],
  },
  {
    id: "rag-service",
    name: "RAG Service",
    icon: Search,
    color: "text-teal-500",
    layer: "services",
    description: "Retrieval-augmented generation for grounded responses",
    responsibilities: [
      "Document ingestion and chunking",
      "Vector embedding generation",
      "Similarity search",
      "Context ranking",
    ],
    dependencies: [],
  },
  {
    id: "llm-router",
    name: "LLM Router",
    icon: Cpu,
    color: "text-rose-500",
    layer: "services",
    description: "Intelligent routing to multiple LLM providers",
    responsibilities: [
      "Provider selection based on task",
      "Cost optimization",
      "Fallback handling",
      "Rate limit management",
    ],
    dependencies: [],
  },
]

const LAYERS = [
  { id: "interface", name: "User Interface", color: "border-blue-500/30 bg-blue-500/5" },
  { id: "core", name: "AgentOS Core", color: "border-pink-500/30 bg-pink-500/5" },
  { id: "services", name: "Supporting Services", color: "border-green-500/30 bg-green-500/5" },
]

export function ArchitectureExplorer() {
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null)

  const getComponentsByLayer = (layer: string) => 
    COMPONENTS.filter(c => c.layer === layer)

  const isHighlighted = (componentId: string) => {
    if (!selectedComponent) return false
    return selectedComponent.id === componentId || 
           selectedComponent.dependencies.includes(componentId)
  }

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Architecture Explorer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Click on any component to see its details and dependencies.
        </p>

        {/* Architecture Diagram */}
        <div className="space-y-4">
          {LAYERS.map((layer) => (
            <div
              key={layer.id}
              className={cn("p-4 rounded-lg border", layer.color)}
            >
              <h4 className="text-sm font-medium mb-3">{layer.name}</h4>
              <div className="flex flex-wrap gap-3">
                {getComponentsByLayer(layer.id).map((component) => {
                  const Icon = component.icon
                  const highlighted = isHighlighted(component.id)
                  const isSelected = selectedComponent?.id === component.id
                  const isDependency = selectedComponent?.dependencies.includes(component.id)

                  return (
                    <motion.button
                      key={component.id}
                      onClick={() => setSelectedComponent(
                        isSelected ? null : component
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border bg-background transition-all",
                        isSelected && "ring-2 ring-primary border-primary",
                        isDependency && "ring-2 ring-amber-500 border-amber-500",
                        !highlighted && selectedComponent && "opacity-40"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", component.color)} />
                      <span className="text-sm font-medium">{component.name}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Component Details */}
        <AnimatePresence>
          {selectedComponent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="border rounded-lg overflow-hidden"
            >
              <div className="p-4 bg-muted/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = selectedComponent.icon
                    return <Icon className={cn("h-6 w-6", selectedComponent.color)} />
                  })()}
                  <div>
                    <h3 className="font-semibold">{selectedComponent.name}</h3>
                    <Badge variant="outline" className="text-xs capitalize">
                      {selectedComponent.layer}
                    </Badge>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedComponent(null)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  {selectedComponent.description}
                </p>

                {/* Responsibilities */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Responsibilities</h4>
                  <ul className="space-y-1">
                    {selectedComponent.responsibilities.map((resp, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {resp}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* API Endpoints */}
                {selectedComponent.apiEndpoints && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">API Endpoints</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedComponent.apiEndpoints.map((endpoint, i) => (
                        <Badge key={i} variant="outline" className="font-mono text-xs">
                          {endpoint}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dependencies */}
                {selectedComponent.dependencies.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Dependencies</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedComponent.dependencies.map((depId) => {
                        const dep = COMPONENTS.find(c => c.id === depId)
                        if (!dep) return null
                        const Icon = dep.icon
                        return (
                          <button
                            key={depId}
                            onClick={() => setSelectedComponent(dep)}
                            className="flex items-center gap-1 px-2 py-1 rounded border bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 transition-colors"
                          >
                            <Icon className={cn("h-3 w-3", dep.color)} />
                            <span className="text-xs">{dep.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border-2 border-primary" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border-2 border-amber-500" />
            <span>Dependency</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
