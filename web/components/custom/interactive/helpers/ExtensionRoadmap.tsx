"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Rocket,
  Star,
  Clock,
  CheckCircle,
  ChevronRight,
  Users,
  Shield,
  Zap,
  Globe,
  Database,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Extension {
  id: string
  title: string
  description: string
  difficulty: 1 | 2 | 3 | 4 | 5
  timeEstimate: string
  prerequisites: string[]
  benefits: string[]
  icon: typeof Rocket
  category: "scale" | "security" | "features" | "integration"
}

const EXTENSIONS: Extension[] = [
  {
    id: "multi-tenancy",
    title: "Multi-tenancy Support",
    description: "Enable multiple users and organizations to use the platform with isolated data and configurations.",
    difficulty: 4,
    timeEstimate: "2-3 weeks",
    prerequisites: ["Authentication system", "Database per-tenant or row-level security"],
    benefits: ["SaaS-ready architecture", "Revenue potential", "Enterprise adoption"],
    icon: Users,
    category: "scale",
  },
  {
    id: "plugin-system",
    title: "Plugin Architecture",
    description: "Allow third-party developers to extend agent capabilities with custom tools and integrations.",
    difficulty: 5,
    timeEstimate: "3-4 weeks",
    prerequisites: ["Stable API contracts", "Sandboxed execution environment"],
    benefits: ["Ecosystem growth", "Community contributions", "Customization"],
    icon: Zap,
    category: "features",
  },
  {
    id: "advanced-security",
    title: "Advanced Security Layer",
    description: "Implement comprehensive security including prompt injection detection, output filtering, and audit logging.",
    difficulty: 4,
    timeEstimate: "2-3 weeks",
    prerequisites: ["Security threat model", "Logging infrastructure"],
    benefits: ["Enterprise compliance", "Risk mitigation", "Trust building"],
    icon: Shield,
    category: "security",
  },
  {
    id: "horizontal-scaling",
    title: "Horizontal Scaling",
    description: "Enable the system to scale across multiple nodes with load balancing and distributed state.",
    difficulty: 5,
    timeEstimate: "3-4 weeks",
    prerequisites: ["Kubernetes deployment", "Distributed cache (Redis)"],
    benefits: ["Handle more users", "High availability", "Cost efficiency"],
    icon: Globe,
    category: "scale",
  },
  {
    id: "advanced-memory",
    title: "Advanced Memory Systems",
    description: "Implement sophisticated memory with graph-based knowledge, temporal reasoning, and memory consolidation.",
    difficulty: 4,
    timeEstimate: "2-3 weeks",
    prerequisites: ["Graph database", "Memory service foundation"],
    benefits: ["Better context retention", "Smarter agents", "Personalization"],
    icon: Database,
    category: "features",
  },
  {
    id: "real-time-collab",
    title: "Real-time Collaboration",
    description: "Enable multiple users to interact with agents simultaneously with shared context and live updates.",
    difficulty: 3,
    timeEstimate: "1-2 weeks",
    prerequisites: ["WebSocket infrastructure", "Conflict resolution strategy"],
    benefits: ["Team productivity", "Shared workflows", "Live assistance"],
    icon: Users,
    category: "features",
  },
]

const CATEGORIES = {
  scale: { label: "Scaling", color: "text-blue-500", bg: "bg-blue-500/10" },
  security: { label: "Security", color: "text-red-500", bg: "bg-red-500/10" },
  features: { label: "Features", color: "text-green-500", bg: "bg-green-500/10" },
  integration: { label: "Integration", color: "text-purple-500", bg: "bg-purple-500/10" },
}

export function ExtensionRoadmap() {
  const [selectedExtension, setSelectedExtension] = useState<Extension | null>(null)
  const [filter, setFilter] = useState<string | null>(null)

  const filteredExtensions = filter 
    ? EXTENSIONS.filter(e => e.category === filter)
    : EXTENSIONS

  const renderStars = (count: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-3 w-3",
            i <= count ? "fill-amber-500 text-amber-500" : "text-muted-foreground"
          )}
        />
      ))}
    </div>
  )

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-primary" />
          Extension Roadmap
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Explore potential extensions to enhance your AgentOS implementation.
        </p>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={filter === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter(null)}
          >
            All
          </Badge>
          {Object.entries(CATEGORIES).map(([key, { label }]) => (
            <Badge
              key={key}
              variant={filter === key ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilter(key)}
            >
              {label}
            </Badge>
          ))}
        </div>

        {/* Extensions Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {filteredExtensions.map((ext, index) => {
            const Icon = ext.icon
            const category = CATEGORIES[ext.category]
            const isSelected = selectedExtension?.id === ext.id

            return (
              <motion.div
                key={ext.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedExtension(isSelected ? null : ext)}
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-all hover:border-primary/50",
                  isSelected && "ring-2 ring-primary border-primary"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-lg", category.bg)}>
                    <Icon className={cn("h-5 w-5", category.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium text-sm">{ext.title}</h4>
                      <Badge variant="outline" className={cn("text-xs shrink-0", category.color)}>
                        {category.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {ext.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">Difficulty:</span>
                        {renderStars(ext.difficulty)}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {ext.timeEstimate}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isSelected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="mt-4 pt-4 border-t space-y-3"
                  >
                    <div>
                      <h5 className="text-xs font-medium mb-1">Prerequisites</h5>
                      <ul className="space-y-1">
                        {ext.prerequisites.map((prereq, i) => (
                          <li key={i} className="text-xs flex items-center gap-1 text-muted-foreground">
                            <ChevronRight className="h-3 w-3" />
                            {prereq}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium mb-1">Benefits</h5>
                      <ul className="space-y-1">
                        {ext.benefits.map((benefit, i) => (
                          <li key={i} className="text-xs flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="text-xl font-bold">{EXTENSIONS.length}</div>
            <div className="text-xs text-muted-foreground">Extensions</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="text-xl font-bold">12-18</div>
            <div className="text-xs text-muted-foreground">Weeks Total</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="text-xl font-bold">
              {(EXTENSIONS.reduce((a, e) => a + e.difficulty, 0) / EXTENSIONS.length).toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Avg Difficulty</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="text-xl font-bold">{Object.keys(CATEGORIES).length}</div>
            <div className="text-xs text-muted-foreground">Categories</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
