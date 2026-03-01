# Trump Redacted

A free, open-source browser extension that places a black box over mentions of Donald Trump's name on any webpage.

## 🔧 Extension

The Chrome/Chromium extension works on all websites and catches dynamically loaded content (SPAs, infinite scroll, etc.).

**Names redacted:** Donald J. Trump, Donald Trump, Trump, Donald

### Install from Chrome Web Store

*(Link coming soon)*

### Install manually (for development)

1. Clone this repo
2. Open `chrome://extensions/` in Chrome (or any Chromium browser)
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked** and select the `extension/` folder
5. Browse the web — names are now redacted

### How it works

- A content script scans all visible text on every page
- Matching names are wrapped in a `<span>` with black background and black text
- A MutationObserver catches dynamically added content
- Form inputs, code blocks, and editable areas are left alone

## 🌐 Website

The `website/` folder contains the landing page with:
- Extension download link
- T-shirt store section (powered by Printful / print-on-demand)

### Deploy

The site is a single static HTML file. Deploy to Netlify, Vercel, GitHub Pages, or any static host.

## 📦 Project Structure

```
├── extension/
│   ├── manifest.json      # Chrome extension manifest (V3)
│   ├── content.js         # DOM walker & redaction logic
│   ├── redact.css         # Black-box styling
│   └── icons/             # Extension icons
├── website/
│   └── index.html         # Landing page
├── LICENSE                # MIT
└── README.md
```

## License

MIT — see [LICENSE](./LICENSE).
