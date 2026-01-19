"use client"

import { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Plane, 
  RotateCcw,
  ChevronDown
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// City data with coordinates
interface City {
  name: string
  country: string
  lat: number
  lng: number
  // SVG map position (percentage)
  x: number
  y: number
}

const CITIES: City[] = [
  { name: "New York", country: "USA", lat: 40.7128, lng: -74.0060, x: 25, y: 38 },
  { name: "London", country: "UK", lat: 51.5074, lng: -0.1278, x: 47, y: 32 },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, x: 85, y: 40 },
  { name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093, x: 88, y: 72 },
  { name: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708, x: 60, y: 45 },
  { name: "São Paulo", country: "Brazil", lat: -23.5505, lng: -46.6333, x: 32, y: 68 },
  { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522, x: 48, y: 34 },
  { name: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198, x: 77, y: 55 },
  { name: "Los Angeles", country: "USA", lat: 34.0522, lng: -118.2437, x: 15, y: 42 },
  { name: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6173, x: 57, y: 28 },
]

// Preset scenarios
interface Scenario {
  name: string
  login1City: string
  login2City: string
  timeDiffMinutes: number
  description: string
}

const PRESET_SCENARIOS: Scenario[] = [
  {
    name: "NYC to London (6 hours)",
    login1City: "New York",
    login2City: "London",
    timeDiffMinutes: 360,
    description: "Possible - typical transatlantic flight time",
  },
  {
    name: "NYC to Tokyo (2 hours)",
    login1City: "New York",
    login2City: "Tokyo",
    timeDiffMinutes: 120,
    description: "Impossible - flight takes 14+ hours",
  },
  {
    name: "London to Paris (30 min)",
    login1City: "London",
    login2City: "Paris",
    timeDiffMinutes: 30,
    description: "Possible - Eurostar takes ~2.5 hours, but VPN/proxy possible",
  },
  {
    name: "Sydney to Dubai (1 hour)",
    login1City: "Sydney",
    login2City: "Dubai",
    timeDiffMinutes: 60,
    description: "Impossible - flight takes 14+ hours",
  },
]

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

// Format time duration
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

// SVG World Map Component (simplified)
function WorldMap({
  cities,
  login1,
  login2,
  onCityClick,
  selectionMode,
}: {
  cities: City[]
  login1: City | null
  login2: City | null
  onCityClick: (city: City) => void
  selectionMode: "login1" | "login2" | null
}) {
  return (
    <div className="relative w-full aspect-[2/1] bg-muted/30 rounded-lg overflow-hidden border">
      {/* Simple world map background */}
      <svg
        viewBox="0 0 100 50"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Simplified continent shapes */}
        <defs>
          <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {/* Ocean background */}
        <rect x="0" y="0" width="100" height="50" fill="url(#mapGradient)" />
        
        {/* Simplified continents */}
        <g fill="hsl(var(--muted-foreground))" fillOpacity="0.15">
          {/* North America */}
          <path d="M5,15 Q15,10 25,15 L30,25 Q25,35 20,35 L10,30 Q5,25 5,15" />
          {/* South America */}
          <path d="M25,40 Q30,35 35,40 L35,48 Q30,50 25,48 L25,40" />
          {/* Europe */}
          <path d="M42,18 Q50,15 55,20 L55,28 Q50,32 45,30 L42,25 Q40,22 42,18" />
          {/* Africa */}
          <path d="M45,32 Q52,30 55,35 L55,48 Q50,50 45,48 L45,32" />
          {/* Asia */}
          <path d="M55,15 Q70,10 85,20 L90,35 Q80,40 70,38 L60,30 Q55,25 55,15" />
          {/* Australia */}
          <path d="M80,42 Q88,40 92,45 L90,48 Q85,50 80,48 L80,42" />
        </g>

        {/* Grid lines */}
        <g stroke="hsl(var(--border))" strokeWidth="0.1" strokeOpacity="0.3">
          {[10, 20, 30, 40].map((y) => (
            <line key={`h-${y}`} x1="0" y1={y} x2="100" y2={y} />
          ))}
          {[20, 40, 60, 80].map((x) => (
            <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="50" />
          ))}
        </g>

        {/* Connection line between logins */}
        {login1 && login2 && (
          <motion.path
            d={`M ${login1.x} ${login1.y} Q ${(login1.x + login2.x) / 2} ${Math.min(login1.y, login2.y) - 10} ${login2.x} ${login2.y}`}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="0.3"
            strokeDasharray="1,0.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        )}
      </svg>

      {/* City markers */}
      {cities.map((city) => {
        const isLogin1 = login1?.name === city.name
        const isLogin2 = login2?.name === city.name
        const isSelected = isLogin1 || isLogin2

        return (
          <motion.button
            key={city.name}
            className={cn(
              "absolute transform -translate-x-1/2 -translate-y-1/2 z-10",
              "flex flex-col items-center gap-0.5 group",
              selectionMode && "cursor-pointer"
            )}
            style={{ left: `${city.x}%`, top: `${city.y}%` }}
            onClick={() => onCityClick(city)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className={cn(
                "w-3 h-3 rounded-full border-2 transition-colors",
                isLogin1 && "bg-blue-500 border-blue-300",
                isLogin2 && "bg-orange-500 border-orange-300",
                !isSelected && "bg-muted-foreground/50 border-muted-foreground/30",
                !isSelected && selectionMode && "hover:bg-primary hover:border-primary"
              )}
              animate={isSelected ? { scale: [1, 1.3, 1] } : {}}
              transition={{ repeat: isSelected ? Infinity : 0, duration: 2 }}
            />
            <span
              className={cn(
                "text-[8px] font-medium whitespace-nowrap px-1 rounded",
                "opacity-0 group-hover:opacity-100 transition-opacity",
                isSelected && "opacity-100",
                isLogin1 && "text-blue-500 bg-blue-500/10",
                isLogin2 && "text-orange-500 bg-orange-500/10",
                !isSelected && "text-muted-foreground bg-background/80"
              )}
            >
              {city.name}
            </span>
          </motion.button>
        )
      })}

      {/* Selection mode indicator */}
      {selectionMode && (
        <div className="absolute top-2 left-2 px-2 py-1 rounded bg-background/90 border text-xs">
          Click to set{" "}
          <span className={selectionMode === "login1" ? "text-blue-500" : "text-orange-500"}>
            {selectionMode === "login1" ? "Login 1" : "Login 2"}
          </span>
        </div>
      )}
    </div>
  )
}

export function ImpossibleTravelDetector() {
  const [login1City, setLogin1City] = useState<City | null>(CITIES[0]) // New York
  const [login2City, setLogin2City] = useState<City | null>(CITIES[2]) // Tokyo
  const [login1Time, setLogin1Time] = useState("2024-01-15T10:00")
  const [login2Time, setLogin2Time] = useState("2024-01-15T12:00")
  const [selectionMode, setSelectionMode] = useState<"login1" | "login2" | null>(null)
  const [showPresets, setShowPresets] = useState(false)

  const MAX_FLIGHT_SPEED_KMH = 900 // Commercial jet speed

  // Calculate analysis results
  const analysis = useMemo(() => {
    if (!login1City || !login2City) {
      return null
    }

    const distance = calculateDistance(
      login1City.lat,
      login1City.lng,
      login2City.lat,
      login2City.lng
    )

    const time1 = new Date(login1Time).getTime()
    const time2 = new Date(login2Time).getTime()
    const timeDiffMs = Math.abs(time2 - time1)
    const timeDiffMinutes = timeDiffMs / (1000 * 60)
    const timeDiffHours = timeDiffMinutes / 60

    const maxPossibleDistance = MAX_FLIGHT_SPEED_KMH * timeDiffHours
    const isPossible = distance <= maxPossibleDistance
    const minimumTimeNeeded = distance / MAX_FLIGHT_SPEED_KMH // hours

    return {
      distance: Math.round(distance),
      timeDiffMinutes: Math.round(timeDiffMinutes),
      timeDiffHours,
      maxPossibleDistance: Math.round(maxPossibleDistance),
      isPossible,
      minimumTimeNeeded: Math.round(minimumTimeNeeded * 60), // in minutes
    }
  }, [login1City, login2City, login1Time, login2Time])

  // Handle city click
  const handleCityClick = useCallback(
    (city: City) => {
      if (selectionMode === "login1") {
        setLogin1City(city)
        setSelectionMode(null)
      } else if (selectionMode === "login2") {
        setLogin2City(city)
        setSelectionMode(null)
      }
    },
    [selectionMode]
  )

  // Apply preset scenario
  const applyPreset = useCallback((scenario: Scenario) => {
    const city1 = CITIES.find((c) => c.name === scenario.login1City)
    const city2 = CITIES.find((c) => c.name === scenario.login2City)
    if (city1 && city2) {
      setLogin1City(city1)
      setLogin2City(city2)
      
      const now = new Date()
      now.setMinutes(0, 0, 0)
      const login1 = new Date(now)
      const login2 = new Date(now.getTime() + scenario.timeDiffMinutes * 60 * 1000)
      
      setLogin1Time(login1.toISOString().slice(0, 16))
      setLogin2Time(login2.toISOString().slice(0, 16))
    }
    setShowPresets(false)
  }, [])

  // Reset
  const handleReset = useCallback(() => {
    setLogin1City(CITIES[0])
    setLogin2City(CITIES[2])
    const now = new Date()
    now.setMinutes(0, 0, 0)
    setLogin1Time(now.toISOString().slice(0, 16))
    const later = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    setLogin2Time(later.toISOString().slice(0, 16))
    setSelectionMode(null)
  }, [])

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Impossible Travel Detector
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* World Map */}
        <WorldMap
          cities={CITIES}
          login1={login1City}
          login2={login2City}
          onCityClick={handleCityClick}
          selectionMode={selectionMode}
        />

        {/* Controls */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Login 1 */}
          <div className="space-y-3 p-4 rounded-lg border border-blue-500/30 bg-blue-500/5">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-blue-500 font-medium">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                Login 1
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectionMode(selectionMode === "login1" ? null : "login1")}
                className={cn(selectionMode === "login1" && "border-blue-500 text-blue-500")}
              >
                <MapPin className="h-3 w-3 mr-1" />
                {selectionMode === "login1" ? "Selecting..." : "Change"}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{login1City?.name || "Select city"}</span>
              {login1City && (
                <span className="text-xs text-muted-foreground">({login1City.country})</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Input
                type="datetime-local"
                value={login1Time}
                onChange={(e) => setLogin1Time(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          {/* Login 2 */}
          <div className="space-y-3 p-4 rounded-lg border border-orange-500/30 bg-orange-500/5">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-orange-500 font-medium">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                Login 2
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectionMode(selectionMode === "login2" ? null : "login2")}
                className={cn(selectionMode === "login2" && "border-orange-500 text-orange-500")}
              >
                <MapPin className="h-3 w-3 mr-1" />
                {selectionMode === "login2" ? "Selecting..." : "Change"}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{login2City?.name || "Select city"}</span>
              {login2City && (
                <span className="text-xs text-muted-foreground">({login2City.country})</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Input
                type="datetime-local"
                value={login2Time}
                onChange={(e) => setLogin2Time(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        <AnimatePresence mode="wait">
          {analysis && (
            <motion.div
              key={`${analysis.distance}-${analysis.timeDiffMinutes}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                "p-4 rounded-lg border-2",
                analysis.isPossible
                  ? "border-green-500/50 bg-green-500/10"
                  : "border-red-500/50 bg-red-500/10"
              )}
            >
              {/* Verdict */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {analysis.isPossible ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : (
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 0.5, repeatDelay: 2 }}
                    >
                      <AlertTriangle className="h-6 w-6 text-red-500" />
                    </motion.div>
                  )}
                  <span
                    className={cn(
                      "text-lg font-bold",
                      analysis.isPossible ? "text-green-500" : "text-red-500"
                    )}
                  >
                    {analysis.isPossible ? "TRAVEL POSSIBLE" : "IMPOSSIBLE TRAVEL DETECTED"}
                  </span>
                </div>
                <Badge variant={analysis.isPossible ? "default" : "destructive"}>
                  {analysis.isPossible ? "Low Risk" : "High Risk"}
                </Badge>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded bg-background/50">
                  <div className="text-2xl font-bold text-foreground">
                    {analysis.distance.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Distance (km)</div>
                </div>
                <div className="text-center p-3 rounded bg-background/50">
                  <div className="text-2xl font-bold text-foreground">
                    {formatDuration(analysis.timeDiffMinutes)}
                  </div>
                  <div className="text-xs text-muted-foreground">Time Between Logins</div>
                </div>
                <div className="text-center p-3 rounded bg-background/50">
                  <div className="text-2xl font-bold text-foreground">
                    {analysis.maxPossibleDistance.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Plane className="h-3 w-3" />
                    Max Travel (km)
                  </div>
                </div>
                <div className="text-center p-3 rounded bg-background/50">
                  <div className="text-2xl font-bold text-foreground">
                    {formatDuration(analysis.minimumTimeNeeded)}
                  </div>
                  <div className="text-xs text-muted-foreground">Min Time Needed</div>
                </div>
              </div>

              {/* Explanation */}
              <div className="mt-4 text-sm text-muted-foreground">
                {analysis.isPossible ? (
                  <p>
                    At {MAX_FLIGHT_SPEED_KMH} km/h (commercial jet speed), traveling{" "}
                    {analysis.distance.toLocaleString()} km in {formatDuration(analysis.timeDiffMinutes)}{" "}
                    is physically possible. However, this doesn&apos;t rule out VPN or proxy usage.
                  </p>
                ) : (
                  <p>
                    <strong>Alert:</strong> The distance of {analysis.distance.toLocaleString()} km
                    cannot be traveled in {formatDuration(analysis.timeDiffMinutes)} even at{" "}
                    {MAX_FLIGHT_SPEED_KMH} km/h. Minimum time required:{" "}
                    {formatDuration(analysis.minimumTimeNeeded)}. This indicates potential account
                    compromise or credential sharing.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preset Scenarios & Reset */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPresets(!showPresets)}
              className="gap-1"
            >
              Preset Scenarios
              <ChevronDown className={cn("h-4 w-4 transition-transform", showPresets && "rotate-180")} />
            </Button>
            
            <AnimatePresence>
              {showPresets && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-1 z-20 w-64 p-2 rounded-lg border bg-background shadow-lg"
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

          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground p-3 rounded bg-muted/30">
          <strong>How it works:</strong> This detector uses the Haversine formula to calculate the
          great-circle distance between two points on Earth. It then compares the time between logins
          against the maximum possible travel distance at {MAX_FLIGHT_SPEED_KMH} km/h (typical
          commercial jet cruising speed). If the distance exceeds what&apos;s physically possible to
          travel in the given time, it flags the login as suspicious.
        </div>
      </CardContent>
    </Card>
  )
}
