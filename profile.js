/**
 * profile.js - allergyZEN Vision Engine & Spectrum Synonym Dictionary
 */

let currentStream = null;

// Built-in Hidden Ingredients & Alternative Names Dictionary
const SYNONYM_DICTIONARY = {
  // Water / Cosmetic / Gel Bases
  "aqua": ["aqua", "water", "eau", "distilled water", "purified water", "aqua/water/eau", "aqua (water)", "aqueous"],
  "water": ["water", "aqua", "eau", "distilled water", "purified water", "aqua/water/eau", "aqua (water)"],

  // Dairy & Derivatives
  "milk": ["milk", "lactose", "whey", "casein", "caseinate", "lactalbumin", "lactoglobulin", "curd", "ghee", "butterfat", "milk solids"],
  "lactose": ["lactose", "milk sugar", "whey", "milk solids", "lactate"],

  // Eggs & Derivatives
  "egg": ["egg", "eggs", "albumin", "ovalbumin", "globulin", "lecithin", "lysozyme", "vitellin", "mayonnaise"],

  // Soy & Derivatives
  "soy": ["soy", "soya", "soybean", "edamame", "lecithin", "e322", "textured vegetable protein", "tvp", "tofu"],

  // Wheat & Gluten
  "gluten": ["gluten", "wheat", "barley", "rye", "spelt", "triticale", "seitan", "semolina", "farina", "durum"],
  "wheat": ["wheat", "gluten", "farina", "semolina", "spelt"],

  // Peanuts & Tree Nuts
  "peanuts": ["peanut", "peanuts", "groundnut", "arachis oil", "mandelona"],
  "nuts": ["almond", "walnut", "cashew", "pecan", "pistachio", "macadamia", "hazelnut", "filbert"],

  // Cosmetics, Gels & Chemical Triggers
  "parabens": ["methylparaben", "ethylparaben", "propylparaben", "butylparaben", "paraben"],
  "sulfates": ["sodium lauryl sulfate", "sls", "sodium laureth sulfate", "sles", "ammonium lauryl sulfate"],
  "fragrance": ["fragrance", "parfum", "aroma", "essential oil"],

  // Terpenes & Medicinal Excipients
  "pinene": ["alpha-pinene", "beta-pinene", "pinene", "turpentine", "pine oil"],
  "croscarmellose": ["croscarmellose sodium", "e468", "crosslinked sodium carboxymethylcellulose"],
  "sds": ["sodium dodecyl sulfate", "sds", "sodium lauryl sulfate", "sls"]
};

/**
 * Expands user triggers into a broad search list using the Synonym Dictionary
 */
function expandTriggerList(userList) {
  let expanded = new Set();

  (userList || []).forEach(rawItem => {
    const clean = rawItem.toLowerCase().trim();
    if (!clean) return;

    // Add original term
    expanded.add(clean);

    // Direct lookup in dictionary
    if (SYNONYM_DICTIONARY[clean]) {
      SYNONYM_DICTIONARY[clean].forEach(syn => expanded.add(syn));
    }

    // Reverse lookup (if user typed a alias like "casein", also flag "milk")
    Object.keys(SYNONYM_DICTIONARY).forEach(key => {
      if (SYNONYM_DICTIONARY[key].includes(clean)) {
        SYNONYM_DICTIONARY[key].forEach(syn => expanded.add(syn));
      }
    });
  });

  return Array.from(expanded);
}

/**
 * Requests high-resolution camera stream with focus constraints
 */
async function openScannerModal() {
  const modal = document.getElementById('modal-scanner');
  const video = document.getElementById('camera-feed');
  const feedback = document.getElementById('scan-feedback');
  
  if (modal) modal.classList.remove('hidden');
  if (feedback) {
    feedback.style.display = 'block';
    feedback.style.background = "rgba(0,0,0,0.85)";
    feedback.innerText = "Align ingredient text in viewfinder...";
  }

  // HD Video constraints for OCR clear reading
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

/**
 * Stops camera stream when modal is closed
 */
function closeScannerModal() {
  const modal = document.getElementById('modal-scanner');
  if (modal) modal.classList.add('hidden');

  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
  }
}

/**
 * Real-time OCR Capture & Spectrum Cross-matching
 */
async function captureAndScan() {
  const feedback = document.getElementById('scan-feedback');
  const video = document.getElementById('camera-feed');
  
  if (!feedback || !video) return;

  feedback.style.display = 'block';
  feedback.style.background = "rgba(0, 0, 0, 0.85)";
  feedback.innerText = "⚡ Reading text & checking hidden aliases...";

  // 1. Capture HD Frame to Canvas
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // 2. High Contrast Grayscale Pre-processing for clear label reading
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
    // 3. OCR Text Extraction via Tesseract
    const result = await Tesseract.recognize(canvas, 'eng');
    const scannedText = (result.data.text || "").toLowerCase();

    // 4. Load & Expand Spectrum Triggers
    const stored = localStorage.getItem('az_user_profile');
    const userProfile = stored ? JSON.parse(stored) : { items: {} };
    const items = userProfile.items || {};

    const redExpanded = expandTriggerList(items.red);
    const amberExpanded = expandTriggerList(items.amber);
    const brownExpanded = expandTriggerList(items.brown);
    const blueExpanded = expandTriggerList(items.blue);

    // 5. Match extracted label text against expanded lists
    let matchedRed = redExpanded.filter(trig => scannedText.includes(trig));
    let matchedAmber = amberExpanded.filter(trig => scannedText.includes(trig));
    let matchedBrown = brownExpanded.filter(trig => scannedText.includes(trig));
    let matchedBlue = blueExpanded.filter(trig => scannedText.includes(trig));

    // 6. Output result prioritized by reactivity level
    if (matchedRed.length > 0) {
      feedback.style.background = "rgba(239, 68, 68, 0.95)"; // Red Alert
      feedback.innerHTML = `🔴 <strong>CRITICAL TRIGGER FOUND:</strong><br>${matchedRed.join(', ').toUpperCase()}`;
    } else if (matchedAmber.length > 0) {
      feedback.style.background = "rgba(249, 115, 22, 0.95)"; // Amber Caution
      feedback.innerHTML = `🟠 <strong>CAUTION / SENSITIVITY DETECTED:</strong><br>${matchedAmber.join(', ').toUpperCase()}`;
    } else if (matchedBrown.length > 0) {
      feedback.style.background = "rgba(139, 69, 19, 0.95)"; // Brown Dislike
      feedback.innerHTML = `🟤 <strong>PERSONAL DISLIKE DETECTED:</strong><br>${matchedBrown.join(', ').toUpperCase()}`;
    } else if (matchedBlue.length > 0) {
      feedback.style.background = "rgba(59, 130, 246, 0.95)"; // Blue Boundary
      feedback.innerHTML = `💙 <strong>BOUNDARY FLAG:</strong><br>${matchedBlue.join(', ').toUpperCase()}`;
    } else {
      feedback.style.background = "rgba(34, 197, 94, 0.95)"; // Safe Green
      feedback.innerHTML = `🟢 <strong>SAFE:</strong> No spectrum triggers or hidden aliases found!`;
      
      setTimeout(() => {
        closeScannerModal();
      }, 2000);
    }

  } catch (err) {
    console.error("OCR Scanner Error:", err);
    feedback.style.background = "rgba(239, 68, 68, 0.95)";
    feedback.innerText = "⚠️ Could not read label clearly. Hold steady under good light.";
  }
}

/**
 * Spectrum Info Display
 */
function handleTriggerClick(itemName, color) {
  if (!itemName) return;
  
  const cleanName = itemName.toLowerCase().trim();
  let title = itemName;
  let badgeText = `${color.toUpperCase()} SPECTRUM`;

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
