"use client"

import { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FileCode2, 
  Copy, 
  Check, 
  RotateCcw, 
  Download,
  AlertCircle,
  Variable,
  Eye,
  Code,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface ExtractedVariable {
  name: string
  filter?: string
  defaultValue: string
  type: "string" | "number" | "boolean" | "object" | "array"
}

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

// Jinja2 filters that we support
const SUPPORTED_FILTERS = ["upper", "lower", "title", "capitalize", "trim", "truncate", "default", "json", "length"]

// Extract variables from Jinja2-style template
function extractVariables(template: string): ExtractedVariable[] {
  const variableMap = new Map<string, ExtractedVariable>()
  
  // Match {{ variable }} and {{ variable | filter }} and {{ variable | filter(args) }}
  const pattern = /\{\{\s*(\w+)(?:\s*\|\s*(\w+)(?:\([^)]*\))?)?\s*\}\}/g
  let match
  
  while ((match = pattern.exec(template)) !== null) {
    const name = match[1]
    const filter = match[2]
    
    if (!variableMap.has(name)) {
      variableMap.set(name, {
        name,
        filter,
        defaultValue: "",
        type: "string"
      })
    }
  }
  
  return Array.from(variableMap.values())
}

// Validate Jinja2 template syntax
function validateTemplate(template: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Check for unmatched braces
  const openBraces = (template.match(/\{\{/g) || []).length
  const closeBraces = (template.match(/\}\}/g) || []).length
  
  if (openBraces !== closeBraces) {
    errors.push(`Unmatched braces: ${openBraces} opening vs ${closeBraces} closing`)
  }
  
  // Check for empty variable names
  if (/\{\{\s*\}\}/.test(template)) {
    errors.push("Empty variable placeholder found: {{ }}")
  }
  
  // Check for invalid variable names
  const invalidVars = template.match(/\{\{\s*[^a-zA-Z_][^}]*\}\}/g)
  if (invalidVars) {
    errors.push(`Invalid variable names: ${invalidVars.join(", ")}`)
  }
  
  // Check for unsupported filters
  const filterPattern = /\{\{\s*\w+\s*\|\s*(\w+)/g
  let filterMatch
  while ((filterMatch = filterPattern.exec(template)) !== null) {
    const filter = filterMatch[1]
    if (!SUPPORTED_FILTERS.includes(filter)) {
      warnings.push(`Unknown filter: ${filter}`)
    }
  }
  
  // Check for control structures (not supported in simple mode)
  if (/\{%/.test(template)) {
    warnings.push("Control structures ({% %}) detected - only variable substitution is supported")
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

// Apply filter to value
function applyFilter(value: string, filter: string, args?: string): string {
  switch (filter) {
    case "upper":
      return value.toUpperCase()
    case "lower":
      return value.toLowerCase()
    case "title":
      return value.replace(/\b\w/g, c => c.toUpperCase())
    case "capitalize":
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    case "trim":
      return value.trim()
    case "truncate":
      const length = args ? parseInt(args, 10) : 50
      return value.length > length ? value.slice(0, length) + "..." : value
    case "length":
      return String(value.length)
    case "json":
      try {
        return JSON.stringify(value, null, 2)
      } catch {
        return value
      }
    case "default":
      return value || args || ""
    default:
      return value
  }
}

// Render template with variables
function renderTemplate(template: string, variables: Record<string, string>): string {
  let result = template
  
  // Replace {{ variable | filter(args) }} patterns
  result = result.replace(
    /\{\{\s*(\w+)(?:\s*\|\s*(\w+)(?:\(([^)]*)\))?)?\s*\}\}/g,
    (match, varName, filter, args) => {
      const value = variables[varName] ?? ""
      if (filter) {
        return applyFilter(value, filter, args?.replace(/['"]/g, ""))
      }
      return value
    }
  )
  
  return result
}

// Syntax highlighting for Jinja2 templates
function highlightTemplate(template: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  
  // Match Jinja2 patterns
  const pattern = /(\{\{[^}]+\}\})|(\{%[^%]+%\})|(\{#[^#]+#\})/g
  let match
  
  while ((match = pattern.exec(template)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`} className="text-zinc-300">
          {template.slice(lastIndex, match.index)}
        </span>
      )
    }
    
    const fullMatch = match[0]
    
    if (fullMatch.startsWith("{{")) {
      // Variable expression
      const inner = fullMatch.slice(2, -2)
      const varMatch = inner.match(/^\s*(\w+)(.*)$/)
      
      if (varMatch) {
        parts.push(
          <span key={`var-${match.index}`} className="text-yellow-400">
            {"{{"}
            <span className="text-cyan-400">{varMatch[1]}</span>
            {varMatch[2] && <span className="text-purple-400">{varMatch[2]}</span>}
            {"}}"}
          </span>
        )
      } else {
        parts.push(
          <span key={`expr-${match.index}`} className="text-yellow-400">
            {fullMatch}
          </span>
        )
      }
    } else if (fullMatch.startsWith("{%")) {
      // Control structure
      parts.push(
        <span key={`ctrl-${match.index}`} className="text-green-400">
          {fullMatch}
        </span>
      )
    } else if (fullMatch.startsWith("{#")) {
      // Comment
      parts.push(
        <span key={`comment-${match.index}`} className="text-zinc-500 italic">
          {fullMatch}
        </span>
      )
    }
    
    lastIndex = match.index + fullMatch.length
  }
  
  // Add remaining text
  if (lastIndex < template.length) {
    parts.push(
      <span key={`text-end`} className="text-zinc-300">
        {template.slice(lastIndex)}
      </span>
    )
  }
  
  return parts
}

const EXAMPLE_TEMPLATES = [
  {
    name: "Research Agent",
    template: `You are a research assistant specializing in {{ topic }}.

Your task is to {{ task | lower }}.

Guidelines:
- Focus on {{ focus_area }}
- Provide {{ num_sources | default('3') }} sources
- Format output as {{ output_format | default('markdown') }}`,
  },
  {
    name: "Code Review",
    template: `Review the following {{ language | upper }} code:

\`\`\`{{ language }}
{{ code }}
\`\`\`

Focus on:
- {{ review_focus | default('best practices') }}
- Security vulnerabilities
- Performance optimizations

Provide feedback in {{ format | default('bullet points') }}.`,
  },
  {
    name: "Data Analysis",
    template: `Analyze the {{ data_type }} data provided.

Context: {{ context | truncate(200) }}

Required analysis:
1. {{ analysis_type | title }}
2. Key insights
3. Recommendations

Output format: {{ output_format | default('JSON') }}`,
  }
]

export function PromptTemplateBuilder() {
  const [template, setTemplate] = useState(EXAMPLE_TEMPLATES[0].template)
  const [variableValues, setVariableValues] = useState<Record<string, string>>({
    topic: "artificial intelligence",
    task: "Summarize recent developments",
    focus_area: "practical applications",
    num_sources: "5",
    output_format: "markdown"
  })
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor")
  const [copied, setCopied] = useState(false)
  const [copiedRendered, setCopiedRendered] = useState(false)

  // Extract variables from template
  const extractedVariables = useMemo(() => extractVariables(template), [template])
  
  // Validate template
  const validation = useMemo(() => validateTemplate(template), [template])
  
  // Render template with current variable values
  const renderedTemplate = useMemo(() => {
    if (!validation.valid) return template
    return renderTemplate(template, variableValues)
  }, [template, variableValues, validation.valid])

  // Update variable value
  const updateVariable = useCallback((name: string, value: string) => {
    setVariableValues(prev => ({ ...prev, [name]: value }))
  }, [])

  // Load example template
  const loadExample = useCallback((example: typeof EXAMPLE_TEMPLATES[0]) => {
    setTemplate(example.template)
    // Reset variable values for new template
    const newVars = extractVariables(example.template)
    const newValues: Record<string, string> = {}
    newVars.forEach(v => {
      newValues[v.name] = variableValues[v.name] || ""
    })
    setVariableValues(newValues)
  }, [variableValues])

  // Copy template
  const copyTemplate = useCallback(async () => {
    await navigator.clipboard.writeText(template)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [template])

  // Copy rendered output
  const copyRendered = useCallback(async () => {
    await navigator.clipboard.writeText(renderedTemplate)
    setCopiedRendered(true)
    setTimeout(() => setCopiedRendered(false), 2000)
  }, [renderedTemplate])

  // Download template as JSON
  const downloadTemplate = useCallback(() => {
    const data = {
      template,
      variables: extractedVariables.map(v => ({
        name: v.name,
        filter: v.filter,
        defaultValue: variableValues[v.name] || ""
      })),
      metadata: {
        created: new Date().toISOString(),
        version: "1.0"
      }
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `prompt-template-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [template, extractedVariables, variableValues])

  // Reset to default
  const reset = useCallback(() => {
    setTemplate(EXAMPLE_TEMPLATES[0].template)
    setVariableValues({
      topic: "artificial intelligence",
      task: "Summarize recent developments",
      focus_area: "practical applications",
      num_sources: "5",
      output_format: "markdown"
    })
  }, [])

  return (
    <div className="my-8 rounded-xl border border-border bg-card/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <FileCode2 className="w-5 h-5 text-primary" />
          Prompt Template Builder
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
            onClick={downloadTemplate}
            className="h-8 text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Example Templates */}
      <div className="p-3 border-b border-border bg-muted/20 flex items-center gap-2 overflow-x-auto">
        <span className="text-xs text-muted-foreground whitespace-nowrap">Examples:</span>
        {EXAMPLE_TEMPLATES.map((example, i) => (
          <Button
            key={i}
            variant="outline"
            size="sm"
            onClick={() => loadExample(example)}
            className="h-7 text-xs whitespace-nowrap"
          >
            {example.name}
          </Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* Editor Panel - 3 columns */}
        <div className="lg:col-span-3 flex flex-col">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "editor" | "preview")} className="flex flex-col flex-1">
            <div className="p-2 border-b border-border bg-muted/20">
              <TabsList className="h-8">
                <TabsTrigger value="editor" className="text-xs gap-1.5">
                  <Code className="w-3 h-3" />
                  Editor
                </TabsTrigger>
                <TabsTrigger value="preview" className="text-xs gap-1.5">
                  <Eye className="w-3 h-3" />
                  Preview
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="editor" className="flex-1 m-0 data-[state=inactive]:hidden">
              <div className="relative h-full min-h-[300px]">
                <textarea
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className={cn(
                    "w-full h-full min-h-[300px] p-4 font-mono text-sm resize-none",
                    "bg-[#0d1117] text-zinc-300",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20",
                    "placeholder:text-zinc-600"
                  )}
                  placeholder="Enter your Jinja2 template here...

Example:
You are a {{ role }} assistant.
Your task is to {{ task | lower }}.
"
                  spellCheck={false}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyTemplate}
                  className="absolute top-2 right-2 h-7 text-xs gap-1 bg-zinc-800/80 hover:bg-zinc-700"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="flex-1 m-0 data-[state=inactive]:hidden">
              <div className="relative h-full min-h-[300px] bg-[#0d1117] p-4 overflow-auto">
                <pre className="font-mono text-sm whitespace-pre-wrap">
                  {highlightTemplate(template)}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Validation Messages */}
          <AnimatePresence>
            {(validation.errors.length > 0 || validation.warnings.length > 0) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-border overflow-hidden"
              >
                <div className="p-3 space-y-2">
                  {validation.errors.map((error, i) => (
                    <div key={`error-${i}`} className="flex items-start gap-2 text-sm text-red-400">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  ))}
                  {validation.warnings.map((warning, i) => (
                    <div key={`warning-${i}`} className="flex items-start gap-2 text-sm text-yellow-400">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Variables Panel - 2 columns */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="p-3 border-b border-border bg-muted/20 flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              <Variable className="w-4 h-4" />
              Variables
              <Badge variant="secondary" className="text-xs">
                {extractedVariables.length}
              </Badge>
            </span>
          </div>
          
          <div className="flex-1 overflow-auto p-4 space-y-4 max-h-[400px]">
            {extractedVariables.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Variable className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No variables detected</p>
                <p className="text-xs mt-1">Use {"{{ variable }}"} syntax</p>
              </div>
            ) : (
              extractedVariables.map((variable, index) => (
                <motion.div
                  key={variable.name}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-mono flex items-center gap-2">
                      <span className="text-cyan-400">{variable.name}</span>
                      {variable.filter && (
                        <Badge variant="outline" className="text-xs font-normal text-purple-400">
                          | {variable.filter}
                        </Badge>
                      )}
                    </Label>
                    <Badge variant="secondary" className="text-xs">
                      {variable.type}
                    </Badge>
                  </div>
                  <Input
                    value={variableValues[variable.name] || ""}
                    onChange={(e) => updateVariable(variable.name, e.target.value)}
                    placeholder={`Enter ${variable.name}...`}
                    className="font-mono text-sm h-9"
                  />
                </motion.div>
              ))
            )}
          </div>
          
          {/* Supported Filters Reference */}
          <div className="p-3 border-t border-border bg-muted/20">
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Supported Filters
              </summary>
              <div className="mt-2 flex flex-wrap gap-1">
                {SUPPORTED_FILTERS.map(filter => (
                  <code key={filter} className="px-1.5 py-0.5 rounded bg-muted text-xs">
                    {filter}
                  </code>
                ))}
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Rendered Output */}
      <div className="border-t border-border">
        <div className="p-3 bg-muted/20 flex items-center justify-between">
          <span className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Rendered Output
          </span>
          <Button
            size="sm"
            onClick={copyRendered}
            className="h-7 text-xs gap-1"
            disabled={!validation.valid}
          >
            {copiedRendered ? (
              <>
                <Check className="w-3 h-3" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy Output
              </>
            )}
          </Button>
        </div>
        <div className="p-4 bg-[#0d1117] max-h-[300px] overflow-auto">
          <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap">
            {validation.valid ? renderedTemplate : (
              <span className="text-red-400">Fix template errors to see rendered output</span>
            )}
          </pre>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-border bg-muted/20 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Code className="w-3 h-3" />
          {template.length} chars
        </span>
        <span className="flex items-center gap-1.5">
          <Variable className="w-3 h-3" />
          {extractedVariables.length} variables
        </span>
        <span className={cn(
          "flex items-center gap-1.5",
          validation.valid ? "text-green-500" : "text-red-500"
        )}>
          {validation.valid ? (
            <>
              <Check className="w-3 h-3" />
              Valid template
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3" />
              {validation.errors.length} error(s)
            </>
          )}
        </span>
      </div>
    </div>
  )
}

export default PromptTemplateBuilder
