"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Plus, Minus, X, Sparkles, Flame, Heart, 
  TrendingUp, TrendingDown, Sun, Check, Wallet, PiggyBank, Receipt, ArrowLeft
} from "lucide-react"

/**
 * ALLERGYZEN WELLNESS ASSISTANT - ZEN HABITS COMPONENT
 * Features: Habit Tracker, Money Ledger, Custom E-Number/Calorie Trackers
 * Version: 2.0.1 (Handshake Integrated)
 */

interface Habit {
  id: string
  name: string
  type: "good" | "bad"
  streak: number
  lastUpdated: string
}

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
  "Skin Zen: Hydration is the best internal moisturizer. Drink a glass of water now.",
  "Mood Check: If you're feeling overwhelmed, identify one sensory trigger you can remove.",
  "Victory Lap: You avoided a 'Red' item today. That's a direct win for your future self.",
  "Zen Thought: Your allergies are not a burden, they are a high-fidelity navigation system.",
  "Habit Hook: Tie your gratitude practice to your morning shield-check."
]

// FIXED: Export default and Prop injection for Navigation
export default function ZenHabits({ onBack }: { onBack: () => void }) {
  // --- STATE MANAGEMENT ---
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
  
  // Ledger State
  const [transactions, setTransactions] = useState<HabitTransaction[]>([])
  const [showLedger, setShowLedger] = useState(false)
  const [ledgerAmount, setLedgerAmount] = useState("")
  const [ledgerNote, setLedgerNote] = useState("")
  const [ledgerType, setLedgerType] = useState<"cost" | "saving">("cost")
  const [selectedHabitForLedger, setSelectedHabitForLedger] = useState<string>("")

  // --- INITIALIZATION ---
  useEffect(() => {
    setMounted(true)
    loadHabits()
    loadTrackers()
    loadLedger()
    checkDailyInsight()
    console.log("[allergyZEN] ZenHabits Initialized with Ledger v2.0");
  }, [])

  // --- DATA PERSISTENCE HELPERS ---
  const loadHabits = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setHabits(JSON.parse(stored))
      } else {
        const defaults: Habit[] = [
          { id: "1", name: "Practice Gratitude", type: "good", streak: 0, lastUpdated: "" },
          { id: "2", name: "Safe Meal Victory", type: "good", streak: 0, lastUpdated: "" },
          { id: "3", name: "Sugar Intake Control", type: "bad", streak: 0, lastUpdated: "" },
        ]
        setHabits(defaults)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults))
      }
    } catch (e) { console.error("Habit Load Error", e) }
  }

  const loadTrackers = () => {
    try {
      const stored = localStorage.getItem(TRACKER_KEY)
      if (stored) {
        setTrackers(JSON.parse(stored))
      } else {
        const defaults: CustomTracker[] = [
          { id: "cal", name: "Daily Calories", unit: "kcal", goal: 2000, current: 0, icon: "flame" },
          { id: "carb", name: "Total Carbs", unit: "g", goal: 250, current: 0, icon: "wheat" },
        ]
        setTrackers(defaults)
        localStorage.setItem(TRACKER_KEY, JSON.stringify(defaults))
      }
    } catch (e) { console.error("Tracker Load Error", e) }
  }

  const loadLedger = () => {
    try {
      const stored = localStorage.getItem(LEDGER_KEY)
      if (stored) {
        setTransactions(JSON.parse(stored))
      }
    } catch (e) { console.error("Ledger Load Error", e) }
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

  const dismissInsight = () => {
    const today = new Date().toDateString()
    localStorage.setItem(INSIGHT_KEY, today)
    setShowInsight(false)
  }

  // --- SAVE ACTIONS ---
  const saveHabits = (updated: Habit[]) => {
    setHabits(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const saveTrackers = (updated: CustomTracker[]) => {
    setTrackers(updated)
    localStorage.setItem(TRACKER_KEY, JSON.stringify(updated))
  }

  const saveLedger = (updated: HabitTransaction[]) => {
    setTransactions(updated)
    localStorage.setItem(LEDGER_KEY, JSON.stringify(updated))
  }

  // --- HANDLERS: HABITS ---
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

  // --- HANDLERS: LEDGER ---
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
    setShowLedger(false)
  }

  const removeTransaction = (id: string) => {
    saveLedger(transactions.filter(t => t.id !== id))
  }

  const getWeeklySummary = () => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const weeklyTransactions = transactions.filter(t => new Date(t.date) >= oneWeekAgo)
    const leak = weeklyTransactions.filter(t => t.type === "cost").reduce((sum, t) => sum + t.amount, 0)
    const retained = weeklyTransactions.filter(t => t.type === "saving").reduce((sum, t) => sum + t.amount, 0)
    
    return { leak, retained, net: retained - leak }
  }

  // --- HANDLERS: TRACKERS ---
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
    setNewTrackerName(""); setNewTrackerUnit(""); setNewTrackerGoal(100); setShowAddTracker(false)
  }

  const updateTracker = (id: string, amount: number) => {
    const updated = trackers.map(t => t.id === id ? { ...t, current: Math.max(0, t.current + amount) } : t)
    saveTrackers(updated)
  }

  const removeTracker = (id: string) => {
    saveTrackers(trackers.filter(t => t.id !== id))
  }

  // --- RENDER ---
  if (!mounted) return null

  const summary = getWeeklySummary()
  const goodHabits = habits.filter(h => h.type === "good")
  const badHabits = habits.filter(h => h.type === "bad")

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-32 space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Command Center
        </button>
        <Badge variant="outline" className="border-blue-200 text-blue-600 font-black uppercase text-[9px]">
          v2.0 Stable
        </Badge>
      </div>

      <header className="text-center py-4">
        <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-sm mb-4">
          <Sparkles className="w-6 h-6 text-blue-600" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">
          Zen <span className="text-blue-600">Habits</span>
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[.3em] mt-1">Ledger & Wellness Tracking</p>
      </header>

      {/* Daily Happiness Insight Popup */}
      {showInsight && (
        <Card className="border-none shadow-xl shadow-blue-500/10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[32px] overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                <Sun className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-[10px] uppercase tracking-widest opacity-80 mb-1">Morning Insight</h4>
                <p className="text-sm font-bold leading-relaxed">{dailyInsight}</p>
              </div>
              <button onClick={dismissInsight} className="opacity-50 hover:opacity-100 transition-opacity">
                <X className="w-5 h-5" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Habit Ledger - Financial Wellness */}
      <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-50">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-sm font-black uppercase flex items-center gap-2 text-slate-900">
                <Wallet className="w-4 h-4 text-orange-500" />
                Wellness Ledger
              </CardTitle>
              <CardDescription className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">Financial Habit Impact</CardDescription>
            </div>
            <Button size="icon" variant="ghost" onClick={() => setShowLedger(!showLedger)} className="rounded-full bg-slate-100 h-8 w-8">
              {showLedger ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-5 bg-red-50/50 rounded-[24px] border border-red-100/50">
              <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">Weekly Leak</p>
              <p className="text-2xl font-black text-red-600 tracking-tighter">-${summary.leak.toFixed(2)}</p>
            </div>
            <div className="p-5 bg-green-50/50 rounded-[24px] border border-green-100/50">
              <p className="text-[9px] font-black text-green-400 uppercase tracking-widest mb-1">Retained</p>
              <p className="text-2xl font-black text-green-600 tracking-tighter">+${summary.retained.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-slate-900 p-5 rounded-[24px] flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Net Wealth Impact</p>
              <p className={`text-xl font-black tracking-tighter ${summary.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {summary.net >= 0 ? '+' : ''}${summary.net.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/10">
              <PiggyBank className="w-6 h-6 text-white" />
            </div>
          </div>

          {showLedger && (
            <div className="p-5 bg-slate-50 rounded-[24px] border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Select Habit</label>
                  <select
                    value={selectedHabitForLedger}
                    onChange={(e) => setSelectedHabitForLedger(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border-slate-200 bg-white text-sm font-bold shadow-sm"
                  >
                    <option value="">Choose a habit...</option>
                    {habits.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Type</label>
                    <select
                      value={ledgerType}
                      onChange={(e) => setLedgerType(e.target.value as any)}
                      className="w-full h-12 px-4 rounded-xl border-slate-200 bg-white text-sm font-bold"
                    >
                      <option value="cost">Leak (-)</option>
                      <option value="saving">Retain (+)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Amount ($)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={ledgerAmount}
                      onChange={(e) => setLedgerAmount(e.target.value)}
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Notes</label>
                  <Input
                    placeholder="e.g. Bought pack of JPS..."
                    value={ledgerNote}
                    onChange={(e) => setLedgerNote(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>

                <Button onClick={addTransaction} className="w-full h-12 rounded-xl bg-slate-900 font-black uppercase tracking-widest text-xs">
                  <Receipt className="w-4 h-4 mr-2" />
                  Update Ledger
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Recent Activity</h5>
            {transactions.slice(-3).reverse().map(t => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${t.type === 'cost' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{t.habitName}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(t.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className={`text-sm font-black ${t.type === 'cost' ? 'text-red-500' : 'text-green-500'}`}>
                     {t.type === 'cost' ? '-' : '+'}${t.amount.toFixed(2)}
                   </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Trackers - E-Numbers / Calories / Additives */}
      <Card className="border-none shadow-sm rounded-[32px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-sm font-black uppercase text-blue-600">Zen Trackers</CardTitle>
              <CardDescription className="text-[9px] font-bold uppercase tracking-widest">E-Numbers & Nutrient Limits</CardDescription>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setShowAddTracker(!showAddTracker)} className="rounded-full bg-blue-50 h-8 w-8">
              <Plus className="w-4 h-4 text-blue-600" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAddTracker && (
            <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-[24px] space-y-3 mb-2">
              <Input placeholder="Tracker Name (e.g. E1202)" value={newTrackerName} onChange={(e) => setNewTrackerName(e.target.value)} className="h-12 rounded-xl" />
              <div className="flex gap-2">
                <Input placeholder="Unit (mg)" value={newTrackerUnit} onChange={(e) => setNewTrackerUnit(e.target.value)} className="h-12 rounded-xl" />
                <Input type="number" placeholder="Goal" value={newTrackerGoal} onChange={(e) => setNewTrackerGoal(Number(e.target.value))} className="h-12 rounded-xl" />
              </div>
              <Button onClick={addTracker} className="w-full bg-blue-600 h-12 rounded-xl font-black uppercase text-xs tracking-widest">Deploy Tracker</Button>
            </div>
          )}

          {trackers.map(tracker => (
            <div key={tracker.id} className="p-5 border border-slate-100 rounded-[24px] bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black uppercase text-slate-900 tracking-tight">{tracker.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target: {tracker.goal}{tracker.unit}</p>
                </div>
                <button onClick={() => removeTracker(tracker.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <Progress value={(tracker.current / tracker.goal) * 100} className="h-2" />
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={() => updateTracker(tracker.id, 10)} className="rounded-xl font-black border-slate-200">+10</Button>
                <Button size="sm" variant="outline" onClick={() => updateTracker(tracker.id, 50)} className="rounded-xl font-black border-slate-200">+50</Button>
                <Button size="sm" variant="outline" onClick={() => updateTracker(tracker.id, -20)} className="rounded-xl font-black border-slate-200 text-slate-400"><Minus className="w-3 h-3" /></Button>
                <div className="ml-auto flex items-center gap-1">
                   <span className="text-sm font-black text-slate-900">{tracker.current}</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase">{tracker.unit}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Habit Lists */}
      <div className="grid gap-6">
        {/* Good Habits */}
        <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
          <CardHeader className="bg-white">
            <CardTitle className="text-sm font-black uppercase text-green-600 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> 
              Strengthening
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {goodHabits.map(habit => (
              <div key={habit.id} className="flex items-center justify-between p-5 bg-green-50/50 border border-green-100/50 rounded-[24px]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-green-500 shadow-sm">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight text-slate-900">{habit.name}</p>
                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">{habit.streak} Day Streak</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <Button size="sm" variant="ghost" onClick={() => updateStreak(habit.id, true)} className="rounded-xl h-10 w-10 hover:bg-green-100">
                     <Check className="w-5 h-5 text-green-600" />
                   </Button>
                   <button onClick={() => removeHabit(habit.id)} className="text-slate-200 hover:text-red-400 px-2">
                     <X className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Bad Habits - Brown Tier Dislike Branding */}
        <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
          <CardHeader className="bg-white">
            <CardTitle className="text-sm font-black uppercase text-[#78350f] flex items-center gap-2">
              <Flame className="w-4 h-4" /> 
              Releasing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {badHabits.map(habit => (
              <div key={habit.id} className="flex items-center justify-between p-5 bg-orange-50/50 border border-[#78350f]/10 rounded-[24px]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#78350f] shadow-sm">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight text-slate-900">{habit.name}</p>
                    <p className="text-[10px] font-bold text-[#78350f] uppercase tracking-widest">{habit.streak} Days Free</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <Button size="sm" variant="ghost" onClick={() => updateStreak(habit.id, true)} className="rounded-xl h-10 w-10 hover:bg-orange-100">
                     <Check className="w-5 h-5 text-[#78350f]" />
                   </Button>
                   <button onClick={() => removeHabit(habit.id)} className="text-slate-200 hover:text-red-400 px-2">
                     <X className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Persistent Add Habit Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex items-center gap-3 z-50">
        <div className="flex-1 flex gap-2">
          <Input 
            placeholder="Commit to new habit..." 
            value={newHabitName} 
            onChange={(e) => setNewHabitName(e.target.value)} 
            className="h-12 rounded-2xl border-slate-100 shadow-inner bg-slate-50"
          />
          <select 
            value={newHabitType} 
            onChange={(e) => setNewHabitType(e.target.value as any)}
            className="bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase px-3 tracking-widest shadow-inner outline-none"
          >
            <option value="good">Good</option>
            <option value="bad">Bad</option>
          </select>
        </div>
        <Button onClick={addHabit} className="bg-blue-600 hover:bg-blue-700 h-12 w-12 rounded-2xl shadow-lg shadow-blue-500/30 shrink-0">
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  )
}
