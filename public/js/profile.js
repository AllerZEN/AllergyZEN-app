// allergyZEN Wellness Assistant App - Master Script v5.3
// Focus: Variable Handshakes, Zen Spectrum Integrity, and Business Privacy Wipe

const STORAGE_KEY = "allergyzen_family_profiles";
const SETTINGS_KEY = "allergyzen_app_settings";
const APP_VERSION = "2.1.1_LABEL_FIX"; // Incrementing this forces a wipe of old dev data [cite: 2026-01-29]

const userProfile = {
  profiles: [],
  session: {
    activeProfileIndex: 0,
    protectionWindow: {
      startTime: null,
      durationMs: 180 * 60 * 1000, // Default 3 hours [cite: 2026-01-18]
      businessName: null,
      handshakeType: "3h", 
      active: false
    }
  },

  init() {
    this.checkVersionReset(); // Ensures the 243 items are wiped for a fresh user [cite: 2026-01-28]
    this.loadFromStorage();
    this.cleanupExpiredData();
    this.applyGlobalTheme();
    this.startGlobalTimer(); 
    return this;
  },

  checkVersionReset() {
    if (localStorage.getItem("az_app_version") !== APP_VERSION) {
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
            brown: [], // 🟤 Dislike (Updated from Reactivity) [cite: 2026-01-25]
            blue: [], // 💙 Sensory Boundary [cite: 2026-01-20]
            green: [] // 🟢 Safe Alternatives [cite: 2026-01-25]
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

  // HANDSHAKE DURATION LOGIC (30m, 1h, 3h, 24h) [cite: 2026-01-25]
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
    console.log("🛡️ Zen Shield: Privacy Wipe Executed. Business access revoked. [cite: 2026-01-18]");
    window.dispatchEvent(new CustomEvent("handshakeExpired"));
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

// UNIVERSAL CLICK HANDLER FOR INTERACTIVITY
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab, .nav-item, .btn-main, .menu-item');
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
    else if (label.includes('HOME')) {
        navigateTo('azwaa-app');
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
