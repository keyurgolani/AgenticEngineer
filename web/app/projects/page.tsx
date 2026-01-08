import Link from "next/link"
import { ArrowRight, Code, Terminal, Shield, Workflow, Layers, ExternalLink, Lightbulb, Globe, GraduationCap, FileCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ProjectIdeasPage() {
  const coreProjects = [
    {
      id: 1,
      title: "The 'Deep Research' Analyst",
      description: "Build an autonomous agent that can research any topic, browse the web, scrape content, and synthesize a comprehensive report with citations.",
      day: "Day 08",
      slug: "day-08-project1-deep-research",
      icon: Terminal,
      skills: ["Agent Loops", "Web Search", "Summarization"],
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      id: 2,
      title: "Self-Healing K8s Operator",
      description: "Create an agentic Kubernetes operator that monitors cluster state, detects crash loops, analyzes logs, and autonomously applies fixes.",
      day: "Day 10",
      slug: "day-10-project2-k8s-operator",
      icon: Layers,
      skills: ["Event Driven", "Infrastructure", "Diagnosis"],
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      id: 3,
      title: "Secure Data Analyst",
      description: "A local-first agent that can write and execute SQL/Python to analyze sensitive CSV/Excel data without it ever leaving your machine.",
      day: "Day 15",
      slug: "day-15-project3-local-analyst",
      icon: Shield,
      skills: ["Code Execution", "Security", "Local LLMs"],
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    {
      id: 4,
      title: "Legacy Code Refactorer",
      description: "An advanced agent that can traverse a git repository, build a dependency graph, and autonomously refactor legacy code to modern patterns.",
      day: "Day 17",
      slug: "day-17-project4-refactorer",
      icon: Code,
      skills: ["AST Analysis", "Git Ops", "Refactoring"],
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    },
    {
      id: 5,
      title: "Financial Forensics Swarm",
      description: "A multi-agent swarm coordinated to detect fraud patterns in real-time transaction streams using specialized worker agents.",
      day: "Day 22",
      slug: "day-22-project5-forensics-swarm",
      icon: Workflow,
      skills: ["Swarm Orchestration", "Real-time", "Specialization"],
      color: "text-red-500",
      bg: "bg-red-500/10"
    },
    {
      id: 6,
      title: "Domain Intelligence Swarm",
      description: "An autonomous multi-agent system that monitors expiring domains, evaluates their value, and executes purchases based on predefined criteria.",
      day: "Day 25",
      slug: "day-25-project-domain-swarm",
      icon: Globe,
      skills: ["Multi-Agent", "Event-Driven", "API Integration"],
      color: "text-violet-500",
      bg: "bg-violet-500/10"
    },
    {
      id: 7,
      title: "Interactive Onboarding Assistant",
      description: "Transform documents into an interactive learning dashboard with study guides, quizzes, practice simulations, and grounded Q&A.",
      day: "Day 34",
      slug: "day-34-project-onboarding-assistant",
      icon: GraduationCap,
      skills: ["RAG", "Quiz Generation", "Simulations"],
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      id: 8,
      title: "Spec-Driven AI Coder",
      description: "A multi-phase agent IDE that plans architecture, implements code, and verifies against specifications—separating thinking from coding.",
      day: "Day 35",
      slug: "day-35-project-spec-coder",
      icon: FileCode,
      skills: ["Spec-Driven", "Multi-Phase", "Verification"],
      color: "text-pink-500",
      bg: "bg-pink-500/10"
    }
  ]

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 md:px-12 bg-muted/20 border-b border-border/40">
        <div className="max-w-7xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 px-3 py-1 text-sm border-primary/20 bg-primary/5 text-primary">
                Hands-On Implementation
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                Project Ideas & <span className="text-primary">Implementations</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                The Agentic Engineer Handbook is built around <span className="text-foreground font-medium">5 Core Projects</span>. 
                These aren&apos;t just tutorials—they are production-grade reference implementations.
            </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreProjects.map((project) => (
                <div key={project.id} className="group relative flex flex-col bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
                    <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${project.bg} ${project.color}`}>
                                <project.icon className="w-6 h-6" />
                            </div>
                            <Badge variant="secondary" className="font-mono text-xs text-muted-foreground/80">
                                {project.day}
                            </Badge>
                        </div>
                        
                        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                            {project.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                            {project.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                            {project.skills.map(skill => (
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
            ))}

            {/* Coming Soon Card */}
            <div className="flex flex-col items-center justify-center bg-muted/20 border border-dashed border-border rounded-2xl p-8 min-h-[300px] text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
                    <Lightbulb className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-muted-foreground">More Ideas Coming Soon</h3>
                <p className="text-sm text-muted-foreground/60 max-w-xs mb-6">
                    Have a project idea? Contribute to the handbook.
                </p>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" asChild>
                    <a href="https://github.com/StartAgentic/agentic-engineer-handbook" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                        Contribute on GitHub
                    </a>
                </Button>
            </div>
        </div>
      </section>
    </div>
  )
}
