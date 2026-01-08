"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Brain, Terminal, Eye, CheckCircle2, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

const steps = [
  { 
    id: "thought", 
    label: "Thought", 
    icon: Brain, 
    color: "text-purple-400", 
    bg: "bg-purple-400/10",
    description: "The agent analyzes the request and plans the next step."
  },
  { 
    id: "action", 
    label: "Action", 
    icon: Terminal, 
    color: "text-blue-400", 
    bg: "bg-blue-400/10",
    description: "The agent executes a tool or API call based on its plan."
  },
  { 
    id: "observation", 
    label: "Observation", 
    icon: Eye, 
    color: "text-green-400", 
    bg: "bg-green-400/10",
    description: "The agent sees the result of the action."
  }
]

export function ThinkingLoop() {
  const [activeStep, setActiveStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [cycleCount, setCycleCount] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveStep((prev) => {
          if (prev === 2) {
            setCycleCount(c => c + 1)
            return 0
          }
          return prev + 1
        })
      }, 2000)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  return (
    <div className="my-8 rounded-xl border border-border bg-[#0d1117] overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
        <h4 className="font-semibold text-sm flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              {isPlaying && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-green-500' : 'bg-zinc-500'}`}></span>
            </span>
            Agentic Loop Visualization
        </h4>
        <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono mr-2">Cycles: {cycleCount}</span>
            <Button 
                size="sm" 
                variant={isPlaying ? "secondary" : "default"}
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-7 text-xs"
            >
                {isPlaying ? "Pause" : <><Play className="w-3 h-3 mr-1" /> Simulate</>}
            </Button>
        </div>
      </div>

      <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
        {/* Connection Lines (Background) */}
        <div className="relative flex items-center justify-center w-full max-w-2xl">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -z-10" />
            
            <div className="grid grid-cols-3 gap-8 w-full">
                {steps.map((step, index) => {
                    const isActive = activeStep === index

                    return (
                        <div key={step.id} className="relative flex flex-col items-center group">
                            <motion.div 
                                animate={{ 
                                    scale: isActive ? 1.1 : 1,
                                    borderColor: isActive ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.1)",
                                }}
                                className={`w-16 h-16 rounded-full border-2 bg-[#0d1117] flex items-center justify-center z-10 transition-colors duration-300 ${isActive ? step.bg : 'bg-[#0d1117]'}`}
                            >
                                <step.icon className={`w-7 h-7 ${isActive ? step.color : 'text-muted-foreground'}`} />
                            </motion.div>
                            
                            <div className="mt-4 text-center">
                                <h5 className={`font-medium text-sm transition-colors duration-300 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</h5>
                            </div>

                            {isActive && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute top-28 bg-muted/50 backdrop-blur-sm border border-border p-3 rounded-lg text-xs text-muted-foreground text-center w-48"
                                >
                                    {step.description}
                                </motion.div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>

        {/* Completion Logic Visualization */}
        {cycleCount > 0 && (
             <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-20 flex items-center gap-2 text-green-400 text-sm bg-green-950/30 px-3 py-1.5 rounded-full border border-green-900"
             >
                <CheckCircle2 className="w-4 h-4" />
                <span>Task Completed (after {cycleCount} loops)</span>
             </motion.div>
        )}
      </div>
    </div>
  )
}
