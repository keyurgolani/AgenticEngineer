"use client"

import React from "react"
import Image from "next/image"
import { motion } from "framer-motion"

interface ConceptVisualProps {
  src: string
  alt: string
  caption?: string
  pixels?: boolean // If true, adds a pixelated grid overlay effect
}

export function ConceptVisual({ src, alt, caption, pixels }: ConceptVisualProps) {
  return (
    <figure className="my-12 relative group w-full max-w-4xl mx-auto -ml-4 md:-ml-12 lg:-ml-16 pr-4 md:pr-12 lg:pr-16">
      <div className="relative rounded-xl overflow-hidden border border-white/5 bg-zinc-900/50 backdrop-blur-sm shadow-2xl">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
        
        {/* Image Container */}
        <div className="relative">
             <Image 
                src={src} 
                alt={alt} 
                width={1200} 
                height={675} 
                className="w-full h-auto object-cover"
             />
             
             {/* Optional Pixel Overlay for that "Agentic" feel */}
             {pixels && (
                <div className="absolute inset-0 bg-[url('/images/grid-pattern.png')] opacity-10 pointer-events-none mix-blend-overlay" />
             )}
        </div>
      </div>
      
      {caption && (
        <motion.figcaption 
            className="text-center text-sm text-muted-foreground mt-4 italic"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
        >
            {caption}
        </motion.figcaption>
      )}
    </figure>
  )
}
