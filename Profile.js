/**
 * allerZEN Master Profile System
 * Merged Features: Family Support, 3-Hour Variable Timer, Blue Dot Status, & ED Support
 */

const userProfile = {
    session: {
        lastScanTimestamp: null,
        validityDuration: 3 * 60 * 60 * 1000, // Default 3 hours
        isExpired: false,
        activeProfileIndex: 0,
        currentBusiness: null // Track which business set the timer
    },

    // 2. Updated Family Profiles to match your new "Shield" UI
    profiles: [
        {
            name: "Main User",
            type: "Adult",
            redList: [],    // Critical/Anaphylaxis
            amberList: [],  // Sensitivities (Terpenes, etc.)
            blueList: [],   // Boundaries (ED Support/Sensory)
            greenList: []   // Power Choices (Safe Alternatives)
        }
    ],

    init: function() {
        const savedData = localStorage.getItem('allerzen_family_profiles');
        const setupStatus = localStorage.getItem('az_onboarding_complete');
        
        if (savedData) {
            this.profiles = JSON.parse(savedData);
        }
        
        // Gatekeeper: If setup is complete and we are on the LP, redirect to App
        if (setupStatus === 'true' && window.location.pathname.includes('index.html')) {
            window.location.href = 'view.html';
        }
        
        console.log("allerZEN: Shield Logic Initialized.");
        this.updateBlueDotUI();
    },

    // 3. Variable Expiration Support
    // Call this when a QR is scanned: e.g., userProfile.activateShield(1) for a 1-hour cafe window
    activateShield: function(customHours = 3) {
        this.session.validityDuration = customHours * 60 * 60 * 1000;
        this.session.lastScanTimestamp = Date.now();
        this.session.isExpired = false;
        
        // Save the installation/onboarding flag
        localStorage.setItem('az_onboarding_complete', 'true');
        this.save();
        this.updateBlueDotUI();
    },

    // 4. Update the Blue Dot UI across the app
    updateBlueDotUI: function() {
        const blueDot = document.querySelector('.blue-dot');
        const status = this.checkStatus();

        if (blueDot) {
            if (status === "PROTECTED") {
                blueDot.classList.add('pulse');
                blueDot.style.backgroundColor = '#007bff'; // Active Blue
            } else {
                blueDot.classList.remove('pulse');
                blueDot.style.backgroundColor = '#808080'; // Expired Gray
            }
        }
    },

    checkStatus: function() {
        if (!this.session.lastScanTimestamp) return "No Scan";
        
        const now = Date.now();
        const elapsed = now - this.session.lastScanTimestamp;

        if (elapsed >= this.session.validityDuration) {
            this.session.isExpired = true;
            return "EXPIRED";
        }
        return "PROTECTED";
    },

    save: function() {
        localStorage.setItem('allerzen_family_profiles', JSON.stringify(this.profiles));
    }
};

// Auto-initialize
userProfile.init();

// Export for use in other files
if (typeof module !== 'undefined') { module.exports = userProfile; }
