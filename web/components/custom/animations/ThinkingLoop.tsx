"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, Eye, Zap, Database } from "lucide-react"

export function ThinkingLoop() {
  const [step, setStep] = useState(0)
  
  // 0: Perception (Input)
  // 1: Reasoning (Brain processing)
  // 2: Action (Tool usage)
  // 3: Feedback (Result)

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 4)
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="w-full max-w-3xl mx-auto my-16 p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative">
        
        {/* Connecting Lines */}
        <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-zinc-800 -z-10 hidden md:block">
            <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                animate={{ 
                    width: ["0%", "33%", "66%", "100%", "0%"],
                    left: ["0%", "0%", "0%", "0%", "100%"]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
        </div>

        {/* Nodes */}
        <LoopNode 
            icon={Eye} 
            label="Perception" 
            active={step === 0} 
            color="text-blue-400" 
            bgColor="bg-blue-400/10"
            desc="User Input / Obs"
        />
        
        <LoopNode 
            icon={Brain} 
            label="Reasoning (LLM)" 
            active={step === 1} 
            color="text-purple-400" 
            bgColor="bg-purple-400/10"
            desc="Decision Making"
        />
        
        <LoopNode 
            icon={Zap} 
            label="Action (Tool)" 
            active={step === 2} 
            color="text-pink-400" 
            bgColor="bg-pink-400/10"
            desc="Execution"
        />

        <LoopNode 
            icon={Database} 
            label="Memory (Context)" 
            active={step === 3} 
            color="text-green-400" 
            bgColor="bg-green-400/10"
            desc="State Update"
        />

      </div>

      <div className="mt-8 text-center h-12">
        <AnimatePresence mode="wait">
            <motion.p 
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-lg font-medium text-muted-foreground"
            >
                {step === 0 && "Agent observes the user request or tool output..."}
                {step === 1 && "LLM reasons about what to do next based on context."}
                {step === 2 && "Agent executes a tool (API, Python, Search)."}
                {step === 3 && "Result is saved to Memory, updating the Context."}
            </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function LoopNode({ icon: Icon, label, active, color, bgColor, desc }: any) {
  return (
    <motion.div 
        className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-500 ${active ? `${bgColor} border-white/10 scale-110 shadow-lg` : 'bg-transparent border-transparent opacity-50'}`}
        animate={active ? { y: -5 } : { y: 0 }}
    >
      <div className={`p-3 rounded-full ${bgColor} ${active ? 'ring-2 ring-white/20' : ''}`}>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
      <div className="text-center">
        <h4 className={`font-bold text-sm ${active ? 'text-white' : 'text-zinc-500'}`}>{label}</h4>
        <span className="text-xs text-zinc-500">{desc}</span>
      </div>
      
      {active && (
         <motion.div 
            layoutId="active-glow"
            className={`absolute inset-0 rounded-xl ${bgColor} blur-xl -z-10`} 
            transition={{ duration: 0.5 }}
         />
      )}
    </motion.div>
  )
}
