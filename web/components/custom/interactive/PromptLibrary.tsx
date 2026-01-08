"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Copy, Trash2, Search, Terminal, PenTool, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Prompt {
  id: string
  title: string
  content: string
  category: "Coding" | "Writing" | "Analysis"
  timestamp: number
}

const CATEGORIES = [
  { name: "Coding", icon: Terminal, color: "text-blue-400 bg-blue-400/10" },
  { name: "Writing", icon: PenTool, color: "text-green-400 bg-green-400/10" },
  { name: "Analysis", icon: BookOpen, color: "text-amber-400 bg-amber-400/10" },
]

export function PromptLibrary() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  
  // New prompt state
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [newCategory, setNewCategory] = useState<"Coding" | "Writing" | "Analysis">("Coding")

  useEffect(() => {
    const saved = localStorage.getItem("agentic-prompts")
    if (saved) {
      setTimeout(() => setPrompts(JSON.parse(saved)), 0)
    } else {
        // Seed initial data
        const seed: Prompt[] = [
        {
          id: "1",
          title: "Code Refactor Expert",
          content: "You are a Senior Software Engineer. Refactor the following code for readability and performance. Maintain existing functionality but apply DRY principles and modern patterns.",
          category: "Coding",
          timestamp: Date.now()
        },
        {
            id: "2",
            title: "Technical Explainer",
            content: "Explain the following concept to a junior developer. Use analogies, simple language, and avoid jargon where possible. Provide code examples.",
            category: "Writing",
            timestamp: Date.now() - 10000
        }
      ]
      setTimeout(() => {
        setPrompts(seed)
        localStorage.setItem("agentic-prompts", JSON.stringify(seed))
      }, 0)
    }
  }, [])

  const savePrompt = () => {
    if (!newTitle || !newContent) return

    const newPrompt: Prompt = {
      id: crypto.randomUUID(),
      title: newTitle,
      content: newContent,
      category: newCategory,
      timestamp: Date.now()
    }

    const updated = [newPrompt, ...prompts]
    setPrompts(updated)
    localStorage.setItem("agentic-prompts", JSON.stringify(updated))
    
    setIsAdding(false)
    setNewTitle("")
    setNewContent("")
    toast.success("Prompt saved to library")
  }

  const deletePrompt = (id: string) => {
    const updated = prompts.filter(p => p.id !== id)
    setPrompts(updated)
    localStorage.setItem("agentic-prompts", JSON.stringify(updated))
    toast.success("Prompt deleted")
  }

  const copyPrompt = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success("Prompt copied to clipboard")
  }

  const filteredPrompts = prompts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory ? p.category === activeCategory : true
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6 my-8">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h3 className="text-2xl font-bold">Prompt Library</h3>
          <p className="text-muted-foreground">Save and reuse your best agent instructions.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
          <Plus className="w-4 h-4" /> New Prompt
        </Button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="bg-muted/50 border-dashed border-primary/50">
              <CardContent className="pt-6 space-y-4">
                <Input 
                  placeholder="Prompt Title (e.g., 'Bug Smashing Agent')" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <Textarea 
                  placeholder="Enter your prompt content here..." 
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="min-h-[100px] font-mono text-sm"
                />
                <div className="flex gap-2 items-center flex-wrap">
                  {CATEGORIES.map(cat => (
                    <Button
                      key={cat.name}
                      size="sm"
                      variant={newCategory === cat.name ? "default" : "outline"}
                      onClick={() => setNewCategory(cat.name as "Coding" | "Writing" | "Analysis")}
                      className="gap-2"
                    >
                      <cat.icon className="w-3 h-3" /> {cat.name}
                    </Button>
                  ))}
                  <div className="flex-1" />
                  <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                  <Button onClick={savePrompt} disabled={!newTitle || !newContent}>Save Prompt</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-2 rounded-lg border">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search prompts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-0 bg-transparent focus-visible:ring-0"
          />
        </div>
        <div className="flex gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Button 
            size="sm" 
            variant={activeCategory === null ? "secondary" : "ghost"}
            onClick={() => setActiveCategory(null)}
          >
            All
          </Button>
          {CATEGORIES.map(cat => (
            <Button
              key={cat.name}
              size="sm"
              variant={activeCategory === cat.name ? "secondary" : "ghost"}
              onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
              className={cn("gap-2", activeCategory === cat.name && cat.color)}
            >
              <cat.icon className="w-3 h-3" /> {cat.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrompts.map(prompt => (
          <motion.div layout key={prompt.id}>
            <Card className="h-full flex flex-col group hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <Badge variant="outline" className={cn(CATEGORIES.find(c => c.name === prompt.category)?.color, "bg-transparent")}>
                    {prompt.category}
                  </Badge>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:bg-destructive/10"
                      onClick={() => deletePrompt(prompt.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="leading-tight text-lg">{prompt.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                <div className="relative flex-1 bg-muted/50 rounded-md p-3 text-xs font-mono text-muted-foreground line-clamp-4 group-hover:line-clamp-none transition-all">
                   {prompt.content}
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground"
                  onClick={() => copyPrompt(prompt.content)}
                >
                  <Copy className="w-3 h-3" /> Copy Prompt
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {filteredPrompts.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
                <Terminal className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No prompts found. Create your first agent template!</p>
            </div>
        )}
      </div>
    </div>
  )
}
