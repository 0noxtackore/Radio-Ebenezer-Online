<p align="center">
  <img src="img/logo_solid.png" alt="Radio Ebenezer Online" width="100%"/>
</p>

<h1 align="center">Radio Ebenezer Online</h1>

<p align="center">
  Radio Ebenezer 94.7 FM — El mensaje de la hora en la red. Aplicación web para transmisión en vivo, calendario de cultos y notificaciones.
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

Radio Ebenezer Online es una aplicación web moderna para la emisora **Radio Ebenezer 94.7 FM** ("El mensaje de la hora en la red"). Proporciona transmisión en vivo, un calendario semanal de cultos y eventos, notificaciones con cuenta regresiva, y un sistema de gamificación para fidelizar oyentes.

La interfaz es **mobile-first**, responsive, con modo offline detection y recuperación automática. Desplegada en Netlify con CI/CD desde GitHub.

## Features

| Feature | Description |
|---|---|
| **Live Streaming** | Reproductor con botón play/pause, control de volumen y reconexión automática. |
| **Calendario Semanal** | Eventos recurrentes (Culto, Oración, Predicación, Jóvenes) con iconos SVG y domingo del día actual marcado. |
| **Notificaciones** | Avisos de próximos eventos con miniaturas de YouTube (vía RSS), cuenta regresiva estilo "bomba". |
| **Gamificación** | Puntos, rachas, niveles y 10 logros desbloqueables guardados en localStorage. |
| **Offline Detection** | Overlay de "Sin conexión" con verificación real de conectividad (fetch a favicon tras 3s). |
| **YouTube Thumbnails** | Miniaturas de notificaciones desde RSS feed del canal `@tabernaculoebenezer34`, fallback al banner del canal. |
| **Cuenta Regresiva** | Timer visual estilo bomba (4 bloques: Días/Horas/Min/Seg) con fondo carbono y animación blink. |
| **Responsive Design** | Navegación desktop (header) + bottom nav mobile, dropdowns, glassmorphism UI. |

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

- **Node.js 18+** — Runtime y tooling
- **TypeScript 5** — Tipado estricto, modular (`src/config`, `src/components`, `src/state`, `src/utils`, `src/types`)
- **Vite 6** — Dev server (puerto 5504), build optimizado, HMR
- **CSS3** — Custom properties, glassmorphism, animaciones, grid/flex layouts
- **Netlify** — Hosting, CI/CD automático, env vars, edge functions ready
- **GitHub Actions** — (Opcional) Deploy preview / production

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

Crea `.env` basado en `.env.example`:

```env
VITE_STREAM_URL=https://usa8.fastcast4u.com/proxy/ramonsky?mp=/1
VITE_API_URL=https://api.instant.audio/data/playlist/14/ebenezer
VITE_YOUTUBE_API_KEY=
VITE_YOUTUBE_CHANNEL_HANDLE=@tabernaculoebenezer34
VITE_YOUTUBE_CHANNEL_ID=UC4T3wvjnujOJrLNWZ5_zyCw
```

> **Netlify**: Configura estas 5 variables en *Site settings → Environment variables* y haz *Retry deploy*.

### Development

```bash
npm run dev
```

App disponible en `http://localhost:5504` (o el puerto libre que asigne Vite).

### Production Build

```bash
npm run build
```

Genera `dist/` listo para deploy estático.

### Preview Build

```bash
npm run preview
```

## Project Structure

```
Radio-Ebenezer-Online/
├── img/                      # Logos, covers, assets estáticos
│   ├── logo_app.png
│   ├── logo_solid.png
│   ├── eagle.jpeg
│   └── logo_app.ico
├── src/
│   ├── components/           # UI components
│   │   ├── calendar.ts       # Calendario semanal con eventos SVG
│   │   ├── gamification.ts   # Perfil, puntos, rachas, logros
│   │   ├── network.ts        # Offline overlay + connectivity check
│   │   ├── notifications.ts  # Avisos, countdown timer, YouTube thumbs
│   │   └── player.ts         # Audio streaming, volume, reconnect
│   ├── config/
│   │   └── constants.ts      # STREAM_URL, EVENTS, YouTube config
│   ├── state/
│   │   └── gamification.ts   # Lógica de puntos, rachas, localStorage
│   ├── utils/
│   │   ├── date.ts           # getCountdownBlocks(), date helpers
│   │   └── youtube.ts        # RSS parser, thumbnail fetcher
│   ├── types/
│   │   └── env.d.ts          # ImportMetaEnv typings
│   ├── styles/
│   │   └── main.css          # Estilos globales (1900+ líneas)
│   ├── main.ts               # Entry point, init, navigation
│   └── sw-register.ts        # (Opcional) Service Worker
├── index.html                # Shell HTML, nav, screens, meta
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env                      # Local (gitignored)
├── .env.example              # Template para deploy
├── netlify.toml              # Config Netlify (build, headers, redirects)
├── logo_app.ico              # Favicon multi-res (16–256px)
└── README.md
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Inicia servidor de desarrollo (Vite + HMR) |
| `npm run build` | Compila TypeScript + build de producción (Vite) |
| `npm run preview` | Sirve `dist/` localmente para probar build |

## Deployment

### Netlify (Recomendado)

1. Conecta repo en Netlify → *New site from Git*
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Agrega las 5 `VITE_*` env vars en *Site settings → Environment variables*
5. *Deploy site*

El `netlify.toml` ya incluye:
- SPA redirect (`/* → /index.html 200`)
- Headers de seguridad (CSP, HSTS, X-Frame-Options)
- Cacheo de assets estáticos

### Manual (Cualquier estático)

```bash
npm run build
# Sube carpeta dist/ a tu hosting (Apache, Nginx, Vercel, Cloudflare Pages, etc.)
```

## Live Demo

🔗 **https://radio-ebenezer-online.netlify.app/**

Stream: `https://usa8.fastcast4u.com/proxy/ramonsky?mp=/1`

YouTube: [@tabernaculoebenezer34](https://youtube.com/@tabernaculoebenezer34)

## License

Distribuido bajo la **Licencia MIT**. Ver [`LICENSE`](LICENSE) para detalles.

---

<p align="center">
  Built with faith by <a href="https://github.com/0noxtackore">0noxtackore</a>
</p>