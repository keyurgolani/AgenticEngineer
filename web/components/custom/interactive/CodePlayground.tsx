"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MonitorPlay, Code2, Maximize2, ExternalLink, Loader2, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface CodePlaygroundProps {
  id: string
  type?: "stackblitz" | "codesandbox"
  file?: string
  title?: string
  height?: number
  defaultOpen?: boolean
}

export function CodePlayground({
  id,
  type = "stackblitz",
  file,
  title = "Interactive Playground",
  height = 500,
  defaultOpen = false,
}: CodePlaygroundProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isLoading, setIsLoading] = useState(true)
  const [key, setKey] = useState(0) // Used to force iframe reload

  const getUrl = () => {
    if (type === "stackblitz") {
      // StackBlitz embed format
      // id should be the project slug, e.g., "react-ts-12345"
      const baseUrl = `https://stackblitz.com/edit/${id}`
      const params = new URLSearchParams({
        embed: "1",
        file: file || "index.ts",
        hideExplorer: "1",
        theme: "dark",
      })
      return `${baseUrl}?${params.toString()}`
    } else {
      // CodeSandbox embed format
      // id should be the sandbox id
      const baseUrl = `https://codesandbox.io/embed/${id}`
      const params = new URLSearchParams({
        fontsize: "14",
        hidenavigation: "1",
        theme: "dark",
        view: "split",
      })
      return `${baseUrl}?${params.toString()}`
    }
  }

  const handleReload = () => {
    setIsLoading(true)
    setKey((prev) => prev + 1)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50 p-8 text-left transition-all hover:border-blue-500/50 hover:bg-zinc-900/50"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-500/10 p-3 text-blue-400 ring-1 ring-blue-500/20 group-hover:bg-blue-500/20 group-hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)] transition-all">
              <MonitorPlay className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-200 group-hover:text-blue-200 transaction-colors">
                {title}
              </h3>
              <p className="text-sm text-zinc-500 group-hover:text-zinc-400">
                Click to launch interactive environment
              </p>
            </div>
          </div>
          
          <div className="transistion-transform group-hover:translate-x-1">
            <Code2 className="h-5 w-5 text-zinc-600 group-hover:text-blue-400" />
          </div>
        </div>
      </button>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 py-2">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <MonitorPlay className="h-4 w-4 text-blue-400" />
          <span className="font-medium text-zinc-200">{title}</span>
          <span className="text-zinc-600">•</span>
          <span className="text-xs font-mono opacity-70">
            Powered by {type === "stackblitz" ? "StackBlitz" : "CodeSandbox"}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-400 hover:text-zinc-100"
            onClick={handleReload}
            title="Reload Environment"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-400 hover:text-zinc-100"
            onClick={() => window.open(getUrl().replace("embed=1", ""), "_blank")}
            title="Open in New Tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-400 hover:text-zinc-100"
            onClick={() => setIsOpen(false)}
            title="Close Playground"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="relative bg-zinc-950" style={{ height: height }}>
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-900/20 backdrop-blur-sm z-10">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm font-medium text-zinc-400">Booting container...</p>
          </div>
        )}
        
        <iframe
          key={key}
          src={getUrl()}
          className="h-full w-full border-0 bg-transparent"
          title={title}
          allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  )
}
