import Link from "next/link"
import { ArrowRight, Code, Terminal, Shield, Workflow, Layers, ExternalLink, Lightbulb, Globe, GraduationCap, Zap, FlaskConical, Boxes, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ProjectIdeasPage() {
  const exercises = [
    { id: "EX-01", title: "First LLM Call", time: "15 min", skill: "LLM Basics" },
    { id: "EX-02", title: "Structured Output", time: "20 min", skill: "Pydantic" },
    { id: "EX-03", title: "Tool Definition", time: "20 min", skill: "Tools" },
    { id: "EX-04", title: "Environment Config", time: "15 min", skill: "Config" },
    { id: "EX-05", title: "Prompt Templates", time: "20 min", skill: "Jinja2" },
    { id: "EX-06", title: "ReAct Loop", time: "30 min", skill: "Agent Loops" },
    { id: "EX-07", title: "Conversation Memory", time: "25 min", skill: "Memory" },
    { id: "EX-08", title: "Simple Router", time: "20 min", skill: "Routing" },
    { id: "EX-09", title: "Embeddings", time: "25 min", skill: "Vectors" },
    { id: "EX-10", title: "FastAPI Endpoint", time: "30 min", skill: "APIs" },
    { id: "EX-11", title: "Redis Operations", time: "25 min", skill: "Redis" },
    { id: "EX-12", title: "Document Chunking", time: "20 min", skill: "RAG" },
    { id: "EX-13", title: "Vector Store", time: "30 min", skill: "ChromaDB" },
    { id: "EX-14", title: "Simple RAG Query", time: "30 min", skill: "RAG" },
    { id: "EX-15", title: "Fact Extraction", time: "25 min", skill: "Memory" },
  ]

  const pocs = [
    { id: "POC-01", title: "LangGraph State Machine", time: "1.5 hrs", builds: "Orchestrator" },
    { id: "POC-02", title: "Semantic Memory Search", time: "1.5 hrs", builds: "Memory Service" },
    { id: "POC-03", title: "Multi-Provider LLM", time: "2 hrs", builds: "LLM Router" },
    { id: "POC-04", title: "Prompt Versioning", time: "1.5 hrs", builds: "Prompt Library" },
    { id: "POC-05", title: "Web Search Integration", time: "2 hrs", builds: "Research Agent" },
    { id: "POC-06", title: "Request Classification", time: "1.5 hrs", builds: "Orchestrator" },
  ]

  const miniProjects = [
    {
      id: "MP-01",
      title: "Prompt Library Service",
      day: "Day 25",
      slug: "day-25-mini-project-prompt-library",
      port: "8001",
      description: "Centralized prompt storage with versioning and template rendering",
      skills: ["FastAPI", "SQLite", "Jinja2"],
    },
    {
      id: "MP-02",
      title: "Memory Service",
      day: "Day 26",
      slug: "day-26-mini-project-memory-service",
      port: "8002",
      description: "Three-tier memory: STM (Redis), LTM (PostgreSQL), Episodic",
      skills: ["Redis", "PostgreSQL", "Embeddings"],
    },
    {
      id: "MP-03",
      title: "RAG Service",
      day: "Day 27",
      slug: "day-27-mini-project-rag-service",
      port: "8003",
      description: "Document ingestion, chunking, and hybrid search",
      skills: ["ChromaDB", "Chunking", "BM25"],
    },
    {
      id: "MP-04",
      title: "LLM Router Service",
      day: "Day 28",
      slug: "day-28-mini-project-llm-router",
      port: "8004",
      description: "Multi-provider routing with fallback and cost tracking",
      skills: ["Ollama", "OpenAI", "Fallback"],
    },
    {
      id: "MP-05",
      title: "Research Agent Service",
      day: "Day 29",
      slug: "day-29-mini-project-research-agent",
      port: "8005",
      description: "Web search and synthesis with citation tracking",
      skills: ["SearXNG", "Tavily", "Synthesis"],
    },
  ]

  // Major Capstone Projects (3 total)
  const capstoneProjects = [
    {
      id: 1,
      title: "Deep Research Agent",
      description: "Autonomous agent that researches topics, browses the web, and synthesizes comprehensive reports with citations.",
      day: "Day 30",
      slug: "day-30-capstone-deep-research",
      icon: Terminal,
      skills: ["Agent Loops", "Web Search", "Summarization"],
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      time: "8 hours"
    },
    {
      id: 2,
      title: "K8s Operator Agent",
      description: "Agentic Kubernetes operator that monitors cluster state, detects crash loops, analyzes logs, and applies fixes.",
      day: "Day 60",
      slug: "day-60-capstone-k8s-operator",
      icon: Layers,
      skills: ["Event Driven", "Infrastructure", "Diagnosis"],
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      time: "10 hours"
    },
    {
      id: 3,
      title: "AgentOS Ecosystem",
      description: "The grand finale. Build a complete self-hosted platform with smart orchestrator, agent fleet, and all supporting services.",
      day: "Day 90",
      slug: "day-90-capstone-agentic-ecosystem",
      icon: Globe,
      skills: ["Full Stack", "Orchestration", "Deployment"],
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      time: "20+ hours"
    },
  ]

  // Specialized Projects (4 total)
  const specializedProjects = [
    {
      id: 1,
      title: "Privacy Analyst",
      description: "Local-first agent that writes and executes SQL/Python to analyze sensitive data without it leaving your machine.",
      day: "Day 45",
      slug: "day-45-project-privacy-analyst",
      icon: Shield,
      skills: ["Code Execution", "Security", "Local LLMs"],
      color: "text-green-500",
      bg: "bg-green-500/10",
      time: "6 hours"
    },
    {
      id: 2,
      title: "Refactoring Agent",
      description: "Agent that traverses git repositories, builds dependency graphs, and autonomously refactors legacy code.",
      day: "Day 50",
      slug: "day-50-project-refactoring-agent",
      icon: Code,
      skills: ["AST Analysis", "Git Ops", "Refactoring"],
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      time: "8 hours"
    },
    {
      id: 3,
      title: "Forensics Swarm",
      description: "Multi-agent swarm coordinated to detect fraud patterns in real-time transaction streams.",
      day: "Day 70",
      slug: "day-70-project-forensics-swarm",
      icon: Workflow,
      skills: ["Swarm Orchestration", "Real-time", "Specialization"],
      color: "text-red-500",
      bg: "bg-red-500/10",
      time: "8 hours"
    },
    {
      id: 4,
      title: "Domain Swarm",
      description: "Specialized multi-agent system for domain-specific tasks with expert agents collaborating on complex problems.",
      day: "Day 80",
      slug: "day-80-project-domain-swarm",
      icon: GraduationCap,
      skills: ["Multi-Agent", "Domain Expertise", "Collaboration"],
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
      time: "10 hours"
    },
  ]

  const finalCapstone = {
    title: "AgentOS: Self-Hosted Agentic Ecosystem",
    description: "The grand finale. Build a complete self-hosted platform with smart orchestrator, agent fleet, and all supporting services. Supports local LLMs and cloud providers with full memory, RAG, and research capabilities.",
    day: "Day 90",
    slug: "day-90-capstone-agentic-ecosystem",
    time: "20+ hours",
    components: [
      "Smart Orchestrator with request classification",
      "5 Specialized Agents (Research, Code, Analysis, Creative, Assistant)",
      "Unified API Gateway with authentication",
      "Web Dashboard for monitoring",
      "Docker Compose deployment",
      "Local + Cloud LLM support"
    ]
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 md:px-12 bg-muted/20 border-b border-border/40">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 px-3 py-1 text-sm border-primary/20 bg-primary/5 text-primary">
            6-Tier Project System • 90-Day Curriculum
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            From Exercises to <span className="text-primary">Ecosystem</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Progressive skill building through exercises, POCs, mini projects, full projects, 
            and the ultimate capstone—your own <span className="text-foreground font-medium">Self-Hosted AgentOS</span>.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-20">
        
        {/* Tier 1: Exercises */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Tier 1: Exercises</h2>
              <p className="text-sm text-muted-foreground">15-30 minutes each • Quick skill validation</p>
            </div>
            <div className="h-px flex-1 bg-border/50"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {exercises.map((ex) => (
              <div key={ex.id} className="p-3 rounded-lg border border-border/50 bg-card hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-emerald-500">{ex.id}</span>
                  <span className="text-xs text-muted-foreground">{ex.time}</span>
                </div>
                <p className="text-sm font-medium">{ex.title}</p>
                <span className="text-xs text-muted-foreground">{ex.skill}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <Link href="/modules/day-00-project-hierarchy">
              <Button variant="outline" size="sm" className="gap-2">
                View All Exercises <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Tier 2: POCs */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Tier 2: Proof of Concepts</h2>
              <p className="text-sm text-muted-foreground">1-2 hours each • Prove component patterns</p>
            </div>
            <div className="h-px flex-1 bg-border/50"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pocs.map((poc) => (
              <div key={poc.id} className="p-4 rounded-xl border border-border/50 bg-card hover:border-amber-500/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-mono text-amber-500">{poc.id}</span>
                  <span className="text-xs text-muted-foreground">{poc.time}</span>
                </div>
                <h3 className="font-semibold mb-1">{poc.title}</h3>
                <p className="text-sm text-muted-foreground">Builds toward: {poc.builds}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tier 3: Mini Projects */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Boxes className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Tier 3: Mini Projects</h2>
              <p className="text-sm text-muted-foreground">2-4 hours each • Standalone deployable services</p>
            </div>
            <div className="h-px flex-1 bg-border/50"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {miniProjects.map((mp) => (
              <Link key={mp.id} href={`/modules/${mp.slug}`}>
                <div className="group p-5 rounded-xl border border-border/50 bg-card hover:border-blue-500/30 hover:shadow-lg transition-all h-full">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-mono text-blue-500">{mp.id}</span>
                    <Badge variant="secondary" className="text-xs">Port {mp.port}</Badge>
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-blue-500 transition-colors">{mp.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{mp.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {mp.skills.map((skill) => (
                      <span key={skill} className="px-2 py-0.5 rounded bg-muted text-xs">{skill}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Tier 4: Specialized Projects */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Tier 4: Specialized Projects</h2>
              <p className="text-sm text-muted-foreground">6-10 hours each • Domain-specific systems</p>
            </div>
            <div className="h-px flex-1 bg-border/50"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {specializedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>

        {/* Tier 5: Major Capstone Projects */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Tier 5: Major Capstone Projects</h2>
              <p className="text-sm text-muted-foreground">8-20+ hours each • End-of-month milestones</p>
            </div>
            <div className="h-px flex-1 bg-border/50"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {capstoneProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>

        {/* Tier 6: Final Capstone */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-rose-500">Tier 6: Final Capstone</h2>
              <p className="text-sm text-muted-foreground">20+ hours • The ultimate challenge</p>
            </div>
            <div className="h-px flex-1 bg-rose-500/20"></div>
          </div>
          
          <div className="relative p-8 rounded-2xl border-2 border-rose-500/30 bg-gradient-to-br from-rose-500/5 to-transparent">
            <div className="absolute top-4 right-4">
              <Badge className="bg-rose-500 text-white">{finalCapstone.day}</Badge>
            </div>
            
            <h3 className="text-2xl font-bold mb-3">{finalCapstone.title}</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl">{finalCapstone.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {finalCapstone.components.map((component, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                  {component}
                </div>
              ))}
            </div>
            
            <Link href={`/modules/${finalCapstone.slug}`}>
              <Button className="bg-rose-500 hover:bg-rose-600 text-white gap-2">
                Start the Capstone <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Contribute Section */}
        <div className="flex flex-col items-center justify-center bg-muted/20 border border-dashed border-border rounded-2xl p-8 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
            <Lightbulb className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-muted-foreground">Have a Project Idea?</h3>
          <p className="text-sm text-muted-foreground/60 max-w-xs mb-6">
            Contribute exercises, POCs, or full projects to the handbook.
          </p>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" asChild>
            <a href="https://github.com/keyurgolani/AgenticEngineer" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
              Contribute on GitHub
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}

interface Project {
  id: number
  title: string
  description: string
  day: string
  slug: string
  icon: React.ElementType
  skills: string[]
  color: string
  bg: string
  time: string
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="group relative flex flex-col bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 h-full">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${project.bg} ${project.color}`}>
            <project.icon className="w-6 h-6" />
          </div>
          <div className="text-right">
            <Badge variant="secondary" className="font-mono text-xs text-muted-foreground/80">
              {project.day}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">{project.time}</p>
          </div>
        </div>
        
        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
          {project.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {project.skills.map((skill: string) => (
            <span key={skill} className="px-2 py-1 rounded-md bg-muted text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      <div className="p-6 pt-0 mt-auto">
        <Link href={`/modules/${project.slug}`} className="w-full">
          <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all" variant="outline">
            View Project
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
