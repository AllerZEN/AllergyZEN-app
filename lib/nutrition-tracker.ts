// nutrition-tracker.ts
// Handles automatic data flow from scanned/selected items to ZenHealth/Diabetes tracking

export interface NutritionData {
  calories: number
  carbs: number
  protein: number
  fat: number
  sugar: number
  fiber: number
  sodium: number
}

export interface TrackedFood {
  name: string
  nutrition: NutritionData
  timestamp: string
  source: "scan" | "search" | "manual"
}

export interface DailyLog {
  date: string
  foods: TrackedFood[]
  totals: NutritionData
  bloodSugar?: {
    readings: { value: number; time: string; note?: string }[]
  }
  medications?: {
    insulin?: { taken: boolean; time?: string; units?: number }
    other?: { name: string; taken: boolean; time?: string }[]
  }
}

const STORAGE_KEY = "allergyzen_nutrition_log"

// Estimated nutrition data for common food categories
const NUTRITION_ESTIMATES: Record<string, Partial<NutritionData>> = {
  // Proteins
  "chicken": { calories: 165, carbs: 0, protein: 31, fat: 3.6 },
  "beef": { calories: 250, carbs: 0, protein: 26, fat: 15 },
  "fish": { calories: 136, carbs: 0, protein: 20, fat: 5.6 },
  "eggs": { calories: 155, carbs: 1.1, protein: 13, fat: 11 },
  "tofu": { calories: 76, carbs: 1.9, protein: 8, fat: 4.8 },
  // Carbs
  "rice": { calories: 130, carbs: 28, protein: 2.7, fat: 0.3 },
  "bread": { calories: 265, carbs: 49, protein: 9, fat: 3.2 },
  "pasta": { calories: 131, carbs: 25, protein: 5, fat: 1.1 },
  "potato": { calories: 77, carbs: 17, protein: 2, fat: 0.1 },
  // Fruits
  "apple": { calories: 52, carbs: 14, protein: 0.3, fat: 0.2, sugar: 10 },
  "banana": { calories: 89, carbs: 23, protein: 1.1, fat: 0.3, sugar: 12 },
  "orange": { calories: 47, carbs: 12, protein: 0.9, fat: 0.1, sugar: 9 },
  // Vegetables
  "broccoli": { calories: 34, carbs: 7, protein: 2.8, fat: 0.4 },
  "carrot": { calories: 41, carbs: 10, protein: 0.9, fat: 0.2 },
  "spinach": { calories: 23, carbs: 3.6, protein: 2.9, fat: 0.4 },
  // Dairy
  "milk": { calories: 42, carbs: 5, protein: 3.4, fat: 1 },
  "cheese": { calories: 402, carbs: 1.3, protein: 25, fat: 33 },
  "yogurt": { calories: 59, carbs: 3.6, protein: 10, fat: 0.7 },
  // Snacks/Other
  "chocolate": { calories: 546, carbs: 60, protein: 5, fat: 31, sugar: 48 },
  "chips": { calories: 536, carbs: 53, protein: 7, fat: 35, sodium: 525 },
}

class NutritionTracker {
  private logs: Record<string, DailyLog> = {}

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage() {
    if (typeof window === "undefined") return
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        this.logs = JSON.parse(stored)
      }
    } catch {
      this.logs = {}
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs))
    } catch {
      // Storage full or unavailable
    }
  }

  private getTodayKey(): string {
    return new Date().toISOString().split("T")[0]
  }

  private getOrCreateTodayLog(): DailyLog {
    const today = this.getTodayKey()
    if (!this.logs[today]) {
      this.logs[today] = {
        date: today,
        foods: [],
        totals: { calories: 0, carbs: 0, protein: 0, fat: 0, sugar: 0, fiber: 0, sodium: 0 }
      }
    }
    return this.logs[today]
  }

  // Estimate nutrition from food name
  estimateNutrition(foodName: string): NutritionData {
    const lowerName = foodName.toLowerCase()
    
    // Check for matches in our estimates
    for (const [key, nutrition] of Object.entries(NUTRITION_ESTIMATES)) {
      if (lowerName.includes(key)) {
        return {
          calories: nutrition.calories || 0,
          carbs: nutrition.carbs || 0,
          protein: nutrition.protein || 0,
          fat: nutrition.fat || 0,
          sugar: nutrition.sugar || 0,
          fiber: nutrition.fiber || 0,
          sodium: nutrition.sodium || 0
        }
      }
    }

    // Default estimate for unknown foods
    return {
      calories: 100,
      carbs: 10,
      protein: 5,
      fat: 5,
      sugar: 2,
      fiber: 1,
      sodium: 100
    }
  }

  // Add food from scan or search - AUTO-FLOW to tracker
  addFood(name: string, source: "scan" | "search" | "manual", customNutrition?: Partial<NutritionData>) {
    const log = this.getOrCreateTodayLog()
    const nutrition = customNutrition 
      ? { ...this.estimateNutrition(name), ...customNutrition }
      : this.estimateNutrition(name)

    const food: TrackedFood = {
      name,
      nutrition: nutrition as NutritionData,
      timestamp: new Date().toISOString(),
      source
    }

    log.foods.push(food)
    
    // Update totals
    log.totals.calories += nutrition.calories
    log.totals.carbs += nutrition.carbs
    log.totals.protein += nutrition.protein
    log.totals.fat += nutrition.fat
    log.totals.sugar += nutrition.sugar || 0
    log.totals.fiber += nutrition.fiber || 0
    log.totals.sodium += nutrition.sodium || 0

    this.saveToStorage()
    
    // Dispatch event for UI updates
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("nutritionUpdated", { 
        detail: { food, totals: log.totals }
      }))
    }

    return food
  }

  // Get today's totals for diabetes hub integration
  getTodayTotals(): NutritionData {
    const log = this.getOrCreateTodayLog()
    return log.totals
  }

  // Get today's foods
  getTodayFoods(): TrackedFood[] {
    const log = this.getOrCreateTodayLog()
    return log.foods
  }

  // Log blood sugar reading
  logBloodSugar(value: number, note?: string) {
    const log = this.getOrCreateTodayLog()
    if (!log.bloodSugar) {
      log.bloodSugar = { readings: [] }
    }
    log.bloodSugar.readings.push({
      value,
      time: new Date().toISOString(),
      note
    })
    this.saveToStorage()
  }

  // Log medication/insulin
  logMedication(type: "insulin" | "other", taken: boolean, details?: { units?: number; name?: string }) {
    const log = this.getOrCreateTodayLog()
    if (!log.medications) {
      log.medications = {}
    }
    
    if (type === "insulin") {
      log.medications.insulin = {
        taken,
        time: new Date().toISOString(),
        units: details?.units
      }
    } else {
      if (!log.medications.other) {
        log.medications.other = []
      }
      log.medications.other.push({
        name: details?.name || "Medication",
        taken,
        time: new Date().toISOString()
      })
    }
    this.saveToStorage()
  }

  // Get log for a specific date
  getLog(date: string): DailyLog | null {
    return this.logs[date] || null
  }

  // Clear today's log
  clearToday() {
    const today = this.getTodayKey()
    delete this.logs[today]
    this.saveToStorage()
  }
}

// Singleton instance
const nutritionTracker = new NutritionTracker()
export default nutritionTracker
