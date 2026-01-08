"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { CopyButton } from "./CopyButton"

interface CodeTab {
  label: string
  language: string
  code: string
  filename?: string
}

interface CodeTabsProps {
  tabs: CodeTab[]
  defaultTab?: number
}

export function CodeTabs({ tabs, defaultTab = 0 }: CodeTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const currentTab = tabs[activeTab]

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-zinc-800 bg-[#0d1117]">
      {/* Tab Headers */}
      <div className="flex items-center border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex overflow-x-auto">
          {tabs.map((tab, i) => (
            <button
              key={`${tab.label}-${i}`}
              onClick={() => setActiveTab(i)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap",
                "border-b-2 -mb-px",
                activeTab === i
                  ? "text-foreground border-primary bg-zinc-800/50"
                  : "text-muted-foreground border-transparent hover:text-foreground hover:bg-zinc-800/30"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="ml-auto pr-2">
          <CopyButton 
            value={currentTab.code} 
            className="opacity-60 hover:opacity-100"
          />
        </div>
      </div>

      {/* Filename bar if present */}
      {currentTab.filename && (
        <div className="px-4 py-2 border-b border-zinc-800/50 bg-zinc-900/30">
          <span className="text-xs text-zinc-500 font-mono">{currentTab.filename}</span>
        </div>
      )}

      {/* Code Content */}
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm">
          <code className={`language-${currentTab.language}`}>
            {currentTab.code}
          </code>
        </pre>
      </div>
    </div>
  )
}

// Simpler variant for showing before/after code
interface CodeDiffProps {
  before: string
  after: string
  language?: string
  beforeLabel?: string
  afterLabel?: string
}

export function CodeDiff({ 
  before, 
  after, 
  language = "typescript",
  beforeLabel = "Before",
  afterLabel = "After"
}: CodeDiffProps) {
  return (
    <CodeTabs
      tabs={[
        { label: beforeLabel, language, code: before },
        { label: afterLabel, language, code: after }
      ]}
    />
  )
}

// Inline diff view showing additions and removals
interface DiffLine {
  type: "add" | "remove" | "unchanged"
  content: string
}

interface InlineDiffProps {
  lines: DiffLine[]
  filename?: string
}

export function InlineDiff({ lines, filename }: InlineDiffProps) {
  return (
    <div className="my-6 rounded-lg overflow-hidden border border-zinc-800 bg-[#0d1117]">
      {filename && (
        <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
          <span className="text-xs text-zinc-500 font-mono">{filename}</span>
        </div>
      )}
      
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono">
          {lines.map((line, i) => (
            <div
              key={i}
              className={cn(
                "px-2 -mx-2",
                line.type === "add" && "bg-green-500/10 text-green-400",
                line.type === "remove" && "bg-red-500/10 text-red-400 line-through opacity-70"
              )}
            >
              <span className="select-none mr-3 text-zinc-600 w-4 inline-block">
                {line.type === "add" ? "+" : line.type === "remove" ? "-" : " "}
              </span>
              {line.content}
            </div>
          ))}
        </pre>
      </div>
    </div>
  )
}
