/**
 * allergyZEN Wellness Assistant App - Core Profile Engine (Profile.js)
 * Power is Knowledge.
 * Handles the full Zen Spectrum, interactive dictionary insight modals,
 * data persistence, and 3-hour business handshakes.
 */

// Global User Profile State with default fallback values
window.userProfile = {
  session: {
    protectionWindow: {
      active: false,
      expiresAt: null,
      businessId: null,
      businessName: null
    }
  },
  activeProfileIndex: 0,
  profiles: [
    {
      name: "Primary Shield",
      items: {
        red: ["Peanuts", "Shellfish", "Croscarmellose Sodium"],
        amber: ["Lactose", "Terpenes", "SDS"],
        brown: ["Cilantro", "Mushrooms"],
        green: ["Sunflower Seed Butter", "Oat Milk", "Almond Milk"],
        blue: ["Texture Restrictions", "Neutral Language Request"]
      },
      zenNotes: []
    }
  ],

  // Storage Handlers
  saveToStorage() {
    localStorage.setItem('allergyzen_user_profile', JSON.stringify(this.profiles));
    localStorage.setItem('allergyzen_session', JSON.stringify(this.session));
  },

  loadFromStorage() {
    const savedProfiles = localStorage.getItem('allergyzen_user_profile');
    const savedSession = localStorage.getItem('allergyzen_session');
    if (savedProfiles) this.profiles = JSON.parse(savedProfiles);
    if (savedSession) this.session = JSON.parse(savedSession);
  },

  getActiveProfile() {
    return this.profiles[this.activeProfileIndex];
  },

  // Handshake Engine
  startHandshake(durationMs, businessId, businessName) {
    const now = Date.now();
    this.session.protectionWindow = {
      active: true,
      expiresAt: now + durationMs,
      businessId: businessId,
      businessName: businessName
    };
    this.saveToStorage();
  },

  clearHandshake() {
    this.session.protectionWindow = {
      active: false,
      expiresAt: null,
      businessId: null,
      businessName: null
    };
    this.saveToStorage();
  },

  getProtectionTimeRemaining() {
    if (!this.session.protectionWindow.active || !this.session.protectionWindow.expiresAt) return 0;
    const remaining = this.session.protectionWindow.expiresAt - Date.now();
    if (remaining <= 0) {
      this.clearHandshake(); // Auto-wipes data after the window closes
      return 0;
    }
    return remaining;
  }
};

// ==========================================
// INTERACTIVE TRIGGER KNOWLEDGE BASE DICTIONARY
// ==========================================
const triggerKnowledgeBase = {
  // Batch 1: Basics
  "peanuts": {
    reactions: "Anaphylaxis, severe respiratory distress, acute hives, swelling.",
    hiddenIn: "Arachis oil, groundnuts, cold-pressed oils, satay sauces, baked goods cross-contamination, meat binders.",
    safeAlternatives: "Sunflower seed butter (SunButter), pumpkin seeds, roasted chickpeas."
  },
  "shellfish": {
    reactions: "Severe systemic allergic reactions, anaphylaxis, swelling of throat/lips, severe cramps.",
    hiddenIn: "Glucosamine supplements, fish stock, oyster sauce, surimi (artificial crab meat), kimchi paste.",
    safeAlternatives: "Plant-based kelp flakes (for sea flavor), hearts of palm or king oyster mushrooms (for texture)."
  },
  "lactose": {
    reactions: "Bloating, severe gastrointestinal spasms, gas, explosive diarrhea.",
    hiddenIn: "Whey, casein, milk solids, prescription pill fillers (excipients), processed deli meats, protein powders.",
    safeAlternatives: "Almond milk, coconut milk, oat milk, lactase-treated products."
  },
  // Batch: Medicinal Excipients
  "croscarmellose sodium": {
    reactions: "Hidden intestinal bloating, localized GI irritation, immune/sensitivity spikes.",
    hiddenIn: "Cellulose gum, cross-linked carboxymethylcellulose, tablet disintegrant in vitamins, supplements, and generic prescription tablets.",
    safeAlternatives: "Liquid oil formulations, compounding pharmacy alternatives using pure ingredients, soft-gels without binders."
  },
  // Batch: The Lab Set & Modern Materials
  "sds": {
    reactions: "Severe skin peeling, contact cheilitis (lip irritation), mucous membrane erosion, painful mouth ulcers.",
    hiddenIn: "Sodium Lauryl Sulfate (SLS), sodium dodecyl sulfate, foaming toothpastes, liquid soaps, commercial lab detergents.",
    safeAlternatives: "SLS-free toothpastes (using coco-glucoside), amino-acid based organic cleansers."
  },
  "terpenes": {
    reactions: "Contact dermatitis, volatile organic compound headaches, airway irritation, sudden asthma flares.",
    hiddenIn: "Essential oils, pine-based sanitizers, plant terpene extracts (Limonene, Myrcene, Pinene), botanical skincare.",
    safeAlternatives: "Fragrance-free synthetic equivalents, mineral oil alternatives, unflavored extracts."
  }
};

// ==========================================
// INTERACTIVE MODAL & EVENT HANDLERS
// ==========================================

/**
 * Triggered when clicking an ingredient button to view information
 */
function handleTriggerClick(triggerName) {
  const normalizedKey = triggerName.toLowerCase().trim();
  const data = triggerKnowledgeBase[normalizedKey] || {
    reactions: "Varies depending on individual biological reactivity and sensitivity profile.",
    hiddenIn: "Verify directly with manufacturer documentation, laboratory testing, or raw material batch records.",
    safeAlternatives: "Please browse your personalized SAFE tab for vetted, non-reactive ingredients."
  };

  showTriggerInsightModal(triggerName, data);
}

/**
 * Dynamically builds and paints the interactive modal pop-up on the screen
 */
function showTriggerInsightModal(name, data) {
  const existingModal = document.getElementById('insightModal');
  if (existingModal) existingModal.remove();

  const modalHtml = `
    <div id="insightModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); z-index: 3000; display: flex; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(2px);">
      <div style="background: #FFF; width: 100%; max-width: 420px; border-radius: 20px; box-shadow: 0 12px 30px rgba(0,0,0,0.25); overflow: hidden; display: flex; flex-direction: column;">
        
        <!-- Modal Header -->
        <div style="background: #8E55A2; padding: 16px; color: white; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700; display: flex; align-items: center; gap: 6px;">🔍 Spectrum Insight: ${name}</h3>
          <button onclick="document.getElementById('insightModal').remove()" style="background: none; border: none; color: white; font-size: 1.6rem; cursor: pointer; line-height: 1;">&times;</button>
        </div>
        
        <!-- Modal Body Content -->
        <div style="padding: 20px; display: flex; flex-direction: column; gap: 14px; max-height: 65vh; overflow-y: auto;">
          <div>
            <strong style="color: #EF4444; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">⚠️ Reactivity & Symptoms:</strong>
            <p style="margin: 4px 0 0 0; font-size: 0.9rem; color: #374151; line-height: 1.45;">${data.reactions}</p>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 0;">
          
          <div>
            <strong style="color: #F97316; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">🕵️‍♂️ Hidden Identifiers & Sources:</strong>
            <p style="margin: 4px 0 0 0; font-size: 0.9rem; color: #374151; line-height: 1.45;">${data.hiddenIn}</p>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 0;">
          
          <div style="background: #F0FDF4; border: 1px solid #BBF7D0; padding: 14px; border-radius: 12px;">
            <strong style="color: #16A34A; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">🟢 Safe Functional Alternatives:</strong>
            <p style="margin: 4px 0 0 0; font-size: 0.9rem; color: #166534; line-height: 1.45;">${data.safeAlternatives}</p>
          </div>
        </div>

        <!-- Interactive Footer Buttons -->
        <div style="background: #F9FAFB; padding: 14px 16px; border-top: 1px solid #E5E7EB; display: flex; gap: 10px;">
          <button onclick="document.getElementById('insightModal').remove()" style="flex: 1; padding: 11px; border-radius: 8px; border: 1px solid #D1D5DB; background: white; font-weight: 600; font-size: 0.9rem; cursor: pointer;">Close</button>
          <button onclick="navigateToSafeTab()" style="flex: 2; padding: 11px; border-radius: 8px; border: none; background: #22C55E; color: white; font-weight: 700; font-size: 0.9rem; cursor: pointer; text-align: center;">See Safe Alternatives ➔</button>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

/**
 * Handles tab transitions to display the safe alternatives tab smoothly
 */
function navigateToSafeTab() {
  const modal = document.getElementById('insightModal');
  if (modal) modal.remove();
  
  if (typeof switchTab === 'function') {
    switchTab('safe'); // Changes tab context instantly if on profile page
  } else {
    window.location.href = 'profile.html?tab=safe'; // Fallback redirect with parameters
  }
}

// Automatically load profiles from memory space instantly when file mounts
userProfile.loadFromStorage();
// ==========================================
// AUTOMATED BADGE RENDERING LINK
// ==========================================

/**
 * Automatically targets the allergyZEN UI containers and renders 
 * interactive badges linked directly to the Knowledge Base.
 */
function renderAllergyZenBadges() {
  const activeProfile = window.userProfile.getActiveProfile();
  if (!activeProfile || !activeProfile.items) return;

  // Map your Zen Spectrum categories to your HTML container IDs
  const spectrumMap = {
    red: { containerId: 'red-triggers-container', color: '#EF4444' },
    amber: { containerId: 'amber-triggers-container', color: '#F97316' },
    brown: { containerId: 'brown-triggers-container', color: '#78350F' },
    green: { containerId: 'green-triggers-container', color: '#22C55E' },
    blue: { containerId: 'blue-triggers-container', color: '#3B82F6' }
  };

  Object.keys(spectrumMap).forEach(key => {
    const container = document.getElementById(spectrumMap[key].containerId);
    if (!container) return; // Skips if container isn't found on the current page

    const items = activeProfile.items[key] || [];
    
    // Clear static elements and inject fully interactive badges
    container.innerHTML = items.map(item => `
      <span class="badge" 
            style="display: inline-flex; align-items: center; gap: 6px; margin: 4px; padding: 6px 12px; border-radius: 20px; background: #F3F4F6; border: 1px solid #E5E7EB; font-size: 0.875rem; font-weight: 500; color: #374151; cursor: pointer; transition: all 0.2s;" 
            onclick="handleTriggerClick('${item.replace(/'/g, "\\'")}')"
            onmouseover="this.style.backgroundColor='#E5E7EB'"
            onmouseout="this.style.backgroundColor='#F3F4F6'">
        <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${spectrumMap[key].color}; display: inline-block;"></span>
        ${item}
        <button class="delete-btn" 
                style="background: none; border: none; color: #9CA3AF; cursor: pointer; font-size: 1rem; padding: 0 2px; line-height: 1;"
                onclick="event.stopPropagation(); removeUserProfileItem('${key}', '${item.replace(/'/g, "\\'")}')">&times;</button>
      </span>
    `).join('');
  });
}

/**
 * Global item removal handler supporting state preservation
 */
function removeUserProfileItem(category, item) {
  const activeProfile = window.userProfile.getActiveProfile();
  if (activeProfile && activeProfile.items[category]) {
    activeProfile.items[category] = activeProfile.items[category].filter(i => i !== item);
    window.userProfile.saveToStorage();
    renderAllergyZenBadges(); // Refresh view instantly
  }
}

// Run rendering immediately when document finishes parsing layout structures
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderAllergyZenBadges);
} else {
  renderAllergyZenBadges();
}
