"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Users,
  MessageCircle,
  Github,
  Twitter,
  ExternalLink,
  TrendingUp,
  Star,
  BookOpen,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Community {
  id: string
  name: string
  platform: "discord" | "slack" | "github" | "twitter" | "reddit" | "forum"
  description: string
  memberCount: string
  activity: "very-active" | "active" | "moderate"
  topics: string[]
  url: string
  highlights: string[]
}

const COMMUNITIES: Community[] = [
  {
    id: "ai-engineers",
    name: "AI Engineer Discord",
    platform: "discord",
    description: "The hub for AI engineers building production applications with LLMs and agents.",
    memberCount: "50K+",
    activity: "very-active",
    topics: ["LLMs", "Agents", "RAG", "Production ML"],
    url: "https://discord.gg/aiengineers",
    highlights: [
      "Weekly office hours with industry experts",
      "Job board for AI engineering roles",
      "Project showcase channel",
    ],
  },
  {
    id: "langchain",
    name: "LangChain Discord",
    platform: "discord",
    description: "Official community for LangChain and LangGraph developers.",
    memberCount: "40K+",
    activity: "very-active",
    topics: ["LangChain", "LangGraph", "Agents", "Chains"],
    url: "https://discord.gg/langchain",
    highlights: [
      "Direct access to LangChain team",
      "Beta feature announcements",
      "Community templates and examples",
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic Discord",
    platform: "discord",
    description: "Community for Claude developers and AI safety enthusiasts.",
    memberCount: "25K+",
    activity: "active",
    topics: ["Claude", "MCP", "AI Safety", "Prompt Engineering"],
    url: "https://discord.gg/anthropic",
    highlights: [
      "MCP server development support",
      "Claude API best practices",
      "Research paper discussions",
    ],
  },
  {
    id: "huggingface",
    name: "Hugging Face Discord",
    platform: "discord",
    description: "Open-source ML community with focus on transformers and model hosting.",
    memberCount: "100K+",
    activity: "very-active",
    topics: ["Transformers", "Open Source", "Model Training", "Inference"],
    url: "https://discord.gg/huggingface",
    highlights: [
      "Model release announcements",
      "Training tips and tricks",
      "Spaces showcase",
    ],
  },
  {
    id: "mlops",
    name: "MLOps Community",
    platform: "slack",
    description: "Focused on production ML systems, deployment, and operations.",
    memberCount: "30K+",
    activity: "active",
    topics: ["MLOps", "Deployment", "Monitoring", "Infrastructure"],
    url: "https://mlops.community",
    highlights: [
      "Production case studies",
      "Tool comparisons",
      "Career advice",
    ],
  },
  {
    id: "localllama",
    name: "r/LocalLLaMA",
    platform: "reddit",
    description: "Reddit community for running LLMs locally and open-source model development.",
    memberCount: "200K+",
    activity: "very-active",
    topics: ["Local LLMs", "Quantization", "Fine-tuning", "Hardware"],
    url: "https://reddit.com/r/LocalLLaMA",
    highlights: [
      "New model benchmarks",
      "Hardware recommendations",
      "Optimization techniques",
    ],
  },
]

const PLATFORM_ICONS = {
  discord: MessageCircle,
  slack: MessageCircle,
  github: Github,
  twitter: Twitter,
  reddit: Users,
  forum: BookOpen,
}

const PLATFORM_COLORS = {
  discord: "text-indigo-500 bg-indigo-500/10",
  slack: "text-green-500 bg-green-500/10",
  github: "text-gray-500 bg-gray-500/10",
  twitter: "text-blue-400 bg-blue-400/10",
  reddit: "text-orange-500 bg-orange-500/10",
  forum: "text-purple-500 bg-purple-500/10",
}

const ACTIVITY_COLORS = {
  "very-active": "bg-green-500",
  "active": "bg-blue-500",
  "moderate": "bg-amber-500",
}

export function CommunityConnector() {
  const [filter, setFilter] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const platforms = [...new Set(COMMUNITIES.map(c => c.platform))]
  const filteredCommunities = filter 
    ? COMMUNITIES.filter(c => c.platform === filter)
    : COMMUNITIES

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Community Connector
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Connect with fellow AI engineers and stay updated with the latest developments.
        </p>

        {/* Platform Filters */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={filter === null ? "default" : "outline"}
            className="cursor-pointer capitalize"
            onClick={() => setFilter(null)}
          >
            All Platforms
          </Badge>
          {platforms.map((platform) => {
            const Icon = PLATFORM_ICONS[platform]
            return (
              <Badge
                key={platform}
                variant={filter === platform ? "default" : "outline"}
                className="cursor-pointer capitalize gap-1"
                onClick={() => setFilter(platform)}
              >
                <Icon className="h-3 w-3" />
                {platform}
              </Badge>
            )
          })}
        </div>

        {/* Community Cards */}
        <div className="grid gap-4">
          {filteredCommunities.map((community, index) => {
            const Icon = PLATFORM_ICONS[community.platform]
            const isExpanded = expandedId === community.id

            return (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border rounded-lg overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : community.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn("p-2 rounded-lg", PLATFORM_COLORS[community.platform])}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold">{community.name}</h4>
                        <Badge variant="outline" className="text-xs capitalize">
                          {community.platform}
                        </Badge>
                        <Badge className={cn("text-xs", ACTIVITY_COLORS[community.activity])}>
                          {community.activity.replace("-", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {community.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {community.memberCount} members
                        </span>
                        <div className="flex gap-1">
                          {community.topics.slice(0, 3).map((topic, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                          {community.topics.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{community.topics.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 gap-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(community.url, "_blank")
                      }}
                    >
                      Join <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="border-t bg-muted/30 p-4"
                  >
                    <h5 className="text-sm font-medium flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      Community Highlights
                    </h5>
                    <ul className="space-y-1">
                      {community.highlights.map((highlight, i) => (
                        <li key={i} className="text-sm flex items-start gap-2 text-muted-foreground">
                          <TrendingUp className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="text-xl font-bold">{COMMUNITIES.length}</div>
            <div className="text-xs text-muted-foreground">Communities</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="text-xl font-bold">400K+</div>
            <div className="text-xs text-muted-foreground">Total Members</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="text-xl font-bold">{platforms.length}</div>
            <div className="text-xs text-muted-foreground">Platforms</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
