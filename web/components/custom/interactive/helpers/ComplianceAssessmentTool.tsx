"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Download,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface ComplianceItem {
  id: string
  category: string
  requirement: string
  description: string
  severity: "critical" | "high" | "medium" | "low"
  regulation: "GDPR" | "CCPA" | "HIPAA" | "SOC2" | "PCI-DSS"
  checked: boolean
}

const COMPLIANCE_ITEMS: ComplianceItem[] = [
  // GDPR
  {
    id: "gdpr-1",
    category: "Data Collection",
    requirement: "Explicit consent for data collection",
    description: "Users must provide clear, affirmative consent before any personal data is collected.",
    severity: "critical",
    regulation: "GDPR",
    checked: false,
  },
  {
    id: "gdpr-2",
    category: "Data Access",
    requirement: "Right to access personal data",
    description: "Users can request a copy of all personal data held about them.",
    severity: "high",
    regulation: "GDPR",
    checked: false,
  },
  {
    id: "gdpr-3",
    category: "Data Deletion",
    requirement: "Right to erasure (right to be forgotten)",
    description: "Users can request deletion of their personal data.",
    severity: "high",
    regulation: "GDPR",
    checked: false,
  },
  {
    id: "gdpr-4",
    category: "Data Portability",
    requirement: "Data export in machine-readable format",
    description: "Users can export their data in a commonly used format.",
    severity: "medium",
    regulation: "GDPR",
    checked: false,
  },
  // CCPA
  {
    id: "ccpa-1",
    category: "Disclosure",
    requirement: "Privacy policy disclosure",
    description: "Clear disclosure of what personal information is collected and how it's used.",
    severity: "critical",
    regulation: "CCPA",
    checked: false,
  },
  {
    id: "ccpa-2",
    category: "Opt-Out",
    requirement: "Do Not Sell My Personal Information",
    description: "Provide a clear opt-out mechanism for data sales.",
    severity: "high",
    regulation: "CCPA",
    checked: false,
  },
  // HIPAA
  {
    id: "hipaa-1",
    category: "Encryption",
    requirement: "PHI encryption at rest and in transit",
    description: "All protected health information must be encrypted.",
    severity: "critical",
    regulation: "HIPAA",
    checked: false,
  },
  {
    id: "hipaa-2",
    category: "Access Control",
    requirement: "Role-based access to PHI",
    description: "Access to health data must be restricted based on job function.",
    severity: "critical",
    regulation: "HIPAA",
    checked: false,
  },
  // SOC2
  {
    id: "soc2-1",
    category: "Security",
    requirement: "Access control policies",
    description: "Documented policies for granting and revoking system access.",
    severity: "high",
    regulation: "SOC2",
    checked: false,
  },
  {
    id: "soc2-2",
    category: "Monitoring",
    requirement: "Security event logging",
    description: "All security-relevant events must be logged and monitored.",
    severity: "high",
    regulation: "SOC2",
    checked: false,
  },
  // PCI-DSS
  {
    id: "pci-1",
    category: "Card Data",
    requirement: "No storage of full card numbers",
    description: "Full credit card numbers must not be stored after authorization.",
    severity: "critical",
    regulation: "PCI-DSS",
    checked: false,
  },
  {
    id: "pci-2",
    category: "Network",
    requirement: "Firewall configuration",
    description: "Maintain firewall configuration to protect cardholder data.",
    severity: "critical",
    regulation: "PCI-DSS",
    checked: false,
  },
]

const SEVERITY_COLORS = {
  critical: "text-red-500 bg-red-500/10 border-red-500/30",
  high: "text-orange-500 bg-orange-500/10 border-orange-500/30",
  medium: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  low: "text-blue-500 bg-blue-500/10 border-blue-500/30",
}

const REGULATION_COLORS = {
  "GDPR": "bg-blue-500",
  "CCPA": "bg-green-500",
  "HIPAA": "bg-purple-500",
  "SOC2": "bg-amber-500",
  "PCI-DSS": "bg-red-500",
}

export function ComplianceAssessmentTool() {
  const [items, setItems] = useState(COMPLIANCE_ITEMS)
  const [filterRegulation, setFilterRegulation] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredItems = filterRegulation 
    ? items.filter(i => i.regulation === filterRegulation)
    : items

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }

  const regulations = [...new Set(items.map(i => i.regulation))]
  
  const getComplianceScore = (regulation?: string) => {
    const relevantItems = regulation 
      ? items.filter(i => i.regulation === regulation)
      : items
    const checked = relevantItems.filter(i => i.checked).length
    return Math.round((checked / relevantItems.length) * 100)
  }

  const getCriticalGaps = () => {
    return items.filter(i => !i.checked && i.severity === "critical")
  }

  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      overallScore: getComplianceScore(),
      byRegulation: regulations.map(r => ({
        regulation: r,
        score: getComplianceScore(r),
        items: items.filter(i => i.regulation === r).map(i => ({
          requirement: i.requirement,
          status: i.checked ? "compliant" : "non-compliant",
          severity: i.severity,
        })),
      })),
      criticalGaps: getCriticalGaps().map(i => i.requirement),
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `compliance-report-${report.timestamp.replace(/[:.]/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const overallScore = getComplianceScore()
  const criticalGaps = getCriticalGaps()

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Compliance Assessment Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className={cn(
          "p-4 rounded-lg border",
          overallScore >= 80 ? "bg-green-500/10 border-green-500/30" :
          overallScore >= 50 ? "bg-amber-500/10 border-amber-500/30" :
          "bg-red-500/10 border-red-500/30"
        )}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Overall Compliance Score</span>
            <span className={cn(
              "text-2xl font-bold",
              overallScore >= 80 ? "text-green-500" :
              overallScore >= 50 ? "text-amber-500" : "text-red-500"
            )}>
              {overallScore}%
            </span>
          </div>
          <Progress value={overallScore} className="h-2" />
          {criticalGaps.length > 0 && (
            <div className="mt-2 text-sm text-red-500 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              {criticalGaps.length} critical gaps require immediate attention
            </div>
          )}
        </div>

        {/* Regulation Scores */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {regulations.map(reg => {
            const score = getComplianceScore(reg)
            return (
              <button
                key={reg}
                onClick={() => setFilterRegulation(filterRegulation === reg ? null : reg)}
                className={cn(
                  "p-3 rounded-lg border text-center transition-all",
                  filterRegulation === reg && "ring-2 ring-primary"
                )}
              >
                <Badge className={cn("mb-2", REGULATION_COLORS[reg as keyof typeof REGULATION_COLORS])}>
                  {reg}
                </Badge>
                <div className={cn(
                  "text-xl font-bold",
                  score >= 80 ? "text-green-500" :
                  score >= 50 ? "text-amber-500" : "text-red-500"
                )}>
                  {score}%
                </div>
              </button>
            )
          })}
        </div>

        {/* Export Button */}
        <Button onClick={exportReport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Export Report
        </Button>

        {/* Checklist */}
        <div className="space-y-2">
          <Label>
            Compliance Checklist 
            {filterRegulation && <Badge variant="outline" className="ml-2">{filterRegulation}</Badge>}
          </Label>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  "border rounded-lg overflow-hidden",
                  item.checked && "bg-green-500/5 border-green-500/30"
                )}
              >
                <div
                  className="p-3 flex items-start gap-3 cursor-pointer"
                  onClick={() => {
                    toggleItem(item.id)
                    setExpandedId(expandedId === item.id ? null : item.id)
                  }}
                >
                  <div className="mt-1">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleItem(item.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-border"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={cn("text-xs", REGULATION_COLORS[item.regulation])}>
                        {item.regulation}
                      </Badge>
                      <Badge variant="outline" className={cn("text-xs capitalize", SEVERITY_COLORS[item.severity])}>
                        {item.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{item.category}</span>
                    </div>
                    <p className={cn(
                      "text-sm font-medium mt-1",
                      item.checked && "line-through text-muted-foreground"
                    )}>
                      {item.requirement}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {item.checked ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className={cn("h-5 w-5", SEVERITY_COLORS[item.severity].split(" ")[0])} />
                    )}
                  </div>
                  <ChevronRight className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform",
                    expandedId === item.id && "rotate-90"
                  )} />
                </div>

                <AnimatePresence>
                  {expandedId === item.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t bg-muted/30"
                    >
                      <div className="p-3">
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
