import type { Selectors } from "../types";

export const selectors: Selectors = {
  screens: {
    home: document.getElementById("screen-home"),
    search: document.getElementById("screen-search"),
    notifications: document.getElementById("screen-notifications"),
  },
  bottomNavItems: document.querySelectorAll(".bottom-nav-item"),
  desktopNavItems: document.querySelectorAll(".desktop-nav-item"),
  loader: document.getElementById("app-loader"),
  audio: document.getElementById("radio-audio") as HTMLAudioElement,
  playToggle: document.getElementById("btn-play-toggle") as HTMLButtonElement,
  playIcon: document.getElementById("play-icon") as unknown as SVGSVGElement | null,
  statusText: document.getElementById("player-status-text")!,
  statusDot: document.getElementById("player-status-dot")!,
  discInner: document.getElementById("cover-disc-inner"),
  tonearm: document.querySelector(".turntable-arm"),
  logoCircle: document.querySelector(".logo-circle"),
  offlineOverlay: document.getElementById("offline-overlay"),
  serverOverlay: document.getElementById("server-overlay"),
  volumeButton: document.getElementById("btn-volume") as HTMLButtonElement | null,
  volumeIcon: document.getElementById("volume-icon") as unknown as SVGSVGElement | null,
  volumeRange: document.getElementById("volume-range") as HTMLInputElement | null,
  calendarContainer: document.getElementById("schedule-calendar"),
  calendarNotification: document.getElementById("calendar-notification"),
};
