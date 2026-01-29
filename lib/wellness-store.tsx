"use client"

// Wellness state management with React Context (NO ZUSTAND)
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

export type ProductType = "food" | "cleaning" | "beauty" | "medication" | "clothing" | "unknown"

export interface ScanResult {
  productName: string
  productType: ProductType
  status: "safe" | "danger" | "caution"
  redFlags: { ingredient: string; allergen: string; hidden?: boolean }[]
  yellowFlags: { ingredient: string; reason: string }[]
  fragranceWarning: boolean
  timestamp: Date
}

interface WellnessState {
  foodSafety: number
  skinSafety: number
  inflammation: number
  brandShieldAlert: boolean
  skinCrisisFlashing: boolean
  skinCrisisMode: boolean
  lastScanResult: ScanResult | null
  scanHistory: ScanResult[]
}

interface WellnessActions {
  updateRingsFromScan: (result: ScanResult) => void
  triggerBrandShieldAlert: () => void
  clearBrandShieldAlert: () => void
  resetRings: () => void
  addToHistory: (result: ScanResult) => void
  toggleSkinCrisisMode: () => void
  setSkinCrisisMode: (active: boolean) => void
}

type WellnessStore = WellnessState & WellnessActions

const defaultState: WellnessState = {
  foodSafety: 85,
  skinSafety: 78,
  inflammation: 72,
  brandShieldAlert: false,
  skinCrisisFlashing: false,
  skinCrisisMode: false,
  lastScanResult: null,
  scanHistory: [],
}

const WellnessContext = createContext<WellnessStore | null>(null)

// Determine product type from product name/ingredients
export function detectProductType(productName: string, ingredients: string[]): ProductType {
  const name = productName.toLowerCase()
  const allText = [name, ...ingredients.map((i) => i.toLowerCase())].join(" ")

  const foodIndicators = [
    "cereal", "snack", "cookie", "bread", "milk", "cheese", "yogurt", "juice",
    "chocolate", "candy", "nutrition", "vitamin", "supplement", "food", "eat",
    "drink", "beverage", "sauce", "oil", "flour", "sugar", "salt", "spice",
  ]

  const cleaningIndicators = [
    "detergent", "soap", "cleaner", "wash", "tide", "bleach", "disinfect",
    "laundry", "dish", "floor", "surface", "spray", "wipe", "scrub",
  ]

  const beautyIndicators = [
    "shampoo", "conditioner", "lotion", "cream", "moisturizer", "dove", "nivea",
    "deodorant", "perfume", "cologne", "makeup", "cosmetic", "skin", "body",
    "face", "hair", "nail", "lip", "eye", "sunscreen", "serum",
  ]

  const medicationIndicators = [
    "tablet", "capsule", "pill", "medicine", "drug", "pharmaceutical",
    "tylenol", "advil", "ibuprofen", "antibiotic", "prescription",
  ]

  const clothingIndicators = [
    "shirt", "pants", "dress", "fabric", "cotton", "polyester", "piqué",
    "clothing", "garment", "textile", "fiber", "wear",
  ]

  if (foodIndicators.some((i) => allText.includes(i))) return "food"
  if (cleaningIndicators.some((i) => allText.includes(i))) return "cleaning"
  if (beautyIndicators.some((i) => allText.includes(i))) return "beauty"
  if (medicationIndicators.some((i) => allText.includes(i))) return "medication"
  if (clothingIndicators.some((i) => allText.includes(i))) return "clothing"

  return "unknown"
}

// Provider component
export function WellnessProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WellnessState>(defaultState)

  const updateRingsFromScan = useCallback((result: ScanResult) => {
    const { productType, status, redFlags, yellowFlags } = result
    const redPenalty = redFlags.length * 15
    const yellowPenalty = yellowFlags.length * 5
    const totalPenalty = Math.min(redPenalty + yellowPenalty, 60)

    setState((prev) => {
      const updates: Partial<WellnessState> = {
        lastScanResult: result,
        brandShieldAlert: status === "danger",
        skinCrisisFlashing:
          status === "danger" && (productType === "cleaning" || productType === "beauty" || productType === "clothing"),
      }

      if (productType === "food" || productType === "medication") {
        updates.foodSafety = Math.max(20, prev.foodSafety - totalPenalty)
        if (redFlags.length > 0) {
          updates.inflammation = Math.max(20, prev.inflammation - Math.floor(totalPenalty / 2))
        }
      } else if (productType === "cleaning" || productType === "beauty" || productType === "clothing") {
        updates.skinSafety = Math.max(20, prev.skinSafety - totalPenalty)
        if (redFlags.length > 0) {
          updates.inflammation = Math.max(20, prev.inflammation - Math.floor(totalPenalty / 3))
        }
      } else {
        updates.foodSafety = Math.max(20, prev.foodSafety - Math.floor(totalPenalty / 3))
        updates.skinSafety = Math.max(20, prev.skinSafety - Math.floor(totalPenalty / 3))
      }

      if (status === "safe") {
        if (productType === "food") {
          updates.foodSafety = Math.min(100, prev.foodSafety + 2)
        } else if (productType === "cleaning" || productType === "beauty") {
          updates.skinSafety = Math.min(100, prev.skinSafety + 2)
        }
      }

      return { ...prev, ...updates }
    })
  }, [])

  const triggerBrandShieldAlert = useCallback(() => {
    setState((prev) => ({ ...prev, brandShieldAlert: true, skinCrisisFlashing: true }))
    setTimeout(() => {
      setState((prev) => ({ ...prev, skinCrisisFlashing: false }))
    }, 5000)
  }, [])

  const clearBrandShieldAlert = useCallback(() => {
    setState((prev) => ({ ...prev, brandShieldAlert: false, skinCrisisFlashing: false }))
  }, [])

  const resetRings = useCallback(() => {
    setState((prev) => ({
      ...prev,
      foodSafety: 85,
      skinSafety: 78,
      inflammation: 72,
      brandShieldAlert: false,
      skinCrisisFlashing: false,
    }))
  }, [])

  const addToHistory = useCallback((result: ScanResult) => {
    setState((prev) => ({
      ...prev,
      scanHistory: [result, ...prev.scanHistory].slice(0, 50),
    }))
  }, [])

  const toggleSkinCrisisMode = useCallback(() => {
    setState((prev) => ({ ...prev, skinCrisisMode: !prev.skinCrisisMode }))
  }, [])

  const setSkinCrisisMode = useCallback((active: boolean) => {
    setState((prev) => ({ ...prev, skinCrisisMode: active }))
  }, [])

  const value: WellnessStore = {
    ...state,
    updateRingsFromScan,
    triggerBrandShieldAlert,
    clearBrandShieldAlert,
    resetRings,
    addToHistory,
    toggleSkinCrisisMode,
    setSkinCrisisMode,
  }

  return <WellnessContext.Provider value={value}>{children}</WellnessContext.Provider>
}

// Hook with selector support (mimics zustand API)
export function useWellnessStore(): WellnessStore
export function useWellnessStore<T>(selector: (state: WellnessStore) => T): T
export function useWellnessStore<T>(selector?: (state: WellnessStore) => T) {
  const context = useContext(WellnessContext)
  
  // Fallback for when provider is not present (provides default working state)
  if (!context) {
    const fallback: WellnessStore = {
      ...defaultState,
      updateRingsFromScan: () => {},
      triggerBrandShieldAlert: () => {},
      clearBrandShieldAlert: () => {},
      resetRings: () => {},
      addToHistory: () => {},
      toggleSkinCrisisMode: () => {},
      setSkinCrisisMode: () => {},
    }
    return selector ? selector(fallback) : fallback
  }
  
  return selector ? selector(context) : context
}
