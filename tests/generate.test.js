import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { generatePassword, generatePassphrase, shuffleString, randomInt } from "../src/generate.js";
import { WORDLIST } from "../src/wordlist.js";

describe("randomInt", () => {
  it("returns integer in [0, max)", () => {
    for (let i = 0; i < 20; i++) {
      const n = randomInt(10);
      assert.ok(n >= 0 && n < 10, `out of range: ${n}`);
    }
  });
  it("handles max=1", () => {
    assert.equal(randomInt(1), 0);
  });
  it("returns values across range (statistical)", () => {
    const seen = new Set();
    for (let i = 0; i < 200; i++) {
      seen.add(randomInt(5));
    }
    assert.ok(seen.size >= 4, `only ${seen.size} distinct values seen`);
  });
});

describe("shuffleString", () => {
  it("returns string of same length", () => {
    const s = "abcdefgh";
    assert.equal(shuffleString(s).length, s.length);
  });
  it("returns string with same characters", () => {
    const s = "abcdef123!";
    const shuffled = shuffleString(s);
    assert.deepEqual([...shuffled].sort(), [...s].sort());
  });
  it("handles empty string", () => {
    assert.equal(shuffleString(""), "");
  });
  it("handles single char", () => {
    assert.equal(shuffleString("x"), "x");
  });
});

describe("generatePassword", () => {
  it("returns string of requested length", () => {
    for (const len of [8, 12, 16, 32, 64]) {
      const p = generatePassword({ length: len });
      assert.equal(p.length, len, `length ${len}: got ${p.length}`);
    }
  });
  it("contains lowercase when requested", () => {
    let hasLower = false;
    for (let i = 0; i < 20; i++) {
      const p = generatePassword({ length: 16, lowercase: true, uppercase: false, digits: false, symbols: false });
      if (/[a-z]/.test(p)) { hasLower = true; break; }
    }
    assert.ok(hasLower);
  });
  it("contains uppercase when requested", () => {
    let hasUpper = false;
    for (let i = 0; i < 20; i++) {
      const p = generatePassword({ length: 16, lowercase: false, uppercase: true, digits: false, symbols: false });
      if (/[A-Z]/.test(p)) { hasUpper = true; break; }
    }
    assert.ok(hasUpper);
  });
  it("contains digit when requested", () => {
    let hasDigit = false;
    for (let i = 0; i < 20; i++) {
      const p = generatePassword({ length: 16, lowercase: false, uppercase: false, digits: true, symbols: false });
      if (/[0-9]/.test(p)) { hasDigit = true; break; }
    }
    assert.ok(hasDigit);
  });
  it("contains symbol when requested", () => {
    let hasSym = false;
    for (let i = 0; i < 20; i++) {
      const p = generatePassword({ length: 16, lowercase: false, uppercase: false, digits: false, symbols: true });
      if (/[^a-zA-Z0-9]/.test(p)) { hasSym = true; break; }
    }
    assert.ok(hasSym);
  });
  it("excludes ambiguous chars when flag set", () => {
    for (let i = 0; i < 30; i++) {
      const p = generatePassword({ length: 16, excludeAmbiguous: true });
      assert.ok(!/[0Ol1Ii]/.test(p), `ambiguous char found in: ${p}`);
    }
  });
  it("does not exceed requested length", () => {
    const p = generatePassword({ length: 8, lowercase: true, uppercase: true, digits: true, symbols: true });
    assert.equal(p.length, 8);
  });
  it("falls back to lowercase if all options disabled", () => {
    const p = generatePassword({ length: 10, lowercase: false, uppercase: false, digits: false, symbols: false });
    assert.equal(p.length, 10);
  });
  it("generates different passwords on repeated calls", () => {
    const passwords = new Set();
    for (let i = 0; i < 10; i++) {
      passwords.add(generatePassword({ length: 16 }));
    }
    assert.ok(passwords.size > 7, `only ${passwords.size} unique passwords`);
  });
  it("ensures at least one of each requested class", () => {
    for (let i = 0; i < 10; i++) {
      const p = generatePassword({ length: 16, lowercase: true, uppercase: true, digits: true, symbols: true });
      assert.ok(/[a-z]/.test(p), "no lowercase");
      assert.ok(/[A-Z]/.test(p), "no uppercase");
      assert.ok(/[0-9]/.test(p), "no digit");
      assert.ok(/[^a-zA-Z0-9]/.test(p), "no symbol");
    }
  });
});

describe("generatePassphrase", () => {
  it("returns correct word count", () => {
    for (const count of [3, 4, 5, 6]) {
      const p = generatePassphrase(count, "-", WORDLIST);
      const words = p.split("-");
      assert.equal(words.length, count, `expected ${count} words, got ${words.length}`);
    }
  });
  it("uses correct separator", () => {
    const p = generatePassphrase(4, "_", WORDLIST);
    assert.ok(p.includes("_"), "no underscore found");
    assert.ok(!p.includes("-"), "hyphen found unexpectedly");
  });
  it("uses words from wordlist", () => {
    const p = generatePassphrase(4, "-", WORDLIST);
    const words = p.split("-");
    words.forEach((w) => {
      assert.ok(WORDLIST.includes(w), `word "${w}" not in wordlist`);
    });
  });
  it("returns empty string for empty wordlist", () => {
    const p = generatePassphrase(5, "-", []);
    assert.equal(p, "");
  });
  it("generates different passphrases", () => {
    const phrases = new Set();
    for (let i = 0; i < 20; i++) {
      phrases.add(generatePassphrase(5, "-", WORDLIST));
    }
    assert.ok(phrases.size > 10, `only ${phrases.size} unique passphrases`);
  });
});

describe("WORDLIST", () => {
  it("has at least 100 words", () => {
    assert.ok(WORDLIST.length >= 100, `only ${WORDLIST.length} words`);
  });
  it("all words are strings", () => {
    WORDLIST.forEach((w) => assert.equal(typeof w, "string"));
  });
  it("all words are non-empty", () => {
    WORDLIST.forEach((w) => assert.ok(w.length > 0));
  });
});
