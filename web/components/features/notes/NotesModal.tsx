"use client"

import React, { useState, useEffect, useMemo } from "react"
import { usePathname } from "next/navigation"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PartialBlock } from "@blocknote/core"
import { BlockNoteView } from "@blocknote/mantine"
import { useCreateBlockNote } from "@blocknote/react"
import { useNotesStore } from "@/lib/store"
import { NotebookPen, Search, Plus, Trash2, FileText, Save, PanelLeftClose, PanelLeftOpen, Maximize2, Minimize2, X } from "lucide-react"
import "@blocknote/mantine/style.css"
import { cn } from "@/lib/utils"

interface NoteEntry {
  slug: string
  title?: string
  updatedAt: number
}

export function NotesModal() {
  const { isOpen, closeNotes } = useNotesStore()
  const pathname = usePathname()
  
  // State
  const [mounted, setMounted] = useState(false)
  const [notes, setNotes] = useState<NoteEntry[]>([])
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isZenMode, setIsZenMode] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState("")

  // Handle SSR
  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true)
  }, [])

  // Check storage availability
  const storageAvailable = useMemo(() => {
    if (typeof window === 'undefined') return false;
    try {
        const x = '__storage_test__';
        localStorage.setItem(x, x);
        localStorage.removeItem(x);
        return true;
    } catch {
        return false;
    }
  }, []);

  // Determine current context (if we are on a module page)
  useEffect(() => {
    if (isOpen && pathname?.startsWith("/modules/")) {
        const slug = pathname.split("/modules/")[1]
        if (slug && !selectedSlug) {
            // eslint-disable-next-line
            setSelectedSlug(slug)
        }
    }
  }, [isOpen, pathname, selectedSlug])

  // Load list of notes
  useEffect(() => {
    if (isOpen && storageAvailable) {
        const loadedNotes: NoteEntry[] = []
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key?.startsWith("agentic-notes-")) {
                const slug = key.replace("agentic-notes-", "")
                loadedNotes.push({
                    slug,
                    updatedAt: 0 
                })
            }
        }
        // eslint-disable-next-line
        setNotes(loadedNotes.sort((a, b) => a.slug.localeCompare(b.slug)))
    }
  }, [isOpen, storageAvailable])

  const currentContent = useMemo(() => {
      if (!selectedSlug || typeof window === "undefined" || !storageAvailable) return undefined
      const saved = localStorage.getItem(`agentic-notes-${selectedSlug}`)
      try {
          return saved ? (JSON.parse(saved) as PartialBlock[]) : undefined
      } catch (e) {
          console.error("Error parsing note", e)
          return undefined
      }
  }, [selectedSlug, storageAvailable]) 

  const editor = useCreateBlockNote({
      initialContent: currentContent 
  })

  // Swap content effect
  useEffect(() => {
      if (editor && selectedSlug && storageAvailable) {
          const load = async () => {
              const saved = localStorage.getItem(`agentic-notes-${selectedSlug}`)
              if (saved) {
                  const blocks = JSON.parse(saved) as PartialBlock[]
                  editor.replaceBlocks(editor.document, blocks)
              } else {
                  editor.replaceBlocks(editor.document, [{ type: "paragraph", content: "" }])
              }
          }
          load()
      }
  }, [selectedSlug, editor, storageAvailable])


  const handleEditorChange = () => {
      if (editor && selectedSlug && storageAvailable) {
          localStorage.setItem(`agentic-notes-${selectedSlug}`, JSON.stringify(editor.document))
          setLastSaved(new Date())
          
          if (!notes.find(n => n.slug === selectedSlug)) {
              setNotes(prev => [...prev, { slug: selectedSlug, updatedAt: Date.now() }])
          }
      }
  }

  const handleCreateNote = (e?: React.FormEvent) => {
      e?.preventDefault()
      if (newNoteTitle.trim()) {
          const safeSlug = newNoteTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")
          setSelectedSlug(safeSlug)
          setNewNoteTitle("")
          setIsCreating(false)
      }
  }

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>, slug: string) => {
      e.stopPropagation()
      if (confirm(`Delete note '${slug}'?`) && storageAvailable) {
          localStorage.removeItem(`agentic-notes-${slug}`)
          setNotes(prev => prev.filter(n => n.slug !== slug))
          if (selectedSlug === slug) setSelectedSlug(null)
      }
  }

  const filteredNotes = notes.filter(n => n.slug.toLowerCase().includes(searchQuery.toLowerCase()))

  if (!mounted) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeNotes()}>
      <DialogContent 
        showCloseButton={false} 
        className={cn(
        "p-0 gap-0 overflow-hidden flex flex-col md:flex-row bg-background/95 backdrop-blur-3xl transition-all duration-300 border-zinc-800 shadow-2xl sm:max-w-none",
        isZenMode 
            ? "w-screen h-screen rounded-none border-0" 
            : "w-[95vw] h-[90vh] max-w-[1800px] rounded-xl border"
      )}>
        <DialogTitle className="sr-only">Notes</DialogTitle>
        
        {/* Sidebar */}
        <div className={cn(
            "border-r border-border/50 flex flex-col bg-muted/20 transition-all duration-300 ease-in-out relative backdrop-blur-sm",
            isSidebarOpen ? "w-full md:w-80 opacity-100" : "w-0 opacity-0 overflow-hidden border-r-0"
        )}>
            <div className="p-5 border-b border-border/50 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground/80">
                        <NotebookPen className="w-4 h-4" />
                        Library
                    </h2>
                    <div className="flex items-center gap-1">
                         <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setIsCreating(!isCreating)} 
                            title="New Note" 
                            className={cn("h-8 w-8 hover:bg-background/50", isCreating && "bg-background/50 text-foreground")}
                         >
                            <Plus className={cn("w-4 h-4 transition-transform", isCreating && "rotate-45")} />
                        </Button>
                        {/* Mobile Close Button */}
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => closeNotes()} 
                            title="Close" 
                            className="h-8 w-8 hover:bg-background/50 md:hidden"
                         >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {isCreating ? (
                    <form onSubmit={handleCreateNote} className="animate-in fade-in slide-in-from-top-2">
                        <Input 
                            autoFocus
                            placeholder="Enter note name..." 
                            className="h-9 text-sm bg-background border-primary/50 focus:border-primary" 
                            value={newNoteTitle}
                            onChange={(e) => setNewNoteTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Escape") setIsCreating(false)
                            }}
                            onBlur={() => !newNoteTitle && setIsCreating(false)}
                        />
                         <p className="text-[10px] text-muted-foreground mt-1.5 ml-1">Press Enter to create</p>
                    </form>
                ) : (
                    <div className="relative group animate-in fade-in">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                        <Input 
                            placeholder="Search notes..." 
                            className="pl-9 h-10 text-sm bg-background/40 border-input/30 focus:bg-background/80 focus:border-primary/50 transition-all" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                )}
            </div>
            
            <ScrollArea className="flex-1 p-3">
                <div className="space-y-1">
                    {filteredNotes.length === 0 && (
                        <div className="text-center py-16 text-sm text-muted-foreground/60 italic flex flex-col items-center gap-2">
                             <FileText className="w-8 h-8 opacity-20" />
                            <span>No notes found</span>
                        </div>
                    )}
                    {filteredNotes.map((note) => (
                        <div 
                            key={note.slug}
                            onClick={() => setSelectedSlug(note.slug)}
                            className={cn(
                                "group flex items-center justify-between px-4 py-3 rounded-lg text-sm cursor-pointer transition-all duration-200 border border-transparent",
                                selectedSlug === note.slug 
                                    ? "bg-primary/10 text-primary font-medium border-primary/10 shadow-sm" 
                                    : "hover:bg-background/60 text-muted-foreground hover:text-foreground hover:border-border/30"
                            )}
                        >
                            <div className="flex items-center gap-3 truncate">
                                <FileText className={cn("w-4 h-4 transition-opacity", selectedSlug === note.slug ? "opacity-100" : "opacity-50")} />
                                <span className="truncate max-w-[160px] capitalize">{note.slug.replace(/-/g, " ")}</span>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive/10 hover:text-destructive translate-x-2 group-hover:translate-x-0"
                                onClick={(e) => handleDelete(e, note.slug)}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col bg-background/50 relative h-full">
            {selectedSlug ? (
                <>
                    <div className="h-16 border-b border-border/40 flex items-center justify-between px-6 bg-background/60 backdrop-blur-xl z-20 shrink-0 sticky top-0">
                        <div className="flex items-center gap-4">
                             <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                                className="-ml-2 h-9 w-9 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
                            </Button>
                            
                            <div className="h-6 w-px bg-border/40" />

                            <h1 className="text-base font-medium capitalize flex items-center gap-3">
                                {selectedSlug.replace(/-/g, " ")}
                                {selectedSlug.startsWith("day-") && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-mono uppercase tracking-wider border border-blue-500/20">
                                        Module
                                    </span>
                                )}
                            </h1>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                            {lastSaved && (
                                <span className="hidden sm:flex text-xs text-muted-foreground animate-in fade-in slide-in-from-right-2 items-center gap-1.5 mr-4 px-2 py-1 rounded-full bg-muted/30">
                                    <Save className="w-3 h-3 text-green-500" />
                                    Saved
                                </span>
                            )}
                            
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setIsZenMode(!isZenMode)}
                                className="h-9 w-9 text-muted-foreground hover:text-foreground hidden sm:flex"
                                title={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
                            >
                                {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </Button>
                            
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => closeNotes()}
                                className="h-9 w-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive ml-1 sm:ml-2" 
                                title="Close"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden relative bg-gradient-to-b from-transparent to-muted/5">
                         <ScrollArea className="h-full w-full">
                            <div className={cn(
                                "mx-auto min-h-[500px] py-16 transition-all duration-500 ease-in-out",
                                isZenMode ? "max-w-6xl px-12 md:px-20" : "max-w-5xl px-8 md:px-16",
                                !isSidebarOpen && !isZenMode && "max-w-6xl"
                            )}>
                                <BlockNoteView 
                                    editor={editor} 
                                    onChange={handleEditorChange}
                                    theme="dark"
                                    className="min-h-[60vh] note-editor"
                                />
                                <div className="h-32" /> {/* Bottom spacer */}
                            </div>
                         </ScrollArea>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 animate-in fade-in zoom-in-95 duration-500 bg-dot-pattern">
                    <div className="w-32 h-32 bg-muted/20 rounded-full flex items-center justify-center mb-8 ring-1 ring-border/50">
                        <NotebookPen className="w-14 h-14 opacity-20" />
                    </div>
                    <h3 className="text-xl font-medium text-foreground mb-3">Your Agentic Notebook</h3>
                    <p className="max-w-md text-center text-sm leading-relaxed text-muted-foreground/80">
                        Capture your thoughts, plan your agents, and document your learnings.
                        Select a note from the sidebar to start editing.
                    </p>
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
