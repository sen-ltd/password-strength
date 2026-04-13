import { evaluatePassword } from "./strength.js";
import { generatePassword, generatePassphrase } from "./generate.js";
import { WORDLIST } from "./wordlist.js";
import { getTranslation } from "./i18n.js";

let currentLang = "en";
let t = getTranslation(currentLang);

// DOM refs
const passwordInput = document.getElementById("password-input");
const toggleVisibilityBtn = document.getElementById("toggle-visibility");
const strengthBar = document.getElementById("strength-bar");
const strengthLabel = document.getElementById("strength-label");
const entropyValue = document.getElementById("entropy-value");
const crackTimeValue = document.getElementById("crack-time-value");
const feedbackList = document.getElementById("feedback-list");
const langToggle = document.getElementById("lang-toggle");

// Generator
const genLengthSlider = document.getElementById("gen-length");
const genLengthDisplay = document.getElementById("gen-length-display");
const genLowercase = document.getElementById("gen-lowercase");
const genUppercase = document.getElementById("gen-uppercase");
const genDigits = document.getElementById("gen-digits");
const genSymbols = document.getElementById("gen-symbols");
const genExcludeAmbiguous = document.getElementById("gen-exclude-ambiguous");
const genOutput = document.getElementById("gen-output");
const genBtn = document.getElementById("gen-btn");
const copyBtn = document.getElementById("copy-btn");
const copyMsg = document.getElementById("copy-msg");

// Bulk
const bulkCount = document.getElementById("bulk-count");
const bulkBtn = document.getElementById("bulk-btn");
const bulkOutput = document.getElementById("bulk-output");

// Passphrase
const passphraseToggle = document.getElementById("passphrase-toggle");
const passphraseOptions = document.getElementById("passphrase-options");
const passphraseWordCount = document.getElementById("passphrase-word-count");
const passphraseSeparator = document.getElementById("passphrase-separator");

// Tabs
const tabBtns = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

const SCORE_CLASSES = ["score-0", "score-1", "score-2", "score-3", "score-4"];
const SCORE_WIDTHS = ["10%", "25%", "50%", "75%", "100%"];
const SCORE_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"];

function updateStrengthUI(result) {
  const { score, entropy, crackTime, feedback } = result;

  // Bar
  strengthBar.style.width = SCORE_WIDTHS[score];
  strengthBar.style.backgroundColor = SCORE_COLORS[score];
  SCORE_CLASSES.forEach((c) => strengthBar.classList.remove(c));
  strengthBar.classList.add(`score-${score}`);

  // Label
  strengthLabel.textContent = t.strengthLevels[score];
  strengthLabel.className = `strength-label score-text-${score}`;

  // Entropy + crack time
  entropyValue.textContent = `${entropy} ${t.bitsUnit}`;
  crackTimeValue.textContent = crackTime;

  // Feedback
  feedbackList.innerHTML = "";
  if (feedback.length === 0 && passwordInput.value.length > 0) {
    const li = document.createElement("li");
    li.className = "feedback-good";
    li.textContent = "✓ Looks good!";
    feedbackList.appendChild(li);
  }
  feedback.forEach(({ key, severity }) => {
    const li = document.createElement("li");
    li.className = `feedback-${severity}`;
    const icon = severity === "error" ? "✗" : severity === "warning" ? "⚠" : "→";
    li.textContent = `${icon} ${t.feedbackItems[key] || key}`;
    feedbackList.appendChild(li);
  });
}

function onPasswordChange() {
  const val = passwordInput.value;
  const result = evaluatePassword(val);
  updateStrengthUI(result);
}

function toggleVisibility() {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleVisibilityBtn.textContent = t.hidePassword;
  } else {
    passwordInput.type = "password";
    toggleVisibilityBtn.textContent = t.showPassword;
  }
}

function getGeneratorOptions() {
  return {
    length: parseInt(genLengthSlider.value, 10),
    lowercase: genLowercase.checked,
    uppercase: genUppercase.checked,
    digits: genDigits.checked,
    symbols: genSymbols.checked,
    excludeAmbiguous: genExcludeAmbiguous.checked,
  };
}

function generateOne() {
  let result;
  if (passphraseToggle.checked) {
    const wordCount = parseInt(passphraseWordCount.value, 10) || 5;
    const sep = passphraseSeparator.value;
    result = generatePassphrase(wordCount, sep, WORDLIST);
  } else {
    result = generatePassword(getGeneratorOptions());
  }
  genOutput.value = result;
}

function generateBulk() {
  const count = Math.min(Math.max(parseInt(bulkCount.value, 10) || 5, 1), 50);
  const lines = [];
  for (let i = 0; i < count; i++) {
    if (passphraseToggle.checked) {
      const wordCount = parseInt(passphraseWordCount.value, 10) || 5;
      const sep = passphraseSeparator.value;
      lines.push(generatePassphrase(wordCount, sep, WORDLIST));
    } else {
      lines.push(generatePassword(getGeneratorOptions()));
    }
  }
  bulkOutput.value = lines.join("\n");
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    copyMsg.textContent = t.copiedMsg;
    copyMsg.style.opacity = "1";
    setTimeout(() => {
      copyMsg.style.opacity = "0";
    }, 1500);
  } catch {
    // fallback
    genOutput.select();
    document.execCommand("copy");
  }
}

function switchTab(tabId) {
  tabBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });
  tabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === `panel-${tabId}`);
  });
}

function updatePassphraseVisibility() {
  passphraseOptions.style.display = passphraseToggle.checked ? "block" : "none";
}

function applyTranslations() {
  t = getTranslation(currentLang);
  document.title = t.title;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) el.textContent = t[key];
  });
  // Update dynamic labels
  toggleVisibilityBtn.textContent =
    passwordInput.type === "password" ? t.showPassword : t.hidePassword;
  langToggle.textContent = currentLang === "en" ? "日本語" : "English";
  // Re-render feedback if password exists
  if (passwordInput.value) onPasswordChange();
}

// Event listeners
passwordInput.addEventListener("input", onPasswordChange);
toggleVisibilityBtn.addEventListener("click", toggleVisibility);
genLengthSlider.addEventListener("input", () => {
  genLengthDisplay.textContent = genLengthSlider.value;
});
genBtn.addEventListener("click", generateOne);
copyBtn.addEventListener("click", () => copyToClipboard(genOutput.value));
bulkBtn.addEventListener("click", generateBulk);
passphraseToggle.addEventListener("change", updatePassphraseVisibility);
tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});
langToggle.addEventListener("click", () => {
  currentLang = currentLang === "en" ? "ja" : "en";
  applyTranslations();
});

// Init
genLengthDisplay.textContent = genLengthSlider.value;
updatePassphraseVisibility();
applyTranslations();
generateOne();
