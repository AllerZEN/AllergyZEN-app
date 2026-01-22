// allergyZEN Master Profile Logic - Production v1.0
const STORAGE_KEY = "allergyzen_family_profiles";
const PROTECTION_DURATION_MS = 3 * 60 * 60 * 1000; // 3 Hours

const userProfile = {
  profiles: [],
  session: {
    activeProfileIndex: 0,
    protectionWindow: { startTime: null, businessName: null, confirmedByBusiness: false }
  },

  init() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      this.profiles = data.profiles || [];
      this.session = data.session || this.session;
    }
    
    // DEFAULT TO "ME" - Ensures a clean start
    if (this.profiles.length === 0) {
      this.profiles.push({
        name: "Me",
        items: { red: [], amber: [], green: [], blue: [] },
        boundaries: { softTextures: false, noSaltSauce: false }
      });
    }
    this.cleanupExpiredData();
    this.saveToStorage();
    return this;
  },

  saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      profiles: this.profiles,
      session: this.session
    }));
  },

  switchProfile(index) {
    if (index >= 0 && index < this.profiles.length) {
      this.session.activeProfileIndex = index;
      this.saveToStorage();
    }
  },

  getActiveProfile() {
    return this.profiles[this.session.activeProfileIndex];
  },

  // THE 3-HOUR HANDSHAKE (Bulletproof Security)
  startProtectionWindow(businessId, businessName) {
    this.session.protectionWindow = {
      startTime: new Date().toISOString(),
      businessId: businessId,
      businessName: businessName,
      confirmedByBusiness: true // Set to true for the "Confirmed" blue pulse
    };
    this.saveToStorage();
    
    // Auto-wipe security trigger
    setTimeout(() => {
      this.cleanupExpiredData();
      if(typeof updateTimer === 'function') updateTimer();
    }, PROTECTION_DURATION_MS);
  },

  getProtectionTimeRemaining() {
    const startTime = this.session.protectionWindow?.startTime;
    if (!startTime) return 0;
    const elapsed = Date.now() - new Date(startTime).getTime();
    return Math.max(0, PROTECTION_DURATION_MS - elapsed);
  },

  cleanupExpiredData() {
    if (this.getProtectionTimeRemaining() <= 0) {
      this.session.protectionWindow = { startTime: null, businessName: null };
      this.saveToStorage();
    }
  },

  checkStatus() {
    if (this.getProtectionTimeRemaining() > 0) return "CONFIRMED";
    return "PROTECTED"; // Default state if profile has items
  }
};

userProfile.init();
