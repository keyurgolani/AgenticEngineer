"use client"

import { useState, useId } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, HelpCircle, RotateCcw, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useExerciseStore } from "@/lib/store"

interface QuizOption {
  id: string
  text: string
  isCorrect: boolean
  explanation?: string
}

interface QuizProps {
  id?: string
  moduleSlug?: string
  question: string
  options: QuizOption[]
  hint?: string
  explanation?: string
}

export function Quiz({ 
  id,
  moduleSlug,
  question, 
  options, 
  hint,
  explanation 
}: QuizProps) {
  const generatedId = useId()
  const quizId = id || generatedId
  
  const [selected, setSelected] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [attempts, setAttempts] = useState(0)
  
  const { markExerciseComplete, isExerciseComplete } = useExerciseStore()
  const isAlreadyComplete = moduleSlug ? isExerciseComplete(moduleSlug, quizId) : false

  const selectedOption = options.find((o) => o.id === selected)
  const isCorrect = selectedOption?.isCorrect

  const handleSubmit = () => {
    if (!selected) return
    setShowResult(true)
    setAttempts(a => a + 1)
    
    if (isCorrect && moduleSlug) {
      markExerciseComplete(moduleSlug, quizId)
    }
  }

  const handleReset = () => {
    setSelected(null)
    setShowResult(false)
    setShowHint(false)
  }

  return (
    <div className="my-8 border border-amber-500/20 bg-amber-500/5 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-amber-500/20 bg-amber-500/10">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold text-amber-500">Knowledge Check</span>
        </div>
        {isAlreadyComplete && (
          <span className="text-xs text-green-500 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Question */}
        <p className="font-medium text-foreground">{question}</p>

        {/* Options */}
        <div className="space-y-2">
          {options.map((option) => {
            const isSelected = selected === option.id
            const showCorrectness = showResult && isSelected
            
            return (
              <motion.button
                key={option.id}
                onClick={() => !showResult && setSelected(option.id)}
                disabled={showResult}
                whileHover={!showResult ? { scale: 1.01 } : {}}
                whileTap={!showResult ? { scale: 0.99 } : {}}
                className={cn(
                  "w-full text-left p-4 rounded-lg border transition-all",
                  "flex items-center justify-between gap-3",
                  !showResult && isSelected && "border-amber-500 bg-amber-500/10",
                  !showResult && !isSelected && "border-border hover:border-amber-500/50 hover:bg-muted/50",
                  showResult && option.isCorrect && "border-green-500 bg-green-500/10",
                  showResult && isSelected && !option.isCorrect && "border-red-500 bg-red-500/10",
                  showResult && !isSelected && !option.isCorrect && "opacity-50"
                )}
              >
                <span className="text-sm">{option.text}</span>
                
                <AnimatePresence>
                  {showCorrectness && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      {option.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </motion.div>
                  )}
                  {showResult && option.isCorrect && !isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })}
        </div>

        {/* Explanation after answer */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className={cn(
                "p-4 rounded-lg",
                isCorrect ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"
              )}>
                <p className={cn(
                  "text-sm font-medium mb-2",
                  isCorrect ? "text-green-500" : "text-red-500"
                )}>
                  {isCorrect ? "🎉 Correct!" : "❌ Not quite right"}
                </p>
                {selectedOption?.explanation && (
                  <p className="text-sm text-muted-foreground">{selectedOption.explanation}</p>
                )}
                {explanation && !selectedOption?.explanation && (
                  <p className="text-sm text-muted-foreground">{explanation}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint */}
        <AnimatePresence>
          {showHint && hint && !showResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-400 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  {hint}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          {!showResult ? (
            <>
              <Button
                onClick={handleSubmit}
                disabled={!selected}
                className="bg-amber-500 hover:bg-amber-600 text-black"
              >
                Check Answer
              </Button>
              {hint && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                  className="text-muted-foreground"
                >
                  <Lightbulb className="w-4 h-4 mr-1" />
                  {showHint ? "Hide Hint" : "Need a hint?"}
                </Button>
              )}
            </>
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

// Multiple choice variant with multiple correct answers
interface MultiSelectQuizProps {
  id?: string
  moduleSlug?: string
  question: string
  options: { id: string; text: string; isCorrect: boolean }[]
  minCorrect?: number
}

export function MultiSelectQuiz({
  id,
  moduleSlug,
  question,
  options,
  minCorrect = 1
}: MultiSelectQuizProps) {
  const generatedId = useId()
  const quizId = id || generatedId
  
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showResult, setShowResult] = useState(false)
  
  const { markExerciseComplete } = useExerciseStore()

  const toggleOption = (optionId: string) => {
    if (showResult) return
    const newSelected = new Set(selected)
    if (newSelected.has(optionId)) {
      newSelected.delete(optionId)
    } else {
      newSelected.add(optionId)
    }
    setSelected(newSelected)
  }

  const correctOptions = options.filter(o => o.isCorrect).map(o => o.id)
  const selectedCorrect = [...selected].filter(id => correctOptions.includes(id))
  const selectedIncorrect = [...selected].filter(id => !correctOptions.includes(id))
  const isFullyCorrect = selectedCorrect.length === correctOptions.length && selectedIncorrect.length === 0

  const handleSubmit = () => {
    setShowResult(true)
    if (isFullyCorrect && moduleSlug) {
      markExerciseComplete(moduleSlug, quizId)
    }
  }

  return (
    <div className="my-8 border border-purple-500/20 bg-purple-500/5 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-purple-500/20 bg-purple-500/10">
        <HelpCircle className="w-4 h-4 text-purple-500" />
        <span className="text-sm font-semibold text-purple-500">Select All That Apply</span>
      </div>

      <div className="p-5 space-y-4">
        <p className="font-medium text-foreground">{question}</p>

        <div className="space-y-2">
          {options.map((option) => {
            const isSelected = selected.has(option.id)
            
            return (
              <button
                key={option.id}
                onClick={() => toggleOption(option.id)}
                disabled={showResult}
                className={cn(
                  "w-full text-left p-4 rounded-lg border transition-all",
                  "flex items-center gap-3",
                  !showResult && isSelected && "border-purple-500 bg-purple-500/10",
                  !showResult && !isSelected && "border-border hover:border-purple-500/50",
                  showResult && option.isCorrect && "border-green-500 bg-green-500/10",
                  showResult && isSelected && !option.isCorrect && "border-red-500 bg-red-500/10"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                  isSelected ? "border-purple-500 bg-purple-500" : "border-muted-foreground"
                )}>
                  {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm flex-1">{option.text}</span>
                {showResult && option.isCorrect && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </button>
            )
          })}
        </div>

        {showResult && (
          <div className={cn(
            "p-4 rounded-lg",
            isFullyCorrect ? "bg-green-500/10" : "bg-amber-500/10"
          )}>
            <p className="text-sm">
              {isFullyCorrect 
                ? "🎉 Perfect! You got all the correct answers."
                : `You got ${selectedCorrect.length} of ${correctOptions.length} correct answers.`
              }
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {!showResult ? (
            <Button
              onClick={handleSubmit}
              disabled={selected.size < minCorrect}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              Check Answers
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                setSelected(new Set())
                setShowResult(false)
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
