import { getModulesByWeek } from "@/lib/modules"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, Code, Rocket, Users } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Course Syllabus | Agentic Software Engineering",
  description: "Complete 90-day curriculum for building production-grade AI agents. Learn LangGraph, MCP, multi-agent systems, and advanced architectures.",
}

export default function SyllabusPage() {
  const weeks = getModulesByWeek()
  const weekNumbers = Object.keys(weeks).map(Number).sort((a, b) => a - b)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-12">
        {/* Header */}
        <div className="space-y-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Course Syllabus
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              A comprehensive 90-day journey from LLM fundamentals to production-grade agentic systems. 
              Build 12 real-world projects across 3 months.
            </p>
          </div>
        </div>

        {/* Course Overview */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Duration</CardTitle>
              </div>
              <CardDescription className="text-base text-foreground">
                90 days • 12 weeks
              </CardDescription>
              <CardDescription className="text-sm">
                Structured learning path with daily modules
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Code className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Projects</CardTitle>
              </div>
              <CardDescription className="text-base text-foreground">
                12 hands-on projects
              </CardDescription>
              <CardDescription className="text-sm">
                3 capstones • 4 specialized • 5 mini-projects
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Rocket className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Outcome</CardTitle>
              </div>
              <CardDescription className="text-base text-foreground">
                Production-ready skills
              </CardDescription>
              <CardDescription className="text-sm">
                Deploy autonomous agent systems at scale
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Learning Path */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">What You&apos;ll Learn</h2>
            <p className="text-muted-foreground">
              The course is structured into three progressive months, each building on the previous:
            </p>
          </div>

          {/* Month 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1">
                Month 1
              </Badge>
              <h3 className="text-xl font-semibold text-foreground">
                Foundations & Core Concepts
              </h3>
            </div>
            <p className="text-muted-foreground pl-20">
              Master LLM fundamentals, prompt engineering, single-agent systems, RAG, and memory architectures. 
              Build your first autonomous agents with LangChain, CrewAI, and MCP.
            </p>
            <div className="pl-20 space-y-2">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Weeks 1-4:</span> The Agentic Mindset • The Agentic Toolkit • RAG & Memory Systems • Single-Agent Mastery
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Projects:</span> Prompt Library, Memory Service, RAG Service
              </div>
            </div>
          </div>

          {/* Month 2 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 px-3 py-1">
                Month 2
              </Badge>
              <h3 className="text-xl font-semibold text-foreground">
                Multi-Agent Systems & Production Engineering
              </h3>
            </div>
            <p className="text-muted-foreground pl-20">
              Learn orchestration patterns, security, observability, and reliability. Build production-grade 
              multi-agent systems with proper monitoring, testing, and deployment practices.
            </p>
            <div className="pl-20 space-y-2">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Weeks 5-8:</span> Multi-Agent Orchestration • Production Security • Observability & Reliability • Production Engineering
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Projects:</span> LLM Router, Research Agent, Privacy Analyst
              </div>
            </div>
          </div>

          {/* Month 3 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-green-500/10 text-green-400 border-green-500/20 px-3 py-1">
                Month 3
              </Badge>
              <h3 className="text-xl font-semibold text-foreground">
                Advanced Architectures & Mastery
              </h3>
            </div>
            <p className="text-muted-foreground pl-20">
              Master agent swarms, enterprise deployment, and specialized architectures. Build complex systems 
              including K8s operators, forensics swarms, and your final AgentOS ecosystem.
            </p>
            <div className="pl-20 space-y-2">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Weeks 9-12:</span> Agent Swarms • Enterprise Deployment • Specialized Projects • Capstone & Mastery
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Projects:</span> Refactoring Agent, Forensics Swarm, Domain Swarm, Deep Research Agent, K8s Operator, AgentOS Ecosystem
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Breakdown */}
        <div className="space-y-8 pt-8 border-t border-border">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Weekly Breakdown</h2>
            <p className="text-muted-foreground">
              Detailed view of all 12 weeks and 90 daily modules:
            </p>
          </div>

          <div className="space-y-8">
            {weekNumbers.map((weekNum) => (
              <div key={weekNum} className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-card text-primary font-bold border border-border shadow-sm flex-shrink-0">
                    W{weekNum}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {weekNum === 1 && "The Agentic Mindset"}
                      {weekNum === 2 && "The Agentic Toolkit"}
                      {weekNum === 3 && "RAG & Memory Systems"}
                      {weekNum === 4 && "Single-Agent Mastery"}
                      {weekNum === 5 && "Multi-Agent Orchestration"}
                      {weekNum === 6 && "Production Security"}
                      {weekNum === 7 && "Observability & Reliability"}
                      {weekNum === 8 && "Production Engineering"}
                      {weekNum === 9 && "Agent Swarms"}
                      {weekNum === 10 && "Enterprise Deployment"}
                      {weekNum === 11 && "Specialized Projects"}
                      {weekNum === 12 && "Capstone & Mastery"}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {weekNum === 1 && "Foundations: LLMs, Prompts, and Context"}
                      {weekNum === 2 && "Frameworks: LangChain, CrewAI, and MCP"}
                      {weekNum === 3 && "Knowledge: Vector DBs, Embeddings, Retrieval"}
                      {weekNum === 4 && "Integration: Tools, APIs, and Workflows"}
                      {weekNum === 5 && "Patterns: Coordination, Delegation, Consensus"}
                      {weekNum === 6 && "Security: Sandboxing, Auth, and Guardrails"}
                      {weekNum === 7 && "Monitoring: Tracing, Logging, and Debugging"}
                      {weekNum === 8 && "Engineering: Durability, Scaling, and Testing"}
                      {weekNum === 9 && "Swarms: Emergent Behavior and Collective Intelligence"}
                      {weekNum === 10 && "Enterprise: K8s, CI/CD, and Infrastructure"}
                      {weekNum === 11 && "Projects: Privacy, Refactoring, Forensics Agents"}
                      {weekNum === 12 && "Capstone: AgentOS Ecosystem and Final Projects"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {weeks[weekNum].map((module) => (
                        <Link key={module.slug} href={`/modules/${module.slug}`}>
                          <Badge 
                            variant="outline" 
                            className="text-xs hover:bg-primary/10 hover:border-primary/50 transition-colors cursor-pointer"
                          >
                            Day {module.day.toString().padStart(2, '0')}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="pt-8 border-t border-border">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="text-center space-y-4 p-8">
              <div className="flex justify-center">
                <Users className="w-12 h-12 text-primary" />
              </div>
              <CardTitle className="text-2xl">Ready to Start Your Journey?</CardTitle>
              <CardDescription className="text-base max-w-2xl mx-auto">
                Begin with Week 1 and learn how to build autonomous agents that can reason, plan, and execute complex tasks.
              </CardDescription>
              <div className="pt-4">
                <Link href="/modules/day-01-interface-of-agentic-ai">
                  <Button size="lg" className="h-12 px-8 text-base bg-white text-black hover:bg-zinc-200 gap-2 font-semibold">
                    Start Week 1
                  </Button>
                </Link>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}
