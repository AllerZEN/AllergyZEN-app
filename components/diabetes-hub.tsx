"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Droplet, 
  Pill,
  Syringe,
  Plus,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  History
} from "lucide-react"
import { cn } from "@/lib/utils"

interface BloodSugarReading {
  id: string
  value: number
  timestamp: string
  type: "fasting" | "pre-meal" | "post-meal" | "bedtime" | "random"
  notes?: string
}

interface MedicationLog {
  id: string
  type: "insulin" | "medication"
  name?: string
  dose?: string
  timestamp: string
  taken: boolean
}

interface DiabetesData {
  bloodSugarReadings: BloodSugarReading[]
  medicationLogs: MedicationLog[]
  carbsToday: number
  caloriesFromFood: number
  lastUpdated: string
}

const DIABETES_STORAGE_KEY = "allergyzen_diabetes_data"

// Blood sugar level ranges (mg/dL)
const BLOOD_SUGAR_RANGES = {
  low: { max: 70, label: "Low", color: "text-amber-600", bg: "bg-amber-100" },
  target: { min: 70, max: 130, label: "Target", color: "text-green-600", bg: "bg-green-100" },
  elevated: { min: 130, max: 180, label: "Elevated", color: "text-amber-500", bg: "bg-amber-50" },
  high: { min: 180, label: "High", color: "text-red-600", bg: "bg-red-100" }
}

const READING_TYPES = [
  { id: "fasting", label: "Fasting" },
  { id: "pre-meal", label: "Pre-Meal" },
  { id: "post-meal", label: "Post-Meal" },
  { id: "bedtime", label: "Bedtime" },
  { id: "random", label: "Random" }
] as const

export function DiabetesHub() {
  const [data, setData] = useState<DiabetesData>({
    bloodSugarReadings: [],
    medicationLogs: [],
    carbsToday: 0,
    caloriesFromFood: 0,
    lastUpdated: new Date().toISOString()
  })
  
  const [newReading, setNewReading] = useState("")
  const [readingType, setReadingType] = useState<BloodSugarReading["type"]>("random")
  const [showHistory, setShowHistory] = useState(false)
  const [insulinTaken, setInsulinTaken] = useState(false)
  const [medicationTaken, setMedicationTaken] = useState(false)
  
  // Load data on mount
  useEffect(() => {
    loadData()
    // Listen for food scan events to auto-populate carbs/calories
    const handleFoodScan = (event: CustomEvent<{ carbs: number; calories: number }>) => {
      if (event.detail) {
        addFoodData(event.detail.carbs, event.detail.calories)
      }
    }
    window.addEventListener("allergyzen:food-scanned" as keyof WindowEventMap, handleFoodScan as EventListener)
    return () => window.removeEventListener("allergyzen:food-scanned" as keyof WindowEventMap, handleFoodScan as EventListener)
  }, [])
  
  const loadData = () => {
    try {
      const stored = localStorage.getItem(DIABETES_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Filter to today's data
        const today = new Date().toISOString().split("T")[0]
        const todayReadings = parsed.bloodSugarReadings?.filter(
          (r: BloodSugarReading) => r.timestamp.startsWith(today)
        ) || []
        const todayMeds = parsed.medicationLogs?.filter(
          (m: MedicationLog) => m.timestamp.startsWith(today)
        ) || []
        
        setData({
          ...parsed,
          bloodSugarReadings: todayReadings,
          medicationLogs: todayMeds
        })
        
        // Check if insulin/medication logged today
        setInsulinTaken(todayMeds.some((m: MedicationLog) => m.type === "insulin" && m.taken))
        setMedicationTaken(todayMeds.some((m: MedicationLog) => m.type === "medication" && m.taken))
      }
    } catch {
      // Ignore
    }
  }
  
  const saveData = (newData: DiabetesData) => {
    try {
      // Merge with existing historical data
      const stored = localStorage.getItem(DIABETES_STORAGE_KEY)
      const existingData = stored ? JSON.parse(stored) : { bloodSugarReadings: [], medicationLogs: [] }
      
      // Keep last 30 days of readings
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const mergedReadings = [
        ...existingData.bloodSugarReadings.filter(
          (r: BloodSugarReading) => new Date(r.timestamp) > thirtyDaysAgo
        ),
        ...newData.bloodSugarReadings.filter(
          (r: BloodSugarReading) => !existingData.bloodSugarReadings.some((e: BloodSugarReading) => e.id === r.id)
        )
      ]
      
      const mergedMeds = [
        ...existingData.medicationLogs.filter(
          (m: MedicationLog) => new Date(m.timestamp) > thirtyDaysAgo
        ),
        ...newData.medicationLogs.filter(
          (m: MedicationLog) => !existingData.medicationLogs.some((e: MedicationLog) => e.id === m.id)
        )
      ]
      
      const fullData = {
        ...newData,
        bloodSugarReadings: mergedReadings,
        medicationLogs: mergedMeds,
        lastUpdated: new Date().toISOString()
      }
      
      localStorage.setItem(DIABETES_STORAGE_KEY, JSON.stringify(fullData))
      setData(newData)
    } catch {
      // Ignore
    }
  }
  
  const addBloodSugarReading = () => {
    const value = Number.parseFloat(newReading)
    if (Number.isNaN(value) || value <= 0) return
    
    const reading: BloodSugarReading = {
      id: crypto.randomUUID(),
      value,
      timestamp: new Date().toISOString(),
      type: readingType
    }
    
    const newReadings = [reading, ...data.bloodSugarReadings]
    saveData({ ...data, bloodSugarReadings: newReadings })
    setNewReading("")
  }
  
  const toggleInsulin = (taken: boolean) => {
    setInsulinTaken(taken)
    const log: MedicationLog = {
      id: crypto.randomUUID(),
      type: "insulin",
      timestamp: new Date().toISOString(),
      taken
    }
    const newLogs = [log, ...data.medicationLogs.filter(m => m.type !== "insulin")]
    saveData({ ...data, medicationLogs: newLogs })
  }
  
  const toggleMedication = (taken: boolean) => {
    setMedicationTaken(taken)
    const log: MedicationLog = {
      id: crypto.randomUUID(),
      type: "medication",
      timestamp: new Date().toISOString(),
      taken
    }
    const newLogs = [log, ...data.medicationLogs.filter(m => m.type !== "medication")]
    saveData({ ...data, medicationLogs: newLogs })
  }
  
  // Auto-flow from food scans
  const addFoodData = (carbs: number, calories: number) => {
    const newData = {
      ...data,
      carbsToday: data.carbsToday + carbs,
      caloriesFromFood: data.caloriesFromFood + calories
    }
    saveData(newData)
  }
  
  // Get blood sugar status
  const getBloodSugarStatus = (value: number) => {
    if (value < BLOOD_SUGAR_RANGES.low.max) return BLOOD_SUGAR_RANGES.low
    if (value <= BLOOD_SUGAR_RANGES.target.max) return BLOOD_SUGAR_RANGES.target
    if (value <= BLOOD_SUGAR_RANGES.elevated.max) return BLOOD_SUGAR_RANGES.elevated
    return BLOOD_SUGAR_RANGES.high
  }
  
  const latestReading = data.bloodSugarReadings[0]
  const latestStatus = latestReading ? getBloodSugarStatus(latestReading.value) : null
  
  // Calculate daily average
  const dailyAverage = data.bloodSugarReadings.length > 0
    ? Math.round(data.bloodSugarReadings.reduce((sum, r) => sum + r.value, 0) / data.bloodSugarReadings.length)
    : null
  
  // Format time
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", { 
      hour: "numeric", 
      minute: "2-digit",
      hour12: true 
    })
  }
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center py-2">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Droplet className="w-6 h-6 text-teal-500" />
          <h1 className="text-xl font-bold text-gray-800">Diabetes Hub</h1>
        </div>
        <p className="text-sm text-gray-500">Track blood sugar, insulin, and carbs</p>
      </div>
      
      {/* Current Status Card */}
      <Card className={cn(
        "border-2",
        latestStatus?.bg || "bg-gray-50",
        latestStatus ? "border-current" : "border-gray-200"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Latest Reading</p>
              {latestReading ? (
                <div className="flex items-baseline gap-2">
                  <span className={cn("text-4xl font-bold", latestStatus?.color)}>
                    {latestReading.value}
                  </span>
                  <span className="text-gray-500">mg/dL</span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-400">--</p>
              )}
            </div>
            {latestStatus && (
              <Badge className={cn(latestStatus.bg, latestStatus.color, "border-0")}>
                {latestStatus.label}
              </Badge>
            )}
          </div>
          
          {latestReading && (
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(latestReading.timestamp)}
              </span>
              <span className="capitalize">{latestReading.type.replace("-", " ")}</span>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Blood Sugar Log */}
      <Card className="border-teal-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Droplet className="w-4 h-4 text-teal-500" />
            Blood Sugar Log
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Enter reading (mg/dL)"
                value={newReading}
                onChange={(e) => setNewReading(e.target.value)}
                className="border-2 border-gray-200"
              />
            </div>
            <Button 
              onClick={addBloodSugarReading}
              disabled={!newReading}
              className="bg-teal-500 hover:bg-teal-600"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Reading Type Selection */}
          <div className="flex flex-wrap gap-2">
            {READING_TYPES.map(type => (
              <Badge
                key={type.id}
                variant={readingType === type.id ? "default" : "outline"}
                className={cn(
                  "cursor-pointer",
                  readingType === type.id && "bg-teal-500"
                )}
                onClick={() => setReadingType(type.id)}
              >
                {type.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Medication Tracking */}
      <Card className="border-purple-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Pill className="w-4 h-4 text-purple-500" />
            Medication Tracking
          </CardTitle>
          <CardDescription>Toggle when you take your medication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Insulin Toggle */}
          <div className={cn(
            "flex items-center justify-between p-4 rounded-lg border-2 transition-all",
            insulinTaken 
              ? "border-green-500 bg-green-50" 
              : "border-gray-200"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                insulinTaken ? "bg-green-500/20" : "bg-gray-100"
              )}>
                <Syringe className={cn(
                  "w-5 h-5",
                  insulinTaken ? "text-green-600" : "text-gray-500"
                )} />
              </div>
              <div>
                <Label className="font-semibold">Insulin Taken</Label>
                {insulinTaken && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Logged at {formatTime(new Date().toISOString())}
                  </p>
                )}
              </div>
            </div>
            <Switch
              checked={insulinTaken}
              onCheckedChange={toggleInsulin}
            />
          </div>
          
          {/* Medication Toggle */}
          <div className={cn(
            "flex items-center justify-between p-4 rounded-lg border-2 transition-all",
            medicationTaken 
              ? "border-green-500 bg-green-50" 
              : "border-gray-200"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                medicationTaken ? "bg-green-500/20" : "bg-gray-100"
              )}>
                <Pill className={cn(
                  "w-5 h-5",
                  medicationTaken ? "text-green-600" : "text-gray-500"
                )} />
              </div>
              <div>
                <Label className="font-semibold">Medication Taken</Label>
                {medicationTaken && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Logged at {formatTime(new Date().toISOString())}
                  </p>
                )}
              </div>
            </div>
            <Switch
              checked={medicationTaken}
              onCheckedChange={toggleMedication}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Auto-Tracked from Food Scans */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            Today's Intake (Auto-Tracked)
          </CardTitle>
          <CardDescription>From scanned/selected food items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-white border">
              <p className="text-2xl font-bold text-amber-600">{data.carbsToday}g</p>
              <p className="text-xs text-gray-500">Carbohydrates</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white border">
              <p className="text-2xl font-bold text-orange-600">{data.caloriesFromFood}</p>
              <p className="text-xs text-gray-500">Calories</p>
            </div>
          </div>
          <p className="text-xs text-center text-gray-500 mt-3">
            Scan food items in the Safe Tab to auto-populate
          </p>
        </CardContent>
      </Card>
      
      {/* Daily Summary */}
      {data.bloodSugarReadings.length > 0 && (
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                Today's Summary
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="text-xs"
              >
                <History className="w-4 h-4 mr-1" />
                {showHistory ? "Hide" : "History"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-800">{data.bloodSugarReadings.length}</p>
                <p className="text-xs text-gray-500">Readings</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-teal-600">{dailyAverage || "--"}</p>
                <p className="text-xs text-gray-500">Avg mg/dL</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-800">
                  {Math.round(
                    (data.bloodSugarReadings.filter(r => {
                      const status = getBloodSugarStatus(r.value)
                      return status.label === "Target"
                    }).length / data.bloodSugarReadings.length) * 100
                  )}%
                </p>
                <p className="text-xs text-gray-500">In Target</p>
              </div>
            </div>
            
            {showHistory && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {data.bloodSugarReadings.map(reading => {
                  const status = getBloodSugarStatus(reading.value)
                  return (
                    <div 
                      key={reading.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          status.label === "Target" && "bg-green-500",
                          status.label === "Low" && "bg-amber-500",
                          status.label === "Elevated" && "bg-amber-400",
                          status.label === "High" && "bg-red-500"
                        )} />
                        <span className="font-medium">{reading.value} mg/dL</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(reading.timestamp)} - {reading.type.replace("-", " ")}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Alert for out-of-range readings */}
      {latestReading && (getBloodSugarStatus(latestReading.value).label === "Low" || getBloodSugarStatus(latestReading.value).label === "High") && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-semibold text-red-700">
                  {getBloodSugarStatus(latestReading.value).label === "Low" 
                    ? "Blood Sugar Low" 
                    : "Blood Sugar High"}
                </p>
                <p className="text-sm text-red-600">
                  {getBloodSugarStatus(latestReading.value).label === "Low"
                    ? "Consider having a fast-acting carbohydrate and retest in 15 minutes."
                    : "Consider checking your medication and consulting your care plan."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DiabetesHub
