"use client"

/**
 * allergyZEN Profile & Handshake Engine
 * Manages the Family Shield, Zen Spectrum items, and Bulletproof 3-hour handshakes.
 * 2026 SPEC: Includes 🟤 Brown tier (Dislikes) and 💙 Blue tier (Sensory).
 */

export interface DotItems {
  red: AllergenItem[] // High Reactivity / Strict Avoidance
  amber: AllergenItem[] // Moderate Sensitivity
  brown: AllergenItem[] // Dislike / Personal Preference (🟤)
  green: AllergenItem[] // Verified Safe
  blue: AllergenItem[] // ED/Sensory Boundaries (💙)
}

export interface AllergenItem {
  name: string
  category: string
  addedAt: string
}

export type ThemeColor = "purple" | "teal" | "rose" | "amber" | "sky"

export const THEME_COLORS: Record<ThemeColor, { primary: string; accent: string; bg: string }> = {
  purple: { primary: "#8E55A2", accent: "#C084FC", bg: "#FAF5FF" },
  teal: { primary: "#0D9488", accent: "#5EEAD4", bg: "#F0FDFA" },
  rose: { primary: "#E11D48", accent: "#FDA4AF", bg: "#FFF1F2" },
  amber: { primary: "#D97706", accent: "#FCD34D", bg: "#FFFBEB" },
  sky: { primary: "#0284C7", accent: "#7DD3FC", bg: "#F0F9FF" },
}

export interface FamilyMember {
  name: string
  allergies: string[] // Combined high-reactivity names for easy access
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

// 2026 BULLETPROOF HANDSHAKE OPTIONS
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

  startProtectionWindow(businessId: string, businessName: string, durationMinutes: number = 180) {
    this.session.protectionWindow = {
      startTime: new Date().toISOString(),
      durationMs: durationMinutes * 60 * 1000,
      businessId,
      businessName,
      acknowledged: true,
      confirmedByBusiness: false
    }
    this.saveToStorage()
    window.dispatchEvent(new CustomEvent("handshakeStarted", { detail: { durationMinutes, businessName } }))
  }
  
  getRemainingProtectionTime(): number {
    const { startTime, durationMs } = this.session.protectionWindow
    if (!startTime) return 0
    const elapsed = Date.now() - new Date(startTime).getTime()
    return Math.max(0, durationMs - elapsed)
  }
  
  isProtectionActive(): boolean {
    return this.getRemainingProtectionTime() > 0
  }

  // Auto-wipe logic for the Partner Dashboard
  checkStatus(): "PROTECTED" | "EXPIRED" | "CONFIRMED" | "INACTIVE" {
    if (!this.session.protectionWindow.startTime) return "INACTIVE"
    if (!this.isProtectionActive()) return "EXPIRED"
    return this.session.protectionWindow.confirmedByBusiness ? "CONFIRMED" : "PROTECTED"
  }

  // --- ZEN SPECTRUM ITEM MANAGEMENT ---

  addItem(itemName: string, category: string, dotColor: keyof DotItems) {
    const profile = this.getActiveProfile()
    if (!profile) return
    
    if (!profile.items) profile.items = { red: [], amber: [], brown: [], green: [], blue: [] }
    
    // PRIORITY SYNC: Remove from all other tiers first
    const tiers: (keyof DotItems)[] = ["red", "amber", "brown", "green", "blue"]
    tiers.forEach(t => {
      profile.items![t] = profile.items![t].filter(i => i.name !== itemName)
    })
    
    profile.items[dotColor].push({ name: itemName, category, addedAt: new Date().toISOString() })
    
    // Sync the flat "allergies" array for quick high-reactivity checks
    profile.allergies = profile.items.red.map(i => i.name)
    
    this.saveToStorage()
  }

  getProfilePhoto(): string | null {
    return this.getActiveProfile()?.photoUrl || null
  }

  getActiveProfile(): FamilyMember | null {
    return this.profiles[this.session.activeProfileIndex] || null
  }
}

const userProfile = new UserProfileManager()
export default userProfile
