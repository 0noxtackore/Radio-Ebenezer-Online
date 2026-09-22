<p align="center">
  <img src="img/logo_solid.png" alt="Radio Ebenezer Online" width="100%"/>
</p>

<h1 align="center">Radio Ebenezer Online</h1>

<p align="center">
  Radio Ebenezer — The message of the hour on the web. A web application for live streaming, weekly service calendar, and real-time notifications.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Netlify-00C7B7?logo=netlify&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green" />
</p>

---

## About

Radio Ebenezer Online is a modern web application for **Radio Ebenezer** ("The message of the hour on the web"). It provides live streaming, a weekly calendar of services and events, notifications with countdown timers, and a gamification system to engage listeners.

The interface is **mobile-first**, responsive, with offline detection and automatic recovery. Deployed on Netlify with CI/CD from GitHub.

## Features

| Feature | Description |
|---|---|
| **Live Streaming** | Player with play/pause, volume control, and automatic reconnection. |
| **Weekly Calendar** | Recurring events (Worship, Prayer, Preaching, Youth) with SVG icons and current Sunday highlighted. |
| **Notifications** | Upcoming event alerts with YouTube thumbnails (via RSS), bomb-style countdown timer. |
| **Gamification** | Points, streaks, levels, and 10 unlockable achievements stored in localStorage. |
| **Offline Detection** | "Offline" overlay with real connectivity check (fetch to favicon after 3s delay). |
| **YouTube Thumbnails** | Notification thumbnails from RSS feed of `@tabernaculoebenezer34`, fallback to channel banner. |
| **Countdown Timer** | Visual bomb-style timer (4 blocks: Days/Hours/Min/Sec) with carbon background and blink animation. |
| **Responsive Design** | Desktop navigation (header) + mobile bottom nav, dropdowns, glassmorphism UI. |

## Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/Node.js_18-339933?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript_5-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite_6-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white" />
  <img src="https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/Netlify-00C7B7?logo=netlify&logoColor=white" />
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?logo=githubactions&logoColor=white" />
</p>

- **Node.js 18+** — Runtime and tooling
- **TypeScript 5** — Strict typing, modular (`src/config`, `src/components`, `src/state`, `src/utils`, `src/types`)
- **Vite 6** — Dev server (port 5504), optimized build, HMR
- **CSS3** — Custom properties, glassmorphism, animations, grid/flex layouts
- **Netlify** — Hosting, CI/CD, env vars, edge functions ready
- **GitHub Actions** — (Optional) Deploy preview / production

## Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **npm** package manager

### Installation

```bash
git clone https://github.com/0noxtackore/Radio-Ebenezer-Online.git
cd Radio-Ebenezer-Online
npm install
```

### Environment Variables

Create `.env` based on `.env.example`:

```env
VITE_STREAM_URL=https://usa8.fastcast4u.com/proxy/ramonsky?mp=/1
VITE_API_URL=https://api.instant.audio/data/playlist/14/ebenezer
VITE_YOUTUBE_API_KEY=
VITE_YOUTUBE_CHANNEL_HANDLE=@tabernaculoebenezer34
VITE_YOUTUBE_CHANNEL_ID=UC4T3wvjnujOJrLNWZ5_zyCw
```

> **Netlify**: Configure these 5 variables in *Site settings → Environment variables* and trigger *Retry deploy*.

### Development

```bash
npm run dev
```

App available at `http://localhost:5504` (or whatever port Vite assigns).

### Production Build

```bash
npm run build
```

Generates `dist/` ready for static deployment.

### Preview Build

```bash
npm run preview
```

## Project Structure

```
Radio-Ebenezer-Online/
├── img/                      # Logos, covers, static assets
│   ├── logo_app.png
│   ├── logo_solid.png
│   ├── eagle.jpeg
│   └── logo_app.ico
├── src/
│   ├── components/           # UI components
│   │   ├── calendar.ts       # Weekly calendar with SVG events
│   │   ├── gamification.ts   # Profile, points, streaks, achievements
│   │   ├── network.ts        # Offline overlay + connectivity check
│   │   ├── notifications.ts  # Alerts, countdown timer, YouTube thumbs
│   │   └── player.ts         # Audio streaming, volume, reconnect
│   ├── config/
│   │   └── constants.ts      # STREAM_URL, EVENTS, YouTube config
│   ├── state/
│   │   └── gamification.ts   # Points, streaks, localStorage logic
│   ├── utils/
│   │   ├── date.ts           # getCountdownBlocks(), date helpers
│   │   └── youtube.ts        # RSS parser, thumbnail fetcher
│   ├── types/
│   │   └── env.d.ts          # ImportMetaEnv typings
│   ├── styles/
│   │   └── main.css          # Global styles (1900+ lines)
│   ├── main.ts               # Entry point, init, navigation
│   └── sw-register.ts        # (Optional) Service Worker
├── index.html                # Shell HTML, nav, screens, meta
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env                      # Local (gitignored)
├── .env.example              # Template for deploy
├── netlify.toml              # Netlify config (build, headers, redirects)
├── logo_app.ico              # Favicon multi-res (16–256px)
└── README.md
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (Vite + HMR) |
| `npm run build` | Compile TypeScript + production build (Vite) |
| `npm run preview` | Serve `dist/` locally to test build |

## Deployment

### Netlify (Recommended)

1. Connect repo in Netlify → *New site from Git*
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add the 5 `VITE_*` env vars in *Site settings → Environment variables*
5. *Deploy site*

The `netlify.toml` includes:
- SPA redirect (`/* → /index.html 200`)
- Security headers (CSP, HSTS, X-Frame-Options)
- Static asset caching

### Manual (Any Static Host)

```bash
npm run build
# Upload dist/ folder to your hosting (Apache, Nginx, Vercel, Cloudflare Pages, etc.)
```

## Live Demo

🔗 **https://radio-ebenezer-online.netlify.app/**

Stream: `https://usa8.fastcast4u.com/proxy/ramonsky?mp=/1`

YouTube: [@tabernaculoebenezer34](https://youtube.com/@tabernaculoebenezer34)

## License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

<p align="center">
  Built with faith by <a href="https://github.com/0noxtackore">0noxtackore</a>
</p>