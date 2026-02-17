"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Trophy,
  Code,
  Database,
  Search,
  Shield,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Project {
  id: string
  title: string
  day: string
  type: "capstone" | "specialized" | "mini"
  description: string
  icon: typeof Trophy
  color: string
  techStack: string[]
  features: string[]
  difficulty: 1 | 2 | 3 | 4 | 5
  estimatedHours: number
  learningOutcomes: string[]
}

const PROJECTS: Project[] = [
  {
    id: "deep-research",
    title: "Deep Research Agent",
    day: "Day 24",
    type: "capstone",
    description: "Build a sophisticated research agent that can conduct multi-step investigations, synthesize information from multiple sources, and generate comprehensive reports.",
    icon: Search,
    color: "text-purple-500",
    techStack: ["LangGraph", "Tavily API", "RAG", "Streaming"],
    features: [
      "Multi-step research planning",
      "Source credibility assessment",
      "Iterative refinement loop",
      "Citation generation",
      "Report formatting",
    ],
    difficulty: 4,
    estimatedHours: 20,
    learningOutcomes: [
      "Complex agent orchestration",
      "Information retrieval strategies",
      "Multi-document synthesis",
    ],
  },
  {
    id: "k8s-operator",
    title: "K8s SRE Operator Agent",
    day: "Day 55",
    type: "capstone",
    description: "Create an intelligent Kubernetes operator that can diagnose issues, suggest remediations, and automate incident response with human-in-the-loop approval.",
    icon: Cpu,
    color: "text-blue-500",
    techStack: ["Kubernetes", "Python Operator SDK", "LangGraph", "Prometheus"],
    features: [
      "Pod failure diagnosis",
      "Automated remediation suggestions",
      "Human approval workflow",
      "Incident timeline tracking",
      "Slack integration",
    ],
    difficulty: 5,
    estimatedHours: 30,
    learningOutcomes: [
      "Kubernetes operator patterns",
      "Production agent deployment",
      "Human-in-the-loop systems",
    ],
  },
  {
    id: "agentos",
    title: "AgentOS Ecosystem",
    day: "Day 87",
    type: "capstone",
    description: "Build a complete agent operating system with multiple specialized agents, shared memory, intelligent routing, and a unified API.",
    icon: Trophy,
    color: "text-amber-500",
    techStack: ["FastAPI", "LangGraph", "Redis", "PostgreSQL", "React"],
    features: [
      "5 specialized agents",
      "Smart request routing",
      "Shared memory system",
      "Prompt library",
      "Web dashboard",
    ],
    difficulty: 5,
    estimatedHours: 40,
    learningOutcomes: [
      "Multi-agent architecture",
      "System design at scale",
      "Full-stack agent development",
    ],
  },
  {
    id: "privacy-analyst",
    title: "Privacy Analyst Agent",
    day: "Day 77",
    type: "specialized",
    description: "Develop an agent that analyzes codebases for privacy compliance, PII detection, and GDPR/CCPA requirements.",
    icon: Shield,
    color: "text-green-500",
    techStack: ["AST Parsing", "Regex Patterns", "LLM Analysis", "Report Generation"],
    features: [
      "PII pattern detection",
      "Compliance checking",
      "Risk scoring",
      "Remediation suggestions",
    ],
    difficulty: 4,
    estimatedHours: 15,
    learningOutcomes: [
      "Code analysis techniques",
      "Privacy regulations",
      "Security-focused agents",
    ],
  },
  {
    id: "refactoring-agent",
    title: "Refactoring Agent",
    day: "Day 78",
    type: "specialized",
    description: "Create an agent that can analyze code quality, suggest refactoring opportunities, and safely apply transformations.",
    icon: Code,
    color: "text-cyan-500",
    techStack: ["Tree-sitter", "Language Servers", "Git", "Testing Frameworks"],
    features: [
      "Code smell detection",
      "Safe refactoring",
      "Test preservation",
      "Incremental changes",
    ],
    difficulty: 4,
    estimatedHours: 18,
    learningOutcomes: [
      "AST manipulation",
      "Code transformation",
      "Safe automation",
    ],
  },
  {
    id: "rag-service",
    title: "RAG Service",
    day: "Day 84",
    type: "mini",
    description: "Build a production-ready RAG service with document ingestion, chunking strategies, and hybrid search.",
    icon: Database,
    color: "text-teal-500",
    techStack: ["ChromaDB", "OpenAI Embeddings", "FastAPI", "BM25"],
    features: [
      "Multiple chunking strategies",
      "Hybrid search (vector + keyword)",
      "Metadata filtering",
      "Relevance scoring",
    ],
    difficulty: 3,
    estimatedHours: 10,
    learningOutcomes: [
      "Vector database operations",
      "Retrieval optimization",
      "Search ranking",
    ],
  },
  {
    id: "financial-forensics-swarm",
    title: "Financial Forensics Swarm",
    day: "Day 79",
    type: "capstone",
    description: "Build a multi-agent swarm that investigates financial fraud by correlating data across multiple sources using MCP servers.",
    icon: Shield,
    color: "text-red-500",
    techStack: ["MCP", "FastAPI", "Graph Analysis", "Multi-Agent"],
    features: [
      "Multi-source correlation",
      "Fraud pattern detection",
      "Graph-based analysis",
      "Real-time monitoring",
      "Audit trail generation",
    ],
    difficulty: 5,
    estimatedHours: 25,
    learningOutcomes: [
      "MCP integration",
      "Multi-agent swarms",
      "Financial domain expertise",
    ],
  },
  {
    id: "local-data-analyst",
    title: "Local Data Analyst",
    day: "Day 77",
    type: "capstone",
    description: "Create a privacy-preserving data analyst that runs entirely locally, analyzing sensitive data without sending it to external APIs.",
    icon: Database,
    color: "text-emerald-500",
    techStack: ["Ollama", "DuckDB", "Local LLMs", "Sandboxing"],
    features: [
      "Local-only processing",
      "Schema-only prompting",
      "SQL generation",
      "Data visualization",
      "Privacy compliance",
    ],
    difficulty: 4,
    estimatedHours: 18,
    learningOutcomes: [
      "Local model deployment",
      "Privacy-preserving AI",
      "Data analysis automation",
    ],
  },
  {
    id: "prompt-library-service",
    title: "Prompt Library Service",
    day: "Day 82",
    type: "mini",
    description: "Build a versioned prompt management system with templating, A/B testing, and analytics.",
    icon: Code,
    color: "text-orange-500",
    techStack: ["FastAPI", "PostgreSQL", "Jinja2", "Redis"],
    features: [
      "Version control",
      "Template rendering",
      "A/B testing",
      "Usage analytics",
    ],
    difficulty: 2,
    estimatedHours: 8,
    learningOutcomes: [
      "Prompt management",
      "API design",
      "Version control patterns",
    ],
  },
  {
    id: "memory-service",
    title: "Memory Service",
    day: "Day 83",
    type: "mini",
    description: "Implement a memory service with working, episodic, and semantic memory layers for agent persistence.",
    icon: Database,
    color: "text-indigo-500",
    techStack: ["Redis", "PostgreSQL", "Vector DB", "FastAPI"],
    features: [
      "Working memory",
      "Episodic memory",
      "Semantic memory",
      "Memory consolidation",
    ],
    difficulty: 3,
    estimatedHours: 10,
    learningOutcomes: [
      "Memory architectures",
      "Vector databases",
      "State persistence",
    ],
  },
  {
    id: "llm-router",
    title: "LLM Router",
    day: "Day 85",
    type: "mini",
    description: "Build an intelligent router that selects the optimal model based on query complexity, cost, and latency requirements.",
    icon: Cpu,
    color: "text-pink-500",
    techStack: ["FastAPI", "Multiple LLM APIs", "Caching", "Metrics"],
    features: [
      "Complexity assessment",
      "Cost optimization",
      "Fallback handling",
      "Usage tracking",
    ],
    difficulty: 3,
    estimatedHours: 8,
    learningOutcomes: [
      "Model routing",
      "Cost optimization",
      "API abstraction",
    ],
  },
  {
    id: "research-agent",
    title: "Research Agent",
    day: "Day 86",
    type: "mini",
    description: "Create a focused research agent that can search, synthesize, and cite sources for any topic.",
    icon: Search,
    color: "text-violet-500",
    techStack: ["Tavily API", "LangGraph", "Markdown", "Citations"],
    features: [
      "Web search",
      "Source synthesis",
      "Citation generation",
      "Report formatting",
    ],
    difficulty: 3,
    estimatedHours: 6,
    learningOutcomes: [
      "Research automation",
      "Source synthesis",
      "Citation handling",
    ],
  },
]

const TYPE_COLORS = {
  capstone: "bg-amber-500",
  specialized: "bg-purple-500",
  mini: "bg-blue-500",
}

export function CapstoneProjectGallery() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [filter, setFilter] = useState<string | null>(null)

  const filteredProjects = filter 
    ? PROJECTS.filter(p => p.type === filter)
    : PROJECTS

  const currentIndex = selectedProject 
    ? filteredProjects.findIndex(p => p.id === selectedProject.id)
    : -1

  const navigateProject = (direction: "prev" | "next") => {
    if (currentIndex === -1) return
    const newIndex = direction === "prev" 
      ? (currentIndex - 1 + filteredProjects.length) % filteredProjects.length
      : (currentIndex + 1) % filteredProjects.length
    setSelectedProject(filteredProjects[newIndex])
  }

  const renderStars = (count: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-3 w-3",
            i <= count ? "fill-amber-500 text-amber-500" : "text-muted-foreground"
          )}
        />
      ))}
    </div>
  )

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Capstone Project Gallery
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={filter === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter(null)}
          >
            All Projects ({PROJECTS.length})
          </Badge>
          <Badge
            variant={filter === "capstone" ? "default" : "outline"}
            className={cn("cursor-pointer", filter === "capstone" && "bg-amber-500")}
            onClick={() => setFilter("capstone")}
          >
            Capstone ({PROJECTS.filter(p => p.type === "capstone").length})
          </Badge>
          <Badge
            variant={filter === "specialized" ? "default" : "outline"}
            className={cn("cursor-pointer", filter === "specialized" && "bg-purple-500")}
            onClick={() => setFilter("specialized")}
          >
            Specialized ({PROJECTS.filter(p => p.type === "specialized").length})
          </Badge>
          <Badge
            variant={filter === "mini" ? "default" : "outline"}
            className={cn("cursor-pointer", filter === "mini" && "bg-blue-500")}
            onClick={() => setFilter("mini")}
          >
            Mini ({PROJECTS.filter(p => p.type === "mini").length})
          </Badge>
        </div>

        {/* Project Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project, index) => {
            const Icon = project.icon
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedProject(project)}
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-all hover:border-primary/50",
                  selectedProject?.id === project.id && "ring-2 ring-primary"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-lg bg-muted")}>
                    <Icon className={cn("h-5 w-5", project.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge className={cn("text-xs capitalize", TYPE_COLORS[project.type])}>
                        {project.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{project.day}</span>
                    </div>
                    <h4 className="font-semibold mt-1">{project.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        {renderStars(project.difficulty)}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ~{project.estimatedHours}h
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Selected Project Details */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="border rounded-lg overflow-hidden"
            >
              <div className="p-4 bg-muted/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = selectedProject.icon
                    return <Icon className={cn("h-6 w-6", selectedProject.color)} />
                  })()}
                  <div>
                    <h3 className="font-semibold">{selectedProject.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={cn("text-xs", TYPE_COLORS[selectedProject.type])}>
                        {selectedProject.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{selectedProject.day}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigateProject("prev")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigateProject("next")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  {selectedProject.description}
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Tech Stack */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Tech Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.techStack.map((tech, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4">
                    <div className="p-3 rounded-lg bg-muted/50 text-center flex-1">
                      <div className="flex justify-center mb-1">
                        {renderStars(selectedProject.difficulty)}
                      </div>
                      <div className="text-xs text-muted-foreground">Difficulty</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center flex-1">
                      <div className="text-lg font-bold">{selectedProject.estimatedHours}h</div>
                      <div className="text-xs text-muted-foreground">Estimated</div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Key Features</h4>
                  <ul className="grid md:grid-cols-2 gap-1">
                    {selectedProject.features.map((feature, i) => (
                      <li key={i} className="text-sm flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Learning Outcomes */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Learning Outcomes</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.learningOutcomes.map((outcome, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {outcome}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
