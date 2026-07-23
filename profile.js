/**
 * profile.js - allergyZEN Core Profile & Spectrum Management
 */

// Global User Profile Manager Object
const userProfile = {
  activeProfileIndex: 0,
  profiles: [
    {
      name: "Default Profile",
      items: {
        red: ["Peanuts", "Shellfish", "Croscarmellose Sodium"],
        amber: ["Lactose", "Pinene", "SDS"],
        brown: ["Cilantro", "Mushrooms"],
        green: ["Sunflower Seed Butter", "Oat Milk", "Almond Milk"],
        blue: ["Texture Restrictions", "Neutral Language Request"]
      },
      zenHealth: {
        bloodSugar: "5.4",
        bloodPressure: "120/80",
        macros: "1800 kcal",
        medications: ["Metformin"]
      },
      activeHandshake: null
    }
  ],

  // Load from local storage on init
  init: function() {
    const saved = localStorage.getItem('az_user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.items) {
          this.profiles[0] = parsed;
        } else if (Array.isArray(parsed)) {
          this.profiles = parsed;
        }
      } catch(e) {
        console.error("Failed to parse cached profile data:", e);
      }
    }
  },

  getActiveProfile: function() {
    return this.profiles[this.activeProfileIndex] || this.profiles[0];
  },

  saveToStorage: function() {
    localStorage.setItem('az_user_profile', JSON.stringify(this.getActiveProfile()));
  },

  // Handshake Activation Logic with Dynamic Timer Windows
  startHandshake: function(durationMs, venueId = "venue-general", venueName = "Partner Venue") {
    const active = this.getActiveProfile();
    const now = Date.now();
    active.activeHandshake = {
      venueId: venueId,
      venueName: venueName,
      startTime: now,
      expiresAt: now + parseInt(durationMs),
      durationMs: parseInt(durationMs)
    };
    this.saveToStorage();
  },

  clearHandshake: function() {
    const active = this.getActiveProfile();
    active.activeHandshake = null;
    this.saveToStorage();
  }
};

// Initialize profile state immediately
userProfile.init();

/**
 * Dynamic Lookup for Granular Spectrum Details (Batch Highlights & Specific Triggers)
 */
function handleTriggerClick(itemName) {
  if (!itemName) return;
  
  const cleanName = itemName.toLowerCase().trim();
  let title = itemName;
  let description = "Spectrum verification active. Safe boundaries or custom trigger loaded.";

  // Granular Batch Highlights & Detailed Spectrum Dictionary
  const allergyDb = {
    // Medicinal Excipients & Lab Chemicals
    "croscarmellose sodium": "Medicinal Excipient: Tablet binder/disintegrant. Common hidden trigger in pharmaceuticals.",
    "sds": "The Lab Set: Sodium Dodecyl Sulfate. Strong surfactant & protein denaturant used in lab settings.",
    "edta": "The Lab Set: Heavy metal chelator and preservative; potential skin and respiratory irritant.",
    "dmso": "The Lab Set: Solvent that rapidly penetrates skin and carries secondary compounds across biological barriers.",
    
    // Photographic & Industrial
    "hydroquinone": "Photographic Chemical: High-risk skin sensitizer and topical agent.",
    "metol": "Photographic Chemical: Frequently causes contact dermatitis in development environments.",
    
    // Exotic Woods & Modern Materials
    "wenge": "Exotic Wood Dust: Tropical hardwood containing aggressive sensitizing natural oils.",
    "padauk": "Exotic Wood Dust: Sensitizing timber dust linked to respiratory irritation.",
    "mushroom leather": "Modern Material: Mycelium textile. May retain fungal spores or treatment chemical residues.",
    "pla": "Modern Material: Polylactic Acid bioplastic; processing additives can trigger localized contact sensitivity.",
    
    // Terpenes & Fermented Basics
    "pinene": "Terpene Profile: Conifer/pine-scented resin compound found in sage and specific flora.",
    "myrcene": "Terpene Profile: Earthy, musky terpene abundant in hops, lemongrass, and thyme.",
    "natto": "Fermented Basic: Triggered specifically by Bacillus subtilis var. natto bacteria.",
    "kimchi": "Fermented Basic: Contains active lactic acid bacteria and wild fermentation fungi variations.",
    
    // Luxury Fibers
    "vicuna": "Luxury Fiber: Ultra-fine wild animal hair with a distinct protein profile from sheep's wool.",
    "qiviut": "Luxury Fiber: Inner muskox wool, distinct from traditional wool allergens."
  };

  if (allergyDb[cleanName]) {
    description = allergyDb[cleanName];
  }

  showSpectrumInfoModal(title, description);
}

/**
 * Visual Display Helper for Trigger Information
 */
function showSpectrumInfoModal(title, text) {
  // Checks if custom modal container exists in DOM, otherwise displays clean alert
  const titleEl = document.getElementById('modal-info-title');
  const bodyEl = document.getElementById('modal-info-body');
  const modalEl = document.getElementById('modal-trigger-info');

  if (titleEl && bodyEl && modalEl) {
    titleEl.innerText = title;
    bodyEl.innerText = text;
    modalEl.classList.remove('hidden');
  } else {
    alert(`💡 ${title}\n\n${text}`);
  }
}

/**
 * Render Badges helper (if rendered outside profile page context)
 */
function renderAllergyZenBadges() {
  const profile = userProfile.getActiveProfile();
  if (!profile || !profile.items) return;

  const colorMap = {
    red: '🔴',
    amber: '🟠',
    brown: '🟤',
    green: '🟢',
    blue: '💙'
  };

  Object.keys(colorMap).forEach(color => {
    const container = document.getElementById(`badge-group-${color}`);
    if (container) {
      const items = profile.items[color] || [];
      container.innerHTML = items.map(item => `
        <span class="zen-badge badge-${color}" onclick="handleTriggerClick('${item.replace(/'/g, "\\'")}')">
          ${colorMap[color]} ${item}
        </span>
      `).join('');
    }
  });
}
