"use client"

/**
 * allergyZEN Profile & Handshake Engine
 * Manages the Family Shield, Zen Spectrum items, and Bulletproof handshakes.
 * 2026 SPEC: Includes Brown tier (Dislikes) and Blue tier (Sensory/ED).
 * PRIMARY BRAND COLOR: #673AB7 (Purple Master Theme)
 */

export interface DotItems {
  red: AllergenItem[]    // High Reactivity / Strict Avoidance
  amber: AllergenItem[]  // Moderate Sensitivity
  brown: AllergenItem[]  // Dislike / Personal Preference
  green: AllergenItem[]  // Verified Safe
  blue: AllergenItem[]   // ED/Sensory Boundaries
}

export interface AllergenItem {
  name: string
  category: string
  addedAt: string
}

export type ThemeColor = "purple" | "teal" | "rose" | "amber" | "sky"

export const THEME_COLORS: Record<ThemeColor, { primary: string; accent: string; bg: string }> = {
  purple: { primary: "#673AB7", accent: "#9575CD", bg: "#EDE7F6" },
  teal: { primary: "#009688", accent: "#4DB6AC", bg: "#E0F2F1" },
  rose: { primary: "#E91E63", accent: "#F48FB1", bg: "#FCE4EC" },
  amber: { primary: "#FF9800", accent: "#FFCC80", bg: "#FFF3E0" },
  sky: { primary: "#03A9F4", accent: "#81D4FA", bg: "#E1F5FE" },
}

export interface FamilyMember {
  name: string
  allergies: string[]
  items?: DotItems
  themeColor?: ThemeColor
  photoUrl?: string 
  createdAt: string
  boundaries?: BoundaryPreferences
}

export interface BoundaryPreferences {
  softTextures: boolean
  noSaltSauce: boolean
  deconstructed: boolean
  deconstructedNotes: string
  temperatureSensitive: boolean
  temperaturePreference: "room-temp" | "warm-only" | "cold-only" | ""
  singleColorMeals: boolean
  singleColorPreference: string 
  noMixedTextures: boolean
  specificPortions: boolean
  portionNotes: string
  customNotes: string[]
}

export interface ProtectionSession {
  active: boolean
  startTime: string | null
  durationMs: number 
  businessId: string | null
  businessName: string | null
  acknowledged: boolean
  confirmedByBusiness: boolean
}

export interface ProfileSession {
  activeProfileIndex: number
  protectionWindow: ProtectionSession
}

// HANDSHAKE OPTIONS: 30min, 1hr, 3hr, 24hr
export const HANDSHAKE_DURATIONS = {
  THIRTY_MIN: 30 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  THREE_HOURS: 180 * 60 * 1000,
  TWENTY_FOUR_HOURS: 1440 * 60 * 1000
}

class UserProfileManager {
  profiles: FamilyMember[] = []
  session: ProfileSession = { 
    activeProfileIndex: 0,
    protectionWindow: {
      active: false,
      startTime: null,
      durationMs: HANDSHAKE_DURATIONS.THREE_HOURS,
      businessId: null,
      businessName: null,
      acknowledged: false,
      confirmedByBusiness: false
    }
  }
  
  private STORAGE_KEY = "allergyzen_family_profiles"
  
  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage()
    }
  }
  
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        this.profiles = data.profiles || []
        this.session = data.session || this.session
      }
      
      if (this.profiles.length === 0) {
        this.profiles.push({
          name: "Me",
          allergies: [],
          themeColor: "purple",
          items: { red: [], amber: [], brown: [], green: [], blue: [] },
          createdAt: new Date().toISOString(),
          boundaries: this.getDefaultBoundaries()
        })
        this.saveToStorage()
      }
    } catch (e) {
      console.error("Profile load error:", e)
    }
  }
  
  private getDefaultBoundaries(): BoundaryPreferences {
    return {
      softTextures: false, noSaltSauce: false, deconstructed: false,
      deconstructedNotes: "", temperatureSensitive: false, temperaturePreference: "",
      singleColorMeals: false, singleColorPreference: "", noMixedTextures: false,
      specificPortions: false, portionNotes: "", customNotes: []
    }
  }
  
  saveToStorage() {
    if (typeof window === "undefined") return
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
      profiles: this.profiles,
      session: this.session
    }))
  }

  // --- HANDSHAKE LOGIC ---

  activateHandshake(businessName: string, durationMinutes: number = 180) {
    this.session.protectionWindow = {
      active: true,
      startTime: new Date().toISOString(),
      durationMs: durationMinutes * 60 * 1000,
      businessId: `biz_${Date.now()}`,
      businessName,
      acknowledged: true,
      confirmedByBusiness: false
    }
    this.saveToStorage()
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("handshakeStarted", { detail: { durationMinutes, businessName } }))
    }
  }

  startProtectionWindow(businessId: string, businessName: string, durationMinutes: number = 180) {
    this.activateHandshake(businessName, durationMinutes)
  }
  
  getRemainingProtectionTime(): number {
    const { startTime, durationMs, active } = this.session.protectionWindow
    if (!startTime || !active) return 0
    const elapsed = Date.now() - new Date(startTime).getTime()
    return Math.max(0, durationMs - elapsed)
  }
  
  getProtectionTimeRemaining(): number {
    return this.getRemainingProtectionTime()
  }
  
  isProtectionActive(): boolean {
    return this.session.protectionWindow.active && this.getRemainingProtectionTime() > 0
  }

  clearProtectionWindow() {
    this.session.protectionWindow = {
      active: false,
      startTime: null,
      durationMs: HANDSHAKE_DURATIONS.THREE_HOURS,
      businessId: null,
      businessName: null,
      acknowledged: false,
      confirmedByBusiness: false
    }
    this.saveToStorage()
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("handshakeCleared"))
    }
  }

  cleanupExpiredData() {
    if (this.session.protectionWindow.active && this.getRemainingProtectionTime() <= 0) {
      this.clearProtectionWindow()
    }
  }

  checkStatus(): "PROTECTED" | "EXPIRED" | "CONFIRMED" | "INACTIVE" {
    if (!this.session.protectionWindow.active) return "INACTIVE"
    if (!this.isProtectionActive()) return "EXPIRED"
    return this.session.protectionWindow.confirmedByBusiness ? "CONFIRMED" : "PROTECTED"
  }

  // --- ZEN SPECTRUM ITEM MANAGEMENT ---

  addItem(itemName: string, category: string, dotColor: keyof DotItems) {
    const profile = this.getActiveProfile()
    if (!profile) return
    
    if (!profile.items) profile.items = { red: [], amber: [], brown: [], green: [], blue: [] }
    
    const tiers: (keyof DotItems)[] = ["red", "amber", "brown", "green", "blue"]
    tiers.forEach(t => {
      profile.items![t] = profile.items![t].filter(i => i.name !== itemName)
    })
    
    profile.items[dotColor].push({ name: itemName, category, addedAt: new Date().toISOString() })
    profile.allergies = profile.items.red.map(i => i.name)
    
    this.saveToStorage()
  }

  removeItem(itemName: string) {
    const profile = this.getActiveProfile()
    if (!profile || !profile.items) return
    
    const tiers: (keyof DotItems)[] = ["red", "amber", "brown", "green", "blue"]
    tiers.forEach(t => {
      profile.items![t] = profile.items![t].filter(i => i.name !== itemName)
    })
    profile.allergies = profile.items.red.map(i => i.name)
    this.saveToStorage()
  }

  addDislike(itemName: string) {
    this.addItem(itemName, "dislike", "brown")
  }

  getProfilePhoto(): string | null {
    return this.getActiveProfile()?.photoUrl || null
  }

  getActiveProfile(): FamilyMember | null {
    return this.profiles[this.session.activeProfileIndex] || null
  }

  setActiveProfile(index: number) {
    if (index >= 0 && index < this.profiles.length) {
      this.session.activeProfileIndex = index
      this.saveToStorage()
    }
  }

  getTheme(): ThemeColor {
    return this.getActiveProfile()?.themeColor || "purple"
  }

  setTheme(color: ThemeColor) {
    const profile = this.getActiveProfile()
    if (profile) {
      profile.themeColor = color
      this.saveToStorage()
    }
  }

  updateBoundaries(boundaries: Partial<BoundaryPreferences>) {
    const profile = this.getActiveProfile()
    if (profile) {
      profile.boundaries = { ...profile.boundaries!, ...boundaries }
      this.saveToStorage()
    }
  }
}

const userProfile = new UserProfileManager()
export default userProfile
