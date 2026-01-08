"use client"

import React, { useState } from "react"
import { ModuleLayout } from "@/components/features/module/ModuleLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, BookOpen, Wrench, Layers, Search, GraduationCap } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

const resources = [
  {
    category: "frameworks",
    items: [
      {
        name: "LangChain",
        desc: "The industry standard for building context-aware reasoning applications.",
        url: "https://python.langchain.com",
        tags: ["Orchestration", "Python", "JS"]
      },
      {
        name: "LangGraph",
        desc: "Build resilient, stateful, multi-agent applications with cycles.",
        url: "https://langchain-ai.github.io/langgraph/",
        tags: ["State Machines", "Multi-Agent"]
      },
      {
        name: "LlamaIndex",
        desc: "The leading data framework for connecting custom data sources to LLMs.",
        url: "https://www.llamaindex.ai/",
        tags: ["RAG", "Data"]
      },
      {
          name: "DSPy",
          desc: "Framework for programming—not prompting—language models.",
          url: "https://dspy-docs.vercel.app/",
          tags: ["Prompt Optimization", "Research"]
      }
    ]
  },
  {
    category: "tools",
    items: [
      {
        name: "LangSmith",
        desc: "Platform for debugging, testing, evaluating, and monitoring chains.",
        url: "https://smith.langchain.com/",
        tags: ["Observability", "Eval"]
      },
      {
        name: "Helicone",
        desc: "Open-source LLM observability and caching platform.",
        url: "https://www.helicone.ai/",
        tags: ["Caching", "Analytics"]
      },
      {
        name: "Osprey",
        desc: "Security and compliance scanning for AI applications.",
        url: "https://osprey.ai/", 
        tags: ["Security", "Scanning"]
      },
      {
        name: "Ollama",
        desc: "Get up and running with large language models locally.",
        url: "https://ollama.com/",
        tags: ["Local Inference", "Dev Tools"]
      },
      {
          name: "Vercel SDK",
          desc: "Build AI-powered user interfaces with React and Svelte.",
          url: "https://sdk.vercel.ai/docs",
          tags: ["Frontend", "Streaming"]
      }
    ]
  },
  {
    category: "papers",
    items: [
      {
        name: "ReAct: Synergizing Reasoning and Acting in Language Models",
        desc: "The foundational paper that introduced the Thought-Action-Observation loop.",
        url: "https://arxiv.org/abs/2210.03629",
        tags: ["Core Theory"]
      },
      {
        name: "Generative Agents: Interactive Simulacra of Human Behavior",
        desc: "Stanford paper demonstrating agents with memory, reflection, and planning.",
        url: "https://arxiv.org/abs/2304.03442",
        tags: ["Simulation", "Memory"]
      },
      {
          name: "Chain-of-Thought Prompting Elicits Reasoning",
          desc: "Standard prompting technique for complex problem solving.",
          url: "https://arxiv.org/abs/2201.11903",
          tags: ["Prompting"]
      }
    ]
  }
]

export default function ResourcesPage() {
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Flatten resources for search
  const allResources = resources.flatMap(cat => cat.items.map(item => ({ ...item, category: cat.category })))

  const filteredResources = allResources.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.desc.toLowerCase().includes(search.toLowerCase()) ||
                          item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchesTab = activeTab === "all" || item.category === activeTab
    return matchesSearch && matchesTab
  })

  // Group by category for 'all' view or just flat list?
  // Flat grid is cleaner for search results.

  const SidebarContent = (
      <div className="p-4">
          <h3 className="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wider">Categories</h3>
          <div className="flex flex-col gap-1">
             <Button variant={activeTab === 'all' ? "secondary" : "ghost"} className="justify-start" onClick={() => setActiveTab('all')}>All Resources</Button>
             <Button variant={activeTab === 'frameworks' ? "secondary" : "ghost"} className="justify-start" onClick={() => setActiveTab('frameworks')}>Frameworks</Button>
             <Button variant={activeTab === 'tools' ? "secondary" : "ghost"} className="justify-start" onClick={() => setActiveTab('tools')}>Tools</Button>
             <Button variant={activeTab === 'papers' ? "secondary" : "ghost"} className="justify-start" onClick={() => setActiveTab('papers')}>Research Papers</Button>
          </div>
      </div>
  )

  return (
    <ModuleLayout sidebarContent={SidebarContent}>
        <div className="max-w-5xl mx-auto space-y-10 pb-20">
            {/* Hero */}
            <div className="space-y-6 text-center py-10">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Agentic Resources
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    A curated collection of frameworks, tools, and research papers to power your journey into agentic engineering.
                </p>
                
                {/* Search */}
                <div className="max-w-md mx-auto relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search frameworks, tools, papers..." 
                        className="pl-10 h-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Mobile Tabs (Sidebar handles desktop) */}
            <div className="md:hidden">
                 <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="frameworks">Libs</TabsTrigger>
                        <TabsTrigger value="tools">Tools</TabsTrigger>
                        <TabsTrigger value="papers">Papers</TabsTrigger>
                    </TabsList>
                 </Tabs>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredResources.map((item) => (
                    <ResourceCard key={item.name} item={item} />
                ))}
                
                {filteredResources.length === 0 && (
                    <div className="col-span-full text-center py-20 text-muted-foreground">
                        No resources found matching &quot;{search}&quot;.
                    </div>
                )}
            </div>

        </div>
    </ModuleLayout>
  )
}

function ResourceCard({ item }: { item: { name: string; desc: string; url: string; tags: string[]; category: string } }) {
    const getIcon = (category: string) => {
        switch(category) {
            case 'frameworks': return <Layers className="w-5 h-5 text-blue-400" />
            case 'tools': return <Wrench className="w-5 h-5 text-green-400" />
            case 'papers': return <GraduationCap className="w-5 h-5 text-purple-400" />
            default: return <BookOpen className="w-5 h-5" />
        }
    }

    return (
        <Card className="group flex flex-col hover:border-primary/50 transition-all duration-300 bg-card hover:shadow-lg">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-muted group-hover:bg-primary/10 transition-colors">
                            {getIcon(item.category)}
                        </div>
                        <div>
                            <CardTitle className="text-lg">{item.name}</CardTitle>
                            <Badge variant="outline" className="mt-1 text-[10px] uppercase font-mono opacity-50">
                                {item.category}
                            </Badge>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                 <CardDescription className="text-base">
                    {item.desc}
                </CardDescription>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4 border-t pt-4 bg-muted/20">
                 <div className="flex flex-wrap gap-2 w-full">
                    {item.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="font-mono text-xs opacity-70">
                            {tag}
                        </Badge>
                    ))}
                </div>
                <Button asChild className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all" variant="outline">
                    <Link href={item.url} target="_blank">
                        View Resource <ExternalLink className="w-4 h-4 ml-auto opacity-50" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
