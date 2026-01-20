/**
 * allerZEN Master Profile System
 * Merged Features: Family Support, 3-Hour Variable Timer, Blue Dot Status, & ED Support
 */

const userProfile = {
    session: {
        lastScanTimestamp: localStorage.getItem('az_last_scan_time') || null,
        validityDuration: 3 * 60 * 60 * 1000, // Fixed 3 hours per your requirement [cite: 2026-01-18]
        isExpired: false,
        activeProfileIndex: 0
    },

    profiles: JSON.parse(localStorage.getItem('allerzen_family_profiles')) || [
        {
            name: "Main User",
            type: "Adult",
            redList: [],    // Critical
            amberList: [],  // Sensitivities
            blueList: [],   // Boundaries (ED Support)
            greenList: []   // Power Choices
        }
    ],

    init: function() {
        console.log("allerZEN: Shield Logic Initialized.");
        this.updateBlueDotUI();
        this.loadSelectedChips(); // Syncs the UI with saved data
    },

    // 1. Logic to handle the Chip selections in the UI [cite: 2026-01-18]
    toggleChipData: function(category, value) {
        const list = this.profiles[this.activeProfileIndex][category + 'List'];
        const index = list.indexOf(value);
        
        if (index > -1) {
            list.splice(index, 1); // Remove if already there
        } else {
            list.push(value); // Add if new
        }
        this.save();
    },

    // 2. Activate Shield & Pair with Business [cite: 2026-01-18]
    activateShield: function() {
        this.session.lastScanTimestamp = Date.now();
        localStorage.setItem('az_last_scan_time', this.session.lastScanTimestamp);
        localStorage.setItem('az_onboarding_complete', 'true');
        
        this.save();
        alert("Shield Activated! Your 3-hour safety window has started.");
        window.location.href = 'view.html'; // Redirect to user dashboard
    },

    // 3. Update the Blue Dot UI [cite: 2026-01-18]
    updateBlueDotUI: function() {
        const blueDot = document.querySelector('.blue-dot');
        const status = this.checkStatus();

        if (blueDot) {
            if (status === "PROTECTED") {
                blueDot.classList.add('pulse');
                blueDot.style.backgroundColor = '#007bff';
            } else {
                blueDot.classList.remove('pulse');
                blueDot.style.backgroundColor = '#808080'; // Gray if expired [cite: 2026-01-18]
            }
        }
    },

    checkStatus: function() {
        if (!this.session.lastScanTimestamp) return "No Scan";
        const now = Date.now();
        const elapsed = now - this.session.lastScanTimestamp;

        return (elapsed < this.session.validityDuration) ? "PROTECTED" : "EXPIRED";
    },

    save: function() {
        localStorage.setItem('allerzen_family_profiles', JSON.stringify(this.profiles));
    },

    loadSelectedChips: function() {
        // This visualizes saved selections when the page reloads
        const current = this.profiles[this.activeProfileIndex];
        const categories = ['red', 'amber', 'blue', 'green'];
        
        categories.forEach(cat => {
            const list = current[cat + 'List'];
            const buttons = document.querySelectorAll(`#${cat}-group button`);
            buttons.forEach(btn => {
                if (list.includes(btn.innerText)) {
                    btn.classList.add('active');
                }
            });
        });
    }
};

// Bridging HTML to JS [cite: 2026-01-18]
function toggleChip(btn) {
    const category = btn.parentElement.id.split('-')[0]; // gets 'red', 'blue' etc.
    btn.classList.toggle('active');
    userProfile.toggleChipData(category, btn.innerText);
}

function activateMyShield() {
    userProfile.activateShield();
}

userProfile.init();
