"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Search,
  Code,
  Eye,
  FileText,
  RotateCcw,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface SecurityIssue {
  type: "pii" | "secret" | "vulnerability" | "compliance"
  severity: "critical" | "high" | "medium" | "low"
  line: number
  column: number
  message: string
  suggestion: string
  pattern: string
}

const SAMPLE_CODE = {
  "pii-exposure": `// User registration handler
async function registerUser(req, res) {
  const { name, email, ssn, phone } = req.body;
  
  // Log user data for debugging
  console.log("New user:", name, email, ssn);
  
  // Store in database
  const user = await db.users.create({
    name: name,
    email: email,
    ssn: ssn,  // Social Security Number
    phone: phone,
    creditCard: req.body.creditCard
  });
  
  // Send welcome email with all details
  await sendEmail(email, \`Welcome \${name}! Your SSN \${ssn} is on file.\`);
  
  return res.json({ success: true, userId: user.id });
}`,

  "hardcoded-secrets": `// API Configuration
const config = {
  apiKey: "sk-1234567890abcdef",
  dbPassword: "super_secret_password_123",
  awsAccessKey: "AKIAIOSFODNN7EXAMPLE",
  awsSecretKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  jwtSecret: "my-jwt-secret-key-do-not-share"
};

// Database connection
const dbUrl = "postgresql://admin:password123@prod-db.example.com:5432/users";

async function callExternalAPI() {
  const response = await fetch("https://api.example.com/data", {
    headers: {
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  });
  return response.json();
}`,

  "sql-injection": `// User search endpoint
app.get("/users/search", async (req, res) => {
  const { query } = req.query;
  
  // VULNERABLE: Direct string interpolation
  const sql = \`SELECT * FROM users WHERE name LIKE '%\${query}%'\`;
  const results = await db.raw(sql);
  
  // Also vulnerable
  const userById = await db.raw(
    "SELECT * FROM users WHERE id = " + req.params.id
  );
  
  // Vulnerable to NoSQL injection
  const mongoQuery = { $where: "this.name == '" + query + "'" };
  const mongoResults = await collection.find(mongoQuery);
  
  return res.json(results);
});`,

  "clean-code": `// Secure user handler with proper practices
import { z } from "zod";
import { hash } from "bcrypt";

const UserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8)
});

async function createUser(input: unknown) {
  // Validate input
  const data = UserSchema.parse(input);
  
  // Hash sensitive data
  const hashedPassword = await hash(data.password, 12);
  
  // Store only necessary data
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: hashedPassword
    },
    select: { id: true, name: true, email: true }
  });
  
  return user;
}`,
}

const PATTERNS: Record<string, { regex: RegExp; type: SecurityIssue["type"]; severity: SecurityIssue["severity"]; message: string; suggestion: string }[]> = {
  pii: [
    { regex: /\bssn\b/gi, type: "pii", severity: "critical", message: "Social Security Number detected", suggestion: "Never store SSN in plain text. Use tokenization or encryption." },
    { regex: /creditCard/gi, type: "pii", severity: "critical", message: "Credit card data detected", suggestion: "Use PCI-compliant payment processors instead of storing card data." },
    { regex: /console\.log.*(?:ssn|password|secret|key)/gi, type: "pii", severity: "high", message: "Sensitive data logged to console", suggestion: "Remove sensitive data from logs or use structured logging with redaction." },
  ],
  secrets: [
    { regex: /["']sk-[a-zA-Z0-9]{20,}["']/g, type: "secret", severity: "critical", message: "API key hardcoded", suggestion: "Use environment variables or a secrets manager." },
    { regex: /password\s*[:=]\s*["'][^"']+["']/gi, type: "secret", severity: "critical", message: "Hardcoded password detected", suggestion: "Use environment variables or a secrets manager." },
    { regex: /AKIA[0-9A-Z]{16}/g, type: "secret", severity: "critical", message: "AWS Access Key detected", suggestion: "Use IAM roles or AWS Secrets Manager." },
    { regex: /["']eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+["']/g, type: "secret", severity: "high", message: "JWT token hardcoded", suggestion: "Generate tokens dynamically, never hardcode." },
  ],
  injection: [
    { regex: /\$\{.*\}.*(?:SELECT|INSERT|UPDATE|DELETE)/gi, type: "vulnerability", severity: "critical", message: "Potential SQL injection", suggestion: "Use parameterized queries or an ORM." },
    { regex: /\+\s*req\.(params|query|body)/g, type: "vulnerability", severity: "critical", message: "User input concatenation detected", suggestion: "Use parameterized queries, never concatenate user input." },
    { regex: /\$where.*\+/g, type: "vulnerability", severity: "critical", message: "NoSQL injection vulnerability", suggestion: "Use MongoDB query operators instead of $where with user input." },
  ],
}

export function CodeSecurityPlayground() {
  const [code, setCode] = useState(SAMPLE_CODE["pii-exposure"])
  const [selectedSample, setSelectedSample] = useState("pii-exposure")
  const [issues, setIssues] = useState<SecurityIssue[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<SecurityIssue | null>(null)

  const scanCode = useCallback(() => {
    setIsScanning(true)
    setIssues([])
    setSelectedIssue(null)

    setTimeout(() => {
      const foundIssues: SecurityIssue[] = []
      const lines = code.split("\n")

      Object.values(PATTERNS).flat().forEach(pattern => {
        lines.forEach((line, lineIndex) => {
          const matches = line.matchAll(pattern.regex)
          for (const match of matches) {
            foundIssues.push({
              type: pattern.type,
              severity: pattern.severity,
              line: lineIndex + 1,
              column: match.index || 0,
              message: pattern.message,
              suggestion: pattern.suggestion,
              pattern: match[0],
            })
          }
        })
      })

      setIssues(foundIssues)
      setIsScanning(false)
    }, 1000)
  }, [code])

  const handleSampleChange = (value: string) => {
    setSelectedSample(value)
    setCode(SAMPLE_CODE[value as keyof typeof SAMPLE_CODE])
    setIssues([])
    setSelectedIssue(null)
  }

  const getSeverityColor = (severity: SecurityIssue["severity"]) => {
    switch (severity) {
      case "critical": return "text-red-500 bg-red-500/10 border-red-500/30"
      case "high": return "text-orange-500 bg-orange-500/10 border-orange-500/30"
      case "medium": return "text-amber-500 bg-amber-500/10 border-amber-500/30"
      case "low": return "text-blue-500 bg-blue-500/10 border-blue-500/30"
    }
  }

  const getTypeIcon = (type: SecurityIssue["type"]) => {
    switch (type) {
      case "pii": return Eye
      case "secret": return Shield
      case "vulnerability": return AlertTriangle
      case "compliance": return FileText
    }
  }

  const criticalCount = issues.filter(i => i.severity === "critical").length
  const highCount = issues.filter(i => i.severity === "high").length
  const riskScore = Math.min(100, criticalCount * 25 + highCount * 10 + issues.length * 2)

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Code Security Validator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-3">
          <Select value={selectedSample} onValueChange={handleSampleChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select sample" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pii-exposure">PII Exposure</SelectItem>
              <SelectItem value="hardcoded-secrets">Hardcoded Secrets</SelectItem>
              <SelectItem value="sql-injection">SQL Injection</SelectItem>
              <SelectItem value="clean-code">Clean Code ✓</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={scanCode} disabled={isScanning} className="gap-2">
            <Search className="h-4 w-4" />
            {isScanning ? "Scanning..." : "Scan Code"}
          </Button>
          <Button variant="outline" onClick={() => { setCode(""); setIssues([]); }} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Clear
          </Button>
        </div>

        {/* Code Editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              <Code className="h-4 w-4" /> Code Input
            </span>
            <span className="text-xs text-muted-foreground">
              {code.split("\n").length} lines
            </span>
          </div>
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="font-mono text-sm min-h-[250px]"
            placeholder="Paste your code here to scan for security issues..."
          />
        </div>

        {/* Results */}
        {issues.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Risk Score */}
            <div className={cn(
              "p-4 rounded-lg border",
              riskScore > 70 ? "bg-red-500/10 border-red-500/30" :
              riskScore > 30 ? "bg-amber-500/10 border-amber-500/30" :
              "bg-green-500/10 border-green-500/30"
            )}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Security Risk Score</span>
                <span className={cn(
                  "text-2xl font-bold",
                  riskScore > 70 ? "text-red-500" :
                  riskScore > 30 ? "text-amber-500" :
                  "text-green-500"
                )}>
                  {riskScore}/100
                </span>
              </div>
              <Progress 
                value={riskScore} 
                className={cn(
                  "h-2",
                  riskScore > 70 && "[&>div]:bg-red-500",
                  riskScore > 30 && riskScore <= 70 && "[&>div]:bg-amber-500"
                )} 
              />
              <div className="flex gap-4 mt-2 text-sm">
                <span className="text-red-500">{criticalCount} Critical</span>
                <span className="text-orange-500">{highCount} High</span>
                <span className="text-muted-foreground">{issues.length} Total</span>
              </div>
            </div>

            {/* Issues List */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Issues Found ({issues.length})</h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {issues.map((issue, index) => {
                  const Icon = getTypeIcon(issue.type)
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedIssue(selectedIssue === issue ? null : issue)}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-all",
                        getSeverityColor(issue.severity),
                        selectedIssue === issue && "ring-2 ring-primary"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={cn("text-xs capitalize", getSeverityColor(issue.severity))}>
                              {issue.severity}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                              {issue.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Line {issue.line}
                            </span>
                          </div>
                          <p className="text-sm font-medium mt-1">{issue.message}</p>
                          <code className="text-xs bg-muted px-1 rounded mt-1 inline-block">
                            {issue.pattern.slice(0, 50)}{issue.pattern.length > 50 ? "..." : ""}
                          </code>
                        </div>
                      </div>

                      <AnimatePresence>
                        {selectedIssue === issue && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-3 pt-3 border-t"
                          >
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                              <div>
                                <span className="text-xs font-medium">Suggestion:</span>
                                <p className="text-sm text-muted-foreground">{issue.suggestion}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* No Issues */}
        {issues.length === 0 && code && !isScanning && selectedSample === "clean-code" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 rounded-lg bg-green-500/10 border border-green-500/30 text-center"
          >
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-green-500">No Security Issues Found!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              This code follows security best practices.
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
