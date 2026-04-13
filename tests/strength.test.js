import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  hasLowercase,
  hasUppercase,
  hasDigit,
  hasSymbol,
  hasSequential,
  hasRepeated,
  calculateEntropy,
  evaluatePassword,
  crackTimeEstimate,
  isCommonPassword,
} from "../src/strength.js";

describe("hasLowercase", () => {
  it("returns true for string with lowercase", () => {
    assert.equal(hasLowercase("abc"), true);
    assert.equal(hasLowercase("aBC"), true);
  });
  it("returns false for string without lowercase", () => {
    assert.equal(hasLowercase("ABC123"), false);
    assert.equal(hasLowercase("123!@#"), false);
  });
});

describe("hasUppercase", () => {
  it("returns true for string with uppercase", () => {
    assert.equal(hasUppercase("ABC"), true);
    assert.equal(hasUppercase("Abc"), true);
  });
  it("returns false for string without uppercase", () => {
    assert.equal(hasUppercase("abc123"), false);
    assert.equal(hasUppercase("123!@#"), false);
  });
});

describe("hasDigit", () => {
  it("returns true for string with digits", () => {
    assert.equal(hasDigit("abc123"), true);
    assert.equal(hasDigit("123"), true);
  });
  it("returns false for string without digits", () => {
    assert.equal(hasDigit("abcABC"), false);
    assert.equal(hasDigit("!@#$"), false);
  });
});

describe("hasSymbol", () => {
  it("returns true for string with symbols", () => {
    assert.equal(hasSymbol("abc!"), true);
    assert.equal(hasSymbol("!@#$"), true);
    assert.equal(hasSymbol("pass word"), true); // space is non-alphanum
  });
  it("returns false for string without symbols", () => {
    assert.equal(hasSymbol("abc123ABC"), false);
  });
});

describe("hasSequential", () => {
  it("detects abc sequence", () => {
    assert.equal(hasSequential("myabc"), true);
  });
  it("detects 123 sequence", () => {
    assert.equal(hasSequential("pass123"), true);
  });
  it("detects qwer sequence", () => {
    assert.equal(hasSequential("myqwer"), true);
  });
  it("returns false for non-sequential", () => {
    assert.equal(hasSequential("xkcd"), false);
    assert.equal(hasSequential("T3@mP"), false);
  });
  it("detects consecutive ascending chars", () => {
    assert.equal(hasSequential("xyz"), true);
  });
});

describe("hasRepeated", () => {
  it("detects triple identical chars", () => {
    assert.equal(hasRepeated("aaa"), true);
    assert.equal(hasRepeated("passaaa"), true);
  });
  it("detects repeating pattern", () => {
    assert.equal(hasRepeated("ababab"), true);
  });
  it("returns false for non-repeated", () => {
    assert.equal(hasRepeated("abcd"), false);
    assert.equal(hasRepeated("T3@mPx"), false);
  });
  it("two identical chars is not flagged", () => {
    assert.equal(hasRepeated("aa"), false);
  });
});

describe("calculateEntropy", () => {
  it("returns 0 for empty string", () => {
    assert.equal(calculateEntropy(""), 0);
  });
  it("returns positive entropy for lowercase only", () => {
    const e = calculateEntropy("abc");
    // 3 * log2(26) ≈ 14.1
    assert.ok(e > 14 && e < 15, `expected ~14.1, got ${e}`);
  });
  it("returns higher entropy for mixed case + digits + symbols", () => {
    const low = calculateEntropy("aaaaaaaa");
    const high = calculateEntropy("aA1!aA1!");
    assert.ok(high > low);
  });
  it("entropy scales with length", () => {
    const short = calculateEntropy("abcd");
    const long = calculateEntropy("abcdabcd");
    assert.ok(long > short);
  });
  it("returns correct pool for all 4 classes", () => {
    // pool = 26+26+10+32 = 94; entropy = 8 * log2(94)
    const e = calculateEntropy("aA1!aA1!");
    const expected = 8 * Math.log2(94);
    assert.ok(Math.abs(e - expected) < 0.1, `expected ${expected}, got ${e}`);
  });
});

describe("crackTimeEstimate", () => {
  it("returns instant for 0 entropy", () => {
    assert.equal(crackTimeEstimate(0), "instant");
  });
  it("returns seconds for very low entropy", () => {
    const result = crackTimeEstimate(5);
    assert.ok(
      result.includes("seconds") || result === "instant",
      `unexpected: ${result}`
    );
  });
  it("returns years for high entropy", () => {
    const result = crackTimeEstimate(100);
    assert.ok(result.includes("year") || result.includes("billion"), `unexpected: ${result}`);
  });
  it("returns longer time for higher entropy", () => {
    const low = crackTimeEstimate(20);
    const high = crackTimeEstimate(80);
    // just check they're different
    assert.notEqual(low, high);
  });
});

describe("isCommonPassword", () => {
  it("detects common passwords", () => {
    assert.equal(isCommonPassword("password"), true);
    assert.equal(isCommonPassword("123456"), true);
    assert.equal(isCommonPassword("qwerty"), true);
    assert.equal(isCommonPassword("abc123"), true);
  });
  it("is case-insensitive", () => {
    assert.equal(isCommonPassword("PASSWORD"), true);
    assert.equal(isCommonPassword("Password"), true);
  });
  it("returns false for uncommon passwords", () => {
    assert.equal(isCommonPassword("Zq!7mR#pX9"), false);
    assert.equal(isCommonPassword("correct-horse-battery-staple"), false);
  });
});

describe("evaluatePassword", () => {
  it("returns score 0 for empty password", () => {
    const r = evaluatePassword("");
    assert.equal(r.score, 0);
    assert.equal(r.entropy, 0);
  });
  it("returns score 0 for common password", () => {
    const r = evaluatePassword("password");
    assert.equal(r.score, 0);
    assert.equal(r.isCommon, true);
  });
  it("returns score 1 for weak password", () => {
    const r = evaluatePassword("abc");
    assert.ok(r.score <= 1, `expected ≤1, got ${r.score}`);
  });
  it("returns score >= 2 for medium password", () => {
    const r = evaluatePassword("Tr0ub4dor");
    assert.ok(r.score >= 2, `expected >=2, got ${r.score}`);
  });
  it("returns score >= 3 for strong password", () => {
    const r = evaluatePassword("Tr0ub4dor&3Correct");
    assert.ok(r.score >= 3, `expected >=3, got ${r.score}`);
  });
  it("returns score 4 for very strong password", () => {
    const r = evaluatePassword("!Zq#7mR&pX9@kT2wL$vN");
    assert.equal(r.score, 4);
  });
  it("feedback includes tooShort for short passwords", () => {
    const r = evaluatePassword("hi");
    const keys = r.feedback.map((f) => f.key);
    assert.ok(keys.includes("tooShort"), `feedback: ${JSON.stringify(keys)}`);
  });
  it("feedback includes common for common password", () => {
    const r = evaluatePassword("123456");
    const keys = r.feedback.map((f) => f.key);
    assert.ok(keys.includes("common"), `feedback: ${JSON.stringify(keys)}`);
  });
  it("feedback includes sequential for sequential", () => {
    const r = evaluatePassword("abcdefgh1A!");
    const keys = r.feedback.map((f) => f.key);
    assert.ok(keys.includes("sequential"), `feedback: ${JSON.stringify(keys)}`);
  });
  it("no noLowercase feedback if lowercase present", () => {
    const r = evaluatePassword("Abcdefgh1!");
    const keys = r.feedback.map((f) => f.key);
    assert.ok(!keys.includes("noLowercase"), `unexpected: ${JSON.stringify(keys)}`);
  });
  it("includes noSymbol feedback when symbols missing", () => {
    const r = evaluatePassword("Abcdefgh1");
    const keys = r.feedback.map((f) => f.key);
    assert.ok(keys.includes("noSymbol"), `feedback: ${JSON.stringify(keys)}`);
  });
  it("has crackTime field", () => {
    const r = evaluatePassword("somePass1!");
    assert.ok(typeof r.crackTime === "string");
  });
  it("has entropy > 0 for non-empty password", () => {
    const r = evaluatePassword("hello");
    assert.ok(r.entropy > 0);
  });
});
