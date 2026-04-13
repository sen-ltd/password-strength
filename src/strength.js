import { COMMON_PASSWORDS } from "./common.js";

// Character class detection
export function hasLowercase(str) {
  return /[a-z]/.test(str);
}

export function hasUppercase(str) {
  return /[A-Z]/.test(str);
}

export function hasDigit(str) {
  return /[0-9]/.test(str);
}

export function hasSymbol(str) {
  return /[^a-zA-Z0-9]/.test(str);
}

// Sequential characters (abc, 123, qwer, etc.)
export function hasSequential(str) {
  const lower = str.toLowerCase();
  const sequences = [
    "abcdefghijklmnopqrstuvwxyz",
    "zyxwvutsrqponmlkjihgfedcba",
    "01234567890",
    "09876543210",
    "qwertyuiop",
    "poiuytrewq",
    "asdfghjkl",
    "lkjhgfdsa",
    "zxcvbnm",
    "mnbvcxz",
  ];
  for (const seq of sequences) {
    for (let i = 0; i <= seq.length - 3; i++) {
      if (lower.includes(seq.slice(i, i + 3))) {
        return true;
      }
    }
  }
  // Consecutive same chars
  for (let i = 0; i < lower.length - 2; i++) {
    const a = lower.charCodeAt(i);
    const b = lower.charCodeAt(i + 1);
    const c = lower.charCodeAt(i + 2);
    if (b - a === 1 && c - b === 1) return true;
    if (a - b === 1 && b - c === 1) return true;
  }
  return false;
}

// Repeated characters (aaa, abab, etc.)
export function hasRepeated(str) {
  // Three or more identical consecutive characters
  if (/(.)\1{2,}/.test(str)) return true;
  // Repeating pattern of length 2 or more (ababab)
  if (/(.{2,})\1{2,}/.test(str)) return true;
  return false;
}

// Entropy calculation
export function calculateEntropy(str) {
  if (!str || str.length === 0) return 0;

  let poolSize = 0;
  if (hasLowercase(str)) poolSize += 26;
  if (hasUppercase(str)) poolSize += 26;
  if (hasDigit(str)) poolSize += 10;
  if (hasSymbol(str)) poolSize += 32;

  if (poolSize === 0) return 0;

  return str.length * Math.log2(poolSize);
}

// Common password check
export function isCommonPassword(str) {
  return COMMON_PASSWORDS.has(str.toLowerCase());
}

// Crack time string estimate
export function crackTimeEstimate(entropy, guessesPerSec = 1e10) {
  if (entropy <= 0) return "instant";

  const combinations = Math.pow(2, entropy);
  const seconds = combinations / guessesPerSec;

  if (seconds < 1) return "instant";
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 86400 * 30) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 86400 * 365) return `${Math.round(seconds / (86400 * 30))} months`;
  if (seconds < 86400 * 365 * 1000) return `${Math.round(seconds / (86400 * 365))} years`;
  if (seconds < 86400 * 365 * 1e6) return `${Math.round(seconds / (86400 * 365 * 1000))} thousand years`;
  if (seconds < 86400 * 365 * 1e9) return `${Math.round(seconds / (86400 * 365 * 1e6))} million years`;
  return "billions of years";
}

// Main evaluation function
export function evaluatePassword(password) {
  if (!password || password.length === 0) {
    return {
      score: 0,
      entropy: 0,
      crackTime: "instant",
      feedback: [],
      isCommon: false,
    };
  }

  const feedback = [];
  let penaltyFactor = 1.0;

  const common = isCommonPassword(password);
  if (common) {
    feedback.push({ key: "common", severity: "error" });
    penaltyFactor *= 0.1;
  }

  const seq = hasSequential(password);
  if (seq) {
    feedback.push({ key: "sequential", severity: "warning" });
    penaltyFactor *= 0.75;
  }

  const rep = hasRepeated(password);
  if (rep) {
    feedback.push({ key: "repeated", severity: "warning" });
    penaltyFactor *= 0.75;
  }

  if (password.length < 8) {
    feedback.push({ key: "tooShort", severity: "error" });
  } else if (password.length < 12) {
    feedback.push({ key: "shortish", severity: "warning" });
  }

  if (!hasUppercase(password)) feedback.push({ key: "noUppercase", severity: "suggestion" });
  if (!hasLowercase(password)) feedback.push({ key: "noLowercase", severity: "suggestion" });
  if (!hasDigit(password)) feedback.push({ key: "noDigit", severity: "suggestion" });
  if (!hasSymbol(password)) feedback.push({ key: "noSymbol", severity: "suggestion" });

  const rawEntropy = calculateEntropy(password);
  const effectiveEntropy = rawEntropy * penaltyFactor;

  let score;
  if (common || password.length < 6) {
    score = 0;
  } else if (effectiveEntropy < 30) {
    score = 1;
  } else if (effectiveEntropy < 60) {
    score = 2;
  } else if (effectiveEntropy < 100) {
    score = 3;
  } else {
    score = 4;
  }

  return {
    score,
    entropy: Math.round(rawEntropy * 10) / 10,
    crackTime: crackTimeEstimate(effectiveEntropy),
    feedback,
    isCommon: common,
  };
}
