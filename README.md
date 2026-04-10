# Pretext vs Naive — Scroll Performance Demo

A visual comparison of two chat-list rendering strategies, designed to let you **feel** the scroll performance difference in the browser.

## What it tests

| Naive | Virtual (Pretext) |
|---|---|
| Renders all **10 000 chat messages** into the DOM at once | Only renders the **~30 messages** visible in the current viewport |
| DOM node count grows linearly with message count | DOM node count stays constant regardless of history length |
| Scrolling forces the browser to composite 10 000 nodes | Scrolling only composites the visible slice + 3-item overscan |

The virtual list uses **[@chenglou/pretext](https://github.com/chenglou/pretext)** to pre-compute every message's pixel height without touching the DOM. This lets it place items via absolute positioning and maintain an accurate scrollbar height — with no layout thrashing.

## Live demo

**<https://romuche.github.io/virtualdom/>**

The homepage links to two standalone pages — open each one and try scrolling to compare.

## Project structure

```
.
├── virtual.html        # Vite HTML entry (virtual list)
├── src/
│   ├── messages.js     # Shared 32-template message dataset (ES module)
│   └── virtual.js      # Virtual list implementation using Pretext
├── docs/               # GitHub Pages root
│   ├── index.html      # Landing page with links to both demos
│   ├── naive.html      # Naive renderer — 10 000 DOM nodes (static, no build step)
│   ├── virtual.html    # Virtual list — built by Vite
│   ├── messages.js     # Copied here by build for naive.html to import
│   └── assets/         # Vite-generated JS bundle
├── vite.config.js
└── package.json
```

## Running locally

```bash
npm install
npm run dev        # dev server at http://localhost:5173
```

Then open `http://localhost:5173/docs/index.html` in Chrome.

> **Note:** `naive.html` imports `messages.js` as an ES module, which requires an HTTP server (not `file://`). The dev server satisfies this automatically.

## Building

```bash
npm run deploy     # runs vite build → writes output to /docs
```

After building, `docs/` is self-contained and ready for GitHub Pages.

## Tech

- No frameworks — vanilla JS and CSS only
- Bundler: [Vite](https://vitejs.dev/)
- Text layout: [@chenglou/pretext](https://github.com/chenglou/pretext) — measures text height 300× faster than DOM-based approaches
- Target browser: Chrome
