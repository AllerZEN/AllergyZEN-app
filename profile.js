/**
 * allergyZEN Wellness Assistant - Master Profile & Engine Logic (v2.0)
 * Handles Zen Spectrum state, dynamic multi-duration handshakes, 
 * ZenHealth tracking, and real-time medication cross-checking.
 */

const STORAGE_KEY = "allergyzen_family_profiles";
const DEFAULT_HANDSHAKE_MS = 3 * 60 * 60 * 1000; // 3 Hours default

const userProfile = {
  profiles: [],
  session: {
    activeProfileIndex: 0,
    protectionWindow: { 
      startTime: null, 
      durationMs: DEFAULT_HANDSHAKE_MS, 
      businessId: null, 
      businessName: null, 
      confirmedByBusiness: false 
    }
  },

  /**
   * Initializes state from localStorage or sets up clean defaults.
   */
  init() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.profiles = data.profiles || [];
        this.session = data.session || this.session;
      } catch (e) {
        console.warn("Failed to parse stored allergyZEN profiles. Resetting to default.");
      }
    }
    
    // Default Profile Construction if Empty
    if (this.profiles.length === 0) {
      this.profiles.push({
        id: "me_default",
        name: "Me",
        items: { 
          red: ["Peanuts", "Shellfish"], 
          amber: ["Lactose", "Terpenes"], 
          brown: ["Cilantro"], 
          green: ["Oat Milk", "Rice"], 
          blue: ["Soft Textures", "No Strong Smells"] 
        },
        zenHealth: {
          bloodSugar: "5.4",
          bloodPressure: "120/80",
          macros: "1800 kcal",
          medications: ["Metformin"]
        },
        zenNotes: [],
        savedForLater: []
      });
    } else {
      // Data Migration Guard: Ensure full spectrum (brown) and ZenHealth exist
      this.profiles.forEach(p => {
        if (!p.items) p.items = { red: [], amber: [], brown: [], green: [], blue: [] };
        if (!p.items.brown) p.items.brown = [];
        if (!p.zenHealth) p.zenHealth = { bloodSugar: "", bloodPressure: "", macros: "", medications: [] };
        if (!p.zenNotes) p.zenNotes = [];
        if (!p.savedForLater) p.savedForLater = [];
      });
    }

    this.cleanupExpiredData();
    this.saveToStorage();
    return this;
  },

  /**
   * Saves current state to LocalStorage.
   */
  saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      profiles: this.profiles,
      session: this.session
    }));
  },

  getActiveProfile() {
    return this.profiles[this.session.activeProfileIndex] || this.profiles[0];
  },

  saveProfile(updatedProfileData) {
    this.profiles[this.session.activeProfileIndex] = {
      ...this.getActiveProfile(),
      ...updatedProfileData
    };
    this.saveToStorage();
  },

  switchProfile(index) {
    if (index >= 0 && index < this.profiles.length) {
      this.session.activeProfileIndex = index;
      this.saveToStorage();
    }
  },

  // --- ZEN SPECTRUM ITEM MANAGEMENT ---

  /**
   * Adds an item to a designated spectrum color (red, amber, brown, green, blue).
   */
  addItem(itemName, category = "General", color = "red") {
    const profile = this.getActiveProfile();
    const targetColor = color.toLowerCase();
    
    if (profile.items[targetColor] && !profile.items[targetColor].includes(itemName)) {
      profile.items[targetColor].push(itemName);
      this.saveToStorage();
      this.crossCheckMedications();
    }
  },

  removeItem(color, itemName) {
    const profile = this.getActiveProfile();
    const targetColor = color.toLowerCase();

    if (profile.items[targetColor]) {
      profile.items[targetColor] = profile.items[targetColor].filter(i => i !== itemName);
      this.saveToStorage();
    }
  },

  // --- MULTI-DURATION HANDSHAKE ENGINE ---

  /**
   * Starts a dynamic time-bound handshake (30m, 1h, 3h, 24h).
   */
  startHandshake(durationMs = DEFAULT_HANDSHAKE_MS, businessId = "VENUE-01", businessName = "AZ Partner Venue") {
    this.session.protectionWindow = {
      startTime: new Date().toISOString(),
      durationMs: durationMs,
      businessId: businessId,
      businessName: businessName,
      confirmedByBusiness: true
    };
    this.saveToStorage();

    // Schedule auto-wipe timer
    setTimeout(() => {
      this.cleanupExpiredData();
      if (typeof updateTimerDisplay === 'function') updateTimerDisplay();
    }, durationMs);
  },

  /**
   * Calculates exact remaining handshake time in milliseconds.
   */
  getProtectionTimeRemaining() {
    const startTime = this.session.protectionWindow?.startTime;
    if (!startTime) return 0;

    const duration = this.session.protectionWindow.durationMs || DEFAULT_HANDSHAKE_MS;
    const elapsed = Date.now() - new Date(startTime).getTime();
    return Math.max(0, duration - elapsed);
  },

  /**
   * Instantly terminates active handshake and wipes local sharing permissions.
   */
  clearHandshake() {
    this.session.protectionWindow = { 
      startTime: null, 
      durationMs: DEFAULT_HANDSHAKE_MS, 
      businessId: null, 
      businessName: null, 
      confirmedByBusiness: false 
    };
    this.saveToStorage();
  },

  cleanupExpiredData() {
    if (this.getProtectionTimeRemaining() <= 0) {
      this.clearHandshake();
    }
  },

  // --- ZENHEALTH & MEDICATION CROSS-CHECKING ---

  /**
   * Cross-checks active medications against the full spectrum to detect potential interactions.
   */
  crossCheckMedications() {
    const profile = this.getActiveProfile();
    const meds = profile.zenHealth?.medications || [];
    const redTriggers = profile.items?.red || [];
    const amberTriggers = profile.items?.amber || [];

    let alerts = [];

    // Diagnostic cross-checks against common medication triggers/excipients
    meds.forEach(med => {
      const lowerMed = med.toLowerCase();
      
      if (lowerMed.includes("metformin") && (redTriggers.includes("Lactose") || amberTriggers.includes("Lactose"))) {
        alerts.push({ med, trigger: "Lactose", level: "amber", note: "Many Metformin formulations contain lactose excipients." });
      }
      if (lowerMed.includes("aspirin") && (redTriggers.includes("Salicylates") || amberTriggers.includes("Salicylates"))) {
        alerts.push({ med, trigger: "Salicylates", level: "red", note: "Aspirin is a high-salicylate compound." });
      }
    });

    return alerts;
  },

  checkStatus() {
    if (this.getProtectionTimeRemaining() > 0) return "CONFIRMED";
    return "PROTECTED";
  }
};

// Auto-initialize on load
userProfile.init();
