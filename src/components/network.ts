import { selectors } from "../utils/dom";
import { state } from "../state/app-state";
import { togglePlayback } from "./player";

let offlineTimeout: ReturnType<typeof setTimeout> | null = null;
const OFFLINE_DELAY = 3000;

function checkRealConnectivity(): void {
  fetch("/favicon.ico", { method: "HEAD", cache: "no-store" })
    .then(() => {
      if (offlineTimeout) {
        clearTimeout(offlineTimeout);
        offlineTimeout = null;
      }
      hideOfflineOverlay();
    })
    .catch(() => {
      showOfflineOverlay();
    });
}

const showOfflineOverlay = (): void => {
  if (selectors.offlineOverlay) {
    selectors.offlineOverlay.hidden = false;
  }
  if (selectors.statusText) {
    selectors.statusText.textContent = "Sin conexión";
  }
  if (selectors.statusDot) {
    selectors.statusDot.classList.remove("status-dot--playing");
  }
};

const hideOfflineOverlay = (): void => {
  if (selectors.offlineOverlay) {
    selectors.offlineOverlay.hidden = true;
  }
};

export function setupNetworkMonitoring(): void {
  window.addEventListener("online", () => {
    console.log("Internet restablecido.");
    if (offlineTimeout) {
      clearTimeout(offlineTimeout);
      offlineTimeout = null;
    }
    checkRealConnectivity();
    if (
      state.isPlaying ||
      localStorage.getItem("ebenezer_autoplay") === "1"
    ) {
      togglePlayback();
    }
  });

  window.addEventListener("offline", () => {
    offlineTimeout = setTimeout(() => {
      checkRealConnectivity();
    }, OFFLINE_DELAY);
  });

  const conn = (navigator as Navigator & { connection?: NetworkConnection }).connection;
  if (conn) {
    conn.addEventListener("change", () => {
      const { effectiveType } = conn;
      console.log(`Calidad de red detectada: ${effectiveType}`);
      if (effectiveType === "2g" || effectiveType === "slow-2g") {
        console.warn("Calidad de internet muy baja.");
      }
    });
  }
}
