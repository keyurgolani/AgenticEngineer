"use client"

import { useState, useId } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, RotateCcw, Code2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useExerciseStore } from "@/lib/store"

interface Blank {
  id: string
  answer: string
  hint?: string
  caseSensitive?: boolean
}

interface FillInBlankProps {
  id?: string
  moduleSlug?: string
  template: string // Use {{id}} for blanks
  blanks: Blank[]
  language?: string
}

export function FillInBlank({ 
  id,
  moduleSlug,
  template, 
  blanks,
  language = "python"
}: FillInBlankProps) {
  const generatedId = useId()
  const exerciseId = id || generatedId
  
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [attempts, setAttempts] = useState(0)
  
  const { markExerciseComplete } = useExerciseStore()

  // Parse template into parts
  const parts = template.split(/(\{\{[^}]+\}\})/)

  const checkAnswer = (blankId: string, userAnswer: string): boolean => {
    const blank = blanks.find((b) => b.id === blankId)
    if (!blank) return false
    
    const correct = blank.caseSensitive 
      ? userAnswer.trim() === blank.answer.trim()
      : userAnswer.trim().toLowerCase() === blank.answer.trim().toLowerCase()
    
    return correct
  }

  const allCorrect = blanks.every((blank) => checkAnswer(blank.id, answers[blank.id] || ""))
  const correctCount = blanks.filter((blank) => checkAnswer(blank.id, answers[blank.id] || "")).length

  const handleSubmit = () => {
    setShowResults(true)
    setAttempts(a => a + 1)
    
    if (allCorrect && moduleSlug) {
      markExerciseComplete(moduleSlug, exerciseId)
    }
  }

  const handleReset = () => {
    setAnswers({})
    setShowResults(false)
  }

  return (
    <div className="my-8 rounded-xl border border-cyan-500/20 bg-cyan-500/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-cyan-500/20 bg-cyan-500/10">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-cyan-500" />
          <span className="text-sm font-semibold text-cyan-500">Fill in the Blanks</span>
        </div>
        {language && (
          <span className="text-xs text-cyan-500/70 uppercase font-mono">{language}</span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Code block with blanks */}
        <div className="font-mono text-sm bg-zinc-900 rounded-lg p-4 overflow-x-auto">
          <pre className="whitespace-pre-wrap">
            {parts.map((part, i) => {
              const match = part.match(/\{\{([^}]+)\}\}/)
              if (match) {
                const blankId = match[1]
                const blank = blanks.find((b) => b.id === blankId)
                const userAnswer = answers[blankId] || ""
                const isCorrect = showResults && checkAnswer(blankId, userAnswer)
                const isWrong = showResults && !checkAnswer(blankId, userAnswer)

                return (
                  <span key={i} className="inline-block align-middle mx-1">
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setAnswers((prev) => ({
                        ...prev,
                        [blankId]: e.target.value
                      }))}
                      disabled={showResults}
                      placeholder={blank?.hint || "..."}
                      className={cn(
                        "px-2 py-1 rounded border bg-zinc-800 text-center font-mono",
                        "min-w-[80px] focus:outline-none focus:ring-2 focus:ring-cyan-500",
                        "transition-colors",
                        isCorrect && "border-green-500 bg-green-500/10 text-green-400",
                        isWrong && "border-red-500 bg-red-500/10 text-red-400"
                      )}
                      style={{
                        width: `${Math.max(80, (userAnswer.length || blank?.hint?.length || 8) * 10)}px`
                      }}
                    />
                    {showResults && (
                      <span className="ml-1 inline-flex align-middle">
                        {isCorrect ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </span>
                    )}
                  </span>
                )
              }
              return <span key={i} className="text-zinc-300">{part}</span>
            })}
          </pre>
        </div>

        {/* Results */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className={cn(
                "p-4 rounded-lg",
                allCorrect ? "bg-green-500/10 border border-green-500/20" : "bg-amber-500/10 border border-amber-500/20"
              )}>
                <p className={cn(
                  "text-sm font-medium mb-2",
                  allCorrect ? "text-green-500" : "text-amber-500"
                )}>
                  {allCorrect 
                    ? "🎉 Perfect! All answers are correct."
                    : `${correctCount} of ${blanks.length} correct`
                  }
                </p>
                
                {!allCorrect && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-muted-foreground font-semibold">Correct answers:</p>
                    <div className="flex flex-wrap gap-2">
                      {blanks.map((blank) => (
                        <span 
                          key={blank.id}
                          className="px-2 py-1 rounded bg-zinc-800 text-xs font-mono"
                        >
                          <span className="text-cyan-400">{blank.id}</span>
                          <span className="text-zinc-500 mx-1">=</span>
                          <span className="text-green-400">{blank.answer}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          {!showResults ? (
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < blanks.length}
              className="bg-cyan-500 hover:bg-cyan-600 text-black"
            >
              Check Answers
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleReset}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </Button>
          )}
          
          {attempts > 0 && (
            <span className="text-xs text-muted-foreground ml-auto">
              Attempts: {attempts}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// Simpler inline code completion
interface CodeCompletionProps {
  code: string
  answer: string
  hint?: string
  onComplete?: () => void
}

export function CodeCompletion({ code, answer, hint, onComplete }: CodeCompletionProps) {
  const [userAnswer, setUserAnswer] = useState("")
  const [showResult, setShowResult] = useState(false)
  
  const isCorrect = userAnswer.trim().toLowerCase() === answer.trim().toLowerCase()

  const handleCheck = () => {
    setShowResult(true)
    if (isCorrect && onComplete) {
      onComplete()
    }
  }

  return (
    <div className="inline-flex items-center gap-2 font-mono text-sm">
      <span className="text-zinc-400">{code}</span>
      <input
        type="text"
        value={userAnswer}
        onChange={(e) => {
          setUserAnswer(e.target.value)
          setShowResult(false)
        }}
        onKeyDown={(e) => e.key === "Enter" && handleCheck()}
        placeholder={hint || "?"}
        className={cn(
          "px-2 py-0.5 rounded border bg-zinc-800 w-24",
          "focus:outline-none focus:ring-1 focus:ring-primary",
          showResult && isCorrect && "border-green-500 text-green-400",
          showResult && !isCorrect && "border-red-500 text-red-400"
        )}
      />
      {showResult && (
        isCorrect 
          ? <CheckCircle className="w-4 h-4 text-green-500" />
          : <XCircle className="w-4 h-4 text-red-500" />
      )}
    </div>
  )
}
