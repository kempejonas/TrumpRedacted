# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RedactTrump is a Chrome/Chromium browser extension (Manifest V3) that places black boxes over mentions of Donald Trump's name on any webpage. It includes a static landing page website. The project uses zero external dependencies — pure vanilla JavaScript, HTML, and CSS throughout.

## Development Setup

There is no build system, bundler, or package manager. To develop:

1. Open `chrome://extensions/` in Chrome with **Developer mode** enabled
2. Click **Load unpacked** and select the `extension/` folder
3. After code changes, click the refresh icon on the extension card to reload

The website (`Website/index.html`) is a single static file — open directly in a browser.

## Architecture

### Extension (`extension/`)

- **manifest.json** — MV3 config; runs on `<all_urls>` at `document_idle`; only permission is `storage`
- **content.js** — Core logic. Uses `TreeWalker` + `NodeFilter.SHOW_TEXT` to scan all text nodes, applies 4 regex patterns ordered longest-first (`Donald J. Trump` → `Donald Trump` → `Trump` → `Donald`) with `\b` word boundaries to avoid false positives. Wraps matches in `<span class="redact-trump">` elements. A `MutationObserver` handles dynamically added content (SPAs, infinite scroll). Protected elements (scripts, styles, forms, code blocks, contenteditable, SVG, math) are skipped.
- **popup.html / popup.js** — Toggle UI. Reads/writes `enabled` state to `chrome.storage.local`. Content script listens for storage changes and can enable/disable without page reload by toggling `.redact-trump-disabled` on `<body>`.
- **redact.css** — Black-box effect via matching background and text color (`#000`), `user-select: none`, all with `!important` to override page styles. Disabled state makes redactions transparent.

### Website (`Website/`)

Single `index.html` with all CSS embedded. Uses Google Fonts (DM Serif Display, Sora, IBM Plex Mono). Sections: hero, how-it-works, live preview demo, merch, privacy policy, footer.

## Design Tokens

- **Black:** `#0a0a0a`
- **Cream/White:** `#f5f2ed`, `#ebe6de`
- **Accent Red:** `#d6001c`
- **Gray:** `#6b6560`

## Key Implementation Details

- Original text is preserved in the DOM (hidden by CSS) so disabling the extension restores content without reload
- `aria-hidden="true"` is set on redacted spans for accessibility
- Text nodes are collected into an array before processing to avoid mutating the live DOM tree during iteration
- The regex patterns use case-insensitive matching except for standalone `Trump` (case-sensitive to reduce false positives)
