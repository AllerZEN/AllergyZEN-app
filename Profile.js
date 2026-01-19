/**
 * allerZEN Master Profile System
 * Features: Multi-user Family Support, Persistent Storage, 3-Hour Protection Timer
 */

const userProfile = {
    // 1. Session & Safety Data
    session: {
        lastScanTimestamp: null,
        validityDuration: 3 * 60 * 60 * 1000, // 3 hours
        isExpired: false,
        activeProfileIndex: 0 // Default to the main account holder
    },

    // 2. Family Profiles Array
    // This allows parents to add kids/family members
    profiles: [
        {
            name: "Main User",
            type: "Adult",
            redList: [],    // High Danger
            orangeList: [], // Moderate/Caution
            greenList: []   // Safe/Verified
        }
    ],

    // 3. Initialize & Load Data
    // Pulls saved family data from the phone's memory
    init: function() {
        const savedData = localStorage.getItem('allerzen_family_profiles');
        if (savedData) {
            this.profiles = JSON.parse(savedData);
        }
        console.log("allerZEN: Family Profiles Loaded.");
    },

    // 4. Add Family Member
    addFamilyMember: function(name, type = "Child") {
        this.profiles.push({
            name: name,
            type: type,
            redList: [],
            orangeList: [],
            greenList: []
        });
        this.save();
    },

    // 5. Save Data
    save: function() {
        localStorage.setItem('allerzen_family_profiles', JSON.stringify(this.profiles));
    },

    // 6. The Protection Logic
    startProtectionTimer: function() {
        this.session.lastScanTimestamp = Date.now();
        this.session.isExpired = false;
        console.log("allerZEN: 3-Hour Family Shield Activated.");
    },

    checkStatus: function() {
        if (!this.session.lastScanTimestamp) return "No Scan Detected";
        
        const now = Date.now();
        const elapsed = now - this.session.lastScanTimestamp;

        if (elapsed >= this.session.validityDuration) {
            this.session.isExpired = true;
            return "EXPIRED: Please Rescan";
        }
        return "PROTECTED";
    }
};

// Auto-initialize when the app loads
userProfile.init();

export default userProfile;
