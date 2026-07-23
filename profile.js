/**
 * profile.js - allergyZEN Vision Engine, OCR & Spectrum Synonym Dictionary
 */

let currentStream = null;

// Built-in Hidden Ingredients & Alternative Names Dictionary
const SYNONYM_DICTIONARY = {
  "aqua": ["aqua", "water", "eau", "distilled water", "purified water", "aqua/water/eau", "aqua (water)", "aqueous"],
  "water": ["water", "aqua", "eau", "distilled water", "purified water", "aqua/water/eau", "aqua (water)"],
  "milk": ["milk", "lactose", "whey", "casein", "caseinate", "lactalbumin", "lactoglobulin", "curd", "ghee", "butterfat", "milk solids"],
  "lactose": ["lactose", "milk sugar", "whey", "milk solids", "lactate"],
  "egg": ["egg", "eggs", "albumin", "ovalbumin", "globulin", "lecithin", "lysozyme", "vitellin", "mayonnaise"],
  "soy": ["soy", "soya", "soybean", "edamame", "lecithin", "e322", "textured vegetable protein", "tvp", "tofu"],
  "gluten": ["gluten", "wheat", "barley", "rye", "spelt", "triticale", "seitan", "semolina", "farina", "durum"],
  "wheat": ["wheat", "gluten", "farina", "semolina", "spelt"],
  "peanuts": ["peanut", "peanuts", "groundnut", "arachis oil", "mandelona"],
  "nuts": ["almond", "walnut", "cashew", "pecan", "pistachio", "macadamia", "hazelnut", "filbert"],
  "parabens": ["methylparaben", "ethylparaben", "propylparaben", "butylparaben", "paraben"],
  "sulfates": ["sodium lauryl sulfate", "sls", "sodium laureth sulfate", "sles", "ammonium lauryl sulfate"],
  "fragrance": ["fragrance", "parfum", "aroma", "essential oil"],
  "pinene": ["alpha-pinene", "beta-pinene", "pinene", "turpentine", "pine oil"],
  "croscarmellose": ["croscarmellose sodium", "e468", "crosslinked sodium carboxymethylcellulose"],
  "sds": ["sodium dodecyl sulfate", "sds", "sodium lauryl sulfate", "sls"]
};

function expandTriggerList(userList) {
  let expanded = new Set();
  (userList || []).forEach(rawItem => {
    const clean = rawItem.toLowerCase().trim();
    if (!clean) return;

    expanded.add(clean);
    if (SYNONYM_DICTIONARY[clean]) {
      SYNONYM_DICTIONARY[clean].forEach(syn => expanded.add(syn));
    }
    Object.keys(SYNONYM_DICTIONARY).forEach(key => {
      if (SYNONYM_DICTIONARY[key].includes(clean)) {
        SYNONYM_DICTIONARY[key].forEach(syn => expanded.add(syn));
      }
    });
  });
  return Array.from(expanded);
}

async function openScannerModal() {
  const modal = document.getElementById('modal-scanner');
  const video = document.getElementById('camera-feed');
  const feedback = document.getElementById('scan-feedback');
  
  if (modal) modal.classList.remove('hidden');
  if (feedback) {
    feedback.style.display = 'block';
    feedback.style.background = "rgba(0,0,0,0.85)";
    feedback.innerText = "Align ingredient text or back label in viewfinder...";
  }

  const cameraConstraints = {
    video: {
      facingMode: { exact: "environment" },
      width: { ideal: 1920, max: 3840 },
      height: { ideal: 1080, max: 2160 },
      focusMode: { ideal: "continuous" }
    },
    audio: false
  };

  try {
    currentStream = await navigator.mediaDevices.getUserMedia(cameraConstraints);
    if (video) video.srcObject = currentStream;
  } catch (err) {
    try {
      currentStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "environment" },
        audio: false
      });
      if (video) video.srcObject = currentStream;
    } catch (fallbackErr) {
      alert("Unable to access camera in HD mode. Please check site permissions.");
    }
  }
}

function closeScannerModal() {
  const modal = document.getElementById('modal-scanner');
  if (modal) modal.classList.add('hidden');

  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
  }
}

async function captureAndScan() {
  const feedback = document.getElementById('scan-feedback');
  const video = document.getElementById('camera-feed');
  
  if (!feedback || !video) return;

  feedback.style.display = 'block';
  feedback.style.background = "rgba(0, 0, 0, 0.85)";
  feedback.innerText = "⚡ Reading text & checking hidden aliases...";

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // High contrast preprocessing
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const contrast = (avg - 128) * 1.5 + 128;
    data[i] = contrast;
    data[i + 1] = contrast;
    data[i + 2] = contrast;
  }
  ctx.putImageData(imgData, 0, 0);

  try {
    const result = await Tesseract.recognize(canvas, 'eng');
    const scannedText = (result.data.text || "").toLowerCase();

    const stored = localStorage.getItem('az_user_profile');
    const userProfile = stored ? JSON.parse(stored) : { items: {} };
    const items = userProfile.items || {};

    const redExpanded = expandTriggerList(items.red);
    const amberExpanded = expandTriggerList(items.amber);
    const brownExpanded = expandTriggerList(items.brown);
    const blueExpanded = expandTriggerList(items.blue);

    let matchedRed = redExpanded.filter(trig => scannedText.includes(trig));
    let matchedAmber = amberExpanded.filter(trig => scannedText.includes(trig));
    let matchedBrown = brownExpanded.filter(trig => scannedText.includes(trig));
    let matchedBlue = blueExpanded.filter(trig => scannedText.includes(trig));

    closeScannerModal();

    let detectedName = matchedRed[0] || matchedAmber[0] || matchedBrown[0] || matchedBlue[0] || "Scanned Item";
    lastScannedItemName = detectedName;

    if (matchedRed.length > 0) {
      showSpectrumInfoModal("Scanned Product Warning", `🔴 CRITICAL TRIGGER DETECTED: ${matchedRed.join(', ').toUpperCase()}\n\nDetected text on label:\n"${scannedText.slice(0, 150)}..."`, "🔴 RED ALERT");
    } else if (matchedAmber.length > 0) {
      showSpectrumInfoModal("Scanned Product Sensitivity", `🟠 CAUTION DETECTED: ${matchedAmber.join(', ').toUpperCase()}\n\nDetected text on label:\n"${scannedText.slice(0, 150)}..."`, "🟠 AMBER CAUTION");
    } else if (matchedBrown.length > 0) {
      showSpectrumInfoModal("Scanned Product Dislike", `🟤 DISLIKE DETECTED: ${matchedBrown.join(', ').toUpperCase()}\n\nDetected text on label:\n"${scannedText.slice(0, 150)}..."`, "🟤 BROWN DISLIKE");
    } else if (matchedBlue.length > 0) {
      showSpectrumInfoModal("Scanned Product Boundary", `💙 BOUNDARY FLAG: ${matchedBlue.join(', ').toUpperCase()}\n\nDetected text on label:\n"${scannedText.slice(0, 150)}..."`, "💙 BLUE BOUNDARY");
    } else {
      showSpectrumInfoModal("Scanned Product Result", `🟢 PASS: No triggers or sensitive aliases detected on label.\n\nDetected text on label:\n"${scannedText.slice(0, 150)}..."`, "🟢 SAFE ITEM");
    }

  } catch (err) {
    console.error("OCR Scanner Error:", err);
    feedback.style.background = "rgba(239, 68, 68, 0.95)";
    feedback.innerText = "⚠️ Could not read label clearly. Point directly at ingredient list under good light.";
  }
}

function handleTriggerClick(itemName, color) {
  if (!itemName) return;
  
  const cleanName = itemName.toLowerCase().trim();
  let title = itemName;
  let badgeText = `${color.toUpperCase()} SPECTRUM`;
  lastScannedItemName = itemName;

  let synonyms = SYNONYM_DICTIONARY[cleanName] ? SYNONYM_DICTIONARY[cleanName].join(', ') : "Standard exact and partial phrase matching active.";
  let description = `Item registered under ${color.toUpperCase()} spectrum.\n\n🔍 Hidden aliases checked during scans:\n${synonyms}`;

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
