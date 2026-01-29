"use client"

// Family Shield Profile Management with 3-Hour Safety Timer

export interface DotItems {
  red: AllergenItem[]
  amber: AllergenItem[]
  brown: AllergenItem[] // Dislike/Thumb Down - personal preference
  green: AllergenItem[]
  blue: AllergenItem[]
}

export interface AllergenItem {
  name: string
  category: string
  addedAt: string
}

// Theme colors for profile-specific vibes
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
  dislikedItems?: string[] // Items user dislikes regardless of safety
  themeColor?: ThemeColor
  photoUrl?: string // Profile photo (base64 or URL)
  createdAt: string
  boundaries?: BoundaryPreferences
}

export interface BoundaryPreferences {
  // Core ED Boundaries
  softTextures: boolean
  noSaltSauce: boolean
  deconstructed: boolean
  deconstructedNotes: string
  // New expanded sensory options
  temperatureSensitive: boolean
  temperaturePreference: "room-temp" | "warm-only" | "cold-only" | ""
  singleColorMeals: boolean
  singleColorPreference: string // e.g., "white", "beige"
  noMixedTextures: boolean
  specificPortions: boolean
  portionNotes: string
  // Custom notes
  customNotes: string[]
}

export interface ProtectionSession {
  startTime: string | null
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

const PROTECTION_DURATION_MS = 3 * 60 * 60 * 1000 // 3 hours in milliseconds

class UserProfileManager {
  profiles: FamilyMember[] = []
  session: ProfileSession = { 
    activeProfileIndex: 0,
    protectionWindow: {
      startTime: null,
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
            businessId: null,
            businessName: null,
            acknowledged: false,
            confirmedByBusiness: false
          }
        }
      }
      
      // Load personal notes
      const notesStored = localStorage.getItem(this.NOTES_KEY)
      if (notesStored) {
        this.personalNotes = JSON.parse(notesStored)
      }
      
      // Create default profile if none exists
      if (this.profiles.length === 0) {
        this.profiles.push({
          name: "Me",
          allergies: [],
          createdAt: new Date().toISOString(),
          boundaries: {
            softTextures: false,
            noSaltSauce: false,
            deconstructed: false,
            deconstructedNotes: "",
            customNotes: []
          }
        })
        this.saveToStorage()
      }
    } catch (e) {
      console.error("Error loading profiles:", e)
      this.profiles = [{
        name: "Me",
        allergies: [],
        createdAt: new Date().toISOString(),
        boundaries: {
          softTextures: false,
          noSaltSauce: false,
          deconstructed: false,
          deconstructedNotes: "",
          customNotes: []
        }
      }]
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
  
  private saveNotes() {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(this.NOTES_KEY, JSON.stringify(this.personalNotes))
    } catch (e) {
      console.error("Error saving notes:", e)
    }
  }
  
  // 3-Hour Protection Window Logic
  startProtectionWindow(businessId: string, businessName: string) {
    this.session.protectionWindow = {
      startTime: new Date().toISOString(),
      businessId,
      businessName,
      acknowledged: true,
      confirmedByBusiness: false
    }
    this.saveToStorage()
  }
  
  confirmByBusiness() {
    if (this.session?.protectionWindow) {
      this.session.protectionWindow.confirmedByBusiness = true
      this.saveToStorage()
    }
  }
  
  getProtectionTimeRemaining(): number {
    const startTime = this.session?.protectionWindow?.startTime
    if (!startTime) return 0
    
    const startTimeMs = new Date(startTime).getTime()
    const elapsed = Date.now() - startTimeMs
    const remaining = PROTECTION_DURATION_MS - elapsed
    
    return Math.max(0, remaining)
  }
  
  isProtectionActive(): boolean {
    return this.getProtectionTimeRemaining() > 0
  }
  
  checkStatus(): "PROTECTED" | "EXPIRED" | "CONFIRMED" | "INACTIVE" | "UNKNOWN" {
    const activeProfile = this.profiles?.[this.session?.activeProfileIndex]
    if (!activeProfile) return "UNKNOWN"
    
    // Ensure protectionWindow exists with safe access
    const protectionWindow = this.session?.protectionWindow
    
    // Check if protection window is active (only if protectionWindow exists and has startTime)
    if (protectionWindow?.startTime) {
      if (this.isProtectionActive()) {
        if (protectionWindow.confirmedByBusiness) {
          return "CONFIRMED"
        }
        return "PROTECTED"
      }
      return "EXPIRED"
    }
    
    // If user has set up allergies, they're protected
    if (activeProfile.allergies && activeProfile.allergies.length > 0) {
      return "PROTECTED"
    }
    
    // No protection window started yet
    return "INACTIVE"
  }
  
  clearProtectionWindow() {
    this.session.protectionWindow = {
      startTime: null,
      businessId: null,
      businessName: null,
      acknowledged: false,
      confirmedByBusiness: false
    }
    this.saveToStorage()
  }
  
  // Auto-wipe expired sessions
  cleanupExpiredData() {
    if (this.session?.protectionWindow?.startTime && !this.isProtectionActive()) {
      this.clearProtectionWindow()
    }
  }
  
  addFamilyMember(name: string): FamilyMember {
    const newMember: FamilyMember = {
      name,
      allergies: [],
      createdAt: new Date().toISOString(),
      boundaries: {
        softTextures: false,
        noSaltSauce: false,
        deconstructed: false,
        deconstructedNotes: "",
        customNotes: []
      }
    }
    this.profiles.push(newMember)
    this.saveToStorage()
    return newMember
  }
  
  removeFamilyMember(index: number) {
    if (index > 0 && index < this.profiles.length) {
      this.profiles.splice(index, 1)
      if (this.session.activeProfileIndex >= this.profiles.length) {
        this.session.activeProfileIndex = 0
      }
      this.saveToStorage()
    }
  }
  
  updateAllergies(profileIndex: number, allergies: string[]) {
    if (profileIndex >= 0 && profileIndex < this.profiles.length) {
      this.profiles[profileIndex].allergies = allergies
      this.saveToStorage()
    }
  }
  
  updateBoundaries(profileIndex: number, boundaries: BoundaryPreferences) {
    if (profileIndex >= 0 && profileIndex < this.profiles.length) {
      this.profiles[profileIndex].boundaries = boundaries
      this.saveToStorage()
    }
  }
  
  getActiveProfile(): FamilyMember | null {
    return this.profiles[this.session.activeProfileIndex] || null
  }
  
  // Profile switching - THE CRITICAL FIX
  switchProfile(index: number): FamilyMember | null {
    if (index >= 0 && index < this.profiles.length) {
      this.session.activeProfileIndex = index
      this.saveToStorage()
      return this.profiles[index]
    }
    return null
  }
  
  // Dot-based item management (red, amber, brown, green, blue) - ZEN Spectrum
  addItem(itemName: string, category: string, dotColor: "red" | "amber" | "brown" | "green" | "blue") {
    const profile = this.getActiveProfile()
    if (!profile) return false
    
    // Ensure items object exists with all 5 spectrum colors
    if (!profile.items) {
      profile.items = { red: [], amber: [], brown: [], green: [], blue: [] }
    }
    // Ensure brown exists for legacy profiles
    if (!profile.items.brown) {
      profile.items.brown = []
    }
    
    // Remove from all categories first (item can only be in one dot)
    const colors: ("red" | "amber" | "brown" | "green" | "blue")[] = ["red", "amber", "brown", "green", "blue"]
    for (const color of colors) {
      if (!profile.items[color]) profile.items[color] = []
      profile.items[color] = profile.items[color].filter(i => i.name !== itemName)
    }
    
    // Add to selected category
    profile.items[dotColor].push({
      name: itemName,
      category: category,
      addedAt: new Date().toISOString()
    })
    
    this.saveToStorage()
    return true
  }
  
  removeItem(itemName: string, dotColor: "red" | "amber" | "brown" | "green" | "blue") {
    const profile = this.getActiveProfile()
    if (!profile?.items?.[dotColor]) return false
    
    profile.items[dotColor] = profile.items[dotColor].filter(i => i.name !== itemName)
    this.saveToStorage()
    return true
  }
  
  getItemsByDot(dotColor: "red" | "amber" | "brown" | "green" | "blue"): AllergenItem[] {
    const profile = this.getActiveProfile()
    if (!profile?.items) return []
    return profile.items[dotColor] || []
  }
  
  // Personal Notes (stored locally only for privacy)
  addNote(note: Omit<PersonalNote, "id" | "date">): PersonalNote {
    const newNote: PersonalNote = {
      ...note,
      id: crypto.randomUUID(),
      date: new Date().toISOString()
    }
    this.personalNotes.unshift(newNote)
    this.saveNotes()
    return newNote
  }
  
  deleteNote(id: string) {
    this.personalNotes = this.personalNotes.filter(n => n.id !== id)
    this.saveNotes()
  }
  
  getNotes(): PersonalNote[] {
    return this.personalNotes
  }
  
  // Theme management
  setThemeColor(themeColor: ThemeColor) {
    const profile = this.getActiveProfile()
    if (profile) {
      profile.themeColor = themeColor
      this.saveToStorage()
      // Dispatch event for UI updates
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("themeChanged", { detail: { themeColor } }))
      }
    }
  }
  
  getThemeColor(): ThemeColor {
    const profile = this.getActiveProfile()
    return profile?.themeColor || "purple"
  }
  
  // Profile photo management
  setProfilePhoto(photoUrl: string) {
    const profile = this.getActiveProfile()
    if (profile) {
      profile.photoUrl = photoUrl
      this.saveToStorage()
    }
  }
  
  getProfilePhoto(): string | null {
    const profile = this.getActiveProfile()
    return profile?.photoUrl || null
  }
  
  // Update profile name
  updateProfileName(name: string) {
    const profile = this.getActiveProfile()
    if (profile) {
      profile.name = name
      this.saveToStorage()
    }
  }
  
  // Dislike filter for meal planning
  addDislike(itemName: string) {
    const profile = this.getActiveProfile()
    if (!profile) return false
    
    if (!profile.dislikedItems) {
      profile.dislikedItems = []
    }
    
    if (!profile.dislikedItems.includes(itemName)) {
      profile.dislikedItems.push(itemName)
      this.saveToStorage()
    }
    return true
  }
  
  removeDislike(itemName: string) {
    const profile = this.getActiveProfile()
    if (!profile?.dislikedItems) return false
    
    profile.dislikedItems = profile.dislikedItems.filter(i => i !== itemName)
    this.saveToStorage()
    return true
  }
  
  getDislikedItems(): string[] {
    const profile = this.getActiveProfile()
    return profile?.dislikedItems || []
  }
  
  isDisliked(itemName: string): boolean {
    return this.getDislikedItems().includes(itemName)
  }
}

// Singleton instance
const userProfile = new UserProfileManager()

export default userProfile
