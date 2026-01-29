"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Plus, Minus, X, Sparkles, Flame, Heart, 
  TrendingUp, TrendingDown, Sun, Check, Wallet, PiggyBank, Receipt
} from "lucide-react"

interface Habit {
  id: string
  name: string
  type: "good" | "bad"
  streak: number
  lastUpdated: string
}

// Habit Ledger - Money Management
interface HabitTransaction {
  id: string
  habitId: string
  habitName: string
  type: "cost" | "saving"
  amount: number
  note: string
  date: string
}

interface CustomTracker {
  id: string
  name: string
  unit: string
  goal: number
  current: number
  icon: string
}

console.log("[v0] ZenHabits module loading...")

const STORAGE_KEY = "allergyzen_habits"
const TRACKER_KEY = "allergyzen_custom_trackers"
const INSIGHT_KEY = "allergyzen_daily_insight"
const LEDGER_KEY = "allergyzen_habit_ledger"

const HAPPINESS_INSIGHTS = [
  "Balance tip: Start your morning with gratitude - name 3 things you're thankful for.",
  "Mind-body connection: Your food choices affect your mood. Celebrate a safe meal win today!",
  "Release reminder: Holding onto anger affects digestion. Take 3 deep breaths.",
  "Progress note: Every day without a trigger is a victory. You're doing amazing.",
  "Self-care: Reducing sugar improves mental clarity. Notice how you feel today.",
  "Gratitude boost: Thank your body for working hard to keep you safe.",
  "Mindful eating: Slow down and savor your safe foods - they're your allies.",
  "Energy tip: Replace one processed snack with a whole food today.",
]

export function ZenHabits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [trackers, setTrackers] = useState<CustomTracker[]>([])
  const [newHabitName, setNewHabitName] = useState("")
  const [newHabitType, setNewHabitType] = useState<"good" | "bad">("good")
  const [showAddTracker, setShowAddTracker] = useState(false)
  const [newTrackerName, setNewTrackerName] = useState("")
  const [newTrackerUnit, setNewTrackerUnit] = useState("")
  const [newTrackerGoal, setNewTrackerGoal] = useState(100)
  const [dailyInsight, setDailyInsight] = useState("")
  const [showInsight, setShowInsight] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Habit Ledger state
  const [transactions, setTransactions] = useState<HabitTransaction[]>([])
  const [showLedger, setShowLedger] = useState(false)
  const [ledgerAmount, setLedgerAmount] = useState("")
  const [ledgerNote, setLedgerNote] = useState("")
  const [ledgerType, setLedgerType] = useState<"cost" | "saving">("cost")
  const [selectedHabitForLedger, setSelectedHabitForLedger] = useState<string>("")

  const loadLedger = () => {
    try {
      const stored = localStorage.getItem(LEDGER_KEY)
      if (stored) {
        setTransactions(JSON.parse(stored))
      } else {
        // Default transactions
        const defaults: HabitTransaction[] = []
        setTransactions(defaults)
        localStorage.setItem(LEDGER_KEY, JSON.stringify(defaults))
      }
    } catch {
      // Ignore
    }
  }

  useEffect(() => {
    setMounted(true)
    loadHabits()
    loadTrackers()
    loadLedger()
    checkDailyInsight()
  }, [])

  const loadHabits = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setHabits(JSON.parse(stored))
      } else {
        // Default habits
        const defaults: Habit[] = [
          { id: "1", name: "Practice Gratitude", type: "good", streak: 0, lastUpdated: "" },
          { id: "2", name: "New Food Win", type: "good", streak: 0, lastUpdated: "" },
          { id: "3", name: "Sugar Intake", type: "bad", streak: 0, lastUpdated: "" },
        ]
        setHabits(defaults)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults))
      }
    } catch {
      // Ignore
    }
  }

  const loadTrackers = () => {
    try {
      const stored = localStorage.getItem(TRACKER_KEY)
      if (stored) {
        setTrackers(JSON.parse(stored))
      } else {
        // Default trackers
        const defaults: CustomTracker[] = [
          { id: "cal", name: "Calories", unit: "kcal", goal: 2000, current: 0, icon: "flame" },
          { id: "carb", name: "Carbs", unit: "g", goal: 250, current: 0, icon: "wheat" },
        ]
        setTrackers(defaults)
        localStorage.setItem(TRACKER_KEY, JSON.stringify(defaults))
      }
    } catch {
      // Ignore
    }
  }

  const checkDailyInsight = () => {
    const today = new Date().toDateString()
    const lastShown = localStorage.getItem(INSIGHT_KEY)
    
    if (lastShown !== today) {
      const randomInsight = HAPPINESS_INSIGHTS[Math.floor(Math.random() * HAPPINESS_INSIGHTS.length)]
      setDailyInsight(randomInsight)
      setShowInsight(true)
    }
  }
  
  const saveLedger = (updated: HabitTransaction[]) => {
    setTransactions(updated)
    localStorage.setItem(LEDGER_KEY, JSON.stringify(updated))
  }
  
  const addTransaction = () => {
    if (!ledgerAmount || !selectedHabitForLedger) return
    
    const habit = habits.find(h => h.id === selectedHabitForLedger)
    if (!habit) return
    
    const newTransaction: HabitTransaction = {
      id: crypto.randomUUID(),
      habitId: habit.id,
      habitName: habit.name,
      type: ledgerType,
      amount: parseFloat(ledgerAmount),
      note: ledgerNote,
      date: new Date().toISOString()
    }
    
    saveLedger([...transactions, newTransaction])
    setLedgerAmount("")
    setLedgerNote("")
    setSelectedHabitForLedger("")
  }
  
  const removeTransaction = (id: string) => {
    saveLedger(transactions.filter(t => t.id !== id))
  }
  
  // Calculate weekly summary
  const getWeeklySummary = () => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const weeklyTransactions = transactions.filter(
      t => new Date(t.date) >= oneWeekAgo
    )
    
    const moneyLeak = weeklyTransactions
      .filter(t => t.type === "cost")
      .reduce((sum, t) => sum + t.amount, 0)
    
    const moneyRetained = weeklyTransactions
      .filter(t => t.type === "saving")
      .reduce((sum, t) => sum + t.amount, 0)
    
    return {
      moneyLeak,
      moneyRetained,
      netWellnessWealth: moneyRetained - moneyLeak
    }
  }

  const dismissInsight = () => {
    const today = new Date().toDateString()
    localStorage.setItem(INSIGHT_KEY, today)
    setShowInsight(false)
  }

  const saveHabits = (updated: Habit[]) => {
    setHabits(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const saveTrackers = (updated: CustomTracker[]) => {
    setTrackers(updated)
    localStorage.setItem(TRACKER_KEY, JSON.stringify(updated))
  }

  const addHabit = () => {
    if (!newHabitName.trim()) return
    
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: newHabitName.trim(),
      type: newHabitType,
      streak: 0,
      lastUpdated: ""
    }
    
    saveHabits([...habits, newHabit])
    setNewHabitName("")
  }

  const updateStreak = (id: string, increment: boolean) => {
    const updated = habits.map(h => {
      if (h.id === id) {
        return {
          ...h,
          streak: increment ? h.streak + 1 : Math.max(0, h.streak - 1),
          lastUpdated: new Date().toISOString()
        }
      }
      return h
    })
    saveHabits(updated)
  }

  const removeHabit = (id: string) => {
    saveHabits(habits.filter(h => h.id !== id))
  }

  const addTracker = () => {
    if (!newTrackerName.trim()) return
    
    const newTracker: CustomTracker = {
      id: crypto.randomUUID(),
      name: newTrackerName.trim(),
      unit: newTrackerUnit || "units",
      goal: newTrackerGoal,
      current: 0,
      icon: "chart"
    }
    
    saveTrackers([...trackers, newTracker])
    setNewTrackerName("")
    setNewTrackerUnit("")
    setNewTrackerGoal(100)
    setShowAddTracker(false)
  }

  const updateTracker = (id: string, amount: number) => {
    const updated = trackers.map(t => {
      if (t.id === id) {
        return { ...t, current: Math.max(0, t.current + amount) }
      }
      return t
    })
    saveTrackers(updated)
  }

  const removeTracker = (id: string) => {
    saveTrackers(trackers.filter(t => t.id !== id))
  }

  if (!mounted) return null

  const goodHabits = habits.filter(h => h.type === "good")
  const badHabits = habits.filter(h => h.type === "bad")

  return (
    <div className="space-y-4">
      {/* Daily Happiness Insight Popup */}
      {showInsight && (
        <Card className="border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                <Sun className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-purple-800 mb-1">Daily Happiness Insight</h4>
                <p className="text-sm text-gray-700">{dailyInsight}</p>
              </div>
              <button onClick={dismissInsight} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Trackers */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Custom Trackers
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => setShowAddTracker(!showAddTracker)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription>Track calories, carbs, additives like E1202, etc.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {showAddTracker && (
            <div className="p-3 bg-gray-50 rounded-lg space-y-2">
              <Input
                placeholder="Tracker name (e.g., E1202)"
                value={newTrackerName}
                onChange={(e) => setNewTrackerName(e.target.value)}
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Unit (g, mg, kcal)"
                  value={newTrackerUnit}
                  onChange={(e) => setNewTrackerUnit(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Goal"
                  value={newTrackerGoal}
                  onChange={(e) => setNewTrackerGoal(Number(e.target.value))}
                  className="w-24"
                />
              </div>
              <Button onClick={addTracker} size="sm" className="w-full">Add Tracker</Button>
            </div>
          )}

          {trackers.map(tracker => (
            <div key={tracker.id} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{tracker.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {tracker.current} / {tracker.goal} {tracker.unit}
                  </span>
                  <button onClick={() => removeTracker(tracker.id)} className="text-gray-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <Progress value={(tracker.current / tracker.goal) * 100} className="h-2 mb-2" />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => updateTracker(tracker.id, -10)}>
                  <Minus className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => updateTracker(tracker.id, 10)}>
                  <Plus className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => updateTracker(tracker.id, 50)}>
                  +50
                </Button>
                <Button size="sm" variant="outline" onClick={() => updateTracker(tracker.id, 100)}>
                  +100
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Habit Ledger - Money Management */}
      <Card className="border-amber-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
              <Wallet className="w-5 h-5" />
              Habit Ledger
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => setShowLedger(!showLedger)} className="bg-transparent">
              {showLedger ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </Button>
          </div>
          <CardDescription>Track costs and savings from your habits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Weekly Summary */}
          {(() => {
            const summary = getWeeklySummary()
            return (
              <div className="grid grid-cols-3 gap-2 p-3 bg-amber-50 rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-red-600">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-xs font-medium">Money Leak</span>
                  </div>
                  <p className="text-lg font-bold text-red-700">-{summary.moneyLeak.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-green-600">
                    <PiggyBank className="w-4 h-4" />
                    <span className="text-xs font-medium">Retained</span>
                  </div>
                  <p className="text-lg font-bold text-green-700">+{summary.moneyRetained.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-600">
                    <Wallet className="w-4 h-4" />
                    <span className="text-xs font-medium">Net Wealth</span>
                  </div>
                  <p className={`text-lg font-bold ${summary.netWellnessWealth >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {summary.netWellnessWealth >= 0 ? '+' : ''}{summary.netWellnessWealth.toFixed(2)}
                  </p>
                </div>
              </div>
            )
          })()}
          
          {/* Add Transaction Form */}
          {showLedger && (
            <div className="p-3 bg-gray-50 rounded-lg space-y-2">
              <select
                value={selectedHabitForLedger}
                onChange={(e) => setSelectedHabitForLedger(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-white text-sm"
              >
                <option value="">Select a habit...</option>
                {habits.map(h => (
                  <option key={h.id} value={h.id}>{h.name} ({h.type})</option>
                ))}
              </select>
              <div className="flex gap-2">
                <select
                  value={ledgerType}
                  onChange={(e) => setLedgerType(e.target.value as "cost" | "saving")}
                  className="px-3 py-2 border rounded-md bg-white text-sm"
                >
                  <option value="cost">Cost (Money Leak)</option>
                  <option value="saving">Saving (Retained)</option>
                </select>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={ledgerAmount}
                  onChange={(e) => setLedgerAmount(e.target.value)}
                  className="flex-1"
                />
              </div>
              <Input
                placeholder="Note (e.g., 'Bought 20 JPS')"
                value={ledgerNote}
                onChange={(e) => setLedgerNote(e.target.value)}
              />
              <Button onClick={addTransaction} size="sm" className="w-full">
                <Receipt className="w-4 h-4 mr-2" />
                Log Transaction
              </Button>
            </div>
          )}
          
          {/* Recent Transactions */}
          {transactions.slice(-5).reverse().map(t => (
            <div key={t.id} className="flex items-center justify-between p-2 bg-white border rounded-lg text-sm">
              <div className="flex items-center gap-2">
                {t.type === "cost" ? (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                ) : (
                  <PiggyBank className="w-4 h-4 text-green-500" />
                )}
                <div>
                  <p className="font-medium">{t.habitName}</p>
                  {t.note && <p className="text-xs text-gray-500">{t.note}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${t.type === "cost" ? "text-red-600" : "text-green-600"}`}>
                  {t.type === "cost" ? "-" : "+"}{t.amount.toFixed(2)}
                </span>
                <button onClick={() => removeTransaction(t.id)} className="text-gray-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Good Habits to Strengthen */}
      <Card className="border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-green-700">
            <Sparkles className="w-5 h-5" />
            Good Habits to Strengthen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {goodHabits.map(habit => (
            <div key={habit.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-green-500" />
                <span>{habit.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{habit.streak} day streak</Badge>
                <Button size="sm" variant="ghost" onClick={() => updateStreak(habit.id, true)}>
                  <Check className="w-4 h-4 text-green-600" />
                </Button>
                <button onClick={() => removeHabit(habit.id)} className="text-gray-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Bad Habits to Release */}
      <Card className="border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-red-700">
            <Flame className="w-5 h-5" />
            Bad Habits to Release
          </CardTitle>
          <CardDescription>Smoking, sugar, anger - track days without</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {badHabits.map(habit => (
            <div key={habit.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span>{habit.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{habit.streak} days free</Badge>
                <Button size="sm" variant="ghost" onClick={() => updateStreak(habit.id, true)}>
                  <Check className="w-4 h-4 text-green-600" />
                </Button>
                <button onClick={() => removeHabit(habit.id)} className="text-gray-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Add New Habit */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add new habit..."
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addHabit()}
            />
            <select
              value={newHabitType}
              onChange={(e) => setNewHabitType(e.target.value as "good" | "bad")}
              className="px-3 py-2 border rounded-md bg-white"
            >
              <option value="good">Good</option>
              <option value="bad">Bad</option>
            </select>
            <Button onClick={addHabit}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
