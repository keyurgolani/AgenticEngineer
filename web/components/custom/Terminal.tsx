"use client"

import React, { useState } from "react"
import { Terminal as TerminalIcon, Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TerminalProps {
  command: string
  output: string
  height?: string
}

export function Terminal({ command, output, height = "h-64" }: TerminalProps) {
  const [hasCopied, setHasCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(command)
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 2000)
  }

  return (
    <div className="my-8 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 font-mono text-sm shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2">
            <TerminalIcon className="w-4 h-4 text-zinc-400" />
            <span className="text-zinc-400">bash</span>
        </div>
        <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
        </div>
      </div>

      {/* Command Bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/50 bg-zinc-950/50">
        <span className="text-green-500">➜</span>
        <span className="text-blue-400">~</span>
        <span className="text-zinc-100 flex-1">{command}</span>
        <Button 
            size="sm" 
            variant="secondary" 
            className="h-6 text-xs" 
            onClick={copyToClipboard}
        >
            {hasCopied ? <Check className="w-3 h-3 mr-1 text-green-500"/> : <Copy className="w-3 h-3 mr-1"/>}
            {hasCopied ? "Copied" : "Copy"}
        </Button>
      </div>

      {/* Output Area */}
      <div className={`p-4 overflow-y-auto ${height} bg-zinc-950`}>
        <div className="text-zinc-300 whitespace-pre-wrap">
            {output}
        </div>
      </div>
    </div>
  )
}
