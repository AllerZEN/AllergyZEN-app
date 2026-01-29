"use client"

// Family Shield Profile Management with Variable Safety Timers (30m, 1h, 3h, 24h)

export interface DotItems {
  red: AllergenItem[]
  amber: AllergenItem[]
  brown: AllergenItem[] // ZEN Spectrum: Dislike - personal preference
  green: AllergenItem[]
  blue: AllergenItem[] // ZEN Spectrum: ED/Sensory boundaries
}

export interface AllergenItem {
  name: string
  category: string
  addedAt: string
}

// Theme colors for profile-specific vibes - Updated to ensure color "sticks"
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
  allergies: string[]
  items?: DotItems
  dislikedItems?: string[] 
  themeColor?: ThemeColor
  photoUrl?: string 
  createdAt: string
  boundaries?: BoundaryPreferences
}

export interface BoundaryPreferences {
  // Core ED Boundaries
  softTextures: boolean
  noSaltSauce: boolean
  deconstructed: boolean
  deconstructedNotes: string
  // Sensory options
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
  durationMs: number // Dynamic duration based on user choice
  businessId: string | null
  businessName: string | null
  acknowledged: boolean
  confirmedByBusiness: boolean
}

export interface ProfileSession {
  activeProfileIndex: number
  protectionWindow: ProtectionSession
}

export interface PersonalNote {
  id: string
  date: string
  mealDescription: string
  feelings: string
  textures: string
  rating: number
}

// Global Protection Constants for Handshake
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
      durationMs: HANDSHAKE_DURATIONS.THREE_HOURS, // Default to 3h
      businessId: null,
      businessName: null,
      acknowledged: false,
      confirmedByBusiness: false
    }
  }
  personalNotes: PersonalNote[] = []
  
  private STORAGE_KEY = "allergyzen_family_profiles"
  private NOTES_KEY = "allergyzen_personal_notes"
  
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
        this.session = data.session || { 
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
      }
      
      const notesStored = localStorage.getItem(this.NOTES_KEY)
      if (notesStored) {
        this.personalNotes = JSON.parse(notesStored)
      }
      
      if (this.profiles.length === 0) {
        this.profiles.push({
          name: "Me",
          allergies: [],
          themeColor: "purple",
          items: { red: [], amber: [], brown: [], green: [], blue: [] },
          createdAt: new Date().toISOString(),
          boundaries: {
            softTextures: false,
            noSaltSauce: false,
            deconstructed: false,
            deconstructedNotes: "",
            temperatureSensitive: false,
            temperaturePreference: "",
            singleColorMeals: false,
            singleColorPreference: "",
            noMixedTextures: false,
            specificPortions: false,
            portionNotes: "",
            customNotes: []
          }
        })
        this.saveToStorage()
      }
    } catch (e) {
      console.error("Error loading profiles:", e)
    }
  }
  
  private saveToStorage() {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        profiles: this.profiles,
        session: this.session
      }))
    } catch (e) {
      console.error("Error saving profiles:", e)
    }
  }

  // UPDATED: Start Protection with Custom Duration (30m, 1h, 3h, 24h)
  startProtectionWindow(businessId: string, businessName: string, durationMinutes: number = 180) {
    const durationMs = durationMinutes * 60 * 1000
    this.session.protectionWindow = {
      startTime: new Date().toISOString(),
      durationMs: durationMs,
      businessId,
      businessName,
      acknowledged: true,
      confirmedByBusiness: false
    }
    this.saveToStorage()
    
    // Dispatch event to notify UI that Handshake is active
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("handshakeStarted", { 
        detail: { durationMinutes, businessName } 
      }))
    }
  }
  
  confirmByBusiness() {
    if (this.session?.protectionWindow) {
      this.session.protectionWindow.confirmedByBusiness = true
      this.saveToStorage()
    }
  }
  
  getProtectionTimeRemaining(): number {
    const startTime = this.session?.protectionWindow?.startTime
    const durationMs = this.session?.protectionWindow?.durationMs || HANDSHAKE_DURATIONS.THREE_HOURS
    
    if (!startTime) return 0
    
    const startTimeMs = new Date(startTime).getTime()
    const elapsed = Date.now() - startTimeMs
    const remaining = durationMs - elapsed
    
    return Math.max(0, remaining)
  }
  
  isProtectionActive(): boolean {
    return this.getProtectionTimeRemaining() > 0
  }
  
  checkStatus(): "PROTECTED" | "EXPIRED" | "CONFIRMED" | "INACTIVE" | "UNKNOWN" {
    const activeProfile = this.profiles?.[this.session?.activeProfileIndex]
    if (!activeProfile) return "UNKNOWN"
    
    const protectionWindow = this.session?.protectionWindow
    
    if (protectionWindow?.startTime) {
      if (this.isProtectionActive()) {
        if (protectionWindow.confirmedByBusiness) return "CONFIRMED"
        return "PROTECTED"
      }
      return "EXPIRED"
    }
    
    return "INACTIVE"
  }
  
  // Manual "Un-shake" button handler
  clearProtectionWindow() {
    this.session.protectionWindow = {
      startTime: null,
      durationMs: HANDSHAKE_DURATIONS.THREE_HOURS,
      businessId: null,
      businessName: null,
      acknowledged: false,
      confirmedByBusiness: false
    }
    this.saveToStorage()
  }
  
  cleanupExpiredData() {
    if (this.session?.protectionWindow?.startTime && !this.isProtectionActive()) {
      this.clearProtectionWindow()
    }
  }
  
  // Profile Switching & Theme Persistence
  switchProfile(index: number): FamilyMember | null {
    if (index >= 0 && index < this.profiles.length) {
      this.session.activeProfileIndex = index
      this.saveToStorage()
      
      // Update Global CSS variable for theme "Stickiness"
      const color = this.THEME_COLOR_VALUES[this.profiles[index].themeColor || "purple"]
      if (typeof window !== "undefined") {
        document.documentElement.style.setProperty('--profile-theme', color)
        window.dispatchEvent(new CustomEvent("profileSwitched", { detail: { index } }))
      }
      return this.profiles[index]
    }
    return null
  }

  private THEME_COLOR_VALUES: Record<ThemeColor, string> = {
    purple: "#8E55A2", teal: "#0D9488", rose: "#E11D48", amber: "#D97706", sky: "#0284C7"
  }
  
  // ZEN Spectrum Management
  addItem(itemName: string, category: string, dotColor: keyof DotItems) {
    const profile = this.getActiveProfile()
    if (!profile) return false
    
    if (!profile.items) {
      profile.items = { red: [], amber: [], brown: [], green: [], blue: [] }
    }
    
    // Remove from all categories first to ensure priority order
    const colors: (keyof DotItems)[] = ["red", "amber", "brown", "green", "blue"]
    for (const color of colors) {
      if (profile.items[color]) {
        profile.items[color] = profile.items[color].filter(i => i.name !== itemName)
      }
    }
    
    // Add to specific ZEN Spectrum home
    profile.items[dotColor].push({
      name: itemName,
      category: category,
      addedAt: new Date().toISOString()
    })
    
    this.saveToStorage()
    return true
  }
  
  removeItem(itemName: string, dotColor: keyof DotItems) {
    const profile = this.getActiveProfile()
    if (!profile?.items?.[dotColor]) return false
    
    profile.items[dotColor] = profile.items[dotColor].filter(i => i.name !== itemName)
    this.saveToStorage()
    return true
  }
  
  getItemsByDot(dotColor: keyof DotItems): AllergenItem[] {
    const profile = this.getActiveProfile()
    if (!profile?.items) return []
    return profile.items[dotColor] || []
  }

  // Dislike List Synchronization with Spectrum Brown
  addDislike(itemName: string) {
    return this.addItem(itemName, "Dislike", "brown")
  }

  getDislikedItems(): string[] {
    const profile = this.getActiveProfile()
    return profile?.items?.brown?.map(i => i.name) || []
  }

  getActiveProfile(): FamilyMember | null {
    return this.profiles[this.session.activeProfileIndex] || null
  }
}

const userProfile = new UserProfileManager()
export default userProfile
