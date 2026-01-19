"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  RotateCcw, 
  ChevronDown, 
  ChevronRight,
  Database,
  Users,
  User,
  Cloud,
  Laptop,
  CheckCircle2,
  ArrowRight,
  ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Question definitions
interface Question {
  id: string
  question: string
  description: string
  icon: React.ReactNode
  options: {
    value: string
    label: string
    description: string
  }[]
}

const questions: Question[] = [
  {
    id: "tools",
    question: "Do you need to access databases, APIs, or external tools?",
    description: "MCP excels at connecting agents to external data sources and tools",
    icon: <Database className="w-5 h-5" />,
    options: [
      { value: "yes", label: "Yes", description: "Need database, API, or file system access" },
      { value: "no", label: "No", description: "Working with self-contained logic only" }
    ]
  },
  {
    id: "collaboration",
    question: "Do you need agents to collaborate with each other?",
    description: "A2A enables agents to discover and communicate with other agents",
    icon: <Users className="w-5 h-5" />,
    options: [
      { value: "yes", label: "Yes", description: "Agents need to work together on tasks" },
      { value: "no", label: "No", description: "Agents work independently" }
    ]
  },
  {
    id: "agentCount",
    question: "Is this a single-agent or multi-agent system?",
    description: "Multi-agent systems often benefit from A2A for coordination",
    icon: <User className="w-5 h-5" />,
    options: [
      { value: "single", label: "Single Agent", description: "One agent handling all tasks" },
      { value: "multi", label: "Multi-Agent", description: "Multiple specialized agents" }
    ]
  },
  {
    id: "deployment",
    question: "Where will your agents be deployed?",
    description: "Deployment environment affects protocol choice and configuration",
    icon: <Cloud className="w-5 h-5" />,
    options: [
      { value: "local", label: "Local", description: "Running on local machines" },
      { value: "cloud", label: "Cloud", description: "Deployed to cloud infrastructure" },
      { value: "both", label: "Both", description: "Hybrid local and cloud deployment" }
    ]
  }
]

// Recommendation logic
type Answers = Record<string, string>

interface Recommendation {
  protocol: "MCP" | "A2A" | "Both"
  confidence: "high" | "medium"
  title: string
  description: string
  reasons: string[]
  links: { label: string; url: string }[]
}

function getRecommendation(answers: Answers): Recommendation {
  const needsTools = answers.tools === "yes"
  const needsCollaboration = answers.collaboration === "yes"
  const isMultiAgent = answers.agentCount === "multi"
  
  // Both protocols recommended
  if (needsTools && (needsCollaboration || isMultiAgent)) {
    return {
      protocol: "Both",
      confidence: "high",
      title: "Use Both MCP and A2A",
      description: "Your use case benefits from both protocols working together. MCP handles tool access while A2A manages agent coordination.",
      reasons: [
        "MCP provides standardized access to databases, APIs, and tools",
        "A2A enables agent discovery and inter-agent communication",
        "Combined approach creates a powerful, interoperable system",
        isMultiAgent ? "Multi-agent systems benefit from A2A's coordination capabilities" : "Collaboration requirements are well-served by A2A"
      ],
      links: [
        { label: "MCP Documentation", url: "https://modelcontextprotocol.io" },
        { label: "A2A Specification", url: "https://google.github.io/A2A" }
      ]
    }
  }
  
  // MCP only
  if (needsTools && !needsCollaboration && !isMultiAgent) {
    return {
      protocol: "MCP",
      confidence: "high",
      title: "Use MCP (Model Context Protocol)",
      description: "MCP is ideal for single-agent systems that need to access external tools and data sources.",
      reasons: [
        "Standardized tool and resource access",
        "Rich ecosystem of pre-built MCP servers",
        "Simple integration with existing infrastructure",
        "No agent-to-agent communication overhead needed"
      ],
      links: [
        { label: "MCP Documentation", url: "https://modelcontextprotocol.io" },
        { label: "MCP Server Registry", url: "https://github.com/modelcontextprotocol/servers" }
      ]
    }
  }
  
  // A2A only
  if (!needsTools && (needsCollaboration || isMultiAgent)) {
    return {
      protocol: "A2A",
      confidence: "high",
      title: "Use A2A (Agent-to-Agent Protocol)",
      description: "A2A is perfect for multi-agent systems focused on agent collaboration without external tool requirements.",
      reasons: [
        "Enables agent discovery and capability advertisement",
        "Standardized inter-agent communication",
        "Supports complex multi-agent workflows",
        "Built-in task delegation and status tracking"
      ],
      links: [
        { label: "A2A Specification", url: "https://google.github.io/A2A" },
        { label: "A2A GitHub", url: "https://github.com/google/A2A" }
      ]
    }
  }
  
  // Default: MCP as starting point
  return {
    protocol: "MCP",
    confidence: "medium",
    title: "Start with MCP",
    description: "Based on your answers, MCP is a good starting point. You can add A2A later if collaboration needs emerge.",
    reasons: [
      "MCP provides a solid foundation for agent development",
      "Easy to extend with A2A when needed",
      "Lower initial complexity",
      "Good for prototyping and iteration"
    ],
    links: [
      { label: "MCP Documentation", url: "https://modelcontextprotocol.io" },
      { label: "Getting Started Guide", url: "https://modelcontextprotocol.io/quickstart" }
    ]
  }
}

// Decision tree node component
interface TreeNodeProps {
  question: Question
  answer?: string
  isActive: boolean
  isCompleted: boolean
  protocol: "mcp" | "a2a" | "both" | null
}

function TreeNode({ question, answer, isActive, isCompleted, protocol }: TreeNodeProps) {
  const getNodeColor = () => {
    if (!isCompleted) return "border-muted-foreground/30 bg-muted/30"
    if (protocol === "mcp") return "border-blue-500 bg-blue-500/10"
    if (protocol === "a2a") return "border-purple-500 bg-purple-500/10"
    return "border-primary bg-primary/10"
  }
  
  const getTextColor = () => {
    if (!isCompleted) return "text-muted-foreground"
    if (protocol === "mcp") return "text-blue-500"
    if (protocol === "a2a") return "text-purple-500"
    return "text-primary"
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border-2 transition-colors",
        getNodeColor(),
        isActive && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
      <div className={cn("p-2 rounded-full", isCompleted ? getNodeColor() : "bg-muted")}>
        {isCompleted ? (
          <CheckCircle2 className={cn("w-4 h-4", getTextColor())} />
        ) : (
          <span className="w-4 h-4 flex items-center justify-center text-xs font-bold text-muted-foreground">
            {questions.findIndex(q => q.id === question.id) + 1}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate", isCompleted ? getTextColor() : "text-muted-foreground")}>
          {question.question.split("?")[0]}?
        </p>
        {answer && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Answer: <span className="font-medium">{answer}</span>
          </p>
        )}
      </div>
    </motion.div>
  )
}

export function ProtocolComparisonTool() {
  const [answers, setAnswers] = useState<Answers>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  
  const currentQuestion = questions[currentQuestionIndex]
  const isComplete = Object.keys(answers).length === questions.length
  const progress = (Object.keys(answers).length / questions.length) * 100
  
  const recommendation = useMemo(() => {
    if (!isComplete) return null
    return getRecommendation(answers)
  }, [answers, isComplete])
  
  // Determine protocol path for each answered question
  const getProtocolForQuestion = (questionId: string, answer: string): "mcp" | "a2a" | "both" | null => {
    if (questionId === "tools" && answer === "yes") return "mcp"
    if (questionId === "collaboration" && answer === "yes") return "a2a"
    if (questionId === "agentCount" && answer === "multi") return "a2a"
    if (questionId === "deployment") return "both"
    return null
  }
  
  const handleAnswer = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }))
    
    // Auto-advance to next question after a short delay
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1)
      }, 300)
    }
  }
  
  const handleReset = () => {
    setAnswers({})
    setCurrentQuestionIndex(0)
    setShowExplanation(false)
  }
  
  const handleQuestionClick = (index: number) => {
    if (index <= Object.keys(answers).length) {
      setCurrentQuestionIndex(index)
    }
  }

  return (
    <div className="my-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Protocol Comparison Tool</h3>
          <p className="text-sm text-muted-foreground">
            Answer a few questions to find the right protocol for your use case
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Start Over
        </Button>
      </div>
      
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{Object.keys(answers).length} of {questions.length} questions</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Decision Tree Visualization */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Decision Path</CardTitle>
            <CardDescription>Your answers shape the recommendation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {questions.map((question, index) => {
              const answer = answers[question.id]
              const isActive = index === currentQuestionIndex
              const isCompleted = !!answer
              const protocol = answer ? getProtocolForQuestion(question.id, answer) : null
              
              return (
                <div key={question.id}>
                  <button
                    onClick={() => handleQuestionClick(index)}
                    className="w-full text-left"
                    disabled={index > Object.keys(answers).length}
                  >
                    <TreeNode
                      question={question}
                      answer={answer ? questions[index].options.find(o => o.value === answer)?.label : undefined}
                      isActive={isActive}
                      isCompleted={isCompleted}
                      protocol={protocol}
                    />
                  </button>
                  {index < questions.length - 1 && (
                    <div className="flex justify-center py-1">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 16 }}
                        className={cn(
                          "w-0.5",
                          isCompleted ? "bg-primary" : "bg-muted-foreground/30"
                        )}
                      />
                    </div>
                  )}
                </div>
              )
            })}
            
            {/* Final recommendation node */}
            {isComplete && recommendation && (
              <>
                <div className="flex justify-center py-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 16 }}
                    className="w-0.5 bg-primary"
                  />
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "p-4 rounded-lg border-2 text-center",
                    recommendation.protocol === "MCP" && "border-blue-500 bg-blue-500/10",
                    recommendation.protocol === "A2A" && "border-purple-500 bg-purple-500/10",
                    recommendation.protocol === "Both" && "border-primary bg-primary/10"
                  )}
                >
                  <p className={cn(
                    "font-bold text-lg",
                    recommendation.protocol === "MCP" && "text-blue-500",
                    recommendation.protocol === "A2A" && "text-purple-500",
                    recommendation.protocol === "Both" && "text-primary"
                  )}>
                    {recommendation.protocol === "Both" ? "MCP + A2A" : recommendation.protocol}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Recommended Protocol</p>
                </motion.div>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Question Card or Recommendation */}
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {currentQuestion.icon}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
                  <CardDescription>{currentQuestion.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={answers[currentQuestion.id] || ""}
                    onValueChange={handleAnswer}
                    className="space-y-3"
                  >
                    {currentQuestion.options.map((option) => (
                      <motion.label
                        key={option.value}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={cn(
                          "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                          answers[currentQuestion.id] === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <RadioGroupItem value={option.value} className="mt-0.5" />
                        <div>
                          <p className="font-medium">{option.label}</p>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                      </motion.label>
                    ))}
                  </RadioGroup>
                  
                  {/* Navigation hint */}
                  <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
                    <span>Click an option to continue</span>
                    {currentQuestionIndex > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                      >
                        ← Previous
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="recommendation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className={cn(
                "h-full border-2",
                recommendation?.protocol === "MCP" && "border-blue-500",
                recommendation?.protocol === "A2A" && "border-purple-500",
                recommendation?.protocol === "Both" && "border-primary"
              )}>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className={cn(
                      "w-5 h-5",
                      recommendation?.protocol === "MCP" && "text-blue-500",
                      recommendation?.protocol === "A2A" && "text-purple-500",
                      recommendation?.protocol === "Both" && "text-primary"
                    )} />
                    <span className={cn(
                      "text-sm font-medium",
                      recommendation?.confidence === "high" ? "text-green-500" : "text-amber-500"
                    )}>
                      {recommendation?.confidence === "high" ? "High Confidence" : "Medium Confidence"} Recommendation
                    </span>
                  </div>
                  <CardTitle className="text-xl">{recommendation?.title}</CardTitle>
                  <CardDescription className="text-base">{recommendation?.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Why this choice - expandable */}
                  <div className="rounded-lg border border-border overflow-hidden">
                    <button
                      onClick={() => setShowExplanation(!showExplanation)}
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-medium">Why this choice?</span>
                      {showExplanation ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <AnimatePresence>
                      {showExplanation && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <ul className="px-4 pb-4 space-y-2">
                            {recommendation?.reasons.map((reason, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <ArrowRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Documentation links */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Learn More</p>
                    <div className="flex flex-wrap gap-2">
                      {recommendation?.links.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors",
                            "bg-muted hover:bg-muted/80 text-foreground"
                          )}
                        >
                          {link.label}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                  
                  {/* Protocol badges */}
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                        recommendation?.protocol === "MCP" || recommendation?.protocol === "Both"
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-muted text-muted-foreground"
                      )}>
                        <Laptop className="w-4 h-4" />
                        MCP
                      </div>
                      <div className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                        recommendation?.protocol === "A2A" || recommendation?.protocol === "Both"
                          ? "bg-purple-500/10 text-purple-500"
                          : "bg-muted text-muted-foreground"
                      )}>
                        <Users className="w-4 h-4" />
                        A2A
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
