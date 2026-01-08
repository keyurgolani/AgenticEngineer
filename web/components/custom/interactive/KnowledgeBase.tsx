"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Upload, FileText, CheckCircle2, X, Database } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface KnowledgeDoc {
  id: string
  name: string
  size: number
  status: "uploading" | "processing" | "indexed" | "error"
  progress: number
  textTokenCount?: number
}

export function KnowledgeBase() {
  const [documents, setDocuments] = useState<KnowledgeDoc[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load from localstorage just to persist "indexed" state across reloads if desired?
  // For now, ephemeral session state is fine for a playground, but let's try to persist basic metadata
  useEffect(() => {
    const saved = localStorage.getItem("agentic-knowledge-base")
    if (saved) {
      setTimeout(() => setDocuments(JSON.parse(saved)), 0)
    }
  }, [])

  const persist = (docs: KnowledgeDoc[]) => {
    setDocuments(docs)
    localStorage.setItem("agentic-knowledge-base", JSON.stringify(docs))
  }

  const handleUpload = (files: FileList | null) => {
    if (!files) return
    
    // Convert to array
    const newDocs: KnowledgeDoc[] = Array.from(files).map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      status: "uploading",
      progress: 0
    }))

    const updated = [...newDocs, ...documents]
    persist(updated)

    // Simulate upload process
    newDocs.forEach(doc => {
        simulateProcessing(doc.id)
    })
  }

  const simulateProcessing = (id: string) => {
    // Phase 1: Upload
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20
      if (progress >= 100) {
        clearInterval(interval)
        updateDocStatus(id, "processing", 100)
        // Phase 2: Indexing
        setTimeout(() => {
             updateDocStatus(id, "indexed", 100, Math.floor(Math.random() * 5000) + 500)
             toast.success("Document indexed successfully")
        }, 1500)
      } else {
        updateDocStatus(id, "uploading", progress)
      }
    }, 300)
  }

  const updateDocStatus = (id: string, status: KnowledgeDoc["status"], progress: number, tokens?: number) => {
    setDocuments(prev => {
        const updated = prev.map(d => {
            if (d.id === id) return { ...d, status, progress, textTokenCount: tokens ?? d.textTokenCount }
            return d
        })
        localStorage.setItem("agentic-knowledge-base", JSON.stringify(updated))
        return updated
    })
  }

  const deleteDoc = (id: string) => {
    const updated = documents.filter(d => d.id !== id)
    persist(updated)
    toast.success("Document removed from context")
  }

  return (
    <div className="space-y-6 my-8">
      <div className="border border-dashed border-zinc-700 bg-zinc-900/30 rounded-xl p-8 text-center transition-colors hover:bg-zinc-900/50 hover:border-primary/50 relative"
           onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
           onDragLeave={() => setIsDragging(false)}
           onDrop={(e) => {
             e.preventDefault()
             setIsDragging(false)
             handleUpload(e.dataTransfer.files)
           }}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <div className={cn("p-4 rounded-full bg-zinc-800 transition-all", isDragging ? "scale-110 bg-primary/20 text-primary" : "")}>
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">Upload Retrieval Context</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Drag & drop PDFs, TXT, or MD files here to add them to your agent&apos;s knowledge base.
            </p>
          </div>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            Select Files
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            multiple 
            onChange={(e) => handleUpload(e.target.files)} 
          />
        </div>
      </div>

      <div className="grid gap-4">
        {documents.map(doc => (
            <motion.div 
                layout 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={doc.id}
            >
                <Card className="bg-card/50">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className={cn("p-2 rounded-md", 
                            doc.status === "indexed" ? "bg-green-500/10 text-green-500" :
                            doc.status === "error" ? "bg-red-500/10 text-red-500" :
                            "bg-blue-500/10 text-blue-500"
                        )}>
                            <FileText className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between mb-1">
                                <span className="font-medium truncate mr-2">{doc.name}</span>
                                <span className="text-xs text-muted-foreground font-mono shrink-0">
                                    {(doc.size / 1024).toFixed(1)} KB
                                </span>
                            </div>
                            
                            {doc.status !== "indexed" ? (
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span className="capitalize">{doc.status}...</span>
                                        <span>{Math.round(doc.progress)}%</span>
                                    </div>
                                    <Progress value={doc.progress} className="h-1" />
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-xs text-green-500/80">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Indexed • {doc.textTokenCount} tokens</span>
                                </div>
                            )}
                        </div>

                        <Button variant="ghost" size="icon" onClick={() => deleteDoc(doc.id)} className="shrink-0 text-muted-foreground hover:text-destructive">
                             <X className="w-4 h-4" />
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        ))}
        
        {documents.length === 0 && (
            <div className="flex items-center justify-center p-8 text-sm text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                <Database className="w-4 h-4 mr-2" />
                No documents in active context
            </div>
        )}
      </div>
    </div>
  )
}
