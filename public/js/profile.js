// AllergyZEN Profile Management - Master Script v4.5
// This file manages profile logic, persistence, variable handshakes, and global theming

const STORAGE_KEY = "allergyzen_family_profiles";
const NOTES_KEY = "allergyzen_personal_notes";
const TRIALS_KEY = "allergyzen_trials";

// Profile Manager
const userProfile = {
  profiles: [],
  session: {
    activeProfileIndex: 0,
    protectionWindow: {
      startTime: null,
      durationMs: 3 * 60 * 60 * 1000, // Default 3 hours
      businessId: null,
      businessName: null,
      acknowledged: false,
      confirmedByBusiness: false
    }
  },
  personalNotes: [],
  trials: [],

  // Initialize on load
  init() {
    this.loadFromStorage();
    this.cleanupExpiredData();
    this.setupScannerListeners(); // New: Make buttons "Live"
    this.applyGlobalTheme(); // New: Make profile color "Stick"
    return this;
  },

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.profiles = data.profiles || [];
        this.session = data.session || {
          activeProfileIndex: 0,
          protectionWindow: {
            startTime: null,
            durationMs: 3 * 60 * 60 * 1000,
            businessId: null,
            businessName: null,
            acknowledged: false,
            confirmedByBusiness: false
          }
        };
      }

      // Load personal notes & trials
      const notesStored = localStorage.getItem(NOTES_KEY);
      if (notesStored) this.personalNotes = JSON.parse(notesStored);
      const trialsStored = localStorage.getItem(TRIALS_KEY);
      if (trialsStored) this.trials = JSON.parse(trialsStored);

      // Create default profile if none exists
      if (this.profiles.length === 0) {
        this.profiles.push({
          name: "Me",
          color: "#8E55A2", // Default Primary
          items: { red: [], amber: [], brown: [], green: [], blue: [] }, // Updated Categories
          createdAt: new Date().toISOString(),
          boundaries: { softTextures: false, noSaltSauce: false, deconstructed: false }
        });
        this.saveToStorage();
      }
    } catch (e) {
      console.error("Error loading profiles:", e);
    }
  },

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        profiles: this.profiles,
        session: this.session
      }));
    } catch (e) {
      console.error("Error saving profiles:", e);
    }
  },

  // NEW: Global Theming Logic
  applyGlobalTheme() {
    const activeProfile = this.getActiveProfile();
    if (activeProfile && activeProfile.color) {
      document.documentElement.style.setProperty('--profile-theme', activeProfile.color);
      // Update UI elements that need immediate color sync
      const homeCircle = document.querySelector('.home-circle');
      if (homeCircle) homeCircle.style.background = activeProfile.color;
    }
  },

  // Profile switching with Sticky Theme
  switchProfile(index) {
    if (index >= 0 && index < this.profiles.length) {
      this.session.activeProfileIndex = index;
      this.saveToStorage();
      this.applyGlobalTheme(); // Ensure color sticks immediately
      
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("profileSwitched", { 
          detail: { index, profile: this.profiles[index] }
        }));
      }
      return this.profiles[index];
    }
    return null;
  },

  getActiveProfile() {
    return this.profiles[this.session.activeProfileIndex] || null;
  },

  // Updated Item management with Brown (Dislike)
  addItem(itemName, category, dotColor) {
    const profile = this.getActiveProfile();
    if (!profile) return false;

    if (!profile.items) {
      profile.items = { red: [], amber: [], brown: [], green: [], blue: [] };
    }

    // Clear existing to avoid duplicates across categories
    ["red", "amber", "brown", "green", "blue"].forEach(color => {
      if (!profile.items[color]) profile.items[color] = [];
      profile.items[color] = profile.items[color].filter(i => i.name !== itemName);
    });

    if (dotColor && profile.items[dotColor]) {
      profile.items[dotColor].push({
        name: itemName,
        category: category,
        addedAt: new Date().toISOString()
      });
    }

    this.saveToStorage();
    return true;
  },

  // SCANNER & HANDSHAKE LOGIC
  setupScannerListeners() {
    const scanTriggers = ['nav-scan', 'scan-trigger-icon'];
    
    scanTriggers.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.onclick = () => this.startScanner();
      }
    });

    const closeBtn = document.getElementById('close-scanner');
    if (closeBtn) {
        closeBtn.onclick = () => this.stopScanner();
    }
  },

  startScanner() {
    const reader = document.getElementById('reader-container');
    reader.style.display = 'block';

    this.scanner = new Html5Qrcode("qr-reader");
    this.scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (decodedText) => this.handleScanResult(decodedText)
    ).catch(err => alert("Camera error: Please check permissions."));
  },

  stopScanner() {
    if (this.scanner) {
      this.scanner.stop().then(() => {
        document.getElementById('reader-container').style.display = 'none';
      });
    }
  },

  handleScanResult(data) {
    this.stopScanner();
    // Simulate detecting a Business QR code
    if (data.includes("business") || data.startsWith("AZ")) {
        this.openHandshakeModal(data);
    } else {
        alert("Product Scanned: " + data + "\nChecking ZEN Spectrum...");
    }
  },

  // Variable Handshake: 30m, 1h, 3h, 24h
  openHandshakeModal(businessId) {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    
    overlay.style.display = 'flex';
    content.innerHTML = `
        <h3>🤝 Connect to Business</h3>
        <p>Choose your handshake duration:</p>
        <div style="display:grid; gap:10px;">
            <button class="spec-btn" style="background:var(--profile-theme)" onclick="userProfile.activateHandshake('${businessId}', 30)">30 Minutes</button>
            <button class="spec-btn" style="background:var(--profile-theme)" onclick="userProfile.activateHandshake('${businessId}', 60)">1 Hour</button>
            <button class="spec-btn" style="background:var(--profile-theme)" onclick="userProfile.activateHandshake('${businessId}', 180)">3 Hours</button>
            <button class="spec-btn" style="background:var(--profile-theme)" onclick="userProfile.activateHandshake('${businessId}', 1440)">24 Hours</button>
            <button class="spec-btn" style="background:#6B7280" onclick="document.getElementById('modal-overlay').style.display='none'">Cancel</button>
        </div>
    `;
  },

  activateHandshake(bizId, minutes) {
    const durationMs = minutes * 60 * 1000;
    this.session.protectionWindow = {
      startTime: new Date().toISOString(),
      durationMs: durationMs,
      businessId: bizId,
      acknowledged: true,
      confirmedByBusiness: false
    };
    
    this.saveToStorage();
    document.getElementById('modal-overlay').style.display = 'none';
    alert(`Handshake active for ${minutes} minutes! Your Shield is now pulsing.`);
    
    if (typeof window.updateProfileUI === "function") window.updateProfileUI();
  },

  getProtectionTimeRemaining() {
    const start = this.session?.protectionWindow?.startTime;
    const duration = this.session?.protectionWindow?.durationMs || 0;
    if (!start) return 0;

    const elapsed = Date.now() - new Date(start).getTime();
    return Math.max(0, duration - elapsed);
  },

  isProtectionActive() {
    return this.getProtectionTimeRemaining() > 0;
  },

  // Manual "Un-shake" button
  clearProtectionWindow() {
    this.session.protectionWindow = {
      startTime: null,
      durationMs: 0,
      businessId: null,
      acknowledged: false,
      confirmedByBusiness: false
    };
    this.saveToStorage();
    alert("Handshake disconnected. Business data wiped.");
  },

  cleanupExpiredData() {
    if (this.session?.protectionWindow?.startTime && !this.isProtectionActive()) {
      this.clearProtectionWindow();
    }
  }
};

// Initialize
userProfile.init();

// Export
if (typeof module !== "undefined" && module.exports) {
  module.exports = userProfile;
}
