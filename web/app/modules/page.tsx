import { getModulesByWeek, getAllModules } from "@/lib/modules"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ModulesPage() {
  const weeks = getModulesByWeek()
  const weekNumbers = Object.keys(weeks).map(Number).sort((a, b) => a - b)
  const allModules = getAllModules()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-foreground">
            All Modules
          </h1>
          <p className="text-xl text-muted-foreground">
            {allModules.length} modules across {weekNumbers.length} weeks
          </p>
        </div>

        <div className="space-y-16">
          {weekNumbers.map((weekNum) => (
            <section key={weekNum}>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-bold text-sm">
                  W{weekNum}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
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
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {weeks[weekNum].map((module) => (
                  <Link key={module.slug} href={`/modules/${module.slug}`}>
                    <Card className="h-full bg-card/50 border-border hover:border-primary/50 hover:bg-card transition-all cursor-pointer group">
                      <CardHeader className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <Badge variant="secondary" className="font-mono text-[10px] text-muted-foreground bg-secondary border border-border">
                            DAY {module.day.toString().padStart(2, '0')}
                          </Badge>
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
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
