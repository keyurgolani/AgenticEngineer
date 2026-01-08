"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, Wrench, Database, MessageSquare, Zap, ChevronRight, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface AgentComponent {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  details: string[]
  color: string
}

const agentComponents: AgentComponent[] = [
  {
    id: "llm",
    name: "LLM Core",
    icon: <Brain className="w-6 h-6" />,
    description: "The reasoning engine that processes inputs and generates responses",
    details: [
      "Processes natural language inputs",
      "Generates structured outputs",
      "Handles multi-turn conversations",
      "Applies system prompts and context"
    ],
    color: "from-purple-500 to-violet-600"
  },
  {
    id: "tools",
    name: "Tool Layer",
    icon: <Wrench className="w-6 h-6" />,
    description: "External capabilities the agent can invoke",
    details: [
      "API integrations",
      "Code execution",
      "File operations",
      "Web browsing"
    ],
    color: "from-blue-500 to-cyan-600"
  },
  {
    id: "memory",
    name: "Memory System",
    icon: <Database className="w-6 h-6" />,
    description: "Short and long-term storage for context and knowledge",
    details: [
      "Conversation history",
      "Vector embeddings",
      "Semantic search",
      "Knowledge graphs"
    ],
    color: "from-green-500 to-emerald-600"
  },
  {
    id: "orchestrator",
    name: "Orchestrator",
    icon: <Zap className="w-6 h-6" />,
    description: "Controls the flow and decision-making process",
    details: [
      "State management",
      "Routing logic",
      "Error handling",
      "Retry mechanisms"
    ],
    color: "from-orange-500 to-amber-600"
  }
]

export function AgentArchitecture() {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleComponentClick = (id: string) => {
    setSelectedComponent(selectedComponent === id ? null : id)
  }

  const triggerAnimation = () => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 3000)
  }

  return (
    <div className="my-8 p-6 rounded-xl border border-border bg-card/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Agent Architecture
        </h3>
        <button
          onClick={triggerAnimation}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          Animate Flow
        </button>
      </div>

      {/* Architecture Diagram */}
      <div className="relative">
        {/* Central Hub */}
        <div className="flex justify-center mb-8">
          <motion.div
            className={cn(
              "relative w-32 h-32 rounded-full bg-gradient-to-br flex items-center justify-center",
              "from-primary/20 to-primary/5 border-2 border-primary/30"
            )}
            animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: isAnimating ? 5 : 0 }}
          >
            <MessageSquare className="w-10 h-10 text-primary" />
            <span className="absolute -bottom-6 text-xs font-medium text-muted-foreground">
              User Input
            </span>
          </motion.div>
        </div>

        {/* Components Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {agentComponents.map((component, index) => (
            <motion.button
              key={component.id}
              onClick={() => handleComponentClick(component.id)}
              className={cn(
                "relative p-4 rounded-xl border transition-all text-left",
                selectedComponent === component.id
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-border hover:border-primary/50 bg-card/50"
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Connection Line Animation */}
              {isAnimating && (
                <motion.div
                  className="absolute -top-8 left-1/2 w-0.5 h-8 bg-gradient-to-b from-primary to-transparent"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: index * 0.3, duration: 0.3 }}
                />
              )}

              <div className={cn(
                "w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center text-white mb-3",
                component.color
              )}>
                {component.icon}
              </div>
              <h4 className="font-medium text-sm mb-1">{component.name}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {component.description}
              </p>
              
              <ChevronRight className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-transform",
                selectedComponent === component.id && "rotate-90"
              )} />
            </motion.button>
          ))}
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedComponent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              {agentComponents
                .filter(c => c.id === selectedComponent)
                .map(component => (
                  <div
                    key={component.id}
                    className="p-4 rounded-xl border border-primary/20 bg-primary/5"
                  >
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-2">{component.name} Details</h4>
                        <ul className="space-y-1">
                          {component.details.map((detail, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Simpler version for inline use
export function AgentComponentCard({ 
  name, 
  description, 
  icon 
}: { 
  name: string
  description: string
  icon: React.ReactNode 
}) {
  return (
    <div className="p-4 rounded-lg border border-border bg-card/50 hover:border-primary/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <h4 className="font-medium text-sm">{name}</h4>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </div>
  )
}
