"use client"

import React from "react"
import { AlertCircle, Info, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"

interface CalloutProps {
  type: "info" | "warning" | "error" | "success" | "tip"
  title?: string
  children: React.ReactNode
}

export function Callout({ type, title, children }: CalloutProps) {
  const styles = {
    info: {
      bg: "bg-blue-500/10 border-blue-500/20",
      icon: Info,
      iconColor: "text-blue-500",
      defaultTitle: "Info"
    },
    warning: {
      bg: "bg-yellow-500/10 border-yellow-500/20",
      icon: AlertTriangle,
      iconColor: "text-yellow-500",
      defaultTitle: "Warning"
    },
    error: {
      bg: "bg-red-500/10 border-red-500/20",
      icon: AlertCircle,
      iconColor: "text-red-500",
      defaultTitle: "Error"
    },
    success: {
      bg: "bg-green-500/10 border-green-500/20",
      icon: CheckCircle,
      iconColor: "text-green-500",
      defaultTitle: "Success"
    },
    tip: {
      bg: "bg-purple-500/10 border-purple-500/20",
      icon: Lightbulb,
      iconColor: "text-purple-500",
      defaultTitle: "Pro Tip"
    },
    important: {
      bg: "bg-orange-500/10 border-orange-500/20",
      icon: AlertTriangle,
      iconColor: "text-orange-500",
      defaultTitle: "Important"
    }
  }

  const style = styles[type] || styles.info
  const Icon = style.icon

  return (
    <div className={cn(
      "my-6 p-4 rounded-lg border",
      style.bg
    )}>
      <div className="flex items-start gap-3">
        <Icon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", style.iconColor)} />
        <div className="flex-1">
          {title && (
            <h4 className={cn("font-semibold mb-1", style.iconColor)}>
              {title}
            </h4>
          )}
          <div className="text-sm text-muted-foreground">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
