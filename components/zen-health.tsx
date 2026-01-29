"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Activity, 
  Flame, 
  Footprints, 
  Plus, 
  Minus,
  Sparkles,
  Calendar,
  Settings2,
  RefreshCw,
  Droplets,
  X,
  Heart,
  Droplet
} from "lucide-react"
import { cn } from "@/lib/utils"
import { DiabetesHub } from "./diabetes-hub"

interface DailyLog {
  date: string
  calories: number
  steps: number
  water: number
  mood: number
  carbs?: number
  customTrackers?: Record<string, number>
}

interface ZenHealthSettings {
  glassSize: number // in ml
  trackCalories: boolean
  trackCarbs: boolean
  trackWater: boolean
  trackSteps: boolean
  customTrackers: string[]
  calorieGoal: number
  stepGoal: number
  waterGoal: number
  carbGoal: number
}

const DEFAULT_SETTINGS: ZenHealthSettings = {
  glassSize: 250,
  trackCalories: true,
  trackCarbs: false,
  trackWater: true,
  trackSteps: true,
  customTrackers: [],
  calorieGoal: 2000,
  stepGoal: 10000,
  waterGoal: 8,
  carbGoal: 250
}

const ZENHEALTH_KEY = "allergyzen_health_log"
const ZENHEALTH_SETTINGS_KEY = "allergyzen_health_settings"

export function ZenHealth() {
  const [calories, setCalories] = useState(0)
  const [carbs, setCarbs] = useState(0)
  const [steps, setSteps] = useState(0)
  const [water, setWater] = useState(0)
  const [waterMl, setWaterMl] = useState(0)
  const [settings, setSettings] = useState<ZenHealthSettings>(DEFAULT_SETTINGS)
  const [showSetup, setShowSetup] = useState(false)
  const [addCalorieAmount, setAddCalorieAmount] = useState("")
  const [addCarbAmount, setAddCarbAmount] = useState("")
  const [history, setHistory] = useState<DailyLog[]>([])
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    loadSettings()
    loadTodaysData()
  }, [])

  const loadSettings = () => {
    try {
      const stored = localStorage.getItem(ZENHEALTH_SETTINGS_KEY)
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) })
      }
    } catch {
      // Use defaults
    }
  }

  const saveSettings = (newSettings: ZenHealthSettings) => {
    setSettings(newSettings)
    localStorage.setItem(ZENHEALTH_SETTINGS_KEY, JSON.stringify(newSettings))
  }

  const loadTodaysData = () => {
    try {
      const stored = localStorage.getItem(ZENHEALTH_KEY)
      if (stored) {
        const logs: DailyLog[] = JSON.parse(stored)
        setHistory(logs)
        
        const today = new Date().toISOString().split("T")[0]
        const todayLog = logs.find(l => l.date === today)
        if (todayLog) {
          setCalories(todayLog.calories)
          setCarbs(todayLog.carbs || 0)
          setSteps(todayLog.steps)
          setWater(todayLog.water)
          setWaterMl(todayLog.water * settings.glassSize)
        }
      }
    } catch {
      // Ignore
    }
  }

  const saveTodaysData = (newCalories: number, newCarbs: number, newSteps: number, newWater: number) => {
    try {
      const today = new Date().toISOString().split("T")[0]
      let logs: DailyLog[] = []
      
      const stored = localStorage.getItem(ZENHEALTH_KEY)
      if (stored) {
        logs = JSON.parse(stored)
      }
      
      const existingIndex = logs.findIndex(l => l.date === today)
      const newLog: DailyLog = {
        date: today,
        calories: newCalories,
        carbs: newCarbs,
        steps: newSteps,
        water: newWater,
        mood: 3
      }
      
      if (existingIndex >= 0) {
        logs[existingIndex] = newLog
      } else {
        logs.unshift(newLog)
      }
      
      logs = logs.slice(0, 30)
      localStorage.setItem(ZENHEALTH_KEY, JSON.stringify(logs))
      setHistory(logs)
    } catch {
      // Ignore
    }
  }

  const addCalories = () => {
    const amount = Number.parseInt(addCalorieAmount) || 0
    if (amount > 0) {
      const newCalories = calories + amount
      setCalories(newCalories)
      saveTodaysData(newCalories, carbs, steps, water)
      setAddCalorieAmount("")
    }
  }

  const addCarbsAmount = () => {
    const amount = Number.parseInt(addCarbAmount) || 0
    if (amount > 0) {
      const newCarbs = carbs + amount
      setCarbs(newCarbs)
      saveTodaysData(calories, newCarbs, steps, water)
      setAddCarbAmount("")
    }
  }

  const addSteps = (amount: number) => {
    const newSteps = Math.max(0, steps + amount)
    setSteps(newSteps)
    saveTodaysData(calories, carbs, newSteps, water)
  }

  const addWater = (glasses: number) => {
    const newWater = Math.max(0, water + glasses)
    setWater(newWater)
    setWaterMl(newWater * settings.glassSize)
    saveTodaysData(calories, carbs, steps, newWater)
  }

  // Web Health API sync (simulated - real implementation requires platform-specific APIs)
  const syncActivity = async () => {
    setSyncing(true)
    try {
      // Check if Web Health API is available (currently limited browser support)
      if ('navigator' in window && 'health' in navigator) {
        // Future Web Health API implementation
      } else {
        // Simulated sync feedback
        await new Promise(resolve => setTimeout(resolve, 1500))
        alert("Sync Activity: Connect your device's health app in Settings to enable automatic step sync. Manual entry is available below.")
      }
    } finally {
      setSyncing(false)
    }
  }

  const caloriePercent = Math.min(100, (calories / settings.calorieGoal) * 100)
  const carbPercent = Math.min(100, (carbs / settings.carbGoal) * 100)
  const stepPercent = Math.min(100, (steps / settings.stepGoal) * 100)
  const waterPercent = Math.min(100, (water / settings.waterGoal) * 100)

  const [activeView, setActiveView] = useState<"wellness" | "diabetes">("wellness")
  const [zenSyncEnabled, setZenSyncEnabled] = useState(false)
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center py-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="w-6 h-6 text-purple-500" />
          <h1 className="text-2xl font-bold text-gray-800">ZenHealth</h1>
        </div>
        <p className="text-gray-500 italic">"It's a Lifestyle Vibe."</p>
      </div>
      
      {/* ZenHealth Sync Toggle (replaces browser popup) */}
      <Card className="border-purple-200 bg-purple-50/50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className={cn("w-4 h-4 text-purple-600", zenSyncEnabled && "animate-spin")} />
              <span className="text-sm font-medium">ZenHealth Sync</span>
            </div>
            <Switch
              checked={zenSyncEnabled}
              onCheckedChange={setZenSyncEnabled}
            />
          </div>
          {zenSyncEnabled && (
            <p className="text-xs text-purple-600 mt-2">Syncing with device health apps...</p>
          )}
        </CardContent>
      </Card>
      
      {/* View Toggle: Wellness vs Diabetes */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <button
          onClick={() => setActiveView("wellness")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-all",
            activeView === "wellness"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Activity className="w-4 h-4" />
          Wellness
        </button>
        <button
          onClick={() => setActiveView("diabetes")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-all",
            activeView === "diabetes"
              ? "bg-teal-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Droplet className="w-4 h-4" />
          Diabetes
        </button>
      </div>
      
      {/* Conditional Content */}
      {activeView === "diabetes" ? (
        <DiabetesHub />
      ) : (
        <div>
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowSetup(!showSetup)}
              variant="outline"
              className="flex-1 border-2 border-gray-800 text-gray-800 hover:bg-gray-100 bg-transparent"
            >
              <Settings2 className="w-4 h-4 mr-2" />
              Set Up My Day
            </Button>
            <Button 
              onClick={syncActivity}
              disabled={syncing}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", syncing && "animate-spin")} />
              {syncing ? "Syncing..." : "Sync Activity"}
            </Button>
          </div>

          {/* Setup Panel */}
          {showSetup && (
            <Card className="border-2 border-gray-800 bg-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Set Up My Day</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowSetup(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <CardDescription>Choose what you want to track today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tracking Options */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">Track Today:</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: "trackCalories", label: "Calories", icon: Flame },
                      { key: "trackCarbs", label: "Carbs", icon: Activity },
                      { key: "trackWater", label: "Water", icon: Droplets },
                      { key: "trackSteps", label: "Steps", icon: Footprints },
                    ].map(item => (
                      <label
                        key={item.key}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                          settings[item.key as keyof ZenHealthSettings]
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <Checkbox
                          checked={settings[item.key as keyof ZenHealthSettings] as boolean}
                          onCheckedChange={(checked) => {
                            saveSettings({ ...settings, [item.key]: checked })
                          }}
                        />
                        <item.icon className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Glass Size Calibration */}
                <div className="space-y-2">
                  <Label htmlFor="glass-size" className="text-sm font-semibold text-gray-700">
                    My Glass Size (ml)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="glass-size"
                      type="number"
                      value={settings.glassSize}
                      onChange={(e) => saveSettings({ ...settings, glassSize: Number(e.target.value) || 250 })}
                      className="flex-1 border-2 border-gray-300"
                    />
                    <div className="flex gap-1">
                      {[200, 250, 300, 350].map(size => (
                        <Button
                          key={size}
                          variant="outline"
                          size="sm"
                          onClick={() => saveSettings({ ...settings, glassSize: size })}
                          className={cn(
                            "border-2",
                            settings.glassSize === size 
                              ? "border-purple-500 bg-purple-50" 
                              : "border-gray-300"
                          )}
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Current: {settings.glassSize}ml per glass = {settings.waterGoal * settings.glassSize}ml daily goal
                  </p>
                </div>

                {/* Goals */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Calorie Goal</Label>
                    <Input
                      type="number"
                      value={settings.calorieGoal}
                      onChange={(e) => saveSettings({ ...settings, calorieGoal: Number(e.target.value) || 2000 })}
                      className="border-2 border-gray-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Step Goal</Label>
                    <Input
                      type="number"
                      value={settings.stepGoal}
                      onChange={(e) => saveSettings({ ...settings, stepGoal: Number(e.target.value) || 10000 })}
                      className="border-2 border-gray-300"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Daily Overview */}
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                Today's Progress
              </CardTitle>
              <CardDescription>Track your daily wellness journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Calories */}
              {settings.trackCalories && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <span className="font-semibold text-gray-700">Calories</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {calories} / {settings.calorieGoal} kcal
                    </span>
                  </div>
                  <Progress value={caloriePercent} className="h-3" />
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Add calories"
                      value={addCalorieAmount}
                      onChange={(e) => setAddCalorieAmount(e.target.value)}
                      className="flex-1 border-2 border-gray-300"
                    />
                    <Button onClick={addCalories} size="sm" className="bg-orange-500 hover:bg-orange-600">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Carbs */}
              {settings.trackCarbs && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-amber-500" />
                      <span className="font-semibold text-gray-700">Carbs</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {carbs} / {settings.carbGoal}g
                    </span>
                  </div>
                  <Progress value={carbPercent} className="h-3" />
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Add carbs (g)"
                      value={addCarbAmount}
                      onChange={(e) => setAddCarbAmount(e.target.value)}
                      className="flex-1 border-2 border-gray-300"
                    />
                    <Button onClick={addCarbsAmount} size="sm" className="bg-amber-500 hover:bg-amber-600">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Steps */}
              {settings.trackSteps && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Footprints className="w-5 h-5 text-green-500" />
                      <span className="font-semibold text-gray-700">Steps</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {steps.toLocaleString()} / {settings.stepGoal.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={stepPercent} className="h-3" />
                  <div className="flex gap-2 justify-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addSteps(-500)}
                      className="border-2 border-gray-800 text-gray-800"
                    >
                      <Minus className="w-4 h-4 mr-1" />500
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => addSteps(500)}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Plus className="w-4 h-4 mr-1" />500
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => addSteps(1000)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />1K
                    </Button>
                  </div>
                </div>
              )}

              {/* Water */}
              {settings.trackWater && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-blue-500" />
                      <span className="font-semibold text-gray-700">Water</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {water} glasses ({waterMl}ml) / {settings.waterGoal} glasses
                    </span>
                  </div>
                  <Progress value={waterPercent} className="h-3" />
                  <div className="flex gap-2 justify-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addWater(-1)}
                      className="border-2 border-gray-800 text-gray-800"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    {[1, 2, 3].map(amount => (
                      <Button 
                        key={amount}
                        size="sm" 
                        onClick={() => addWater(amount)}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <Plus className="w-4 h-4 mr-1" />{amount}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Wellness Insights */}
          <Card className="border-2 border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Zen Insight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-purple-50 border-2 border-purple-100">
                {calories === 0 && steps === 0 && water === 0 ? (
                  <p className="text-gray-600 text-center">
                    Start logging to receive personalized wellness insights.
                  </p>
                ) : caloriePercent >= 80 && stepPercent >= 80 && waterPercent >= 80 ? (
                  <div className="text-center">
                    <p className="text-green-600 font-semibold mb-1">Amazing Progress!</p>
                    <p className="text-gray-600 text-sm">
                      You're crushing your goals today. Keep up the incredible work!
                    </p>
                  </div>
                ) : stepPercent < 50 ? (
                  <div className="text-center">
                    <p className="text-purple-600 font-semibold mb-1">Movement Reminder</p>
                    <p className="text-gray-600 text-sm">
                      A short walk can boost your mood and energy. Every step counts!
                    </p>
                  </div>
                ) : waterPercent < 50 ? (
                  <div className="text-center">
                    <p className="text-blue-600 font-semibold mb-1">Hydration Check</p>
                    <p className="text-gray-600 text-sm">
                      Stay hydrated for optimal wellness. Your body will thank you!
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-purple-600 font-semibold mb-1">Keep Going!</p>
                    <p className="text-gray-600 text-sm">
                      You're making progress. Small consistent actions lead to big results.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            {settings.trackCalories && (
              <Card className={cn(
                "text-center p-3 border-2",
                caloriePercent >= 100 ? "bg-orange-50 border-orange-200" : "bg-white border-gray-200"
              )}>
                <Flame className="w-6 h-6 mx-auto text-orange-500 mb-1" />
                <p className="text-xl font-bold text-gray-800">{Math.round(caloriePercent)}%</p>
                <p className="text-xs text-gray-500">Calories</p>
              </Card>
            )}
            {settings.trackSteps && (
              <Card className={cn(
                "text-center p-3 border-2",
                stepPercent >= 100 ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
              )}>
                <Footprints className="w-6 h-6 mx-auto text-green-500 mb-1" />
                <p className="text-xl font-bold text-gray-800">{Math.round(stepPercent)}%</p>
                <p className="text-xs text-gray-500">Steps</p>
              </Card>
            )}
            {settings.trackWater && (
              <Card className={cn(
                "text-center p-3 border-2",
                waterPercent >= 100 ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
              )}>
                <Droplets className="w-6 h-6 mx-auto text-blue-500 mb-1" />
                <p className="text-xl font-bold text-gray-800">{Math.round(waterPercent)}%</p>
                <p className="text-xs text-gray-500">Water</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
