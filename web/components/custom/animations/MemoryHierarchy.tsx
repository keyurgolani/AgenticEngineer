"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Cpu, HardDrive, BookOpen } from "lucide-react"

export function MemoryHierarchy() {
  const [activeTier, setActiveTier] = useState<string | null>("L1")

  const tiers = [
    {
      id: "L1",
      label: "Working Memory (L1)",
      icon: Cpu,
      color: "bg-blue-500",
      textColor: "text-blue-400",
      desc: "Immediate context window. Contains recent messages and active thoughts. Fast but expensive.",
      tech: "List[Message]",
      width: "w-1/3"
    },
    {
      id: "L2",
      label: "Episodic Memory (L2)",
      icon: HardDrive,
      color: "bg-purple-500",
      textColor: "text-purple-400",
      desc: "Relevant past experiences retrieved via semantic search (RAG). Infinite but slower.",
      tech: "Vector DB (LanceDB)",
      width: "w-2/3"
    },
    {
      id: "L3",
      label: "Archival Memory (L3)",
      icon: BookOpen,
      color: "bg-orange-500",
      textColor: "text-orange-400",
      desc: "High-level facts, user preferences, and goals compressed over time.",
      tech: "Recursive Summaries",
      width: "w-full"
    }
  ]

  return (
    <div className="w-full max-w-4xl mx-auto my-16 p-8 relative">
      <div className="flex flex-col items-center gap-4 relative z-10">
        {tiers.map((tier) => (
          <motion.div
            key={tier.id}
            className={`${tier.width} cursor-pointer relative group`}
            onClick={() => setActiveTier(tier.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div 
                className={`
                    p-6 rounded-xl border border-white/5 backdrop-blur-md shadow-xl flex items-center justify-between
                    transition-all duration-300
                    ${activeTier === tier.id ? `bg-zinc-800/80 border-${tier.textColor.split('-')[1]}-500/50` : 'bg-zinc-900/40 opacity-70 hover:opacity-100'}
                `}
            >
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${tier.color}/20 ${tier.textColor}`}>
                        <tier.icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className={`font-bold text-lg ${activeTier === tier.id ? 'text-white' : 'text-zinc-400'}`}>
                            {tier.label}
                        </h3>
                        <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">{tier.tech}</span>
                    </div>
                </div>
            </div>
            
            {/* Active Glow */}
            {activeTier === tier.id && (
                <motion.div 
                    layoutId="pyramid-glow"
                    className={`absolute inset-0 rounded-xl ${tier.color} blur-2xl opacity-20 -z-10`} 
                />
            )}
          </motion.div>
        ))}
      </div>

      {/* Description Panel */}
      <div className="mt-12 min-h-[120px] max-w-2xl mx-auto text-center">
        {activeTier && (
             <motion.div
                key={activeTier}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50"
             >
                <p className="text-lg text-zinc-300 leading-relaxed">
                    {tiers.find(t => t.id === activeTier)?.desc}
                </p>
             </motion.div>
        )}
      </div>
    </div>
  )
}
