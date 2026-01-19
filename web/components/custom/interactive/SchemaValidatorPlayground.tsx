"use client"

import { useState } from "react"
import { 
  FileJson, 
  Play, 
  Check, 
  X, 
  AlertTriangle, 
  RotateCcw,
  Copy,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// Sample schemas with their validation rules
const SAMPLE_SCHEMAS = {
  userProfile: {
    name: "User Profile",
    description: "Extract user information from text",
    schema: `class UserProfile(BaseModel):
    name: str = Field(description="Full name")
    age: int = Field(ge=0, le=150)
    email: str = Field(pattern=r&apos;^[\\w.-]+@[\\w.-]+\\.\\w+$&apos;)
    interests: list[str] = Field(default_factory=list)`,
    fields: [
      { name: "name", type: "string", required: true, validation: "non-empty string" },
      { name: "age", type: "integer", required: true, validation: "0-150" },
      { name: "email", type: "string", required: true, validation: "valid email format" },
      { name: "interests", type: "array", required: false, validation: "list of strings" },
    ],
    sampleInput: "John Doe is 28 years old. His email is john.doe@example.com. He enjoys hiking, photography, and cooking.",
  },
  productReview: {
    name: "Product Review",
    description: "Extract structured review data",
    schema: `class ProductReview(BaseModel):
    product_name: str
    rating: int = Field(ge=1, le=5)
    sentiment: Literal["positive", "negative", "neutral"]
    pros: list[str]
    cons: list[str]
    would_recommend: bool`,
    fields: [
      { name: "product_name", type: "string", required: true, validation: "non-empty string" },
      { name: "rating", type: "integer", required: true, validation: "1-5" },
      { name: "sentiment", type: "enum", required: true, validation: "positive|negative|neutral" },
      { name: "pros", type: "array", required: true, validation: "list of strings" },
      { name: "cons", type: "array", required: true, validation: "list of strings" },
      { name: "would_recommend", type: "boolean", required: true, validation: "true/false" },
    ],
    sampleInput: "The XPhone Pro is amazing! 4 out of 5 stars. Great camera and battery life, but it's expensive and scratches easily. Definitely recommend if you can afford it!",
  },
  calendarEvent: {
    name: "Calendar Event",
    description: "Extract event details from natural language",
    schema: `class CalendarEvent(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    date: str = Field(pattern=r&apos;^\\d{4}-\\d{2}-\\d{2}$&apos;)
    time: str = Field(pattern=r&apos;^\\d{2}:\\d{2}$&apos;)
    duration_minutes: int = Field(ge=15, le=480)
    attendees: list[str] = Field(default_factory=list)
    location: str | None = None`,
    fields: [
      { name: "title", type: "string", required: true, validation: "1-100 characters" },
      { name: "date", type: "string", required: true, validation: "YYYY-MM-DD format" },
      { name: "time", type: "string", required: true, validation: "HH:MM format" },
      { name: "duration_minutes", type: "integer", required: true, validation: "15-480 minutes" },
      { name: "attendees", type: "array", required: false, validation: "list of names" },
      { name: "location", type: "string", required: false, validation: "optional string" },
    ],
    sampleInput: "Let's meet tomorrow at 2pm for an hour to discuss the project. I'll book the main conference room. Invite Sarah and Mike.",
  },
  taskExtraction: {
    name: "Task Extraction",
    description: "Extract actionable tasks from text",
    schema: `class Task(BaseModel):
    title: str = Field(min_length=5, max_length=200)
    priority: Literal["low", "medium", "high", "critical"]
    due_date: str | None = Field(pattern=r&apos;^\\d{4}-\\d{2}-\\d{2}$&apos;)
    assignee: str | None = None
    tags: list[str] = Field(max_length=5)`,
    fields: [
      { name: "title", type: "string", required: true, validation: "5-200 characters" },
      { name: "priority", type: "enum", required: true, validation: "low|medium|high|critical" },
      { name: "due_date", type: "string", required: false, validation: "YYYY-MM-DD format" },
      { name: "assignee", type: "string", required: false, validation: "optional name" },
      { name: "tags", type: "array", required: false, validation: "max 5 tags" },
    ],
    sampleInput: "URGENT: Fix the login bug by Friday. Assign to Alex. Tags: bug, authentication, security",
  },
}

type SchemaKey = keyof typeof SAMPLE_SCHEMAS

interface FieldValidation {
  field: string
  valid: boolean
  value: string | number | boolean | string[] | null
  error?: string
}

interface ValidationResult {
  success: boolean
  fields: FieldValidation[]
  rawOutput: Record<string, unknown>
  retryCount: number
}

// Simulated extraction and validation
function simulateExtraction(
  input: string, 
  schemaKey: SchemaKey
): ValidationResult {
  const schema = SAMPLE_SCHEMAS[schemaKey]
  const fields: FieldValidation[] = []
  const rawOutput: Record<string, unknown> = {}
  let retryCount = 0

  // Simulate extraction based on schema type
  if (schemaKey === "userProfile") {
    // Extract name
    const nameMatch = input.match(/([A-Z][a-z]+ [A-Z][a-z]+)/)
    const name = nameMatch ? nameMatch[1] : ""
    rawOutput.name = name
    fields.push({
      field: "name",
      valid: name.length > 0,
      value: name,
      error: name.length === 0 ? "Could not extract name" : undefined,
    })

    // Extract age
    const ageMatch = input.match(/(\d+)\s*years?\s*old/i)
    const age = ageMatch ? parseInt(ageMatch[1]) : null
    rawOutput.age = age
    fields.push({
      field: "age",
      valid: age !== null && age >= 0 && age <= 150,
      value: age,
      error: age === null ? "Could not extract age" : age < 0 || age > 150 ? "Age must be 0-150" : undefined,
    })

    // Extract email
    const emailMatch = input.match(/[\w.-]+@[\w.-]+\.\w+/)
    const email = emailMatch ? emailMatch[0] : ""
    rawOutput.email = email
    fields.push({
      field: "email",
      valid: /^[\w.-]+@[\w.-]+\.\w+$/.test(email),
      value: email,
      error: !email ? "Could not extract email" : !/^[\w.-]+@[\w.-]+\.\w+$/.test(email) ? "Invalid email format" : undefined,
    })

    // Extract interests
    const interestsMatch = input.match(/(?:enjoys?|likes?|interests?(?:\s+(?:are|include))?)\s+(.+?)(?:\.|$)/i)
    const interests = interestsMatch 
      ? interestsMatch[1].split(/,\s*(?:and\s+)?/).map(s => s.trim()).filter(Boolean)
      : []
    rawOutput.interests = interests
    fields.push({
      field: "interests",
      valid: true,
      value: interests,
    })
  } else if (schemaKey === "productReview") {
    // Extract product name
    const productMatch = input.match(/(?:the\s+)?([A-Z][A-Za-z0-9\s]+?)(?:\s+is|\s+has|!|\.|,)/i)
    const productName = productMatch ? productMatch[1].trim() : ""
    rawOutput.product_name = productName
    fields.push({
      field: "product_name",
      valid: productName.length > 0,
      value: productName,
      error: !productName ? "Could not extract product name" : undefined,
    })

    // Extract rating
    const ratingMatch = input.match(/(\d)\s*(?:out of 5|\/5|stars?)/i)
    const rating = ratingMatch ? parseInt(ratingMatch[1]) : null
    rawOutput.rating = rating
    fields.push({
      field: "rating",
      valid: rating !== null && rating >= 1 && rating <= 5,
      value: rating,
      error: rating === null ? "Could not extract rating" : rating < 1 || rating > 5 ? "Rating must be 1-5" : undefined,
    })

    // Determine sentiment
    const positiveWords = (input.match(/amazing|great|excellent|love|recommend|good|fantastic/gi) || []).length
    const negativeWords = (input.match(/terrible|bad|awful|hate|worst|poor|disappointing/gi) || []).length
    const sentiment = positiveWords > negativeWords ? "positive" : negativeWords > positiveWords ? "negative" : "neutral"
    rawOutput.sentiment = sentiment
    fields.push({
      field: "sentiment",
      valid: true,
      value: sentiment,
    })

    // Extract pros
    const prosMatch = input.match(/(?:great|good|amazing|excellent|love)\s+([^,.!]+)/gi) || []
    const pros = prosMatch.map(p => p.replace(/^(?:great|good|amazing|excellent|love)\s+/i, "").trim())
    rawOutput.pros = pros
    fields.push({
      field: "pros",
      valid: pros.length > 0,
      value: pros,
      error: pros.length === 0 ? "Could not extract pros" : undefined,
    })

    // Extract cons
    const consMatch = input.match(/(?:but|however|although)\s+(?:it'?s?\s+)?([^,.!]+)/gi) || []
    const cons = consMatch.map(c => c.replace(/^(?:but|however|although)\s+(?:it'?s?\s+)?/i, "").trim())
    rawOutput.cons = cons
    fields.push({
      field: "cons",
      valid: true,
      value: cons,
    })

    // Would recommend
    const wouldRecommend = /recommend/i.test(input) && !/don'?t\s+recommend|not\s+recommend/i.test(input)
    rawOutput.would_recommend = wouldRecommend
    fields.push({
      field: "would_recommend",
      valid: true,
      value: wouldRecommend,
    })
  } else if (schemaKey === "calendarEvent") {
    // Extract title
    const title = input.match(/(?:discuss|meeting|meet|talk about)\s+(?:the\s+)?([^.!,]+)/i)?.[1]?.trim() || "Meeting"
    rawOutput.title = title
    fields.push({
      field: "title",
      valid: title.length >= 1 && title.length <= 100,
      value: title,
      error: title.length < 1 ? "Title too short" : title.length > 100 ? "Title too long" : undefined,
    })

    // Extract date (simulate tomorrow)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const date = tomorrow.toISOString().split("T")[0]
    rawOutput.date = date
    fields.push({
      field: "date",
      valid: /^\d{4}-\d{2}-\d{2}$/.test(date),
      value: date,
    })

    // Extract time
    const timeMatch = input.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
    let time = "14:00"
    if (timeMatch) {
      let hours = parseInt(timeMatch[1])
      const minutes = timeMatch[2] || "00"
      const period = timeMatch[3]?.toLowerCase()
      if (period === "pm" && hours < 12) hours += 12
      if (period === "am" && hours === 12) hours = 0
      time = `${hours.toString().padStart(2, "0")}:${minutes}`
    }
    rawOutput.time = time
    fields.push({
      field: "time",
      valid: /^\d{2}:\d{2}$/.test(time),
      value: time,
    })

    // Extract duration
    const durationMatch = input.match(/(\d+)\s*(?:hour|hr|minute|min)/i)
    let duration = 60
    if (durationMatch) {
      const num = parseInt(durationMatch[1])
      duration = /hour|hr/i.test(durationMatch[0]) ? num * 60 : num
    }
    rawOutput.duration_minutes = duration
    fields.push({
      field: "duration_minutes",
      valid: duration >= 15 && duration <= 480,
      value: duration,
      error: duration < 15 ? "Duration too short (min 15)" : duration > 480 ? "Duration too long (max 480)" : undefined,
    })

    // Extract attendees
    const attendeesMatch = input.match(/invite\s+([^.!]+)/i)
    const attendees = attendeesMatch 
      ? attendeesMatch[1].split(/,\s*(?:and\s+)?/).map(s => s.trim()).filter(Boolean)
      : []
    rawOutput.attendees = attendees
    fields.push({
      field: "attendees",
      valid: true,
      value: attendees,
    })

    // Extract location
    const locationMatch = input.match(/(?:book|at|in)\s+(?:the\s+)?([^.!,]+(?:room|office|building|hall))/i)
    const location = locationMatch ? locationMatch[1].trim() : null
    rawOutput.location = location
    fields.push({
      field: "location",
      valid: true,
      value: location,
    })
  } else if (schemaKey === "taskExtraction") {
    // Extract title
    const titleMatch = input.match(/(?:URGENT:?\s*)?(.+?)(?:\s+by\s+|\s+assign|\s+tags?:|$)/i)
    const title = titleMatch ? titleMatch[1].trim() : ""
    rawOutput.title = title
    fields.push({
      field: "title",
      valid: title.length >= 5 && title.length <= 200,
      value: title,
      error: title.length < 5 ? "Title too short (min 5 chars)" : title.length > 200 ? "Title too long" : undefined,
    })

    // Determine priority
    const isUrgent = /urgent|critical|asap|immediately/i.test(input)
    const isHigh = /high\s*priority|important/i.test(input)
    const priority = isUrgent ? "critical" : isHigh ? "high" : "medium"
    rawOutput.priority = priority
    fields.push({
      field: "priority",
      valid: true,
      value: priority,
    })

    // Extract due date
    const dueDateMatch = input.match(/by\s+(friday|monday|tuesday|wednesday|thursday|saturday|sunday|\d{4}-\d{2}-\d{2})/i)
    let dueDate: string | null = null
    if (dueDateMatch) {
      const dayName = dueDateMatch[1].toLowerCase()
      if (/^\d{4}-\d{2}-\d{2}$/.test(dayName)) {
        dueDate = dayName
      } else {
        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
        const targetDay = days.indexOf(dayName)
        if (targetDay !== -1) {
          const today = new Date()
          const currentDay = today.getDay()
          const daysUntil = (targetDay - currentDay + 7) % 7 || 7
          today.setDate(today.getDate() + daysUntil)
          dueDate = today.toISOString().split("T")[0]
        }
      }
    }
    rawOutput.due_date = dueDate
    fields.push({
      field: "due_date",
      valid: dueDate === null || /^\d{4}-\d{2}-\d{2}$/.test(dueDate),
      value: dueDate,
    })

    // Extract assignee
    const assigneeMatch = input.match(/assign(?:ed)?\s+(?:to\s+)?([A-Z][a-z]+)/i)
    const assignee = assigneeMatch ? assigneeMatch[1] : null
    rawOutput.assignee = assignee
    fields.push({
      field: "assignee",
      valid: true,
      value: assignee,
    })

    // Extract tags
    const tagsMatch = input.match(/tags?:\s*([^.!]+)/i)
    const tags = tagsMatch 
      ? tagsMatch[1].split(/,\s*/).map(s => s.trim()).filter(Boolean).slice(0, 5)
      : []
    rawOutput.tags = tags
    fields.push({
      field: "tags",
      valid: tags.length <= 5,
      value: tags,
      error: tags.length > 5 ? "Max 5 tags allowed" : undefined,
    })
  }

  // Check if any required fields failed - simulate retry
  const hasErrors = fields.some(f => !f.valid && schema.fields.find(sf => sf.name === f.field)?.required)
  if (hasErrors && Math.random() > 0.5) {
    retryCount = 1
  }

  return {
    success: fields.every(f => f.valid || !schema.fields.find(sf => sf.name === f.field)?.required),
    fields,
    rawOutput,
    retryCount,
  }
}

export function SchemaValidatorPlayground() {
  const [selectedSchema, setSelectedSchema] = useState<SchemaKey>("userProfile")
  const [inputText, setInputText] = useState(SAMPLE_SCHEMAS.userProfile.sampleInput)
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [copied, setCopied] = useState(false)

  const currentSchema = SAMPLE_SCHEMAS[selectedSchema]

  const handleSchemaChange = (value: SchemaKey) => {
    setSelectedSchema(value)
    setInputText(SAMPLE_SCHEMAS[value].sampleInput)
    setResult(null)
  }

  const handleValidate = async () => {
    setIsValidating(true)
    setResult(null)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400))
    
    const validationResult = simulateExtraction(inputText, selectedSchema)
    setResult(validationResult)
    setIsValidating(false)
  }

  const handleReset = () => {
    setInputText(currentSchema.sampleInput)
    setResult(null)
  }

  const handleCopyOutput = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result.rawOutput, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const validFieldCount = result?.fields.filter(f => f.valid).length ?? 0
  const totalFieldCount = result?.fields.length ?? 0

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="h-5 w-5 text-primary" />
          Schema Validator Playground
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Test structured output extraction with different schemas
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Schema Selection */}
        <div className="space-y-2">
          <Label>Select Schema</Label>
          <Select value={selectedSchema} onValueChange={(v) => handleSchemaChange(v as SchemaKey)}>
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SAMPLE_SCHEMAS).map(([key, schema]) => (
                <SelectItem key={key} value={key}>
                  {schema.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{currentSchema.description}</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Panel - Input & Schema */}
          <div className="space-y-4">
            {/* Schema Preview */}
            <div className="space-y-2">
              <Label>Pydantic Schema</Label>
              <div className="rounded-lg border bg-muted/50 p-3 font-mono text-xs overflow-x-auto">
                <pre className="whitespace-pre-wrap">{currentSchema.schema}</pre>
              </div>
            </div>

            {/* Input Text */}
            <div className="space-y-2">
              <Label>Input Text</Label>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to extract structured data from..."
                className="min-h-[120px] font-mono text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                onClick={handleValidate} 
                disabled={isValidating || !inputText.trim()}
                className="flex-1"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Validate & Extract
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="space-y-4">
            {/* Field Validation Status */}
            <div className="space-y-2">
              <Label>Schema Fields</Label>
              <div className="rounded-lg border divide-y">
                {currentSchema.fields.map((field) => {
                  const fieldResult = result?.fields.find(f => f.field === field.name)
                  return (
                    <div 
                      key={field.name}
                      className={cn(
                        "flex items-center justify-between p-2.5 text-sm",
                        fieldResult && (fieldResult.valid ? "bg-green-500/5" : "bg-red-500/5")
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {result ? (
                          fieldResult?.valid ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                        )}
                        <span className="font-medium">{field.name}</span>
                        {field.required && (
                          <span className="text-xs text-red-500">*</span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">
                          {field.type} · {field.validation}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Validation Result */}
            {result && (
              <div className="space-y-3">
                {/* Status Banner */}
                <div
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-3",
                    result.success 
                      ? "border-green-500 bg-green-500/10" 
                      : "border-red-500 bg-red-500/10"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      {result.success ? "Validation Passed" : "Validation Failed"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className={cn(
                      "font-mono",
                      result.success ? "text-green-600" : "text-red-600"
                    )}>
                      {validFieldCount}/{totalFieldCount} fields
                    </span>
                    {result.retryCount > 0 && (
                      <span className="flex items-center gap-1 text-amber-600">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {result.retryCount} retry
                      </span>
                    )}
                  </div>
                </div>

                {/* JSON Output */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Extracted JSON</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleCopyOutput}
                      className="h-7 text-xs"
                    >
                      {copied ? (
                        <>
                          <Check className="mr-1 h-3 w-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 h-3 w-3" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="rounded-lg border bg-muted/50 p-3 font-mono text-xs overflow-x-auto max-h-[200px] overflow-y-auto">
                    <pre>{JSON.stringify(result.rawOutput, null, 2)}</pre>
                  </div>
                </div>

                {/* Error Details */}
                {!result.success && (
                  <div className="space-y-2">
                    <Label className="text-red-500">Validation Errors</Label>
                    <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/50 p-3 space-y-1">
                      {result.fields
                        .filter(f => !f.valid && f.error)
                        .map((f, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                            <X className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>
                              <strong>{f.field}</strong>: {f.error}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!result && !isValidating && (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <FileJson className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Click &quot;Validate & Extract&quot; to see structured output
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
