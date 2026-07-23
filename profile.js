/**
 * profile.js - allergyZEN Core Logic & Hardware Integration
 */

let currentStream = null;

// Starts the rear camera feed in real time
async function openScannerModal() {
  const modal = document.getElementById('modal-scanner');
  const video = document.getElementById('camera-feed');
  const feedback = document.getElementById('scan-feedback');
  
  if (modal) modal.classList.remove('hidden');
  if (feedback) feedback.style.display = 'none';

  try {
    // Request environment / rear camera
    currentStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { exact: "environment" } },
      audio: false
    });
    if (video) video.srcObject = currentStream;
  } catch (err) {
    // Fallback if rear camera isn't accessible (e.g. laptop webcams)
    try {
      currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (video) video.srcObject = currentStream;
    } catch (fallbackErr) {
      alert("Camera access denied or not supported on this device. Please check site permissions.");
    }
  }
}

// Stops camera stream when modal closes
function closeScannerModal() {
  const modal = document.getElementById('modal-scanner');
  if (modal) modal.classList.add('hidden');

  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
  }
}

// Simulates live analysis of camera frame
function captureAndScan() {
  const feedback = document.getElementById('scan-feedback');
  if (!feedback) return;

  feedback.style.display = 'block';
  feedback.style.background = "rgba(0,0,0,0.85)";
  feedback.innerText = "🔍 Analyzing image against Zen Spectrum...";

  setTimeout(() => {
    feedback.innerText = "🟢 PASS: 0 Triggers Detected!";
    feedback.style.background = "rgba(34, 197, 94, 0.95)";
    
    setTimeout(() => {
      closeScannerModal();
    }, 1500);
  }, 1200);
}

// Interactive modal details when tapping any trigger
function handleTriggerClick(itemName, color) {
  if (!itemName) return;
  
  const cleanName = itemName.toLowerCase().trim();
  let title = itemName;
  let badgeText = `${color.toUpperCase()} SPECTRUM`;

  const safeMap = {
    "peanuts": "Safe Alternatives: Sunflower Seed Butter, Pumpkin Seed Butter, Tahini.",
    "shellfish": "Safe Alternatives: Jackfruit, Hearts of Palm, King Oyster Mushrooms.",
    "lactose": "Safe Alternatives: Oat Milk, Almond Milk, Coconut Yogurt.",
    "cilantro": "Safe Alternatives: Flat-leaf Parsley, Fresh Dill, Basil."
  };

  let altText = safeMap[cleanName] ? `\n\n💡 ${safeMap[cleanName]}` : "";
  let description = `Item registered under ${color.toUpperCase()} spectrum.${altText}`;

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
