"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, ChevronDown, ChevronUp, Lightbulb } from "lucide-react"

interface ExerciseProps {
  title: string
  difficulty?: "beginner" | "intermediate" | "advanced"
  objectives?: string[]
  hints?: string[]
  children: React.ReactNode
}

export function Exercise({ title, difficulty = "intermediate", objectives = [], hints = [], children }: ExerciseProps) {
  const [showHints, setShowHints] = useState(false)
  const [completedObjectives, setCompletedObjectives] = useState<Set<number>>(new Set())

  const toggleObjective = (index: number) => {
    const newCompleted = new Set(completedObjectives)
    if (newCompleted.has(index)) {
      newCompleted.delete(index)
    } else {
      newCompleted.add(index)
    }
    setCompletedObjectives(newCompleted)
  }

  const difficultyColors = {
    beginner: "bg-green-500/10 text-green-500 border-green-500/20",
    intermediate: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    advanced: "bg-red-500/10 text-red-500 border-red-500/20"
  }

  const progress = objectives.length > 0 
    ? Math.round((completedObjectives.size / objectives.length) * 100) 
    : 0

  return (
    <Card className="my-8 border-primary/20 bg-card/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={difficultyColors[difficulty]}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {progress}% complete
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-1 bg-secondary rounded-full mt-4 overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Objectives */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Objectives</h4>
          <div className="space-y-2">
            {objectives.map((objective, index) => (
              <button
                key={index}
                onClick={() => toggleObjective(index)}
                className="flex items-start gap-3 w-full text-left p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                {completedObjectives.has(index) ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                )}
                <span className={completedObjectives.has(index) ? "line-through text-muted-foreground" : ""}>
                  {objective}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Exercise content */}
        <div className="pt-4 border-t border-border">
          {children}
        </div>

        {/* Hints */}
        {hints && hints.length > 0 && (
          <div className="pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHints(!showHints)}
              className="text-muted-foreground hover:text-foreground"
            >
              {showHints ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
              {showHints ? "Hide Hints" : "Show Hints"}
            </Button>
            
            {showHints && (
              <div className="mt-3 p-4 rounded-lg bg-secondary/30 space-y-2">
                {hints.map((hint, index) => (
                  <p key={index} className="text-sm text-muted-foreground">
                    💡 {hint}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
