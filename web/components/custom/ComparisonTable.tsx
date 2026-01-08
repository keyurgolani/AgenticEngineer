"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, X, Minus, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

type FeatureValue = boolean | string | number | "partial"

interface ComparisonItem {
  name: string
  description?: string
  icon?: string
  features: Record<string, FeatureValue>
  highlight?: boolean
}

interface ComparisonTableProps {
  title?: string
  items: ComparisonItem[]
  features: { key: string; label: string; description?: string }[]
  highlightBest?: boolean
}

export function ComparisonTable({ 
  title,
  items, 
  features,
  highlightBest = true 
}: ComparisonTableProps) {
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null)

  const renderValue = (value: FeatureValue) => {
    if (value === true) {
      return <Check className="w-5 h-5 text-green-500" />
    }
    if (value === false) {
      return <X className="w-5 h-5 text-red-500/50" />
    }
    if (value === "partial") {
      return <Minus className="w-5 h-5 text-amber-500" />
    }
    return <span className="text-sm">{value}</span>
  }

  return (
    <div className="my-8 rounded-xl border border-border overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <h3 className="font-semibold">{title}</h3>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="text-left p-4 font-medium text-muted-foreground">Feature</th>
              {items.map((item, i) => (
                <th 
                  key={i} 
                  className={cn(
                    "p-4 text-center min-w-[120px]",
                    item.highlight && "bg-primary/5"
                  )}
                >
                  <div className="flex flex-col items-center gap-1">
                    {item.icon && <span className="text-2xl">{item.icon}</span>}
                    <span className={cn(
                      "font-semibold",
                      item.highlight && "text-primary"
                    )}>
                      {item.name}
                    </span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground font-normal">
                        {item.description}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature, fi) => (
              <motion.tr 
                key={feature.key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: fi * 0.05 }}
                className={cn(
                  "border-b border-border last:border-0",
                  expandedFeature === feature.key && "bg-muted/30"
                )}
              >
                <td className="p-4">
                  <button
                    onClick={() => setExpandedFeature(
                      expandedFeature === feature.key ? null : feature.key
                    )}
                    className="flex items-center gap-2 text-left w-full"
                  >
                    <span className="font-medium">{feature.label}</span>
                    {feature.description && (
                      expandedFeature === feature.key 
                        ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  {expandedFeature === feature.key && feature.description && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-sm text-muted-foreground mt-2"
                    >
                      {feature.description}
                    </motion.p>
                  )}
                </td>
                {items.map((item, i) => {
                  const value = item.features[feature.key]
                  const isBest = highlightBest && typeof value === "boolean" && value === true
                  
                  return (
                    <td 
                      key={i} 
                      className={cn(
                        "p-4 text-center",
                        item.highlight && "bg-primary/5",
                        isBest && "bg-green-500/5"
                      )}
                    >
                      {renderValue(value)}
                    </td>
                  )
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Simpler side-by-side comparison
interface SideBySideProps {
  left: {
    title: string
    icon?: string
    color?: string
    items: string[]
  }
  right: {
    title: string
    icon?: string
    color?: string
    items: string[]
  }
  title?: string
}

export function SideBySide({ left, right, title }: SideBySideProps) {
  return (
    <div className="my-8">
      {title && (
        <h3 className="font-semibold text-center mb-4">{title}</h3>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {[left, right].map((side, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "p-5 rounded-xl border",
              side.color || (i === 0 ? "border-red-500/20 bg-red-500/5" : "border-green-500/20 bg-green-500/5")
            )}
          >
            <div className="flex items-center gap-2 mb-4">
              {side.icon && <span className="text-2xl">{side.icon}</span>}
              <h4 className="font-semibold">{side.title}</h4>
            </div>
            <ul className="space-y-2">
              {side.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className={i === 0 ? "text-red-500" : "text-green-500"}>
                    {i === 0 ? "✗" : "✓"}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Pros and Cons component
interface ProsConsProps {
  pros: string[]
  cons: string[]
  title?: string
}

export function ProsCons({ pros, cons, title }: ProsConsProps) {
  return (
    <SideBySide
      title={title}
      left={{
        title: "Cons",
        icon: "👎",
        color: "border-red-500/20 bg-red-500/5",
        items: cons
      }}
      right={{
        title: "Pros",
        icon: "👍",
        color: "border-green-500/20 bg-green-500/5",
        items: pros
      }}
    />
  )
}
