<div align="center">

# TabZero

**✨ Ultra-minimalist, aesthetic, privacy-first modern browser new tab extension**

[English](README.md) | [简体中文](README_zh.md)

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript" alt="TypeScript 5.9"></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite" alt="Vite 7"></a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto"><img src="https://img.shields.io/badge/Encryption-AES--256--GCM-green" alt="AES-256-GCM"></a>
  <a href="https://developer.chrome.com/docs/extensions/mv3/intro/"><img src="https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-blue" alt="Manifest V3"></a>
</p>

</div>

---

### Preview

<p align="center">
  <img src="./screenshots/preview-dark.png" alt="Dark Mode Preview" width="100%">
</p>

<p align="center">
  <img src="./screenshots/preview-light.png" alt="Light Mode Preview" width="100%">
</p>

---

### ✨ Key Features

- **🎯 Ultra Minimalist Aesthetics**
  - Modern typography powered by *Outfit* and *JetBrains Mono*, with comfortable 64px golden hero spacing.
  - Built-in dynamic readability shields and subtle vignette shading, ensuring crystalline text legibility across both vibrant light and deep dark wallpapers.
- **🔒 WebDAV Cloud Sync (Zero-Knowledge AES-256-GCM Encryption)**
  - Seamlessly syncs with any standard WebDAV cloud (Nextcloud, Synology NAS, Alist, etc.).
  - **Zero-knowledge privacy**: All bookmarks and categories are encrypted client-side using the browser-native Web Crypto API with PBKDF2 (100,000 iterations) derived keys and AES-256-GCM authenticated encryption. Your server only stores encrypted ciphertext.
- **🟢 Active Connection Monitoring & Breathing Status Indicator**
  - One-click "Test Connection" with an animated pulsing breathing light (🟢 Connected / 🔴 Disconnected).
  - Clear, user-friendly diagnostic guidance for common HTTP errors (401 Bad Credentials, 403 Forbidden, 404 Not Found).
- **📂 Native Browser Bookmark Import & Export**
  - **Lossless HTML Parsing**: Seamlessly import standard Netscape bookmark HTML files exported from Chrome, Edge, Safari, and Firefox, preserving folder hierarchies and favicon associations.
  - **Offline JSON Backup**: One-click structured JSON export and import for full offline data sovereignty.
- **🔍 Multi-Search Engine Instant Switching**
  - Pre-configured with 25+ mainstream search engines (Google, Bing, Baidu, GitHub, DuckDuckGo, Zhihu, Bilibili, Taobao, MDN, etc.).
  - **Full Keyboard Cycling**: Press `Tab` or `Shift + Tab` to seamlessly cycle through search engines without touching the mouse.
  - **Direct Prefix Triggers**: Type `b + Space` for Bing, `g + Space` for Google, `gh + Space` for GitHub directly in the search bar.
- **⌨️ Keyboard-First Workflow**
  - `⌘K` / `Ctrl + K`: Summon global quick search overlay anywhere.
  - `/` or `、`: Instantly focus the main search bar (fully IME-friendly).
  - `Esc`: Dismiss any drawer, modal, or overlay instantly.
- **🖼️ Microsoft Official Bing 4K Daily Streaming Wallpapers**
  - Direct connection to Microsoft's official China CDN (`cn.bing.com`) without slow overseas third-party proxies.
  - **Rolling Single-Cache Architecture**: Maintains only the active wallpaper in local disk cache, launching in 1ms while eliminating storage bloat.
- **⚙️ Deep Customization & Widget Toggles**
  - Configurable link open behavior (`_blank` new tab vs `_self` current tab).
  - Independent visibility toggles for Clock, Quick Link Tiles, Bookmark Bar, and Theme Switcher.

---

### 📂 Directory Structure

```text
TabZero/
├── TabZero/                  # Production-ready Chrome Extension distribution
│   ├── manifest.json         # Extension Manifest V3 configuration
│   ├── index.html            # New tab page entrypoint
│   ├── assets/               # Production runtime (~590 KB total)
│   │   ├── main.js           # Bundle (React 19 + Zustand + WebDAV + WebCrypto)
│   │   └── style.css         # Styles (glassmorphism, animations, responsive grid)
│   ├── icons/                # High-res SVG and PNG extension icons
│   │   ├── icon.svg          # Master vector logo
│   │   ├── icon16.png / 48 / 128
│   │   └── engines/          # Vector icons for 25+ search engines
│   └── screenshots/          # High-resolution demonstration previews
├── public/                   # Static assets
├── src/                      # Source code (TypeScript + React 19)
│   ├── components/           # UI components (Bookmarks, Clock, SearchBar, Settings)
│   ├── hooks/                # Custom React hooks
│   ├── i18n/                 # Localization (en-US, zh-CN)
│   ├── stores/               # Zustand state stores
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Crypto, WebDAV client, bookmark parser
├── package.json              # Project dependencies & build scripts
├── vite.config.ts            # Vite 7 build configuration
└── README.md                 # Project documentation
```

---

### 🚀 Installation & Getting Started

#### Option 1: Load Unpacked Extension (Fastest & Recommended)

1. Clone or download this repository:
   ```bash
   git clone git@github.com:oceanxux/TabZero.git
   ```
2. Open Google Chrome or Microsoft Edge and navigate to `chrome://extensions/` (or `edge://extensions/`).
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** in the top-left corner.
5. Select the **`TabZero`** folder in the root directory.

#### Option 2: Pre-packaged Extension (.crx / .zip)

Download ready-to-use packages from GitHub Releases:
- **`TabZero-v1.0.3.zip`** (~160 KB): Standard Chrome Web Store / Edge Add-ons upload package.
- **`TabZero-v1.0.3.crx`** (~163 KB): One-click drag-and-drop installer for Chromium browsers.

#### Option 3: Build from Source

```bash
# 1. Install dependencies
npm install

# 2. Start local hot-reload development server
npm run dev

# 3. Build production bundle
npm run build
```

---

### ⌨️ Keyboard Shortcuts Reference

| Shortcut | Description | Context |
| :--- | :--- | :--- |
| **`/`** or **`、`** | **Focus Search Bar** | Works seamlessly with Asian/Chinese IME |
| **`⌘ + K`** / **`Ctrl + K`** | **Summon Quick Search Overlay** | Available anywhere on the new tab page |
| **`Tab`** / **`Shift + Tab`** | **Cycle Search Engines** | Quick search engine switching without mouse |
| **`b `** / **`g `** + Space | **Prefix Search Switching** | e.g., type `b keywords` for Bing search |
| **`Esc`** | **Close Overlays / Modals** | Closes settings drawer or search modal |

---

### 🛡️ Security & Privacy Architecture

TabZero adheres strictly to zero-knowledge privacy principles:

```
[ Local User Bookmarks & Data ]
             │
             ▼
[ Web Crypto API (Browser Sandbox) ]
   ├── Key Derivation: PBKDF2 (100,000 iterations of SHA-256)
   ├── Cryptographic Nonce: 16-byte Salt + 12-byte IV
   └── Authenticated Encryption: AES-256-GCM
             │
             ▼
[ Encrypted Ciphertext Payload (ciphertext, salt, iv) ]
             │
             ▼ (Transported via HTTPS)
[ Your Private WebDAV Server (Nextcloud / Synology / Alist) ]
```

> **Note**: Even if your WebDAV storage or network is compromised, no third party can decrypt your bookmarks without your local master password.

---

### 📄 License

This project is licensed under the [MIT License](LICENSE).

<div align="center">

**Crafted with care for a cleaner, faster web browsing experience.**

</div>
