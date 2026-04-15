# Password Strength Checker & Generator

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://sen.ltd/portfolio/password-strength/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A client-side password tool with entropy-based strength analysis and a cryptographically secure password generator. Zero dependencies, no build step.

## Features

### Strength Checker
- **Entropy calculation** — bits of entropy based on character pool size and length
- **Crack time estimate** — estimated brute-force time at 10 billion guesses/second
- **Common password detection** — blocklist of 500+ common passwords
- **Sequential/repeated character penalties** — abc, 123, qwer, aaa, ababab
- **Character class analysis** — lowercase, uppercase, digits, symbols
- **Visual strength bar** — color-coded: red / orange / yellow / green
- **Actionable feedback** — specific suggestions to improve the password

### Password Generator
- **Length slider** — 8 to 64 characters
- **Character class toggles** — lowercase, uppercase, digits, symbols
- **Exclude ambiguous characters** — removes 0/O/1/l/I confusion pairs
- **Bulk generation** — generate up to 50 passwords at once
- **Passphrase mode** — 3-8 random words with configurable separator
- **Cryptographically secure** — uses `crypto.getRandomValues()`

### UX
- Dark theme
- Japanese / English UI toggle
- Client-side only — no data transmitted

## Usage

```sh
# Serve locally
python3 -m http.server 8080
# Open http://localhost:8080
```

## Tests

```sh
npm test
```

Requires Node.js 18+ (uses built-in test runner).

## Security Notes

All password analysis and generation happens entirely in the browser. No passwords are transmitted over the network.

The generator uses `crypto.getRandomValues()` for cryptographically secure random numbers where available.

## Entropy Model

- Pool size = sum of active character classes: lowercase (26) + uppercase (26) + digits (10) + symbols (32)
- Entropy = `length × log₂(poolSize)`
- Penalties applied for common passwords, sequential patterns, and repeated characters

Crack time assumes 10 billion (10¹⁰) guesses per second — a reasonable estimate for a fast offline attack.

## Project Structure

```
├── index.html          # Single-page app
├── style.css           # Dark theme styles
├── src/
│   ├── main.js         # DOM, events, UI
│   ├── strength.js     # Entropy, scoring, feedback
│   ├── generate.js     # Password & passphrase generator
│   ├── wordlist.js     # 200+ word EFF-inspired wordlist
│   ├── common.js       # 500+ common passwords blocklist
│   └── i18n.js         # English/Japanese translations
└── tests/
    ├── strength.test.js
    └── generate.test.js
```

## License

MIT — Copyright (c) 2026 SEN LLC (SEN 合同会社)

<!-- sen-publish:links -->
## Links

- 🌐 Demo: https://sen.ltd/portfolio/password-strength/
- 📝 dev.to: https://dev.to/sendotltd/a-password-strength-checker-with-entropy-math-and-crack-time-estimates-1gjg
<!-- /sen-publish:links -->
