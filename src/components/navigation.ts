import { selectors } from "../utils/dom";
import { refreshTestimonioVerse } from "./testimonios";

export function switchScreen(targetKey: string): void {
  document.documentElement.classList.toggle("testimonios-active", targetKey === "testimonios");
  if (targetKey === "testimonios") refreshTestimonioVerse();

  Object.entries(selectors.screens).forEach(([key, el]) => {
    el?.classList.toggle("screen--active", key === targetKey);
  });

  selectors.bottomNavItems.forEach((btn) => {
    const isTarget = btn.dataset.target === targetKey;
    btn.classList.toggle("bottom-nav-item--active", isTarget);
  });

  if (selectors.desktopNavItems) {
    selectors.desktopNavItems.forEach((btn) => {
      const isTarget = btn.dataset.target === targetKey;
      btn.classList.toggle("desktop-nav-item--active", isTarget);
    });
  }
}

export function initNavigation(): void {
  selectors.bottomNavItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      switchScreen(btn.dataset.target!);
    });
  });

  if (selectors.desktopNavItems) {
    selectors.desktopNavItems.forEach((btn) => {
      btn.addEventListener("click", () => {
        switchScreen(btn.dataset.target!);
      });
    });
  }
}
