"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Step {
  id: number;
  title: string;
  description: string;
  visual?: React.ReactNode; 
  // If visual is not provided, we can render a default card
}

export function StepAnimation({ steps }: { steps: Step[] }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2500);

    return () => clearInterval(timer);
  }, [isPlaying, steps.length]);

  return (
    <div className="border rounded-xl p-6 bg-card my-8">
      {/* Progress indicator */}
      <div className="flex gap-1 mb-8">
        {steps.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-500",
              i <= currentStep ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Visual area */}
      <div className="min-h-[200px] flex items-center justify-center p-4 bg-muted/20 rounded-xl border border-dashed mb-6 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
             {steps[currentStep].visual || (
                 <div className="text-center p-8">
                     <div className="text-6xl mb-4 opacity-20 font-mono font-bold">
                         {currentStep + 1}
                     </div>
                 </div>
             )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step info */}
      <div className="text-center mb-6 min-h-[80px]">
        <motion.div
            key={`text-${currentStep}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <h4 className="font-bold text-xl mb-2">{steps[currentStep].title}</h4>
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
            {steps[currentStep].description}
            </p>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setCurrentStep(0)} disabled={currentStep === 0}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="default"
          size="icon"
          onClick={() => setIsPlaying(!isPlaying)}
          className={cn("transition-all", isPlaying ? "bg-red-500 hover:bg-red-600" : "")}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentStep(Math.min(steps.length - 1, currentStep + 1))
          }
          disabled={currentStep === steps.length - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
