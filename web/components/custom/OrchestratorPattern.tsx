"use client"

import React from "react"
import { Users, Brain, Cpu, Palette, Bug, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Agent {
  name: string
  role: string
  model?: string
  icon?: "brain" | "cpu" | "palette" | "bug"
}

interface OrchestratorPatternProps {
  orchestratorName: string
  orchestratorModel: string
  specialists: Agent[]
  workflow: string[]
  parallelExecution?: boolean
}

const agentIcons = {
  brain: Brain,
  cpu: Cpu,
  palette: Palette,
  bug: Bug
}

export function OrchestratorPattern({
  orchestratorName,
  orchestratorModel,
  specialists,
  workflow,
  parallelExecution = false
}: OrchestratorPatternProps) {
  return (
    <div className="my-8 p-6 border border-amber-500/20 bg-amber-500/5 rounded-xl">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <Users className="w-6 h-6 text-amber-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs text-amber-400 border-amber-500/30">
              Multi-Agent Pattern
            </Badge>
            {parallelExecution && (
              <Badge variant="secondary" className="text-xs">
                Parallel Execution
              </Badge>
            )}
          </div>
          <h3 className="text-lg font-semibold text-foreground">Orchestrator-Specialist Model</h3>
        </div>
      </div>

      {/* Orchestrator */}
      <div className="mb-6">
        <div className="p-4 rounded-lg bg-amber-500/10 border-2 border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{orchestratorName}</h4>
              <p className="text-xs text-muted-foreground">Orchestrator • {orchestratorModel}</p>
            </div>
            <Badge className="ml-auto bg-amber-500/20 text-amber-400 border-amber-500/30">
              Primary
            </Badge>
          </div>
        </div>
      </div>

      {/* Connection Lines */}
      <div className="flex justify-center mb-4">
        <div className="w-px h-8 bg-gradient-to-b from-amber-500/50 to-transparent" />
      </div>

      {/* Specialists Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {specialists.map((agent, idx) => {
          const Icon = agent.icon ? agentIcons[agent.icon] : Cpu
          return (
            <div key={idx} className="p-3 rounded-lg bg-background/50 border border-border/50 hover:border-amber-500/30 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <h5 className="text-sm font-medium text-foreground">{agent.name}</h5>
              <p className="text-xs text-muted-foreground">{agent.role}</p>
              {agent.model && (
                <Badge variant="outline" className="mt-2 text-[10px]">
                  {agent.model}
                </Badge>
              )}
            </div>
          )
        })}
      </div>

      {/* Workflow */}
      <div className="p-4 rounded-lg bg-background/50 border border-border/50">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Execution Flow
        </h4>
        <div className="flex flex-wrap items-center gap-2">
          {workflow.map((step, idx) => (
            <React.Fragment key={idx}>
              <span className="px-3 py-1.5 rounded-lg bg-muted text-sm font-medium text-foreground">
                {step}
              </span>
              {idx < workflow.length - 1 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
