// AllergyZEN Profile Management - Master Script v5.0 (2026 Bulletproof Build)
// Focus: Variable Handshakes, Zen Spectrum Integrity, and Business Privacy Wipe

const STORAGE_KEY = "allergyzen_family_profiles";
const SETTINGS_KEY = "allergyzen_app_settings";

const userProfile = {
  profiles: [],
  session: {
    activeProfileIndex: 0,
    protectionWindow: {
      startTime: null,
      durationMs: 180 * 60 * 1000, // Default 3 hours
      businessName: null,
      handshakeType: "3h", 
      active: false
    }
  },

  init() {
    this.loadFromStorage();
    this.cleanupExpiredData();
    this.applyGlobalTheme();
    this.startGlobalTimer(); // Constant check for Handshake expiry
    return this;
  },

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.profiles = data.profiles || [];
        this.session = data.session || this.session;
      }

      if (this.profiles.length === 0) {
        this.profiles.push({
          name: "Primary User",
          color: "#3B82F6", // Default Zen Blue
          // FULL ZEN SPECTRUM INITIALIZATION
          items: { 
            red: [], // 🔴 Anaphylaxis
            amber: [], // 🟠 Sensitivity
            brown: [], // 🟤 Dislike/Intolerance
            blue: [], // 💙 Sensory Boundary
            green: [] // 🟢 Safe Alternatives
          },
          createdAt: new Date().toISOString()
        });
        this.saveToStorage();
      }
    } catch (e) {
      console.error("Profile Load Error:", e);
    }
  },

  saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      profiles: this.profiles,
      session: this.session
    }));
  },

  // HANDSHAKE DURATION LOGIC (30m, 1h, 3h, 24h)
  activateHandshake(bizName, minutes) {
    const durationMs = minutes * 60 * 1000;
    this.session.protectionWindow = {
      startTime: new Date().toISOString(),
      durationMs: durationMs,
      businessName: bizName || "Partner Business",
      handshakeType: this.formatDurationLabel(minutes),
      active: true
    };
    
    this.saveToStorage();
    this.triggerShieldPulse();
  },

  formatDurationLabel(min) {
    if (min === 30) return "30m";
    if (min === 60) return "1h";
    if (min === 180) return "3h";
    if (min === 1440) return "24h";
    return min + "m";
  },

  // THE BULLETPROOF WIPE
  cleanupExpiredData() {
    const window = this.session.protectionWindow;
    if (window.active && window.startTime) {
      const elapsed = Date.now() - new Date(window.startTime).getTime();
      if (elapsed >= window.durationMs) {
        this.forcePrivacyWipe();
      }
    }
  },

  forcePrivacyWipe() {
    this.session.protectionWindow = {
      startTime: null,
      durationMs: 0,
      businessName: null,
      active: false
    };
    this.saveToStorage();
    console.log("🛡️ Zen Shield: Privacy Wipe Executed. Business access revoked.");
    
    // Notify UI if on the Shield Page
    window.dispatchEvent(new CustomEvent("handshakeExpired"));
  },

  // SPECTRUM ENGINE: Ensures items go to the right bucket
  addItemToSpectrum(name, tier) {
    const profile = this.getActiveProfile();
    if (!profile || !profile.items[tier]) return;

    // Clean duplicates from other tiers first
    Object.keys(profile.items).forEach(t => {
      profile.items[t] = profile.items[t].filter(i => i.name !== name);
    });

    profile.items[tier].push({
      name: name,
      timestamp: Date.now()
    });

    this.saveToStorage();
  },

  getActiveProfile() {
    return this.profiles[this.session.activeProfileIndex];
  },

  applyGlobalTheme() {
    const profile = this.getActiveProfile();
    if (profile) {
      document.documentElement.style.setProperty('--profile-theme', profile.color);
    }
  },

  startGlobalTimer() {
    setInterval(() => this.cleanupExpiredData(), 10000); // Check every 10s
  },

  triggerShieldPulse() {
    // Communication with index.html and view.html
    window.dispatchEvent(new CustomEvent("shieldActivated"));
  }
};

userProfile.init();
