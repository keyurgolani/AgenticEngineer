import { getModulesByWeek, getAllModules } from "@/lib/modules"
import Link from "next/link"
import Image from "next/image"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Terminal, Cpu, Shield, Zap } from "lucide-react"
import { ContinueLearning } from "@/components/custom/ContinueLearning"
import { HomeProgressSection } from "@/components/features/home/HomeProgressSection"

export default function Home() {
  const weeks = getModulesByWeek()
  const weekNumbers = Object.keys(weeks).map(Number).sort((a, b) => a - b)
  const allModules = getAllModules()

  return (
    <div className="min-h-screen flex flex-col items-center bg-background transition-colors duration-300">

      {/* Hero Section */}
      <section className="w-full max-w-5xl py-32 px-6 text-center space-y-8 relative overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-[-1]">
            <Image
                src="/images/dawn_of_silicon_employee.png"
                alt="Dawn of the Silicon Employee"
                fill
                className="object-cover opacity-15"
                priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/80" />
             <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background" />
        </div>
        
        {/* <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full -z-10" /> remove old blob */}
        
        <Badge variant="outline" className="text-blue-400 border-blue-900/50 bg-blue-900/10 px-4 py-1.5 rounded-full text-sm font-medium">
            The 2026 Agentic Software Engineer
        </Badge>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight pb-4 leading-tight text-foreground">
            The Dawn of the <br className="hidden md:block"/>
            <span className="text-primary">Silicon Employee</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Move from writing code to orchestrating <span className="text-foreground font-medium">autonomous workforces</span>. 
            A comprehensive one-month intensive to build production-grade Agentic Systems with 5 real-world projects.
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 pt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">📚 30+ Modules</span>
            <span className="flex items-center gap-1">🛠️ 5 Capstone Projects</span>
            <span className="flex items-center gap-1">🔧 Hands-on Labs</span>
            <span className="flex items-center gap-1">🌐 Open Source</span>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
            <Link href="/modules/day-01-interface-of-agentic-ai">
                <Button size="lg" className="h-12 px-8 text-base bg-white text-black hover:bg-zinc-200 gap-2 font-semibold">
                    Start Week 1 <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
            </Link>
            <Link href="/modules/day-30-conclusion">
                 <Button size="lg" variant="outline" className="h-12 px-8 text-base border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900">
                    View Syllabus
                </Button>
            </Link>
        </div>

        {/* Continue Learning Section */}
        <div className="pt-12 max-w-3xl mx-auto w-full">
          <ContinueLearning modules={allModules} />
        </div>

        {/* Progress Section */}
        <HomeProgressSection totalModules={allModules.length} />

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-20 text-left">
            {[
                { icon: Cpu, label: "Neuro-Symbolic AI", desc: "LLMs + ASTs" },
                { icon: Terminal, label: "Local-First", desc: "Run on Your Metal" },
                { icon: Shield, label: "Production Security", desc: "Sandboxing & Auth" },
                { icon: Zap, label: "Multi-Agent Swarms", desc: "CrewAI & LangGraph" }
            ].map((f, i) => (
                <div key={i} className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors shadow-sm">
                    <f.icon className="w-6 h-6 text-primary mb-3" />
                    <div className="font-semibold text-card-foreground text-sm">{f.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{f.desc}</div>
                </div>
            ))}
        </div>
      </section>
      
      {/* Curriculum Grid */}
      <section className="w-full max-w-7xl px-6 pb-32 space-y-24">
        {weekNumbers.map((weekNum) => (
            <div key={weekNum} className="relative pl-8 md:pl-0">
                <div className="flex flex-col md:flex-row md:items-end gap-4 border-b border-border pb-6 mb-8">
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-border md:hidden" />
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-card text-primary font-bold border border-border shadow-xl z-10">
                            W{weekNum}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">
                                {weekNum === 1 && "The Agentic Mindset"}
                                {weekNum === 2 && "The Agentic Toolkit"}
                                {weekNum === 3 && "Production Engineering"}
                                {weekNum === 4 && "Real-World Application"}
                                {weekNum === 5 && "Bonus: Real World & Tooling"}
                            </h2>
                            <p className="text-sm text-muted-foreground pt-1">
                                {weekNum === 1 && "Foundations: LLMs, Prompts, and Context"}
                                {weekNum === 2 && "Frameworks: LangChain, CrewAI, and MCP"}
                                {weekNum === 3 && "Engineering: Durability, Observability, Security"}
                                {weekNum === 4 && "Portfolio: 5 Capstone Projects"}
                                {weekNum === 5 && "Enrichment: Open Source Hall of Fame"}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {weeks[weekNum].map((module) => (
                        <Link key={module.slug} href={`/modules/${module.slug}`}>
                            <Card className="h-full bg-card/50 border-border hover:border-primary/50 hover:bg-card transition-all cursor-pointer group">
                                <CardHeader className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <Badge variant="secondary" className="font-mono text-[10px] text-muted-foreground bg-secondary border border-border">
                                            DAY {module.day.toString().padStart(2,'0')}
                                        </Badge>
                                        {(module.title?.toLowerCase().includes("lab") || module.title?.toLowerCase().includes("project")) && 
                                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 px-2 py-0 h-5 text-[10px]">PRACTICAL</Badge>
                                        }
                                    </div>
                                    <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors leading-snug mb-2 text-foreground">
                                        {(module.title || "").split(": ")[1] || module.title}
                                    </CardTitle>
                                    <CardDescription className="text-xs text-muted-foreground line-clamp-2">
                                        {module.description}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        ))}
      </section>

      <footer className="w-full py-12 border-t border-border bg-background text-center">
        <p className="text-muted-foreground text-sm">© 2026 Agentic Software Engineering. All rights reserved.</p>
      </footer>
    </div>
  )
}
