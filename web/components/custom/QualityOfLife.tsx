"use client"

import React, { useState } from "react"
import { Clock, CheckCircle2, Info, BookOpen, Target, GraduationCap, ChevronDown, ChevronUp, Sparkles, Brain, Zap, HelpCircle, Award, TrendingUp, Lightbulb, AlertCircle } from "lucide-react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

// ReadingTime Component
export function ReadingTime({ minutes }: { minutes: number }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground my-4 font-medium">
      <Clock className="w-4 h-4" />
      <span>{minutes} min read</span>
    </div>
  )
}

// Prerequisites Component
export function Prerequisites({ items }: { items: string[] }) {
  return (
    <div className="my-6 p-4 border border-blue-500/20 bg-blue-500/5 rounded-lg">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400 mb-3 flex items-center gap-2">
        <Info className="w-4 h-4" />
        Before you start
      </h3>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Glossary Term Component
export function Glossary({ term, def }: { term: string; def: string }) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className="cursor-help underline decoration-dotted decoration-primary/50 underline-offset-4 hover:text-primary transition-colors">
          {term}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <h4 className="font-semibold text-sm mb-1">{term}</h4>
        <p className="text-sm text-muted-foreground">{def}</p>
      </HoverCardContent>
    </HoverCard>
  )
}

// Learning Objectives Component
export function LearningObjectives({ objectives }: { objectives: string[] }) {
  return (
    <div className="my-6 p-5 border border-green-500/20 bg-green-500/5 rounded-lg">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-green-400 mb-4 flex items-center gap-2">
        <Target className="w-4 h-4" />
        By the end of this module, you will be able to:
      </h3>
      <ul className="space-y-3">
        {objectives.map((objective, idx) => (
          <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-xs font-bold shrink-0 mt-0.5">
              {idx + 1}
            </div>
            <span>{objective}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Skill Level Indicator
export function SkillLevel({ level, description }: { level: "beginner" | "intermediate" | "advanced" | "expert"; description?: string }) {
  const levels = {
    beginner: { color: "bg-green-500", label: "Beginner Friendly", icon: Sparkles, filled: 1 },
    intermediate: { color: "bg-yellow-500", label: "Intermediate", icon: Brain, filled: 2 },
    advanced: { color: "bg-orange-500", label: "Advanced", icon: Zap, filled: 3 },
    expert: { color: "bg-red-500", label: "Expert Level", icon: Award, filled: 4 }
  }
  
  const config = levels[level]
  const Icon = config.icon
  
  return (
    <div className="my-4 flex items-center gap-3">
      <Icon className={`w-4 h-4 ${level === 'beginner' ? 'text-green-500' : level === 'intermediate' ? 'text-yellow-500' : level === 'advanced' ? 'text-orange-500' : 'text-red-500'}`} />
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`w-2 h-6 rounded-sm ${i <= config.filled ? config.color : 'bg-muted'}`}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-muted-foreground">{config.label}</span>
      {description && (
        <span className="text-xs text-muted-foreground/70">— {description}</span>
      )}
    </div>
  )
}

// Concept Introduction (Gentle intro for beginners)
export function ConceptIntro({ 
  title, 
  analogy, 
  technicalDef,
  whyItMatters 
}: { 
  title: string; 
  analogy: string; 
  technicalDef: string;
  whyItMatters?: string;
}) {
  const [showTechnical, setShowTechnical] = useState(false)
  
  return (
    <div className="my-6 p-5 border border-purple-500/20 bg-purple-500/5 rounded-lg">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-lg bg-purple-500/20">
          <Lightbulb className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <Badge variant="outline" className="mt-1 text-xs text-purple-400 border-purple-500/30">
            New Concept
          </Badge>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2">
            🎯 Simple Explanation
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{analogy}</p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowTechnical(!showTechnical)}
          className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 p-0 h-auto"
        >
          {showTechnical ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
          {showTechnical ? "Hide" : "Show"} Technical Definition
        </Button>
        
        {showTechnical && (
          <div className="p-3 rounded-lg bg-background/50 border border-purple-500/10">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              📚 Technical Definition
            </h4>
            <p className="text-sm text-muted-foreground">{technicalDef}</p>
          </div>
        )}
        
        {whyItMatters && (
          <div className="pt-3 border-t border-purple-500/10">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2">
              💡 Why This Matters
            </h4>
            <p className="text-sm text-muted-foreground">{whyItMatters}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Key Terms Box
export function KeyTerms({ terms }: { terms: { term: string; definition: string }[] }) {
  return (
    <div className="my-6 p-5 border border-cyan-500/20 bg-cyan-500/5 rounded-lg">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
        <BookOpen className="w-4 h-4" />
        Key Terms in This Module
      </h3>
      <div className="grid gap-3">
        {terms.map((item, idx) => (
          <div key={idx} className="flex gap-3">
            <Badge variant="outline" className="shrink-0 text-cyan-400 border-cyan-500/30 font-mono text-xs">
              {item.term}
            </Badge>
            <span className="text-sm text-muted-foreground">{item.definition}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Progress Checkpoint
export function ProgressCheckpoint({ 
  title,
  questions 
}: { 
  title?: string;
  questions: { question: string; answer: string }[] 
}) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [score, setScore] = useState(0)
  
  const toggleReveal = (idx: number) => {
    const newRevealed = new Set(revealed)
    if (newRevealed.has(idx)) {
      newRevealed.delete(idx)
      setScore(s => Math.max(0, s - 1))
    } else {
      newRevealed.add(idx)
      setScore(s => s + 1)
    }
    setRevealed(newRevealed)
  }
  
  const progress = (score / questions.length) * 100
  
  return (
    <div className="my-8 p-5 border border-amber-500/20 bg-amber-500/5 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          {title || "Knowledge Check"}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{score}/{questions.length}</span>
          <Progress value={progress} className="w-20 h-2" />
        </div>
      </div>
      
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={idx} className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              {idx + 1}. {q.question}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleReveal(idx)}
              className={`text-xs ${revealed.has(idx) ? 'border-green-500/50 text-green-400' : 'border-amber-500/30 text-amber-400'}`}
            >
              {revealed.has(idx) ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Got it!
                </>
              ) : (
                "Reveal Answer"
              )}
            </Button>
            {revealed.has(idx) && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-muted-foreground">{q.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {score === questions.length && (
        <div className="mt-4 p-3 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center gap-2">
          <Award className="w-5 h-5 text-green-400" />
          <span className="text-sm font-medium text-green-400">
            Excellent! You&apos;ve mastered this section. Ready to continue!
          </span>
        </div>
      )}
    </div>
  )
}

// Real World Example
export function RealWorldExample({ 
  title, 
  scenario, 
  implementation,
  takeaway 
}: { 
  title: string; 
  scenario: string; 
  implementation: string;
  takeaway?: string;
}) {
  return (
    <div className="my-6 p-5 border border-emerald-500/20 bg-emerald-500/5 rounded-lg">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4" />
        Real-World Example: {title}
      </h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-1">📋 Scenario</h4>
          <p className="text-sm text-muted-foreground">{scenario}</p>
        </div>
        
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-1">⚙️ How It Works</h4>
          <p className="text-sm text-muted-foreground">{implementation}</p>
        </div>
        
        {takeaway && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <h4 className="text-xs font-semibold text-emerald-400 mb-1">💡 Key Takeaway</h4>
            <p className="text-sm text-muted-foreground">{takeaway}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Difficulty Ramp (shows progression)
export function DifficultyRamp({ 
  current, 
  total,
  label 
}: { 
  current: number; 
  total: number;
  label?: string;
}) {
  return (
    <div className="my-4 flex items-center gap-3">
      <GraduationCap className="w-4 h-4 text-muted-foreground" />
      <div className="flex gap-1">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`w-8 h-2 rounded-sm transition-colors ${
              i < current 
                ? 'bg-gradient-to-r from-green-500 via-yellow-500 to-red-500' 
                : 'bg-muted'
            }`}
            style={{
              background: i < current 
                ? `hsl(${120 - (i / total) * 120}, 70%, 50%)` 
                : undefined
            }}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {label || `Module ${current} of ${total}`}
      </span>
    </div>
  )
}

// Common Mistakes / Pitfalls
export function CommonMistakes({ mistakes }: { mistakes: { mistake: string; fix: string }[] }) {
  return (
    <div className="my-6 p-5 border border-red-500/20 bg-red-500/5 rounded-lg">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-red-400 mb-4 flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        Common Mistakes to Avoid
      </h3>
      <div className="space-y-4">
        {mistakes.map((item, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-red-400">❌</span>
              <p className="text-sm text-muted-foreground">{item.mistake}</p>
            </div>
            <div className="flex items-start gap-2 pl-6">
              <span className="text-green-400">✓</span>
              <p className="text-sm text-green-400/80">{item.fix}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Summary Box
export function ModuleSummary({ points }: { points: string[] }) {
  return (
    <div className="my-8 p-5 border-2 border-primary/30 bg-primary/5 rounded-lg">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4" />
        Module Summary
      </h3>
      <ul className="space-y-2">
        {points.map((point, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="text-primary">•</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
