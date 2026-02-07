// AllergyZEN Profile Management - Master Script v5.0 (2026 Bulletproof Build)
// Focus: Variable Handshakes, Zen Spectrum Integrity, and Business Privacy Wipe

const STORAGE_KEY = "allergyzen_family_profiles";
const SETTINGS_KEY = "allergyzen_app_settings";
const APP_VERSION = "2.0.8_CLEAN"; // Incrementing this forces a wipe of old dev data

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
    this.checkVersionReset(); // Ensures the 243 items are wiped for a fresh user
    this.loadFromStorage();
    this.cleanupExpiredData();
    this.applyGlobalTheme();
    this.startGlobalTimer(); 
    return this;
  },

  checkVersionReset() {
    const savedVersion = localStorage.getItem("az_app_version");
    if (savedVersion !== APP_VERSION) {
      localStorage.clear(); 
      localStorage.setItem("az_app_version", APP_VERSION);
      console.log("🛡️ allergyZEN: System Reset executed. Clean slate active.");
    }
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
          color: "#3B82F6", 
          items: { 
            red: [], // 🔴 Anaphylaxis
            amber: [], // 🟠 Sensitivity
            brown: [], // 🟤 Dislike/Intolerance (Updated from Yellow)
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
    window.dispatchEvent(new CustomEvent("handshakeExpired"));
  },

  addItemToSpectrum(name, tier) {
    const profile = this.getActiveProfile();
    if (!profile || !profile.items[tier]) return;

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
    setInterval(() => this.cleanupExpiredData(), 10000); 
  },

  triggerShieldPulse() {
    window.dispatchEvent(new CustomEvent("shieldActivated"));
  }
};

userProfile.init();

document.addEventListener('click', (e) => {
    const btn = e.target.closest('button, .menu-item, [role="button"], .tab-button, .tab');
    if (!btn) return;

    const label = btn.innerText.toUpperCase().trim();
    
    if (label.includes('SCAN')) {
        if (typeof startScan === "function") startScan();
    } 
    else if (label.includes('BOUNDARIES') || label.includes('ED')) {
        navigateTo('ed-tab'); 
    } 
    else if (label.includes('SAFE')) {
        navigateTo('safe-tab');
    } 
    else if (label.includes('BLOCKED')) {
        navigateTo('blocked-tab');
    } 
    else if (label.includes('DISLIKE')) {
        navigateTo('dislike-tab');
    }
    else if (label.includes('BUSINESS')) {
        navigateTo('handshake');
    }
});

function navigateTo(screenId) {
    const screens = document.querySelectorAll('.app-screen, section');
    screens.forEach(s => s.style.display = 'none');

    const target = document.getElementById(screenId);
    if (target) {
        target.style.display = 'block';
        window.scrollTo(0,0);
    }
}
