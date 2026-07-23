/**
 * profile.js - allergyZEN Core Logic
 */

function handleTriggerClick(itemName, color) {
  if (!itemName) return;
  
  const cleanName = itemName.toLowerCase().trim();
  let title = itemName;
  let description = "Spectrum verification active.";
  let badgeText = `${color.toUpperCase()} SPECTRUM`;

  const safeMap = {
    "peanuts": "Safe Alternatives: Sunflower Seed Butter, Pumpkin Seed Butter, Tahini.",
    "shellfish": "Safe Alternatives: Jackfruit, Hearts of Palm, King Oyster Mushrooms.",
    "lactose": "Safe Alternatives: Oat Milk, Almond Milk, Coconut Yogurt.",
    "cilantro": "Safe Alternatives: Flat-leaf Parsley, Fresh Dill, Basil."
  };

  let altText = safeMap[cleanName] ? `\n\n💡 ${safeMap[cleanName]}` : "";
  description = `Item registered under ${color.toUpperCase()} spectrum.${altText}`;

  showSpectrumInfoModal(title, description, badgeText);
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
      badgeEl.innerHTML = `<span style="background:#FEE2E2; color:#B91C1C; padding:4px 8px; border-radius:12px; font-weight:700; font-size:0.75rem;">${badgeText}</span>`;
    }
    modalEl.classList.remove('hidden');
  }
}
