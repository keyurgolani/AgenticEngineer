"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, Copy, Check, RotateCcw, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PromptSection {
  id: string
  label: string
  placeholder: string
  value: string
  required?: boolean
}

const defaultSections: PromptSection[] = [
  {
    id: "role",
    label: "Role",
    placeholder: "You are an expert software engineer...",
    value: "",
    required: true
  },
  {
    id: "context",
    label: "Context",
    placeholder: "The user is working on a Python project...",
    value: ""
  },
  {
    id: "task",
    label: "Task",
    placeholder: "Help the user debug their code...",
    value: "",
    required: true
  },
  {
    id: "format",
    label: "Output Format",
    placeholder: "Respond in markdown with code blocks...",
    value: ""
  },
  {
    id: "constraints",
    label: "Constraints",
    placeholder: "Keep responses concise. Do not...",
    value: ""
  }
]

export function PromptBuilder() {
  const [sections, setSections] = useState<PromptSection[]>(defaultSections)
  const [copied, setCopied] = useState(false)
  const [customSections, setCustomSections] = useState<string[]>([])

  const updateSection = (id: string, value: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, value } : s))
  }

  const addCustomSection = () => {
    const newId = `custom-${Date.now()}`
    setCustomSections(prev => [...prev, newId])
    setSections(prev => [...prev, {
      id: newId,
      label: "Custom Section",
      placeholder: "Add your custom instructions...",
      value: ""
    }])
  }

  const removeCustomSection = (id: string) => {
    setCustomSections(prev => prev.filter(s => s !== id))
    setSections(prev => prev.filter(s => s.id !== id))
  }

  const generatePrompt = () => {
    const parts: string[] = []
    
    sections.forEach(section => {
      if (section.value.trim()) {
        parts.push(`## ${section.label}\n${section.value}`)
      }
    })
    
    return parts.join("\n\n")
  }

  const copyPrompt = async () => {
    const prompt = generatePrompt()
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const reset = () => {
    setSections(defaultSections)
    setCustomSections([])
  }

  const prompt = generatePrompt()
  const hasContent = sections.some(s => s.value.trim())

  return (
    <div className="my-8 rounded-xl border border-border bg-card/50 overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Prompt Builder
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="h-8 text-xs"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={addCustomSection}
            className="h-8 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Section
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                {section.label}
                {section.required && (
                  <span className="text-xs text-red-500">*</span>
                )}
              </label>
              {customSections.includes(section.id) && (
                <button
                  onClick={() => removeCustomSection(section.id)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              )}
            </div>
            <textarea
              value={section.value}
              onChange={(e) => updateSection(section.id, e.target.value)}
              placeholder={section.placeholder}
              className={cn(
                "w-full p-3 rounded-lg border bg-background text-sm resize-none transition-colors",
                "placeholder:text-muted-foreground/50",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                section.value ? "border-primary/30" : "border-border"
              )}
              rows={2}
            />
          </motion.div>
        ))}
      </div>

      {/* Preview */}
      {hasContent && (
        <div className="border-t border-border">
          <div className="p-4 bg-muted/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Preview</span>
              <Button
                size="sm"
                onClick={copyPrompt}
                className="h-8 gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy Prompt
                  </>
                )}
              </Button>
            </div>
            <pre className="p-4 rounded-lg bg-[#0d1117] text-sm text-zinc-300 overflow-x-auto whitespace-pre-wrap font-mono">
              {prompt}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

// Simpler prompt template display
interface PromptTemplateProps {
  title: string
  template: string
  variables?: string[]
}

export function PromptTemplate({ title, template, variables }: PromptTemplateProps) {
  const [copied, setCopied] = useState(false)

  const copyTemplate = async () => {
    await navigator.clipboard.writeText(template)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-4 rounded-lg border border-border overflow-hidden">
      <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <span className="text-sm font-medium">{title}</span>
        <button
          onClick={copyTemplate}
          className="p-1.5 rounded hover:bg-muted transition-colors"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto bg-[#0d1117] text-zinc-300 font-mono">
        {template}
      </pre>
      {variables && variables.length > 0 && (
        <div className="p-3 border-t border-border bg-muted/20">
          <span className="text-xs text-muted-foreground">Variables: </span>
          {variables.map((v, i) => (
            <code key={i} className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary mx-1">
              {`{${v}}`}
            </code>
          ))}
        </div>
      )}
    </div>
  )
}
