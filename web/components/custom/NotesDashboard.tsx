"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Trash2, StickyNote, Search, FileJson } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Module {
  slug: string
  title: string
  description?: string
  day: number | string
}

interface NoteEntry {
  slug: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any[]
  timestamp?: number
}

export function NotesDashboard({ allModules }: { allModules: Module[] }) {
  const [notes, setNotes] = useState<NoteEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const loadedNotes: NoteEntry[] = []
    
    // Iterate over localStorage to find notes
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith("agentic-notes-")) {
        const slug = key.replace("agentic-notes-", "")
        try {
          const content = JSON.parse(localStorage.getItem(key) || "[]")
          const hasContent = content.length > 0 && (content.length > 1 || (content[0].content && content[0].content.length > 0));
          
          if (hasContent) {
             loadedNotes.push({ slug, content })
          }
        } catch (e) {
          console.error("Failed to parse note for", slug, e)
        }
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotes(loadedNotes)
    setIsLoading(false)
  }, [])

  const getModuleTitle = (slug: string) => {
    const mod = allModules.find(m => m.slug === slug)
    return mod?.title || slug
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getPreview = (content: any[]) => {
      for (const block of content) {
          if (block.content && Array.isArray(block.content)) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const text = block.content.map((c: any) => c.text).join(" ")
              if (text.trim().length > 0) return text.slice(0, 100) + (text.length > 100 ? "..." : "")
          }
      }
      return "No text content..."
  }
  
  const deleteNote = (slug: string) => {
      if(confirm("Are you sure you want to delete this note?")) {
          localStorage.removeItem(`agentic-notes-${slug}`)
          setNotes(prev => prev.filter(n => n.slug !== slug))
      }
  }

  if (isLoading) return <div className="p-12 text-center text-muted-foreground animate-pulse">Loading notes...</div>

  if (notes.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center p-16 text-center border rounded-xl border-dashed border-zinc-700 bg-zinc-900/30"
      >
        <div className="bg-zinc-800 p-4 rounded-full mb-6 relative group">
             <StickyNote className="h-8 w-8 text-zinc-400 group-hover:text-primary transition-colors" />
             <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Your Mind Palace is Empty</h3>
        <p className="text-muted-foreground mb-8 max-w-md">Capture your insights, architectural decisions, and learnings as you progress through the modules.</p>
        <Button asChild size="lg" className="rounded-full font-semibold">
            <Link href="/modules/day-00-course-setup">Start Learning via Day 00</Link>
        </Button>
      </motion.div>
    )
  }

  /* Inside Component */
  // Moved to top level

  const filteredNotes = notes.filter(note => {
    if (!searchQuery) return true
    const title = getModuleTitle(note.slug).toLowerCase()
    const contentPreview = getPreview(note.content).toLowerCase()
    const query = searchQuery.toLowerCase()
    return title.includes(query) || contentPreview.includes(query)
  })

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes, null, 2))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", "agentic_notes_export.json")
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  /* Updated JSX */
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card/50 p-4 rounded-xl border border-border backdrop-blur-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search your notes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background/50 border border-input rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <Button variant="outline" onClick={handleExport} className="w-full sm:w-auto gap-2">
            <FileJson className="h-4 w-4" /> Export JSON
        </Button>
      </div>

    <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        layout
    >
      <AnimatePresence>
      {filteredNotes.map((note) => (
        <motion.div
            key={note.slug}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            layout
        >
            <Card className="group hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 h-full flex flex-col bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex justify-between items-start gap-2">
                    <span className="truncate leading-tight block h-12">{getModuleTitle(note.slug)}</span>
                </CardTitle>
                <CardDescription className="line-clamp-3 min-h-[60px] mt-2">
                    {getPreview(note.content)}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center mt-auto pt-6">
                <Button variant="ghost" size="sm" onClick={() => deleteNote(note.slug)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                </Button>
                <Button asChild size="sm" variant="secondary" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Link href={`/modules/${note.slug}`}>
                        Read Note <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </Button>
            </CardContent>
            </Card>
        </motion.div>
      ))}
      </AnimatePresence>
      
      {filteredNotes.length === 0 && searchQuery && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
              <p>No notes found matching &quot;{searchQuery}&quot;</p>
          </div>
      )}
    </motion.div>
    </div>
  )
}

