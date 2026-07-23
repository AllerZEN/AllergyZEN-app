/**
 * profile.js - allergyZEN Core Profile & Spectrum Management
 */

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
        mode: "all",
        bloodSugar: "5.4",
        bloodPressure: "120/80",
        macros: "1800 kcal",
        medications: ["Metformin"],
        goodHabits: ["Drink 2L Water", "10m Mindfulness"],
        badHabits: ["Late Night Snacks", "High Sodium Meals"]
      },
      activeHandshake: null
    }
  ],

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

userProfile.init();

/**
 * Rich Interactive Lookup Sheet Trigger
 */
function handleTriggerClick(itemName) {
  if (!itemName) return;
  
  const cleanName = itemName.toLowerCase().trim();
  let title = itemName;
  let description = "Spectrum verification active. This item is safely tracked within your active boundaries.";
  let badgeColor = "🔴 Red Spectrum Alert";

  const allergyDb = {
    "croscarmellose sodium": {
      desc: "Medicinal Excipient: Tablet binder and disintegrant. Highly reactive hidden trigger in standard pharmaceuticals.",
      tag: "🔴 Excipient Risk"
    },
    "shellfish": {
      desc: "High Risk Allergen: Anaphylaxis danger. Involves tropomyosin proteins found in crustaceans and mollusks.",
      tag: "🔴 Anaphylaxis Critical"
    },
    "peanuts": {
      desc: "High Risk Allergen: Severe reactivity trigger (Ara h 1-8 proteins). Requires strict cross-contamination protocols.",
      tag: "🔴 Anaphylaxis Critical"
    },
    "sds": {
      desc: "The Lab Set: Sodium Dodecyl Sulfate. Strong surfactant & protein denaturant widely used in scientific laboratories.",
      tag: "🟠 Moderate Reaction"
    },
    "edta": {
      desc: "The Lab Set: Heavy metal chelator and preservative; can cause dermal and localized sensitivities.",
      tag: "🟠 Lab Trigger"
    },
    "pinene": {
      desc: "Terpene Profile: Conifer/pine-scented resin compound found in sage, pine, and specific botanical extracts.",
      tag: "🟠 Terpene Sensitivity"
    },
    "wenge": {
      desc: "Exotic Wood Dust: Tropical hardwood containing aggressive sensitizing natural oils.",
      tag: "🟠 Sensitizing Oil"
    }
  };

  if (allergyDb[cleanName]) {
    description = allergyDb[cleanName].desc;
    badgeColor = allergyDb[cleanName].tag;
  }

  if (typeof activeTriggerSelectedItem !== 'undefined') {
    activeTriggerSelectedItem = itemName;
  }

  showSpectrumInfoModal(title, description, badgeColor);
}

function showSpectrumInfoModal(title, text, badgeText = "") {
  const titleEl = document.getElementById('modal-info-title');
  const bodyEl = document.getElementById('modal-info-body');
  const badgeEl = document.getElementById('modal-info-badge');
  const modalEl = document.getElementById('modal-trigger-info');

  if (titleEl && bodyEl && modalEl) {
    titleEl.innerText = title;
    bodyEl.innerText = text;
    if (badgeEl) {
      badgeEl.innerHTML = badgeText ? `<span style="background:#FEE2E2; color:#B91C1C; padding:4px 8px; border-radius:12px; font-weight:700; font-size:0.75rem;">${badgeText}</span>` : '';
    }
    modalEl.classList.remove('hidden');
  } else {
    alert(`💡 ${title}\n\n${text}`);
  }
}
