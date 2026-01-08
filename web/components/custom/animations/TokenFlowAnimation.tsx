"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Play } from "lucide-react";

export function TokenFlowAnimation({
  inputTokens = ["The", "quick", "brown", "fox"],
  outputTokens = ["jumps", "over", "the", "lazy", "dog", "."],
}: {
  inputTokens?: string[];
  outputTokens?: string[];
}) {
  const [generatedCount, setGeneratedCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const generateNext = () => {
    if (generatedCount < outputTokens.length) {
      setGeneratedCount((prev) => prev + 1);
    }
  };
  
  const reset = () => {
    setGeneratedCount(0);
    setIsAnimating(false);
  }

  const playAll = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setGeneratedCount(0);
    
    let count = 0;
    const interval = setInterval(() => {
        if (count >= outputTokens.length) {
            clearInterval(interval);
            setIsAnimating(false);
            return;
        }
        setGeneratedCount(prev => prev + 1);
        count++;
    }, 600); // Speed of generation
  }

  return (
    <div className="space-y-6 p-6 bg-card rounded-xl border my-8">
      {/* Input tokens */}
      <div>
        <h4 className="text-xs uppercase font-semibold text-muted-foreground mb-3 tracking-wider">
          Context Window (Input)
        </h4>
        <div className="flex flex-wrap gap-2">
          {inputTokens.map((token, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="px-2 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20
                         rounded font-mono text-sm"
            >
              {token}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Processing visualization */}
      <div className="flex items-center gap-4 py-4">
        <div className="h-px bg-border flex-1" />
        <motion.div
          animate={{ 
            rotate: generatedCount > 0 ? 360 : 0,
            scale: isAnimating ? [1, 1.1, 1] : 1
           }}
          transition={{ duration: 0.5 }}
          className="w-12 h-12 rounded-full bg-gradient-to-r 
                     from-purple-500 to-pink-500 flex items-center 
                     justify-center text-white font-bold shadow-lg z-10"
        >
          AI
        </motion.div>
        <div className="h-px bg-border flex-1" />
      </div>

      {/* Output tokens */}
      <div>
        <h4 className="text-xs uppercase font-semibold text-muted-foreground mb-3 tracking-wider">
          Autoregressive Output
        </h4>
        <div className="flex flex-wrap gap-2 min-h-[40px] p-4 bg-muted/30 rounded-lg border border-dashed">
          {outputTokens.slice(0, generatedCount).map((token, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="px-2 py-1 bg-green-500/10 text-green-500 border border-green-500/20
                         rounded font-mono text-sm"
            >
              {token}
            </motion.span>
          ))}
          {generatedCount < outputTokens.length && (
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="px-2 py-1 bg-muted rounded font-mono text-sm inline-block w-2 h-6 align-middle"
            />
          )}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
         <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            disabled={generatedCount === 0 || isAnimating}
         >
            <RefreshCw className="mr-2 h-4 w-4" /> Reset
         </Button>
         <Button
            variant="outline"
            size="sm"
            onClick={generateNext}
            disabled={generatedCount >= outputTokens.length || isAnimating}
         >
            Step (+1 Token)
         </Button>
         <Button
            size="sm"
            onClick={playAll}
            disabled={generatedCount >= outputTokens.length || isAnimating}
         >
            <Play className="mr-2 h-4 w-4" /> Run Generation
         </Button>
      </div>
    </div>
  );
}
