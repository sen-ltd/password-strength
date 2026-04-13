// Secure random integer [0, max)
export function randomInt(max) {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    const limit = Math.floor(0xffffffff / max) * max;
    let val;
    do {
      crypto.getRandomValues(arr);
      val = arr[0];
    } while (val >= limit);
    return val % max;
  }
  // Node.js fallback
  const { randomInt: nodeRandom } = await_crypto();
  if (nodeRandom) return nodeRandom(max);
  return Math.floor(Math.random() * max);
}

function await_crypto() {
  try {
    // eslint-disable-next-line no-undef
    return require("crypto");
  } catch {
    return {};
  }
}

// Shuffle a string using Fisher-Yates
export function shuffleString(str) {
  const arr = str.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}

const CHARS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?",
};

const AMBIGUOUS = /[0Ol1Ii]/g;

/**
 * Generate a random password.
 * @param {object} options
 * @param {number} options.length - Password length (8-64)
 * @param {boolean} options.lowercase - Include lowercase
 * @param {boolean} options.uppercase - Include uppercase
 * @param {boolean} options.digits - Include digits
 * @param {boolean} options.symbols - Include symbols
 * @param {boolean} options.excludeAmbiguous - Exclude 0/O/1/l/I characters
 * @returns {string}
 */
export function generatePassword(options = {}) {
  const {
    length = 16,
    lowercase = true,
    uppercase = true,
    digits = true,
    symbols = true,
    excludeAmbiguous = false,
  } = options;

  let pool = "";
  const required = [];

  if (lowercase) {
    let chars = CHARS.lowercase;
    if (excludeAmbiguous) chars = chars.replace(AMBIGUOUS, "");
    if (chars.length > 0) {
      pool += chars;
      required.push(chars[randomInt(chars.length)]);
    }
  }
  if (uppercase) {
    let chars = CHARS.uppercase;
    if (excludeAmbiguous) chars = chars.replace(AMBIGUOUS, "");
    if (chars.length > 0) {
      pool += chars;
      required.push(chars[randomInt(chars.length)]);
    }
  }
  if (digits) {
    let chars = CHARS.digits;
    if (excludeAmbiguous) chars = chars.replace(AMBIGUOUS, "");
    if (chars.length > 0) {
      pool += chars;
      required.push(chars[randomInt(chars.length)]);
    }
  }
  if (symbols) {
    const chars = CHARS.symbols;
    pool += chars;
    required.push(chars[randomInt(chars.length)]);
  }

  if (pool.length === 0) pool = CHARS.lowercase;

  const remaining = Math.max(0, length - required.length);
  const extra = [];
  for (let i = 0; i < remaining; i++) {
    extra.push(pool[randomInt(pool.length)]);
  }

  return shuffleString([...required, ...extra].join(""));
}

/**
 * Generate a passphrase from a wordlist.
 * @param {number} wordCount - Number of words (4-8)
 * @param {string} separator - Word separator
 * @param {string[]} wordlist - Array of words to choose from
 * @returns {string}
 */
export function generatePassphrase(wordCount = 5, separator = "-", wordlist = []) {
  if (wordlist.length === 0) return "";
  const words = [];
  for (let i = 0; i < wordCount; i++) {
    words.push(wordlist[randomInt(wordlist.length)]);
  }
  return words.join(separator);
}
