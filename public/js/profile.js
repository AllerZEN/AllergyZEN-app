// AllergyZEN Profile Management - Vanilla JavaScript
// This file manages all profile logic, persistence, and the 3-hour handshake

const STORAGE_KEY = "allergyzen_family_profiles";
const NOTES_KEY = "allergyzen_personal_notes";
const TRIALS_KEY = "allergyzen_trials";
const PROTECTION_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours

// Profile Manager
const userProfile = {
  profiles: [],
  session: {
    activeProfileIndex: 0,
    protectionWindow: {
      startTime: null,
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
            businessId: null,
            businessName: null,
            acknowledged: false,
            confirmedByBusiness: false
          }
        };
      }

      // Load personal notes
      const notesStored = localStorage.getItem(NOTES_KEY);
      if (notesStored) {
        this.personalNotes = JSON.parse(notesStored);
      }

      // Load trials
      const trialsStored = localStorage.getItem(TRIALS_KEY);
      if (trialsStored) {
        this.trials = JSON.parse(trialsStored);
      }

      // Create default profile if none exists
      if (this.profiles.length === 0) {
        this.profiles.push({
          name: "Me",
          items: { red: [], amber: [], green: [], blue: [] },
          createdAt: new Date().toISOString(),
          boundaries: {
            softTextures: false,
            noSaltSauce: false,
            deconstructed: false,
            deconstructedNotes: "",
            customNotes: []
          }
        });
        this.saveToStorage();
      }
    } catch (e) {
      console.error("Error loading profiles:", e);
      this.profiles = [{
        name: "Me",
        items: { red: [], amber: [], green: [], blue: [] },
        createdAt: new Date().toISOString(),
        boundaries: {
          softTextures: false,
          noSaltSauce: false,
          deconstructed: false,
          deconstructedNotes: "",
          customNotes: []
        }
      }];
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

  saveNotes() {
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(this.personalNotes));
    } catch (e) {
      console.error("Error saving notes:", e);
    }
  },

  saveTrials() {
    try {
      localStorage.setItem(TRIALS_KEY, JSON.stringify(this.trials));
    } catch (e) {
      console.error("Error saving trials:", e);
    }
  },

  // Profile switching - THE CRITICAL FIX
  switchProfile(index) {
    if (index >= 0 && index < this.profiles.length) {
      this.session.activeProfileIndex = index;
      this.saveToStorage();
      
      // Trigger UI updates
      if (typeof loadSelectedChips === "function") {
        loadSelectedChips();
      }
      if (typeof window !== "undefined" && typeof window.updateProfileUI === "function") {
        window.updateProfileUI();
      }
      
      // Dispatch custom event for React components
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

  // Item management with dot colors
  addItem(itemName, category, dotColor) {
    const profile = this.getActiveProfile();
    if (!profile) return false;

    // Ensure items object exists with all dot categories
    if (!profile.items) {
      profile.items = { red: [], amber: [], green: [], blue: [] };
    }

    // Remove from all other categories first
    ["red", "amber", "green", "blue"].forEach(color => {
      if (!profile.items[color]) profile.items[color] = [];
      profile.items[color] = profile.items[color].filter(i => i.name !== itemName);
    });

    // Add to the selected category
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

  removeItem(itemName, dotColor) {
    const profile = this.getActiveProfile();
    if (!profile || !profile.items || !profile.items[dotColor]) return false;

    profile.items[dotColor] = profile.items[dotColor].filter(i => i.name !== itemName);
    this.saveToStorage();
    return true;
  },

  getItemsByDot(dotColor) {
    const profile = this.getActiveProfile();
    if (!profile || !profile.items) return [];
    return profile.items[dotColor] || [];
  },

  // Family management
  addFamilyMember(name) {
    const newMember = {
      name: name,
      items: { red: [], amber: [], green: [], blue: [] },
      createdAt: new Date().toISOString(),
      boundaries: {
        softTextures: false,
        noSaltSauce: false,
        deconstructed: false,
        deconstructedNotes: "",
        customNotes: []
      }
    };
    this.profiles.push(newMember);
    this.saveToStorage();
    return newMember;
  },

  updateProfileName(index, newName) {
    if (index >= 0 && index < this.profiles.length) {
      this.profiles[index].name = newName;
      this.saveToStorage();
      return true;
    }
    return false;
  },

  deleteProfile(index) {
    if (index > 0 && index < this.profiles.length) {
      this.profiles.splice(index, 1);
      if (this.session.activeProfileIndex >= this.profiles.length) {
        this.session.activeProfileIndex = 0;
      }
      this.saveToStorage();
      return true;
    }
    return false;
  },

  // 3-Hour Protection Window
  startProtectionWindow(businessId, businessName) {
    this.session.protectionWindow = {
      startTime: new Date().toISOString(),
      businessId: businessId,
      businessName: businessName,
      acknowledged: true,
      confirmedByBusiness: false
    };
    this.saveToStorage();
  },

  confirmByBusiness() {
    if (this.session?.protectionWindow) {
      this.session.protectionWindow.confirmedByBusiness = true;
      this.saveToStorage();
    }
  },

  getProtectionTimeRemaining() {
    const startTime = this.session?.protectionWindow?.startTime;
    if (!startTime) return 0;

    const startTimeMs = new Date(startTime).getTime();
    const elapsed = Date.now() - startTimeMs;
    const remaining = PROTECTION_DURATION_MS - elapsed;

    return Math.max(0, remaining);
  },

  isProtectionActive() {
    return this.getProtectionTimeRemaining() > 0;
  },

  checkStatus() {
    const activeProfile = this.profiles?.[this.session?.activeProfileIndex];
    if (!activeProfile) return "UNKNOWN";

    const protectionWindow = this.session?.protectionWindow;

    if (protectionWindow?.startTime) {
      if (this.isProtectionActive()) {
        if (protectionWindow.confirmedByBusiness) {
          return "CONFIRMED";
        }
        return "PROTECTED";
      }
      return "EXPIRED";
    }

    // Check if user has items
    if (activeProfile.items) {
      const totalItems = 
        (activeProfile.items.red?.length || 0) +
        (activeProfile.items.amber?.length || 0) +
        (activeProfile.items.green?.length || 0) +
        (activeProfile.items.blue?.length || 0);
      
      if (totalItems > 0) return "PROTECTED";
    }

    return "INACTIVE";
  },

  clearProtectionWindow() {
    this.session.protectionWindow = {
      startTime: null,
      businessId: null,
      businessName: null,
      acknowledged: false,
      confirmedByBusiness: false
    };
    this.saveToStorage();
  },

  cleanupExpiredData() {
    if (this.session?.protectionWindow?.startTime && !this.isProtectionActive()) {
      this.clearProtectionWindow();
    }
  },

  // Trial Day Tracker
  addTrial(foodItem, date) {
    const trial = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      foodItem: foodItem,
      date: date || new Date().toISOString(),
      status: "pending", // pending, liked, disliked
      notes: ""
    };
    this.trials.push(trial);
    this.saveTrials();
    return trial;
  },

  updateTrialStatus(trialId, status, notes) {
    const trial = this.trials.find(t => t.id === trialId);
    if (trial) {
      trial.status = status;
      if (notes) trial.notes = notes;
      this.saveTrials();

      // If liked, offer to move to green list
      if (status === "liked") {
        return { trial, suggestMove: true };
      }
    }
    return { trial, suggestMove: false };
  },

  moveTrialToSafeList(trialId) {
    const trial = this.trials.find(t => t.id === trialId);
    if (trial && trial.status === "liked") {
      this.addItem(trial.foodItem, "Trial Success", "green");
      // Remove from trials
      this.trials = this.trials.filter(t => t.id !== trialId);
      this.saveTrials();
      return true;
    }
    return false;
  },

  // Notes management
  addNote(note) {
    const newNote = {
      ...note,
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      date: new Date().toISOString()
    };
    this.personalNotes.unshift(newNote);
    this.saveNotes();
    return newNote;
  },

  deleteNote(id) {
    this.personalNotes = this.personalNotes.filter(n => n.id !== id);
    this.saveNotes();
  },

  getNotes() {
    return this.personalNotes;
  },

  getTrials() {
    return this.trials;
  }
};

// Initialize on script load
userProfile.init();

// Helper function to load chips (will be defined in view.html)
function loadSelectedChips() {
  // This will be overridden in the HTML file
  console.log("loadSelectedChips called - override this in your HTML");
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = userProfile;
}
