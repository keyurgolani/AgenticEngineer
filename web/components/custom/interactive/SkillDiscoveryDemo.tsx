"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Folder, 
  FileText, 
  Code, 
  BookOpen, 
  Zap, 
  ChevronRight,
  Eye,
  Download,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Skill {
  id: string
  name: string
  description: string
  tokens: number
  category: string
}

const availableSkills: Skill[] = [
  {
    id: "code-reviewer",
    name: "code-reviewer",
    description: "Performs comprehensive code reviews following team standards",
    tokens: 35,
    category: "Development"
  },
  {
    id: "api-designer",
    name: "api-designer",
    description: "Designs RESTful APIs following best practices",
    tokens: 32,
    category: "Development"
  },
  {
    id: "db-optimizer",
    name: "db-optimizer",
    description: "Optimizes database queries and schemas",
    tokens: 38,
    category: "Database"
  },
  {
    id: "security-auditor",
    name: "security-auditor",
    description: "Audits code for security vulnerabilities",
    tokens: 40,
    category: "Security"
  },
  {
    id: "doc-writer",
    name: "doc-writer",
    description: "Generates comprehensive technical documentation",
    tokens: 30,
    category: "Documentation"
  }
]

interface SkillDetails {
  instructions: string
  scripts: string[]
  references: string[]
  assets: string[]
  totalTokens: number
}

const skillDetails: Record<string, SkillDetails> = {
  "code-reviewer": {
    instructions: "# Code Review Skill\n\n## Process\n1. Security Analysis\n2. Performance Review\n3. Code Quality Check\n\n## Output Format\nMarkdown with severity levels...",
    scripts: ["analyze.py", "validate.sh"],
    references: ["security-checklist.md", "style-guide.md"],
    assets: ["review-template.md"],
    totalTokens: 2500
  },
  "api-designer": {
    instructions: "# API Design Skill\n\n## Process\n1. Define resources\n2. Design endpoints\n3. Document schemas\n\n## Best Practices\n- RESTful conventions\n- Versioning strategy...",
    scripts: ["generate-openapi.py"],
    references: ["rest-principles.md", "api-patterns.md"],
    assets: ["openapi-template.yaml"],
    totalTokens: 2200
  }
}

type Phase = "discovery" | "activation" | "execution"

export function SkillDiscoveryDemo() {
  const [phase, setPhase] = useState<Phase>("discovery")
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [contextTokens, setContextTokens] = useState(200) // Base context

  const handleActivate = (skillId: string) => {
    setSelectedSkill(skillId)
    setPhase("activation")
    
    // Simulate loading full skill
    setTimeout(() => {
      const details = skillDetails[skillId]
      if (details) {
        setContextTokens(prev => prev + details.totalTokens)
      }
      setPhase("execution")
    }, 1500)
  }

  const handleReset = () => {
    setPhase("discovery")
    setSelectedSkill(null)
    setContextTokens(200)
  }

  const totalDiscoveryTokens = availableSkills.reduce((sum, s) => sum + s.tokens, 0)

  return (
    <div className="my-8 p-6 rounded-xl border border-border bg-card/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Progressive Disclosure Demo
        </h3>
        <Button size="sm" variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </div>

      {/* Phase Indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { key: "discovery", label: "Discovery", icon: Eye },
          { key: "activation", label: "Activation", icon: Download },
          { key: "execution", label: "Execution", icon: CheckCircle2 }
        ].map(({ key, label, icon: Icon }, index) => (
          <div key={key} className="flex items-center">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              phase === key
                ? "bg-primary text-primary-foreground"
                : index < ["discovery", "activation", "execution"].indexOf(phase)
                ? "bg-green-500/20 text-green-500"
                : "bg-muted text-muted-foreground"
            )}>
              <Icon className="w-4 h-4" />
              {label}
            </div>
            {index < 2 && (
              <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Context Token Counter */}
      <div className="mb-6 p-4 rounded-lg bg-muted/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Context Window Usage</span>
          <span className="text-sm font-mono">
            {contextTokens.toLocaleString()} / 128,000 tokens
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(contextTokens / 128000) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          {phase === "discovery" && `Only ${totalDiscoveryTokens} tokens for ${availableSkills.length} skills!`}
          {phase === "activation" && "Loading full skill instructions..."}
          {phase === "execution" && "Full skill context loaded"}
        </div>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {phase === "discovery" && (
          <motion.div
            key="discovery"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            <div className="text-sm text-muted-foreground mb-4">
              Agent sees lightweight catalog of available skills:
            </div>
            {availableSkills.map((skill, index) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={() => handleActivate(skill.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleActivate(skill.id)
                  }
                }}
                aria-label={`Activate ${skill.name} skill`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Folder className="w-4 h-4 text-primary" />
                      <span className="font-mono text-sm font-medium">{skill.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {skill.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{skill.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {skill.tokens} tokens
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {phase === "activation" && selectedSkill && (
          <motion.div
            key="activation"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center justify-center py-12"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-primary border-t-transparent"
              />
              <p className="text-lg font-medium">Activating {selectedSkill}...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Loading full instructions and resources
              </p>
            </div>
          </motion.div>
        )}

        {phase === "execution" && selectedSkill && skillDetails[selectedSkill] && (
          <motion.div
            key="execution"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 text-green-500 mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Skill Activated</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Full context loaded. Agent can now use this skill&apos;s instructions and resources.
              </p>
            </div>

            {/* Skill Structure */}
            <div className="p-4 rounded-lg border border-border bg-card/30">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Folder className="w-4 h-4 text-primary" />
                {selectedSkill}/
              </h4>
              
              <div className="space-y-2 ml-4">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span className="font-mono">SKILL.md</span>
                  <span className="text-xs text-muted-foreground">
                    ({skillDetails[selectedSkill].totalTokens} tokens)
                  </span>
                </div>
                
                {skillDetails[selectedSkill].scripts.length > 0 && (
                  <div className="ml-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Folder className="w-3 h-3" />
                      scripts/
                    </div>
                    {skillDetails[selectedSkill].scripts.map(script => (
                      <div key={script} className="ml-6 flex items-center gap-2 text-sm">
                        <Code className="w-3 h-3 text-green-500" />
                        <span className="font-mono text-xs">{script}</span>
                      </div>
                    ))}
                  </div>
                )}

                {skillDetails[selectedSkill].references.length > 0 && (
                  <div className="ml-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Folder className="w-3 h-3" />
                      references/
                    </div>
                    {skillDetails[selectedSkill].references.map(ref => (
                      <div key={ref} className="ml-6 flex items-center gap-2 text-sm">
                        <BookOpen className="w-3 h-3 text-purple-500" />
                        <span className="font-mono text-xs">{ref}</span>
                      </div>
                    ))}
                  </div>
                )}

                {skillDetails[selectedSkill].assets.length > 0 && (
                  <div className="ml-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Folder className="w-3 h-3" />
                      assets/
                    </div>
                    {skillDetails[selectedSkill].assets.map(asset => (
                      <div key={asset} className="ml-6 flex items-center gap-2 text-sm">
                        <FileText className="w-3 h-3 text-orange-500" />
                        <span className="font-mono text-xs">{asset}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Instructions Preview */}
            <div className="p-4 rounded-lg border border-border bg-card/30">
              <h4 className="font-medium mb-2 text-sm">Instructions Preview</h4>
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                {skillDetails[selectedSkill].instructions}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Key Insight */}
      <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-sm">
          <strong className="text-primary">Key Insight:</strong> Progressive disclosure loads only 
          {" "}<strong>{totalDiscoveryTokens} tokens</strong> for {availableSkills.length} skills during discovery, 
          then loads full context ({skillDetails[selectedSkill || "code-reviewer"]?.totalTokens || 2500} tokens) 
          only when needed. This is <strong>95% more efficient</strong> than loading everything upfront!
        </p>
      </div>
    </div>
  )
}
