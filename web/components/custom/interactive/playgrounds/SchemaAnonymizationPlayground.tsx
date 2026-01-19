"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Shield,
  Eye,
  EyeOff,
  Play,
  RotateCcw,
  Copy,
  Check,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface AnonymizationRule {
  id: string
  name: string
  pattern: RegExp
  replacement: (match: string, index: number) => string
  enabled: boolean
}

const DEFAULT_RULES: AnonymizationRule[] = [
  {
    id: "email",
    name: "Email Addresses",
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    replacement: (_, i) => `user${i + 1}@example.com`,
    enabled: true,
  },
  {
    id: "phone",
    name: "Phone Numbers",
    pattern: /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    replacement: (_, i) => `+1-555-000-${String(i + 1).padStart(4, "0")}`,
    enabled: true,
  },
  {
    id: "ssn",
    name: "SSN",
    pattern: /\d{3}[-\s]?\d{2}[-\s]?\d{4}/g,
    replacement: () => "XXX-XX-XXXX",
    enabled: true,
  },
  {
    id: "creditcard",
    name: "Credit Cards",
    pattern: /\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/g,
    replacement: () => "XXXX-XXXX-XXXX-XXXX",
    enabled: true,
  },
  {
    id: "ipv4",
    name: "IP Addresses",
    pattern: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
    replacement: (_, i) => `10.0.0.${i + 1}`,
    enabled: true,
  },
  {
    id: "name",
    name: "Person Names",
    pattern: /\b(John|Jane|Michael|Sarah|David|Emily|Robert|Lisa|William|Jennifer)\s+(Smith|Johnson|Williams|Brown|Jones|Davis|Miller|Wilson|Moore|Taylor)\b/gi,
    replacement: (_, i) => `Person_${i + 1}`,
    enabled: false,
  },
]

const SAMPLE_DATA = `Customer Record:
Name: John Smith
Email: john.smith@company.com
Phone: (555) 123-4567
SSN: 123-45-6789
Credit Card: 4532-1234-5678-9012

Secondary Contact:
Name: Jane Johnson
Email: jane.j@personal-email.org
Phone: +1-555-987-6543
IP Address: 192.168.1.100

Notes: Customer called from 10.0.0.55 regarding account issues.
Backup email: backup@gmail.com`

export function SchemaAnonymizationPlayground() {
  const [input, setInput] = useState(SAMPLE_DATA)
  const [output, setOutput] = useState("")
  const [rules, setRules] = useState(DEFAULT_RULES)
  const [copied, setCopied] = useState(false)
  const [detectedItems, setDetectedItems] = useState<{ type: string; value: string; line: number }[]>([])

  const anonymize = useCallback(() => {
    let result = input
    const detected: typeof detectedItems = []
    let matchIndex = 0

    rules.filter(r => r.enabled).forEach(rule => {
      const matches = input.matchAll(rule.pattern)
      for (const match of matches) {
        const lineNumber = input.substring(0, match.index).split("\n").length
        detected.push({
          type: rule.name,
          value: match[0],
          line: lineNumber,
        })
      }
      
      result = result.replace(rule.pattern, (match) => {
        const replacement = rule.replacement(match, matchIndex++)
        return replacement
      })
    })

    setOutput(result)
    setDetectedItems(detected)
  }, [input, rules])

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ))
  }

  const reset = () => {
    setInput(SAMPLE_DATA)
    setOutput("")
    setDetectedItems([])
  }

  const copyOutput = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Schema Anonymization Playground
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rules Configuration */}
        <div className="space-y-3">
          <Label>Anonymization Rules</Label>
          <div className="flex flex-wrap gap-3">
            {rules.map(rule => (
              <div
                key={rule.id}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                  rule.enabled ? "bg-primary/10 border-primary/30" : "bg-muted/50"
                )}
              >
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={() => toggleRule(rule.id)}
                  id={rule.id}
                />
                <Label htmlFor={rule.id} className="cursor-pointer text-sm">
                  {rule.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Input/Output */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Original Data
              </Label>
              <Badge variant="outline" className="text-xs">
                {input.length} chars
              </Badge>
            </div>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              placeholder="Paste data containing PII..."
            />
          </div>

          {/* Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <EyeOff className="h-4 w-4" />
                Anonymized Data
              </Label>
              {output && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyOutput}
                  className="gap-1"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              )}
            </div>
            <Textarea
              value={output}
              readOnly
              className={cn(
                "min-h-[300px] font-mono text-sm",
                output && "bg-green-500/5 border-green-500/30"
              )}
              placeholder="Anonymized output will appear here..."
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <Button onClick={anonymize} className="gap-2">
            <Play className="h-4 w-4" /> Anonymize
          </Button>
          <Button onClick={reset} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>

        {/* Detected Items */}
        {detectedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <Label>Detected PII ({detectedItems.length} items)</Label>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {detectedItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded border bg-red-500/5 border-red-500/20"
                >
                  <div className="min-w-0">
                    <Badge variant="outline" className="text-xs mb-1">
                      {item.type}
                    </Badge>
                    <p className="text-xs font-mono truncate">{item.value}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">
                    Line {item.line}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Stats */}
        {output && (
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-xl font-bold text-red-500">{detectedItems.length}</div>
              <div className="text-xs text-muted-foreground">PII Found</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-xl font-bold text-green-500">{detectedItems.length}</div>
              <div className="text-xs text-muted-foreground">Anonymized</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-xl font-bold">{rules.filter(r => r.enabled).length}</div>
              <div className="text-xs text-muted-foreground">Active Rules</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
