import { selectors } from "../utils/dom";
import { state } from "../state/app-state";
import {
  STREAM_URL,
  ICON_PLAY_PATH,
  ICON_PAUSE_PATH,
} from "../config/constants";

export function ensureStreamUrl(forceRefresh = false): boolean {
  if (!STREAM_URL) {
    selectors.statusText.textContent =
      "Configura la URL de streaming en .env (VITE_STREAM_URL).";
    selectors.statusDot.classList.remove("status-dot--playing");
    return false;
  }

  if (!selectors.audio.src || forceRefresh) {
    const separator = STREAM_URL.includes("?") ? "&" : "?";
    selectors.audio.src = `${STREAM_URL}${separator}cb=${Date.now()}`;
    selectors.audio.load();
  }

  return true;
}

export function setPlayingUI(playing: boolean): void {
  state.isPlaying = playing;

  if (playing) {
    selectors.statusText.textContent = "Reproduciendo en vivo";
    selectors.statusDot.classList.add("status-dot--playing");
    selectors.playToggle.classList.add("btn-play--pulsing");
    if (selectors.playIcon) {
      const path = selectors.playIcon.querySelector("path");
      if (path) path.setAttribute("d", ICON_PAUSE_PATH);
    }
    if (selectors.discInner) {
      selectors.discInner.classList.add("cover-disc-inner--spinning");
    }
    if (selectors.tonearm) {
      selectors.tonearm.classList.add("turntable-arm--active");
    }
    if (selectors.logoCircle) {
      selectors.logoCircle.classList.add("logo-circle--pulsing");
    }
  } else {
    selectors.statusText.textContent = "Pausado";
    selectors.statusDot.classList.remove("status-dot--playing");
    selectors.playToggle.classList.remove("btn-play--pulsing");
    if (selectors.playIcon) {
      const path = selectors.playIcon.querySelector("path");
      if (path) path.setAttribute("d", ICON_PLAY_PATH);
    }
    if (selectors.discInner) {
      selectors.discInner.classList.remove("cover-disc-inner--spinning");
    }
    if (selectors.tonearm) {
      selectors.tonearm.classList.remove("turntable-arm--active");
    }
    if (selectors.logoCircle) {
      selectors.logoCircle.classList.remove("logo-circle--pulsing");
    }
  }
}

export function togglePlayback(): void {
  if (state.isPlaying) {
    selectors.audio.pause();
    selectors.audio.removeAttribute("src");
    selectors.audio.load();
    setPlayingUI(false);
    try {
      localStorage.setItem("ebenezer_autoplay", "0");
    } catch (_) {
      /* empty */
    }
  } else {
    selectors.statusText.textContent = "Conectando...";
    if (!ensureStreamUrl(true)) return;

    selectors.audio
      .play()
      .then(() => {
        setPlayingUI(true);
        if (state.isMuted || selectors.audio.muted) {
          setMuted(false);
        }
        try {
          localStorage.setItem("ebenezer_autoplay", "1");
        } catch (_) {
          /* empty */
        }
      })
      .catch((error: unknown) => {
        console.error("Error al reproducir la radio", error);
        setPlayingUI(false);
        selectors.statusText.textContent =
          "El navegador bloqueó el autoplay. Toca el botón de reproducción.";
        try {
          localStorage.setItem("ebenezer_autoplay", "0");
        } catch (_) {
          /* empty */
        }
      });
  }
}

export function setMuted(muted: boolean): void {
  if (!selectors.audio) return;
  state.isMuted = muted;
  selectors.audio.muted = muted;
  import("./volume").then((m) => m.updateVolumeIcon());
  if (selectors.volumeButton) {
    selectors.volumeButton.classList.toggle("icon-button--muted", muted);
  }
}

export function handleAudioEvents(): void {
  selectors.audio.addEventListener("playing", () => {
    if (selectors.serverOverlay) {
      selectors.serverOverlay.hidden = true;
    }
    if (state.serverDown) {
      state.serverDown = false;
      window.location.reload();
      return;
    }
    setPlayingUI(true);
  });

  selectors.audio.addEventListener("pause", () => {
    setPlayingUI(false);
  });

  selectors.audio.addEventListener("waiting", () => {
    selectors.statusText.textContent = "Buffering...";
  });

  selectors.audio.addEventListener("error", () => {
    selectors.statusText.textContent =
      "Error al cargar el streaming. Verifica la URL o la conexión.";
    setPlayingUI(false);
    if (!navigator.onLine) return;
    if (selectors.serverOverlay) {
      selectors.serverOverlay.hidden = false;
    }
    state.serverDown = true;
  });
}

export function attemptAutoplay(): void {
  if (!ensureStreamUrl()) return;

  const playPromise = selectors.audio.play();

  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        console.log("Autoplay con sonido exitoso.");
        setPlayingUI(true);
        try {
          localStorage.setItem("ebenezer_autoplay", "1");
        } catch (_) {
          /* empty */
        }
      })
      .catch((error: unknown) => {
        console.warn(
          "Autoplay with sound blocked. Trying muted autoplay...",
          error
        );

        setTimeout(() => {
          setMuted(true);
          selectors.audio
            .play()
            .then(() => {
              console.log("Muted autoplay succeeded.");
              setPlayingUI(true);
              selectors.statusText.textContent =
                "Reproduciendo en silencio. Toca la pantalla para activar el sonido.";
              setupInteractionUnlock();
            })
            .catch((mutedError: unknown) => {
              console.error("Autoplay fully blocked", mutedError);
              setPlayingUI(false);
              selectors.statusText.textContent =
                "Toca la pantalla para escuchar.";
              setupInteractionUnlock();
            });
        }, 150);
      });
  }
}

function setupInteractionUnlock(): void {
  const unlockEvents = ["click", "touchstart", "keydown"];

  const unlockHandler = (): void => {
    if (
      !selectors.audio.paused &&
      (state.isMuted || selectors.audio.muted)
    ) {
      setMuted(false);
      if (selectors.audio.volume === 0) {
        selectors.audio.volume = 1;
        if (selectors.volumeRange) selectors.volumeRange.value = "1";
      }
      console.log("Audio unlocked by user interaction.");
      selectors.statusText.textContent = "Reproduciendo en vivo";
    } else if (selectors.audio.paused) {
      setMuted(false);
      selectors.audio.volume = 1;
      if (selectors.volumeRange) selectors.volumeRange.value = "1";

      selectors.audio
        .play()
        .then(() => {
          setPlayingUI(true);
          selectors.statusText.textContent = "Reproduciendo en vivo";
        })
        .catch((e: unknown) =>
          console.error("Error al iniciar por interacción", e)
        );
    }

    unlockEvents.forEach((evt) =>
      document.removeEventListener(evt, unlockHandler)
    );
  };

  unlockEvents.forEach((evt) =>
    document.addEventListener(evt, unlockHandler, { once: true })
  );
}

export function initPlayer(): void {
  selectors.playToggle.addEventListener("click", togglePlayback);
  if (selectors.volumeButton && selectors.volumeRange && selectors.audio) {
    selectors.volumeButton.addEventListener("click", () => {
      const currentVol = parseFloat(
        selectors.volumeRange?.value || "0"
      );

      if (currentVol === 0 || state.isMuted) {
        const restoreVol = state.volume > 0 ? state.volume : 0.5;
        selectors.volumeRange!.value = String(restoreVol);
        selectors.audio.volume = restoreVol;
        setMuted(false);
      } else {
        state.volume = currentVol;
        selectors.volumeRange!.value = "0";
        selectors.audio.volume = 0;
        setMuted(true);
      }
    });
  }
  if (selectors.volumeRange && selectors.audio) {
    const initialVol = parseFloat(selectors.volumeRange.value || "1");
    selectors.audio.volume = initialVol;
    state.volume = initialVol;
    selectors.volumeRange.addEventListener("input", (ev) => {
      const value = parseFloat((ev.target as HTMLInputElement).value);
      selectors.audio.volume = value;
      if (value === 0) {
        setMuted(true);
      } else {
        state.volume = value;
        if (state.isMuted) {
          setMuted(false);
        }
      }
    });
  }
  handleAudioEvents();
}
