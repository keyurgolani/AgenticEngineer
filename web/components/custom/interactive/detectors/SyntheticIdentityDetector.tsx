"use client"

import { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  User,
  CreditCard,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Database,
  Search,
  AlertCircle,
  ChevronDown,
  Clock,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface IdentityData {
  ssnIssuanceYear: number
  birthYear: number
  email: string
  address: string
  creditHistoryMonths: number
  creditAccountCount: number
}

interface RiskSignal {
  name: string
  description: string
  riskContribution: number
  severity: "low" | "medium" | "high"
  evidence: string
  attribute: keyof IdentityData | "combined"
}

interface DataSourceCheck {
  source: string
  status: "checked" | "pending" | "error"
  result: string
  icon: React.ReactNode
}

interface VerificationItem {
  label: string
  checked: boolean
  description: string
}

// Preset scenarios for demonstration
interface Scenario {
  name: string
  description: string
  data: IdentityData
}

const PRESET_SCENARIOS: Scenario[] = [
  {
    name: "Legitimate Identity",
    description: "Consistent data across all attributes",
    data: {
      ssnIssuanceYear: 1985,
      birthYear: 1985,
      email: "john.smith@gmail.com",
      address: "123 Main St, Chicago, IL 60601",
      creditHistoryMonths: 180,
      creditAccountCount: 8,
    },
  },
  {
    name: "Synthetic Identity (SSN Mismatch)",
    description: "SSN issued before birth year",
    data: {
      ssnIssuanceYear: 2010,
      birthYear: 1990,
      email: "user12345@tempmail.xyz",
      address: "PO Box 999, Anytown, USA",
      creditHistoryMonths: 6,
      creditAccountCount: 1,
    },
  },
  {
    name: "Thin File Fraud",
    description: "Very limited credit history with suspicious patterns",
    data: {
      ssnIssuanceYear: 2018,
      birthYear: 2000,
      email: "randomstring847@protonmail.com",
      address: "456 Oak Ave, Apt 2B, Miami, FL 33101",
      creditHistoryMonths: 3,
      creditAccountCount: 2,
    },
  },
  {
    name: "Credit Piggybacking",
    description: "Young person with unusually long credit history",
    data: {
      ssnIssuanceYear: 2005,
      birthYear: 2005,
      email: "jane.doe@yahoo.com",
      address: "789 Elm St, Los Angeles, CA 90001",
      creditHistoryMonths: 240,
      creditAccountCount: 15,
    },
  },
]

// Suspicious email domains
const SUSPICIOUS_DOMAINS = [
  "tempmail",
  "guerrillamail",
  "10minutemail",
  "throwaway",
  "mailinator",
  "temp-mail",
  "fakeinbox",
  "disposable",
]

// Check if email domain is suspicious
function isSuspiciousEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase() || ""
  return SUSPICIOUS_DOMAINS.some((sus) => domain.includes(sus))
}

// Check if address looks like a PO Box or commercial mail receiving agency
function isSuspiciousAddress(address: string): boolean {
  const lower = address.toLowerCase()
  return (
    lower.includes("po box") ||
    lower.includes("p.o. box") ||
    lower.includes("cmra") ||
    lower.includes("mail drop") ||
    lower.includes("anytown")
  )
}

// Analyze identity for risk signals
function analyzeIdentity(data: IdentityData): RiskSignal[] {
  const signals: RiskSignal[] = []
  const currentYear = new Date().getFullYear()

  // SSN vs Birth Year Analysis
  // SSN randomization started in 2011, before that SSNs were issued at birth or first job
  const ssnBirthDiff = data.ssnIssuanceYear - data.birthYear
  
  if (data.ssnIssuanceYear > data.birthYear + 1 && data.ssnIssuanceYear < 2011) {
    // Pre-2011: SSN should be issued near birth
    signals.push({
      name: "SSN Issuance Anomaly",
      description: "SSN issued significantly after birth (pre-2011 rules)",
      riskContribution: 25,
      severity: "high",
      evidence: `SSN issued in ${data.ssnIssuanceYear}, but birth year is ${data.birthYear}. Pre-2011 SSNs were typically issued at birth.`,
      attribute: "combined",
    })
  } else if (data.ssnIssuanceYear < data.birthYear) {
    // SSN issued before birth - impossible
    signals.push({
      name: "Impossible SSN Timeline",
      description: "SSN issued before birth year",
      riskContribution: 40,
      severity: "high",
      evidence: `SSN issued in ${data.ssnIssuanceYear} but person born in ${data.birthYear}. This is physically impossible.`,
      attribute: "combined",
    })
  }

  // Thin Credit File Analysis
  const expectedMinHistory = Math.max(0, (currentYear - data.birthYear - 18) * 12)

  if (data.creditHistoryMonths < 12 && data.birthYear < currentYear - 25) {
    signals.push({
      name: "Thin Credit File",
      description: "Very limited credit history for age",
      riskContribution: 20,
      severity: "medium",
      evidence: `Only ${data.creditHistoryMonths} months of credit history for someone born in ${data.birthYear}. Expected at least ${Math.round(expectedMinHistory)} months.`,
      attribute: "creditHistoryMonths",
    })
  }

  // Too few accounts
  if (data.creditAccountCount < 2 && data.creditHistoryMonths > 24) {
    signals.push({
      name: "Limited Account Diversity",
      description: "Very few credit accounts despite history length",
      riskContribution: 15,
      severity: "medium",
      evidence: `Only ${data.creditAccountCount} account(s) over ${data.creditHistoryMonths} months. Legitimate users typically have more diverse credit.`,
      attribute: "creditAccountCount",
    })
  }

  // Credit history longer than possible
  const maxPossibleHistory = (currentYear - data.birthYear - 18) * 12
  if (data.creditHistoryMonths > maxPossibleHistory && maxPossibleHistory > 0) {
    signals.push({
      name: "Impossible Credit History",
      description: "Credit history longer than age allows",
      riskContribution: 35,
      severity: "high",
      evidence: `${data.creditHistoryMonths} months of history, but person is only ${currentYear - data.birthYear} years old. Max possible: ${Math.max(0, maxPossibleHistory)} months.`,
      attribute: "creditHistoryMonths",
    })
  }

  // Suspicious email
  if (isSuspiciousEmail(data.email)) {
    signals.push({
      name: "Suspicious Email Domain",
      description: "Email from known disposable/temporary service",
      riskContribution: 15,
      severity: "medium",
      evidence: `Email "${data.email}" uses a domain associated with temporary or disposable email services.`,
      attribute: "email",
    })
  }

  // Suspicious address
  if (isSuspiciousAddress(data.address)) {
    signals.push({
      name: "Non-Residential Address",
      description: "Address appears to be PO Box or mail drop",
      riskContribution: 10,
      severity: "low",
      evidence: `Address "${data.address}" appears to be a PO Box or commercial mail receiving agency.`,
      attribute: "address",
    })
  }

  // Young SSN with old birth year (post-2011)
  if (data.ssnIssuanceYear >= 2011 && data.birthYear < 1990 && ssnBirthDiff > 25) {
    signals.push({
      name: "Late SSN Assignment",
      description: "SSN assigned very late in life",
      riskContribution: 20,
      severity: "medium",
      evidence: `SSN issued in ${data.ssnIssuanceYear} for someone born in ${data.birthYear}. This could indicate immigration or identity reconstruction.`,
      attribute: "combined",
    })
  }

  return signals
}

// Calculate overall synthetic probability score
function calculateSyntheticScore(signals: RiskSignal[]): number {
  const totalRisk = signals.reduce((sum, s) => sum + s.riskContribution, 0)
  return Math.min(100, totalRisk)
}

// Get severity color
function getSeverityColor(severity: "low" | "medium" | "high"): string {
  switch (severity) {
    case "low":
      return "text-yellow-500"
    case "medium":
      return "text-orange-500"
    case "high":
      return "text-red-500"
  }
}

function getSeverityBg(severity: "low" | "medium" | "high"): string {
  switch (severity) {
    case "low":
      return "bg-yellow-500/10 border-yellow-500/30"
    case "medium":
      return "bg-orange-500/10 border-orange-500/30"
    case "high":
      return "bg-red-500/10 border-red-500/30"
  }
}

// Get risk level from score
function getRiskLevel(score: number): { label: string; color: string; bgColor: string } {
  if (score < 20) return { label: "Low Risk", color: "text-green-500", bgColor: "bg-green-500" }
  if (score < 40) return { label: "Moderate Risk", color: "text-yellow-500", bgColor: "bg-yellow-500" }
  if (score < 60) return { label: "Elevated Risk", color: "text-orange-500", bgColor: "bg-orange-500" }
  return { label: "High Risk", color: "text-red-500", bgColor: "bg-red-500" }
}

// Simulated MCP data source checks
function simulateDataSourceChecks(data: IdentityData): DataSourceCheck[] {
  return [
    {
      source: "SSA Death Master File",
      status: "checked",
      result: "No match found - SSN not in death records",
      icon: <Database className="h-4 w-4" />,
    },
    {
      source: "Credit Bureau Records",
      status: "checked",
      result: `${data.creditAccountCount} accounts, ${data.creditHistoryMonths} months history`,
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      source: "Address Verification Service",
      status: "checked",
      result: isSuspiciousAddress(data.address) ? "Non-residential address detected" : "Residential address confirmed",
      icon: <MapPin className="h-4 w-4" />,
    },
    {
      source: "Email Domain Intelligence",
      status: "checked",
      result: isSuspiciousEmail(data.email) ? "Disposable email service detected" : "Standard email provider",
      icon: <Mail className="h-4 w-4" />,
    },
    {
      source: "SSN Issuance Database",
      status: "checked",
      result: `SSN issued in ${data.ssnIssuanceYear}`,
      icon: <Shield className="h-4 w-4" />,
    },
  ]
}

// Generate verification checklist
function generateVerificationChecklist(data: IdentityData, signals: RiskSignal[]): VerificationItem[] {
  const hasSSNIssue = signals.some((s) => s.name.includes("SSN"))
  const hasCreditIssue = signals.some((s) => s.attribute === "creditHistoryMonths" || s.attribute === "creditAccountCount")
  const hasEmailIssue = signals.some((s) => s.attribute === "email")
  const hasAddressIssue = signals.some((s) => s.attribute === "address")

  return [
    {
      label: "SSN Timeline Verification",
      checked: !hasSSNIssue,
      description: hasSSNIssue ? "SSN issuance date inconsistent with birth year" : "SSN issuance aligns with birth year",
    },
    {
      label: "Credit History Validation",
      checked: !hasCreditIssue,
      description: hasCreditIssue ? "Credit history shows anomalies" : "Credit history consistent with age",
    },
    {
      label: "Email Domain Check",
      checked: !hasEmailIssue,
      description: hasEmailIssue ? "Email from suspicious domain" : "Email from legitimate provider",
    },
    {
      label: "Address Verification",
      checked: !hasAddressIssue,
      description: hasAddressIssue ? "Non-residential or suspicious address" : "Valid residential address",
    },
    {
      label: "Identity Consistency",
      checked: signals.length === 0,
      description: signals.length === 0 ? "All attributes are consistent" : `${signals.length} inconsistencies detected`,
    },
  ]
}

// Attribute Risk Indicator Component
function AttributeIndicator({
  label,
  value,
  icon,
  hasRisk,
  riskLevel,
}: {
  label: string
  value: string
  icon: React.ReactNode
  hasRisk: boolean
  riskLevel?: "low" | "medium" | "high"
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border transition-colors",
        hasRisk ? getSeverityBg(riskLevel || "medium") : "bg-green-500/5 border-green-500/30"
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn("text-muted-foreground", hasRisk && getSeverityColor(riskLevel || "medium"))}>
          {icon}
        </span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{value}</span>
        {hasRisk ? (
          <AlertCircle className={cn("h-4 w-4", getSeverityColor(riskLevel || "medium"))} />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        )}
      </div>
    </div>
  )
}

// Data Source Check Component
function DataSourceCheckItem({ check }: { check: DataSourceCheck }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-2 rounded bg-muted/30"
    >
      <div className="text-muted-foreground">{check.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{check.source}</div>
        <div className="text-xs text-muted-foreground truncate">{check.result}</div>
      </div>
      <Badge variant={check.status === "checked" ? "default" : "secondary"} className="shrink-0">
        {check.status === "checked" ? "✓" : "..."}
      </Badge>
    </motion.div>
  )
}

export function SyntheticIdentityDetector() {
  const [identityData, setIdentityData] = useState<IdentityData>({
    ssnIssuanceYear: 1985,
    birthYear: 1985,
    email: "john.smith@gmail.com",
    address: "123 Main St, Chicago, IL 60601",
    creditHistoryMonths: 180,
    creditAccountCount: 8,
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showPresets, setShowPresets] = useState(false)

  // Analyze identity
  const analysis = useMemo(() => {
    const signals = analyzeIdentity(identityData)
    const score = calculateSyntheticScore(signals)
    const riskLevel = getRiskLevel(score)
    const dataSourceChecks = simulateDataSourceChecks(identityData)
    const verificationChecklist = generateVerificationChecklist(identityData, signals)

    return {
      signals,
      score,
      riskLevel,
      dataSourceChecks,
      verificationChecklist,
    }
  }, [identityData])

  // Handle input changes
  const handleInputChange = useCallback((field: keyof IdentityData, value: string | number) => {
    setIdentityData((prev) => ({ ...prev, [field]: value }))
    setShowResults(false)
  }, [])

  // Run analysis with animation
  const runAnalysis = useCallback(() => {
    setIsAnalyzing(true)
    setShowResults(false)
    
    // Simulate MCP data source queries
    setTimeout(() => {
      setIsAnalyzing(false)
      setShowResults(true)
    }, 1500)
  }, [])

  // Apply preset
  const applyPreset = useCallback((scenario: Scenario) => {
    setIdentityData(scenario.data)
    setShowResults(false)
    setShowPresets(false)
  }, [])

  // Reset
  const handleReset = useCallback(() => {
    setIdentityData(PRESET_SCENARIOS[0].data)
    setShowResults(false)
    setIsAnalyzing(false)
  }, [])

  // Get attribute risk info
  const getAttributeRisk = useCallback(
    (attribute: keyof IdentityData | "combined") => {
      const signal = analysis.signals.find((s) => s.attribute === attribute)
      return signal ? { hasRisk: true, severity: signal.severity } : { hasRisk: false }
    },
    [analysis.signals]
  )

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Synthetic Identity Detector
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Fields */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* SSN Issuance Year */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              SSN Issuance Year
            </Label>
            <Input
              type="number"
              min={1936}
              max={new Date().getFullYear()}
              value={identityData.ssnIssuanceYear}
              onChange={(e) => handleInputChange("ssnIssuanceYear", parseInt(e.target.value) || 0)}
              placeholder="e.g., 1985"
            />
          </div>

          {/* Birth Year */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Birth Year
            </Label>
            <Input
              type="number"
              min={1900}
              max={new Date().getFullYear()}
              value={identityData.birthYear}
              onChange={(e) => handleInputChange("birthYear", parseInt(e.target.value) || 0)}
              placeholder="e.g., 1985"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email Address
            </Label>
            <Input
              type="email"
              value={identityData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="e.g., john@example.com"
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Address
            </Label>
            <Input
              type="text"
              value={identityData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="e.g., 123 Main St, City, ST 12345"
            />
          </div>

          {/* Credit History Length */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Credit History (months)
            </Label>
            <Input
              type="number"
              min={0}
              max={600}
              value={identityData.creditHistoryMonths}
              onChange={(e) => handleInputChange("creditHistoryMonths", parseInt(e.target.value) || 0)}
              placeholder="e.g., 180"
            />
          </div>

          {/* Credit Account Count */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Number of Credit Accounts
            </Label>
            <Input
              type="number"
              min={0}
              max={50}
              value={identityData.creditAccountCount}
              onChange={(e) => handleInputChange("creditAccountCount", parseInt(e.target.value) || 0)}
              placeholder="e.g., 8"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={runAnalysis} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Search className="h-4 w-4" />
                </motion.div>
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Analyze Identity
              </>
            )}
          </Button>

          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowPresets(!showPresets)}
              className="gap-1"
            >
              Load Scenario
              <ChevronDown className={cn("h-4 w-4 transition-transform", showPresets && "rotate-180")} />
            </Button>

            <AnimatePresence>
              {showPresets && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-1 z-20 w-72 p-2 rounded-lg border bg-background shadow-lg"
                >
                  {PRESET_SCENARIOS.map((scenario) => (
                    <button
                      key={scenario.name}
                      onClick={() => applyPreset(scenario)}
                      className="w-full text-left p-2 rounded hover:bg-muted transition-colors"
                    >
                      <div className="font-medium text-sm">{scenario.name}</div>
                      <div className="text-xs text-muted-foreground">{scenario.description}</div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Analysis Animation */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="text-sm font-medium flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Database className="h-4 w-4 text-primary" />
                </motion.div>
                Querying MCP Data Sources...
              </div>
              <div className="space-y-2">
                {analysis.dataSourceChecks.map((check, i) => (
                  <motion.div
                    key={check.source}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 }}
                  >
                    <DataSourceCheckItem check={{ ...check, status: i < 3 ? "checked" : "pending" }} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Overall Score */}
              <div
                className={cn(
                  "p-4 rounded-lg border-2",
                  analysis.score < 20
                    ? "border-green-500/50 bg-green-500/10"
                    : analysis.score < 40
                    ? "border-yellow-500/50 bg-yellow-500/10"
                    : analysis.score < 60
                    ? "border-orange-500/50 bg-orange-500/10"
                    : "border-red-500/50 bg-red-500/10"
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {analysis.score < 40 ? (
                      <CheckCircle2 className={cn("h-6 w-6", analysis.riskLevel.color)} />
                    ) : (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        <AlertTriangle className={cn("h-6 w-6", analysis.riskLevel.color)} />
                      </motion.div>
                    )}
                    <span className={cn("text-lg font-bold", analysis.riskLevel.color)}>
                      {analysis.riskLevel.label}
                    </span>
                  </div>
                  <Badge
                    variant={analysis.score >= 60 ? "destructive" : analysis.score >= 40 ? "secondary" : "default"}
                  >
                    {analysis.score}% Synthetic Probability
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Synthetic Identity Score</span>
                    <span className="font-medium">{analysis.score}%</span>
                  </div>
                  <Progress value={analysis.score} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Legitimate</span>
                    <span>Synthetic</span>
                  </div>
                </div>
              </div>

              {/* Attribute Analysis */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Attribute Analysis
                </h4>
                <div className="grid gap-2">
                  <AttributeIndicator
                    label="SSN vs Birth Year"
                    value={`${identityData.ssnIssuanceYear} / ${identityData.birthYear}`}
                    icon={<Shield className="h-4 w-4" />}
                    {...getAttributeRisk("combined")}
                  />
                  <AttributeIndicator
                    label="Email Domain"
                    value={identityData.email.split("@")[1] || "N/A"}
                    icon={<Mail className="h-4 w-4" />}
                    {...getAttributeRisk("email")}
                  />
                  <AttributeIndicator
                    label="Address Type"
                    value={isSuspiciousAddress(identityData.address) ? "Non-Residential" : "Residential"}
                    icon={<MapPin className="h-4 w-4" />}
                    {...getAttributeRisk("address")}
                  />
                  <AttributeIndicator
                    label="Credit History"
                    value={`${identityData.creditHistoryMonths} months`}
                    icon={<Clock className="h-4 w-4" />}
                    {...getAttributeRisk("creditHistoryMonths")}
                  />
                  <AttributeIndicator
                    label="Account Count"
                    value={`${identityData.creditAccountCount} accounts`}
                    icon={<CreditCard className="h-4 w-4" />}
                    {...getAttributeRisk("creditAccountCount")}
                  />
                </div>
              </div>

              {/* Red Flags */}
              {analysis.signals.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Red Flags Detected ({analysis.signals.length})
                  </h4>
                  <div className="space-y-2">
                    {analysis.signals.map((signal, i) => (
                      <motion.div
                        key={signal.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={cn("p-3 rounded-lg border", getSeverityBg(signal.severity))}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <XCircle className={cn("h-4 w-4 shrink-0", getSeverityColor(signal.severity))} />
                              <span className="font-medium text-sm">{signal.name}</span>
                              <Badge variant="outline" className="text-xs">
                                +{signal.riskContribution}%
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{signal.description}</p>
                            <p className="text-xs mt-2 p-2 rounded bg-background/50">{signal.evidence}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* MCP Data Sources */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  MCP Data Sources Queried
                </h4>
                <div className="grid gap-2">
                  {analysis.dataSourceChecks.map((check, i) => (
                    <motion.div
                      key={check.source}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <DataSourceCheckItem check={check} />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Verification Checklist */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Verification Checklist
                </h4>
                <div className="space-y-2">
                  {analysis.verificationChecklist.map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded border",
                        item.checked ? "bg-green-500/5 border-green-500/30" : "bg-red-500/5 border-red-500/30"
                      )}
                    >
                      {item.checked ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info */}
        <div className="text-xs text-muted-foreground p-3 rounded bg-muted/30">
          <strong>How it works:</strong> This detector analyzes multiple identity attributes to identify
          synthetic identities. It checks for SSN/birth year mismatches, thin credit files, suspicious
          email domains, and non-residential addresses. The MCP data source simulation shows how a
          forensics swarm would query multiple systems to gather evidence. Each red flag contributes to
          the overall synthetic probability score.
        </div>
      </CardContent>
    </Card>
  )
}
