"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LayerProps {
  label: string;
  color: string;
  delay?: number;
}

const Layer = ({ label, color, delay = 0 }: LayerProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className={cn("rounded-lg p-4 text-center font-medium shadow-md text-foreground", color)}
  >
    {label}
  </motion.div>
);

export function TransformerArchitecture() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4 p-6 my-8 border rounded-xl bg-card">
      <motion.div
        className="cursor-pointer w-full max-w-2xl"
        onClick={() => setExpanded(!expanded)}
        whileHover={{ scale: 1.01 }}
        layout
      >
        {!expanded ? (
          <div
            className="bg-gradient-to-r from-green-500/20 to-orange-500/20 
                          border-2 border-dashed border-zinc-700
                          rounded-xl p-12 text-center font-bold text-xl
                          hover:bg-muted/50 transition-colors"
          >
            🤖 Transformer Architecture (Click to Expand)
            <p className="text-sm font-normal text-muted-foreground mt-2">
                Click to reveal the Encoder-Decoder stacks hidden inside.
            </p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8 justify-center">
            {/* Encoder Stack */}
            <div className="flex flex-col gap-2 flex-1">
              <h3 className="text-center font-bold text-green-500 mb-2">Encoder Stack</h3>
              {[...Array(6)].map((_, i) => (
                <Layer
                  key={`enc-${i}`}
                  label={`Encoder Layer ${6 - i}`}
                  color="bg-green-500/10 border border-green-500/50"
                  delay={i * 0.1}
                />
              ))}
              <div className="mt-2 text-center text-xs text-muted-foreground">
                  Processes Input Embeddings
              </div>
            </div>
            {/* Decoder Stack */}
            <div className="flex flex-col gap-2 flex-1">
              <h3 className="text-center font-bold text-orange-500 mb-2">Decoder Stack</h3>
              {[...Array(6)].map((_, i) => (
                <Layer
                  key={`dec-${i}`}
                  label={`Decoder Layer ${6 - i}`}
                  color="bg-orange-500/10 border border-orange-500/50"
                  delay={i * 0.1}
                />
              ))}
              <div className="mt-2 text-center text-xs text-muted-foreground">
                  Generates Output Probabilities
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
