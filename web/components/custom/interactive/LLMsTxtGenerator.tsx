"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, Check, Copy, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DocumentSection {
  title: string
  content: string
  tokens: number
}

const sampleDocs: DocumentSection[] = [
  {
    title: "Getting Started",
    content: "Welcome to our API! This guide will help you get started with authentication and making your first request...",
    tokens: 450
  },
  {
    title: "Authentication",
    content: "Our API uses OAuth 2.0 for authentication. You'll need to obtain an access token before making requests...",
    tokens: 380
  },
  {
    title: "Rate Limiting",
    content: "API requests are rate limited to 1000 requests per hour per API key. When you exceed this limit...",
    tokens: 320
  },
  {
    title: "Error Handling",
    content: "All errors return JSON with 'error' and 'message' fields. Common error codes include 400, 401, 403, 404, 429, 500...",
    tokens: 290
  },
  {
    title: "Pagination",
    content: "List endpoints support pagination using 'page' and 'limit' query parameters. The default page size is 20...",
    tokens: 250
  }
]

export function LLMsTxtGenerator() {
  const [selectedSections, setSelectedSections] = useState<Set<string>>(
    new Set(sampleDocs.slice(0, 3).map(s => s.title))
  )
  const [generated, setGenerated] = useState(false)
  const [copied, setCopied] = useState(false)

  const toggleSection = (title: string) => {
    setSelectedSections(prev => {
      const next = new Set(prev)
      if (next.has(title)) {
        next.delete(title)
      } else {
        next.add(title)
      }
      return next
    })
  }

  const generateLLMsTxt = () => {
    setGenerated(true)
  }

  const copyToClipboard = async () => {
    const content = generateContent()
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const generateContent = () => {
    const selected = sampleDocs.filter(s => selectedSections.has(s.title))
    
    let content = "# API Documentation\n\n"
    content += "> A RESTful API for managing user accounts and authentication\n\n"
    
    selected.forEach(section => {
      content += `## ${section.title}\n\n${section.content}\n\n`
    })
    
    content += "## Full Documentation\n\nFor complete API reference, see /llms-full.txt"
    
    return content
  }

  const totalTokens = sampleDocs
    .filter(s => selectedSections.has(s.title))
    .reduce((sum, s) => sum + s.tokens, 0)

  const allTokens = sampleDocs.reduce((sum, s) => sum + s.tokens, 0)
  const savings = ((1 - totalTokens / allTokens) * 100).toFixed(0)

  return (
    <div className="my-8 p-6 rounded-xl border border-border bg-card/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          llms.txt Generator
        </h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Section Selector */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-3">Select Sections to Include</h4>
            <div className="space-y-2">
              {sampleDocs.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <label className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                    selectedSections.has(section.title)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}>
                    <input
                      type="checkbox"
                      checked={selectedSections.has(section.title)}
                      onChange={() => toggleSection(section.title)}
                      className="w-4 h-4 rounded border-border"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{section.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {section.tokens} tokens
                      </div>
                    </div>
                  </label>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="p-4 rounded-lg bg-muted/50 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Selected Sections</span>
              <span className="font-bold">{selectedSections.size} / {sampleDocs.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Tokens</span>
              <span className="font-mono font-bold">{totalTokens.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Token Savings</span>
              <span className="font-bold text-green-500">{savings}%</span>
            </div>
          </div>

          <Button
            onClick={generateLLMsTxt}
            disabled={selectedSections.size === 0}
            className="w-full"
          >
            <Zap className="w-4 h-4 mr-2" />
            Generate llms.txt
          </Button>
        </div>

        {/* Preview */}
        <div className="space-y-4" role="region" aria-label="Generated content preview">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Preview</h4>
            {generated && (
              <Button
                size="sm"
                variant="outline"
                onClick={copyToClipboard}
                aria-label="Copy generated text to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            )}
          </div>

          {generated ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-border overflow-hidden"
            >
              <div className="p-3 bg-muted/30 border-b border-border flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">llms.txt</span>
                <span className="text-xs text-muted-foreground">
                  {(totalTokens / 1024).toFixed(1)} KB
                </span>
              </div>
              <pre className="p-4 text-xs overflow-x-auto bg-[#0d1117] text-zinc-300 font-mono max-h-96 overflow-y-auto">
                {generateContent()}
              </pre>
            </motion.div>
          ) : (
            <div 
              className="h-96 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground"
              aria-hidden="true"
            >
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Select sections and click Generate</p>
              </div>
            </div>
          )}

          {/* Comparison */}
          {generated && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h5 className="text-sm font-medium mb-2">Before vs After</h5>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-muted-foreground mb-1">Traditional HTML</div>
                  <div className="font-mono font-bold">{allTokens * 5} tokens</div>
                  <div className="text-muted-foreground">With navigation, ads, etc.</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">llms.txt</div>
                  <div className="font-mono font-bold text-green-500">{totalTokens} tokens</div>
                  <div className="text-green-500">Clean, structured content</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
        <p>
          <strong>How it works:</strong> llms.txt provides a clean, Markdown-based view of your documentation
          without HTML noise. This reduces token usage by 80-90% and makes it easier for AI agents to
          understand your content.
        </p>
      </div>
    </div>
  )
}

// Simpler inline llms.txt example
interface LLMsTxtExampleProps {
  title: string
  content: string
  size?: string
}

export function LLMsTxtExample({ title, content, size = "8KB" }: LLMsTxtExampleProps) {
  const [copied, setCopied] = useState(false)

  const copyContent = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-4 rounded-lg border border-border overflow-hidden">
      <div className="p-3 bg-muted/30 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{size}</span>
          <button
            onClick={copyContent}
            className="p-1.5 rounded hover:bg-muted transition-colors"
            aria-label="Copy example code"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>
      <pre className="p-4 text-xs overflow-x-auto bg-[#0d1117] text-zinc-300 font-mono max-h-64 overflow-y-auto">
        {content}
      </pre>
    </div>
  )
}
