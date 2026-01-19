"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Calendar,
  CheckCircle,
  Circle,
  Trophy,
  BookOpen,
  Code,
  Rocket,
  Star,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface Milestone {
  day: number
  title: string
  type: "lesson" | "project" | "capstone"
  week: number
  month: number
}

const MILESTONES: Milestone[] = [
  { day: 0, title: "Course Setup & Foundations", type: "lesson", week: 1, month: 1 },
  { day: 5, title: "Structured Output Mastery", type: "lesson", week: 1, month: 1 },
  { day: 10, title: "LangGraph Basics", type: "lesson", week: 2, month: 1 },
  { day: 15, title: "MCP Standard", type: "lesson", week: 3, month: 1 },
  { day: 20, title: "Memory Systems", type: "lesson", week: 3, month: 1 },
  { day: 24, title: "Deep Research Agent", type: "capstone", week: 4, month: 1 },
  { day: 30, title: "Month 1 Complete", type: "lesson", week: 4, month: 1 },
  { day: 35, title: "Standards (MCP & A2A)", type: "lesson", week: 5, month: 2 },
  { day: 40, title: "Multi-Agent Patterns", type: "lesson", week: 6, month: 2 },
  { day: 44, title: "Observability", type: "lesson", week: 6, month: 2 },
  { day: 47, title: "Security & Poisoning", type: "lesson", week: 7, month: 2 },
  { day: 55, title: "K8s Operator Agent", type: "capstone", week: 8, month: 2 },
  { day: 60, title: "Month 2 Complete", type: "lesson", week: 8, month: 2 },
  { day: 62, title: "Context Engineering", type: "lesson", week: 9, month: 3 },
  { day: 69, title: "Benchmarking", type: "lesson", week: 10, month: 3 },
  { day: 77, title: "Privacy Analyst", type: "project", week: 11, month: 3 },
  { day: 79, title: "Forensics Swarm", type: "project", week: 11, month: 3 },
  { day: 84, title: "RAG Service", type: "project", week: 12, month: 3 },
  { day: 87, title: "AgentOS Ecosystem", type: "capstone", week: 12, month: 3 },
  { day: 90, title: "Course Complete!", type: "capstone", week: 12, month: 3 },
]

const TYPE_ICONS = {
  lesson: BookOpen,
  project: Code,
  capstone: Trophy,
}

const TYPE_COLORS = {
  lesson: "text-blue-500 bg-blue-500/10 border-blue-500/30",
  project: "text-purple-500 bg-purple-500/10 border-purple-500/30",
  capstone: "text-amber-500 bg-amber-500/10 border-amber-500/30",
}

export function JourneyTimeline() {
  const [completedDays, setCompletedDays] = useState<number[]>([])
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)

  const progress = useMemo(() => {
    const maxCompleted = Math.max(...completedDays, 0)
    return (maxCompleted / 90) * 100
  }, [completedDays])

  const stats = useMemo(() => {
    const totalMilestones = MILESTONES.length
    const capstonesCompleted = MILESTONES.filter(
      m => m.type === "capstone" && completedDays.includes(m.day)
    ).length
    const totalCapstones = MILESTONES.filter(m => m.type === "capstone").length
    
    return {
      daysCompleted: Math.max(...completedDays, 0),
      milestonesCompleted: MILESTONES.filter(m => completedDays.includes(m.day)).length,
      totalMilestones,
      capstonesCompleted,
      totalCapstones,
      currentWeek: Math.ceil((Math.max(...completedDays, 0) + 1) / 7),
      currentMonth: Math.ceil((Math.max(...completedDays, 0) + 1) / 30),
    }
  }, [completedDays])

  const toggleDay = (day: number) => {
    setCompletedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  const markAllUpTo = (day: number) => {
    const daysToMark = MILESTONES.filter(m => m.day <= day).map(m => m.day)
    setCompletedDays(daysToMark)
  }

  const resetProgress = () => {
    setCompletedDays([])
  }

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          90-Day Journey Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 border">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Your Progress</span>
            <span className="text-sm text-muted-foreground">
              Day {stats.daysCompleted} of 90
            </span>
          </div>
          <Progress value={progress} className="h-3 mb-3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{stats.daysCompleted}</div>
              <div className="text-xs text-muted-foreground">Days</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.milestonesCompleted}/{stats.totalMilestones}</div>
              <div className="text-xs text-muted-foreground">Milestones</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.capstonesCompleted}/{stats.totalCapstones}</div>
              <div className="text-xs text-muted-foreground">Capstones</div>
            </div>
            <div>
              <div className="text-2xl font-bold">Week {stats.currentWeek}</div>
              <div className="text-xs text-muted-foreground">Current</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetProgress}>
            Reset Progress
          </Button>
          <Button variant="outline" size="sm" onClick={() => markAllUpTo(30)}>
            Complete Month 1
          </Button>
          <Button variant="outline" size="sm" onClick={() => markAllUpTo(60)}>
            Complete Month 2
          </Button>
          <Button variant="outline" size="sm" onClick={() => markAllUpTo(90)}>
            Complete All
          </Button>
        </div>

        {/* Timeline by Month */}
        {[1, 2, 3].map((month) => {
          const monthMilestones = MILESTONES.filter(m => m.month === month)
          const monthCompleted = monthMilestones.filter(m => completedDays.includes(m.day)).length
          const monthProgress = (monthCompleted / monthMilestones.length) * 100

          return (
            <div key={month} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center gap-2">
                  <Rocket className={cn(
                    "h-4 w-4",
                    month === 1 && "text-blue-500",
                    month === 2 && "text-purple-500",
                    month === 3 && "text-amber-500"
                  )} />
                  Month {month}
                  {month === 1 && " - Foundations"}
                  {month === 2 && " - Production"}
                  {month === 3 && " - Mastery"}
                </h4>
                <Badge variant="outline" className="text-xs">
                  {monthCompleted}/{monthMilestones.length}
                </Badge>
              </div>
              
              <Progress value={monthProgress} className="h-1.5" />

              <div className="grid gap-2">
                {monthMilestones.map((milestone, index) => {
                  const Icon = TYPE_ICONS[milestone.type]
                  const isCompleted = completedDays.includes(milestone.day)
                  const isHovered = hoveredDay === milestone.day

                  return (
                    <motion.div
                      key={milestone.day}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      onMouseEnter={() => setHoveredDay(milestone.day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      onClick={() => toggleDay(milestone.day)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        TYPE_COLORS[milestone.type],
                        isCompleted && "bg-green-500/10 border-green-500/30",
                        isHovered && "ring-2 ring-primary/30"
                      )}
                    >
                      <div className="shrink-0">
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Icon className={cn("h-4 w-4", isCompleted ? "text-green-500" : "")} />
                          <span className={cn(
                            "font-medium text-sm",
                            isCompleted && "line-through text-muted-foreground"
                          )}>
                            {milestone.title}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-xs">
                          Day {milestone.day}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {milestone.type}
                        </Badge>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Completion Message */}
        {stats.daysCompleted >= 90 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-lg bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/30 text-center"
          >
            <Trophy className="h-12 w-12 text-amber-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">Congratulations! 🎉</h3>
            <p className="text-muted-foreground">
              You&apos;ve completed the entire 90-day Agentic Engineer course!
              You&apos;re now equipped to build production-grade AI agents.
            </p>
            <div className="flex justify-center gap-1 mt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-6 w-6 fill-amber-500 text-amber-500" />
              ))}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
