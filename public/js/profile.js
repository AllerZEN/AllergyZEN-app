/**
 * allergyZEN Wellness Assistant - Profile.js
 * Version: 1.0 (Zen Spectrum Audit Build)
 * Purpose: Manages user risk profile, generates the Zen Spectrum data, 
 * handles the Bulletproof Handshake (30m/1h/3h/24h), and secures privacy.
 */

/* =========================================
   SECTION 1: DATA & STATE MANAGEMENT
   ========================================= */

   const ProfileManager = {
    // State to be saved to localStorage
    state: {
        userName: "User", // Default, anonymous until set
        selectedRisks: [], // Array of strings (e.g., "Peanuts", "SDS", "Vicuna")
        handshakeDuration: 180, // Default: 3 hours (in minutes)
        sessionActive: false,
        startTime: null,
        shieldStatus: 'green' // 🟢 (Safe), 🟠 (Caution), 🔴 (Danger)
    },

    // THE FULL ZEN SPECTRUM DATABASE
    // Updated [2026-01-16] with Batch Highlights
    zenSpectrumCategories: {
        "Common Food Triggers": [
            "Peanuts", "Tree Nuts", "Dairy", "Egg", "Wheat", "Soy", "Fish", "Shellfish"
        ],
        "Medicinal Excipients": [
            "Croscarmellose Sodium", "Magnesium Stearate", "Lactose Monohydrate", 
            "Titanium Dioxide", "Microcrystalline Cellulose", "Gelatin (Bovine)", "Gelatin (Porcine)"
        ],
        "Photographic & Industrial Chemicals": [
            "Hydroquinone", "Metol", "Glacial Acetic Acid", "Ammonium Thiosulfate"
        ],
        "Exotic Wood Dusts": [
            "Wenge", "Padauk", "Cocobolo", "Ebony", "Rosewood", "Mahogany", "Teak"
        ],
        "Fermented Basics (Biogenic Amines)": [
            "Natto (Bacillus subtilis)", "Kimchi (Lactobacillus)", "Kombucha", 
            "Aged Cheese", "Sauerkraut", "Miso"
        ],
        "The Lab Set (Science/Medical Pro)": [
            "SDS (Sodium Dodecyl Sulfate)", "EDTA", "DMSO (Dimethyl Sulfoxide)", 
            "Formaldehyde", "Latex", "Nitrile Accelerators"
        ],
        "Terpene Profile (Plant Compounds)": [
            "Pinene (Pine/Conifer)", "Myrcene (Hops/Mango)", "Limonene (Citrus)", 
            "Linalool (Lavender)", "Caryophyllene (Pepper)", "Eucalyptol"
        ],
        "Modern Materials (Sustainable Textiles)": [
            "Mushroom Leather (Mycelium)", "PLA (Polylactic Acid)", "Bamboo Rayon", 
            "Hemp Composite", "Recycled PET"
        ],
        "Luxury Fibers": [
            "Vicuna", "Qiviut (Muskox)", "Cashmere", "Angora", "Mohair", "Alpaca"
        ]
    },

    /* =========================================
       SECTION 2: INITIALIZATION & AUDIT
       ========================================= */
    
    // UPGRADE PROMPT: Check for existing 'allergyZEN_Profile' in localStorage.
    // If corruption is found (invalid JSON), force a reset to prevent app crash.
    init: function() {
        console.log("Initializing allergyZEN Profile Manager...");
        this.loadProfile();
        this.renderRiskCategories();
        this.setupEventListeners();
        this.updateHandshakeUI(); // Ensure UI matches saved state
    },

    /* =========================================
       SECTION 3: DOM RENDERING (ZEN SPECTRUM)
       ========================================= */

    renderRiskCategories: function() {
        const container = document.getElementById('risk-categories-container');
        if (!container) return; // Guard clause if running on a page without the container

        container.innerHTML = ''; // Clear current

        // Loop through the Zen Spectrum Categories
        for (const [category, items] of Object.entries(this.zenSpectrumCategories)) {
            // Create Category Header
            const section = document.createElement('div');
            section.className = 'spectrum-section mb-6';
            
            const title = document.createElement('h3');
            title.className = 'text-lg font-bold text-gray-700 mb-2 border-b border-gray-200 pb-1';
            title.innerText = category;
            section.appendChild(title);

            // Create Grid for Items
            const grid = document.createElement('div');
            grid.className = 'grid grid-cols-2 gap-2';

            items.forEach(item => {
                const label = document.createElement('label');
                label.className = 'flex items-center space-x-2 cursor-pointer p-2 bg-white rounded shadow-sm hover:bg-blue-50 transition';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = item;
                checkbox.className = 'form-checkbox h-5 w-5 text-blue-600';
                
                // Check if user already selected this risk
                if (this.state.selectedRisks.includes(item)) {
                    checkbox.checked = true;
                }

                // Event Listener for Toggling
                checkbox.addEventListener('change', (e) => {
                    this.toggleRisk(item, e.target.checked);
                });

                const span = document.createElement('span');
                span.innerText = item;
                span.className = 'text-sm text-gray-800';

                label.appendChild(checkbox);
                label.appendChild(span);
                grid.appendChild(label);
            });

            section.appendChild(grid);
            container.appendChild(section);
        }
    },

    /* =========================================
       SECTION 4: LOGIC & STATE UPDATES
       ========================================= */

    toggleRisk: function(riskItem, isChecked) {
        if (isChecked) {
            if (!this.state.selectedRisks.includes(riskItem)) {
                this.state.selectedRisks.push(riskItem);
            }
        } else {
            this.state.selectedRisks = this.state.selectedRisks.filter(r => r !== riskItem);
        }
        // UPGRADE PROMPT: Auto-save on every toggle to prevent data loss if browser closes unexpectedly.
        this.saveProfile(); 
        console.log(`Risk Updated: ${riskItem} is now ${isChecked ? 'Active' : 'Inactive'}`);
    },

    // Handshake Duration Setter (30m, 1hr, 3hr, 24hr)
    setHandshakeDuration: function(minutes) {
        const allowedDurations = [30, 60, 180, 1440];
        
        if (allowedDurations.includes(parseInt(minutes))) {
            this.state.handshakeDuration = parseInt(minutes);
            this.saveProfile();
            this.updateHandshakeUI();
            console.log(`Handshake duration set to ${minutes} minutes.`);
        } else {
            // ERROR FIX PROMPT: If an invalid duration is injected, default to 3 hours (180) for safety.
            console.error("Invalid duration attempt. Reverting to 180 mins.");
            this.state.handshakeDuration = 180;
            this.saveProfile();
        }
    },

    updateHandshakeUI: function() {
        // Visual feedback for which timer button is active
        const buttons = document.querySelectorAll('.handshake-btn');
        buttons.forEach(btn => {
            if (parseInt(btn.dataset.duration) === this.state.handshakeDuration) {
                btn.classList.add('bg-blue-600', 'text-white');
                btn.classList.remove('bg-gray-200', 'text-gray-700');
            } else {
                btn.classList.remove('bg-blue-600', 'text-white');
                btn.classList.add('bg-gray-200', 'text-gray-700');
            }
        });
    },

    /* =========================================
       SECTION 5: ACTIVATION & STORAGE (Bulletproof)
       ========================================= */

    activateShield: function() {
        if (this.state.selectedRisks.length === 0) {
            alert("Please select at least one risk factor before activating your Shield.");
            return;
        }

        // 1. Set Active Timestamp
        this.state.sessionActive = true;
        this.state.startTime = Date.now();
        this.saveProfile();

        // 2. Schedule the Wipe (In memory fallback)
        // Note: Main wipe logic handles in view.html via timestamp check, 
        // but this adds redundancy.
        setTimeout(() => {
            this.wipeSensitiveData();
        }, this.state.handshakeDuration * 60 * 1000);

        // 3. Redirect to The Shield
        window.location.href = 'view.html';
    },

    saveProfile: function() {
        try {
            const serialized = JSON.stringify(this.state);
            localStorage.setItem('allergyZEN_Profile', serialized);
        } catch (e) {
            // ERROR FIX PROMPT: Catch QuotaExceededError in localStorage (rare but possible with massive lists).
            // Solution: Alert user to clear cache or switch browsers.
            console.error("Storage Save Failed", e);
            alert("Storage Error: Your profile could not be saved. Please clear browser cache.");
        }
    },

    loadProfile: function() {
        const saved = localStorage.getItem('allergyZEN_Profile');
        if (saved) {
            try {
                this.state = JSON.parse(saved);
                // UPGRADE PROMPT: If we add new keys to 'state' in future versions, 
                // merge them here using Object.assign to avoid overwriting defaults with nulls.
            } catch (e) {
                console.error("Corrupt profile data found. Resetting.");
                localStorage.removeItem('allergyZEN_Profile');
            }
        }
    },

    wipeSensitiveData: function() {
        console.warn("Handshake expired. Wiping session data.");
        this.state.sessionActive = false;
        this.state.startTime = null;
        this.saveProfile();
        // Redirect if currently on the view page
        if (window.location.href.includes('view.html')) {
            window.location.href = 'index.html';
        }
    },

    /* =========================================
       SECTION 6: EVENT LISTENERS
       ========================================= */

    setupEventListeners: function() {
        // Handshake Buttons
        const timerButtons = document.querySelectorAll('.handshake-btn');
        timerButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setHandshakeDuration(e.target.dataset.duration);
            });
        });

        // Activate Button
        const activateBtn = document.getElementById('activate-shield-btn');
        if (activateBtn) {
            activateBtn.addEventListener('click', () => {
                this.activateShield();
            });
        }
        
        // Brown/Yellow Color Logic Prompt
        // ERROR FIX PROMPT: Ensure that anywhere 'yellow' status was used 
        // for "Caution", it is now rendered as 'brown' (🟤) #8B4513
        // This is primarily CSS, but if JS sets inline styles, override here.
    }
};

// Boot the system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ProfileManager.init();
});
