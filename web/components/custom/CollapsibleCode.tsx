"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronRight, Code2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { CopyButton } from "./CopyButton"

interface CollapsibleCodeProps {
  title: string
  code: string
  language?: string
  defaultOpen?: boolean
  children?: React.ReactNode
}

export function CollapsibleCode({
  title,
  code,
  language = "typescript",
  defaultOpen = false,
  children
}: CollapsibleCodeProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-zinc-800 bg-[#0d1117]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors text-left"
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </motion.div>
        <Code2 className="w-4 h-4 text-zinc-500" />
        <span className="font-mono text-sm text-zinc-300 flex-1">{title}</span>
        {language && (
          <span className="text-xs text-zinc-500 uppercase">{language}</span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="relative border-t border-zinc-800">
              <CopyButton 
                value={code} 
                className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              />
              <div className="p-4 overflow-x-auto group">
                {children || (
                  <pre className="text-sm">
                    <code className={`language-${language}`}>{code}</code>
                  </pre>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Expandable section for any content (not just code)
interface ExpandableSectionProps {
  title: string
  icon?: React.ReactNode
  defaultOpen?: boolean
  variant?: "default" | "info" | "warning" | "tip"
  children: React.ReactNode
}

export function ExpandableSection({
  title,
  icon,
  defaultOpen = false,
  variant = "default",
  children
}: ExpandableSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const variantStyles = {
    default: "border-border bg-card/50",
    info: "border-blue-500/20 bg-blue-500/5",
    warning: "border-amber-500/20 bg-amber-500/5",
    tip: "border-purple-500/20 bg-purple-500/5"
  }

  const headerStyles = {
    default: "hover:bg-muted/50",
    info: "hover:bg-blue-500/10",
    warning: "hover:bg-amber-500/10",
    tip: "hover:bg-purple-500/10"
  }

  return (
    <div className={cn(
      "my-6 rounded-lg overflow-hidden border",
      variantStyles[variant]
    )}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 transition-colors text-left",
          headerStyles[variant]
        )}
      >
        <motion.div
          animate={{ rotate: isOpen ? 0 : -90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
        {icon}
        <span className="text-sm font-medium flex-1">{title}</span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Deep Dive section - for advanced content
interface DeepDiveProps {
  title?: string
  children: React.ReactNode
}

export function DeepDive({ title = "Deep Dive", children }: DeepDiveProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-indigo-500/20 bg-indigo-500/5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-500/10 transition-colors text-left"
      >
        <motion.div
          animate={{ rotate: isOpen ? 0 : -90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-indigo-400" />
        </motion.div>
        <span className="text-lg">🔬</span>
        <span className="text-sm font-semibold text-indigo-400">{title}</span>
        <span className="text-xs text-indigo-400/60 ml-auto">Advanced</span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-indigo-500/20">
              <div className="prose prose-sm prose-zinc dark:prose-invert max-w-none">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
