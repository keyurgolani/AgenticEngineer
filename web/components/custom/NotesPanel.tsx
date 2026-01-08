"use client"

import React, { useState, useEffect, useMemo } from "react"
import { NotebookPen, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet"
import { PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";

interface NotesPanelProps {
  slug: string
}

export function NotesPanel({ slug }: NotesPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Load initial content from local storage
  const initialContent = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    const saved = localStorage.getItem(`agentic-notes-${slug}`);
    return saved ? (JSON.parse(saved) as PartialBlock[]) : undefined;
  }, [slug]);

  const editor = useCreateBlockNote({
    initialContent: initialContent,
  });

  const handleChange = () => {
    if (editor) {
        localStorage.setItem(`agentic-notes-${slug}`, JSON.stringify(editor.document));
        setLastSaved(new Date());
    }
  };

  // Re-load content if slug changes (and editor instance needs reset or re-hydration)
  // BlockNote's useCreateBlockNote handles initialContent only on first render.
  // We might need to manually set blocks if the slug changes while component is mounted.
  useEffect(() => {
     async function loadBlocks() {
         const saved = localStorage.getItem(`agentic-notes-${slug}`);
         if (saved && editor) {
             const blocks = JSON.parse(saved) as PartialBlock[];
             editor.replaceBlocks(editor.document, blocks);
         } else if (editor) {
             editor.replaceBlocks(editor.document, [{ type: "paragraph", content: "" }]);
         }
     }
     if(isOpen) loadBlocks();
  }, [slug, editor, isOpen])


  const clearNotes = () => {
    if (confirm("Are you sure you want to clear your notes for this module?")) {
        localStorage.removeItem(`agentic-notes-${slug}`)
        if (editor) {
             editor.replaceBlocks(editor.document, [{ type: "paragraph", content: "" }]);
        }
        setLastSaved(null)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl z-50 bg-primary hover:bg-primary/90 transition-all hover:scale-105"
            size="icon"
        >
            <NotebookPen className="h-6 w-6 text-primary-foreground" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[600px] flex flex-col h-full border-l border-border bg-background/95 backdrop-blur-md p-0">
        <SheetHeader className="p-6 pb-4 border-b border-border/50 bg-muted/20">
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <NotebookPen className="w-5 h-5 text-primary" />
                <span>My Notes</span>
            </div>
            
            <div className="flex items-center gap-2">
                 {lastSaved ? (
                     <span className="flex items-center text-[10px] uppercase font-bold tracking-widest text-green-500 bg-green-500/10 px-2 py-1 rounded-full animate-in fade-in">
                        Saved
                     </span>
                 ) : (
                     <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                        Ready
                     </span>
                 )}
            </div>
          </SheetTitle>
          <SheetDescription>
            Capture your thoughts for this module. Content is auto-saved locally.
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4">
             <div className="border rounded-md min-h-[500px] bg-zinc-900/50 p-2">
                <BlockNoteView 
                    editor={editor} 
                    onChange={handleChange}
                    theme="dark"
                />
             </div>
        </div>

        <div className="p-4 border-t border-border flex justify-between items-center bg-background/50">
             <Button variant="ghost" size="sm" onClick={clearNotes} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Notes
             </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
