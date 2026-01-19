"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Compass,
  Code,
  Search,
  Database,
  Monitor,
  ChevronRight,
  BookOpen,
  Briefcase,
  TrendingUp,
  Star,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CareerPath {
  id: string
  title: string
  icon: typeof Code
  color: string
  description: string
  skills: string[]
  tools: string[]
  roles: string[]
  salaryRange: string
  demandLevel: "high" | "very-high" | "emerging"
  learningResources: string[]
  projectIdeas: string[]
}

const CAREER_PATHS: CareerPath[] = [
  {
    id: "computer-use",
    title: "Computer Use Agents",
    icon: Monitor,
    color: "text-blue-500",
    description: "Build agents that can interact with desktop applications, browsers, and operating systems to automate complex workflows.",
    skills: [
      "Screen understanding and OCR",
      "Action planning and execution",
      "Error recovery and retry logic",
      "Multi-step workflow orchestration",
      "Security and sandboxing",
    ],
    tools: ["Anthropic Computer Use API", "Playwright", "Puppeteer", "PyAutoGUI", "OpenCV"],
    roles: ["Automation Engineer", "RPA Developer", "AI Solutions Architect"],
    salaryRange: "$120K - $200K",
    demandLevel: "emerging",
    learningResources: [
      "Anthropic Computer Use documentation",
      "Browser automation best practices",
      "Desktop automation patterns",
    ],
    projectIdeas: [
      "Automated form filling agent",
      "Cross-application data migration tool",
      "Intelligent testing automation",
    ],
  },
  {
    id: "code-agents",
    title: "Code Agents",
    icon: Code,
    color: "text-green-500",
    description: "Develop agents specialized in code generation, review, refactoring, and automated software development tasks.",
    skills: [
      "AST manipulation and analysis",
      "Multi-language code generation",
      "Test generation and validation",
      "Code review automation",
      "Repository understanding",
    ],
    tools: ["Tree-sitter", "Language servers (LSP)", "Git APIs", "Static analysis tools", "Sandboxed execution"],
    roles: ["AI Developer Tools Engineer", "Code Intelligence Engineer", "DevEx Engineer"],
    salaryRange: "$140K - $220K",
    demandLevel: "very-high",
    learningResources: [
      "Compiler and AST fundamentals",
      "Language server protocol",
      "Code generation research papers",
    ],
    projectIdeas: [
      "Automated PR reviewer",
      "Code migration assistant",
      "Documentation generator",
    ],
  },
  {
    id: "research-agents",
    title: "Research Agents",
    icon: Search,
    color: "text-purple-500",
    description: "Create agents that can conduct deep research, synthesize information from multiple sources, and generate comprehensive reports.",
    skills: [
      "Information retrieval and ranking",
      "Source credibility assessment",
      "Multi-document summarization",
      "Citation and attribution",
      "Iterative research planning",
    ],
    tools: ["Search APIs (Tavily, Serper)", "Web scraping tools", "PDF parsers", "Knowledge graphs", "RAG systems"],
    roles: ["Research Engineer", "Knowledge Systems Engineer", "AI Research Scientist"],
    salaryRange: "$130K - $200K",
    demandLevel: "high",
    learningResources: [
      "Information retrieval fundamentals",
      "NLP for summarization",
      "Knowledge graph construction",
    ],
    projectIdeas: [
      "Competitive intelligence agent",
      "Academic literature reviewer",
      "Market research automation",
    ],
  },
  {
    id: "data-agents",
    title: "Data Agents",
    icon: Database,
    color: "text-amber-500",
    description: "Build agents that can analyze data, generate insights, create visualizations, and automate data pipeline tasks.",
    skills: [
      "SQL and data querying",
      "Statistical analysis",
      "Data visualization",
      "ETL pipeline design",
      "Anomaly detection",
    ],
    tools: ["Pandas/Polars", "SQL databases", "Visualization libraries", "dbt", "Apache Spark"],
    roles: ["AI Data Engineer", "Analytics Engineer", "Data Intelligence Specialist"],
    salaryRange: "$125K - $190K",
    demandLevel: "high",
    learningResources: [
      "Advanced SQL and query optimization",
      "Statistical methods for data analysis",
      "Data visualization best practices",
    ],
    projectIdeas: [
      "Automated reporting agent",
      "Data quality monitoring system",
      "Natural language to SQL interface",
    ],
  },
]

const DEMAND_COLORS = {
  "high": "bg-green-500",
  "very-high": "bg-blue-500",
  "emerging": "bg-purple-500",
}

export function CareerPathExplorer() {
  const [selectedPath, setSelectedPath] = useState<CareerPath | null>(null)

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-primary" />
          Career Path Explorer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Explore specialization paths for AI agent development and discover the skills, tools, and opportunities in each area.
        </p>

        {/* Path Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {CAREER_PATHS.map((path, index) => {
            const Icon = path.icon
            const isSelected = selectedPath?.id === path.id

            return (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedPath(isSelected ? null : path)}
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-all",
                  isSelected ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-lg bg-muted")}>
                    <Icon className={cn("h-6 w-6", path.color)} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{path.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {path.description}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <Badge variant="outline" className="text-xs">
                        {path.salaryRange}
                      </Badge>
                      <Badge className={cn("text-xs capitalize", DEMAND_COLORS[path.demandLevel])}>
                        {path.demandLevel.replace("-", " ")} demand
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Selected Path Details */}
        <AnimatePresence>
          {selectedPath && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border rounded-lg overflow-hidden"
            >
              <div className={cn("p-4 bg-muted/50 border-b")}>
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = selectedPath.icon
                    return <Icon className={cn("h-6 w-6", selectedPath.color)} />
                  })()}
                  <div>
                    <h3 className="font-semibold">{selectedPath.title}</h3>
                    <p className="text-sm text-muted-foreground">{selectedPath.description}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 grid md:grid-cols-2 gap-6">
                {/* Skills */}
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                    <Star className="h-4 w-4 text-amber-500" />
                    Required Skills
                  </h4>
                  <ul className="space-y-2">
                    {selectedPath.skills.map((skill, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tools */}
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                    <Code className="h-4 w-4 text-green-500" />
                    Key Tools & Technologies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPath.tools.map((tool, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Roles */}
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                    <Briefcase className="h-4 w-4 text-blue-500" />
                    Job Titles
                  </h4>
                  <ul className="space-y-1">
                    {selectedPath.roles.map((role, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        • {role}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Project Ideas */}
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    Project Ideas
                  </h4>
                  <ul className="space-y-1">
                    {selectedPath.projectIdeas.map((idea, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        • {idea}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Learning Resources */}
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                    <BookOpen className="h-4 w-4 text-amber-500" />
                    Recommended Learning
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPath.learningResources.map((resource, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {resource}
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
