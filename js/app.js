// Radio Ebenezer 94.7 FM
// -----------------------
// Main logic for the mobile web app.
// - Controls the streaming player.
// - Handles navigation between screens (Home, Search, Favorites).
// - Manages a simple in-memory favorites list.
// - Implements a sample search (mock) to illustrate the UI.
// IMPORTANT: replace this URL with the real streaming URL
// provided by the station server.
// Common format example: "https://yourserver.com/stream".
const STREAM_URL = "https://usa8.fastcast4u.com/proxy/ramonsky?mp=/1&rel=0&autoplay=1";

// SVG paths for play and pause icons (Bootstrap Icons)
const ICON_PLAY_PATH =
  "m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393";
const ICON_PAUSE_PATH =
  "M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5";

// SVG paths for volume icons (on / mute)
const ICON_VOLUME_ON_PATH_MAIN =
  "M9 4.5a.5.5 0 0 0-.812-.39L6.825 5.5H4.5A.5.5 0 0 0 4 6v4a.5.5 0 0 0 .5.5h2.325l1.363 1.39A.5.5 0 0 0 9 11.5z";
const ICON_VOLUME_ON_PATH_WAVE =
  "M11.5 5.5a3.5 3.5 0 0 1 0 5";
const ICON_VOLUME_MUTE_PATH =
  "M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06m7.137 2.096a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0";

// Fixed image for the disc
const DISC_IMAGES = ["../img/eagle.jpeg"];

// -----------------------
// DOM element selection
// -----------------------

const selectors = {
  screens: {
    home: document.getElementById("screen-home"),
    search: document.getElementById("screen-search"),
    notifications: document.getElementById("screen-notifications"),
  },
  bottomNavItems: document.querySelectorAll(".bottom-nav-item"),
  desktopNavItems: document.querySelectorAll(".desktop-nav-item"),
  loader: document.getElementById("app-loader"),
  audio: document.getElementById("radio-audio"),
  playToggle: document.getElementById("btn-play-toggle"),
  playIcon: document.getElementById("play-icon"),
  statusText: document.getElementById("player-status-text"),
  statusDot: document.getElementById("player-status-dot"),
  discInner: document.getElementById("cover-disc-inner"),
  tonearm: document.querySelector(".turntable-arm"),
  logoCircle: document.querySelector(".logo-circle"),
  offlineOverlay: document.getElementById("offline-overlay"),
  serverOverlay: document.getElementById("server-overlay"),
  volumeButton: document.getElementById("btn-volume"),
  volumeIcon: document.getElementById("volume-icon"),
  volumeRange: document.getElementById("volume-range"),
  searchInput: document.getElementById("search-input"),
  searchResults: document.getElementById("search-results"),
  calendarContainer: document.getElementById("schedule-calendar"),
  calendarNotification: document.getElementById("calendar-notification"),
  upcomingList: document.getElementById("upcoming-list"),
};

// -----------------------
// Simple app state
// -----------------------

const state = {
  isPlaying: false,
  upcomingTracks: [],
  isMuted: false,
  volume: 0.5, // Last non-zero volume
  serverDown: false,
};

// -----------------------
// Schedule events (centralized)
// -----------------------

const EVENTS = [
  {
    id: "culto",
    title: "Culto en vivo",
    day: 0, // 0=Sunday
    startHour: 9,
    startMin: 0,
    color: "#ff4d4d",
    label: "9:00 AM",
  },
  {
    id: "oracion",
    title: "Culto de oración",
    day: [1, 2, 3, 4, 5], // Mon-Fri
    startHour: 15,
    startMin: 0,
    color: "#4da6ff",
    label: "3:00 PM",
  },
  {
    id: "predicacion",
    title: "Predicación especial",
    day: "daily",
    startHour: 18,
    startMin: 0,
    color: "#b366ff",
    label: "6:00 PM",
  },
  {
    id: "jovenes",
    title: "Clase de Jovenes 1",
    day: 6, // 6=Saturday
    startHour: 9,
    startMin: 30,
    endHour: 12,
    endMin: 0,
    color: "#00e676",
    label: "9:30 AM - 12:00 PM",
  },
];

// -----------------------
// Player utilities
// -----------------------

// Verifies a streaming URL exists and assigns it to the <audio>.
// Adds a timestamp parameter to avoid cache and reduce initial buffering.
function ensureStreamUrl(forceRefresh = false) {
  if (!STREAM_URL) {
    selectors.statusText.textContent =
      "Configura la URL de streaming en app.js (const STREAM_URL).";
    selectors.statusDot.classList.remove("status-dot--playing");
    return false;
  }

  // Refresh SRC on playback start to get the live edge instantly
  if (!selectors.audio.src || forceRefresh) {
    const separator = STREAM_URL.includes("?") ? "&" : "?";
    selectors.audio.src = `${STREAM_URL}${separator}cb=${Date.now()}`;
    selectors.audio.load(); // Forced load to minimize latency
  }

  return true;
}

// Updates the UI based on whether the radio is playing.
function setPlayingUI(playing) {
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
// Toggles between playing and pausing the radio.
function togglePlayback() {
  if (state.isPlaying) {
    selectors.audio.pause();
    // Clear src on pause to avoid keeping an open connection
    // and ensure a fresh connection on the next play.
    selectors.audio.removeAttribute("src");
    selectors.audio.load();
    setPlayingUI(false);
    // Remember that the user stopped playback manually
    try {
      localStorage.setItem("ebenezer_autoplay", "0");
    } catch (_) { }
  } else {
    selectors.statusText.textContent = "Conectando...";
    // Force URL refresh for latency < 1s
    if (!ensureStreamUrl(true)) return;

    selectors.audio
      .play()
      .then(() => {
        setPlayingUI(true);
        // If the user pressed play manually and audio was muted
        // due to silent autoplay, unmute now.
        if (state.isMuted || selectors.audio.muted) {
          setMuted(false);
        }
        // Remember that the user wants autoplay after a refresh
        try {
          localStorage.setItem("ebenezer_autoplay", "1");
        } catch (_) { }
      })
      .catch((error) => {
        console.error("Error al reproducir la radio", error);
        // First, keep the UI in a "not playing" state...
        setPlayingUI(false);
        // ...then show a clear message that autoplay is blocked
        selectors.statusText.textContent =
          "El navegador bloqueó el autoplay. Toca el botón de reproducción.";
        try {
          localStorage.setItem("ebenezer_autoplay", "0");
        } catch (_) { }
      });
  }
}

// Subscribe to <audio> events to improve user feedback.
function handleAudioEvents() {
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

// -----------------------
// Smart autoplay & unlock
// -----------------------

function attemptAutoplay() {
  if (!ensureStreamUrl()) return;

  // 1. Attempt to play with sound
  const playPromise = selectors.audio.play();

  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        // Autoplay with sound succeeded
        console.log("Autoplay con sonido exitoso.");
        setPlayingUI(true);
        // Mark that we want future autoplay
        try { localStorage.setItem("ebenezer_autoplay", "1"); } catch (_) { }
      })
      .catch((error) => {
        console.warn("Autoplay with sound blocked. Trying muted autoplay...", error);

        // 2. Fallback: attempt muted playback after a short delay
        setTimeout(() => {
          setMuted(true);
          selectors.audio.play()
            .then(() => {
              console.log("Muted autoplay succeeded.");
              setPlayingUI(true);
              selectors.statusText.textContent = "Reproduciendo en silencio. Toca la pantalla para activar el sonido.";
              setupInteractionUnlock();
            })
            .catch((mutedError) => {
              console.error("Autoplay fully blocked", mutedError);
              setPlayingUI(false);
              selectors.statusText.textContent = "Toca la pantalla para escuchar.";
              setupInteractionUnlock();
            });
        }, 150);
      });
  }
}

function setupInteractionUnlock() {
  const unlockEvents = ["click", "touchstart", "keydown"];

  const unlockHandler = () => {
    // If currently playing and muted, unmute
    if (!selectors.audio.paused && (state.isMuted || selectors.audio.muted)) {
      setMuted(false);
      // Restore volume if it was 0
      if (selectors.audio.volume === 0) {
        selectors.audio.volume = 1;
        if (selectors.volumeRange) selectors.volumeRange.value = "1";
      }
      console.log("Audio unlocked by user interaction.");
      selectors.statusText.textContent = "Reproduciendo en vivo";
    }
    // If NOT playing (full block), attempt playback
    else if (selectors.audio.paused) {
      setMuted(false);
      selectors.audio.volume = 1;
      if (selectors.volumeRange) selectors.volumeRange.value = "1";

      selectors.audio.play()
        .then(() => {
          setPlayingUI(true);
          selectors.statusText.textContent = "Reproduciendo en vivo";
        })
        .catch(e => console.error("Error al iniciar por interacción", e));
    }

    // Remover listeners para que no se ejecute más veces innecesariamente
    unlockEvents.forEach(evt => document.removeEventListener(evt, unlockHandler));
  };

  unlockEvents.forEach(evt => document.addEventListener(evt, unlockHandler, { once: true }));
}


// -----------------------
// Navegación entre pantallas
// -----------------------

function switchScreen(targetKey) {
  // Muestra solo la pantalla objetivo
  Object.entries(selectors.screens).forEach(([key, el]) => {
    el.classList.toggle("screen--active", key === targetKey);
  });

  // Actualiza el estado visual de la barra inferior
  selectors.bottomNavItems.forEach((btn) => {
    const isTarget = btn.dataset.target === targetKey;
    btn.classList.toggle("bottom-nav-item--active", isTarget);
  });

  // Actualiza el estado visual de la navegación de escritorio
  if (selectors.desktopNavItems) {
    selectors.desktopNavItems.forEach((btn) => {
      const isTarget = btn.dataset.target === targetKey;
      btn.classList.toggle("desktop-nav-item--active", isTarget);
    });
  }
}

// -----------------------
// Volumen (mute/unmute + slider)
// -----------------------

function updateVolumeIcon() {
  if (!selectors.volumeIcon) return;
  const paths = selectors.volumeIcon.querySelectorAll("path");
  if (state.isMuted) {
    // Icono mute: un solo path
    if (paths[0]) {
      paths[0].setAttribute("d", ICON_VOLUME_MUTE_PATH);
      if (paths[1]) {
        selectors.volumeIcon.removeChild(paths[1]);
      }
    }
  } else {
    // Icono volumen: restaurar cuerpo y onda
    if (!paths.length) return;
    paths[0].setAttribute("d", ICON_VOLUME_ON_PATH_MAIN);
    if (!paths[1]) {
      const wavePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      wavePath.setAttribute("d", ICON_VOLUME_ON_PATH_WAVE);
      wavePath.setAttribute("stroke", "currentColor");
      wavePath.setAttribute("stroke-width", "1");
      wavePath.setAttribute("fill", "none");
      wavePath.setAttribute("stroke-linecap", "round");
      selectors.volumeIcon.appendChild(wavePath);
    } else {
      paths[1].setAttribute("d", ICON_VOLUME_ON_PATH_WAVE);
      paths[1].setAttribute("stroke", "currentColor");
      paths[1].setAttribute("stroke-width", "1");
      paths[1].setAttribute("fill", "none");
      paths[1].setAttribute("stroke-linecap", "round");
    }
  }
}

function setMuted(muted) {
  if (!selectors.audio) return;
  state.isMuted = muted;
  selectors.audio.muted = muted;
  updateVolumeIcon();
  if (selectors.volumeButton) {
    selectors.volumeButton.classList.toggle("icon-button--muted", muted);
  }
}

function toggleMute() {
  setMuted(!state.isMuted);
}

function renderUpcoming() {
  if (!selectors.upcomingList) return;

  if (!state.upcomingTracks.length) {
    selectors.upcomingList.innerHTML =
      "<p>No hay próximas reproducciones programadas.</p>";
    return;
  }

  selectors.upcomingList.innerHTML = state.upcomingTracks
    .map(
      (track) => `
        <article class="playlist-card">
          <div
            class="playlist-cover"
            style="background-image:url('${track.coverUrl}'); background-size:cover; background-position:center;"
          ></div>
          <h3>${track.title}</h3>
          <p>${track.artist}</p>
        </article>
      `,
    )
    .join("");
}

// -----------------------
// Próximas reproducciones desde API real
// -----------------------

async function fetchUpcomingFromApi() {
  if (!selectors.upcomingList) return;

  try {
    const res = await fetch(
      "https://api.instant.audio/data/playlist/14/ebenezer",
      { cache: "no-cache" },
    );

    const data = await res.json();
    const list = data && Array.isArray(data.result) ? data.result : [];

    if (!list.length) {
      state.upcomingTracks = [];
      renderUpcoming();
      return;
    }

    const fallbackCover =
      "../img/eagle.jpeg";

    // El primer elemento suele ser el tema actual; usamos los siguientes como "próximas".
    // Aquí tomamos hasta 10 elementos siguientes para mostrar más historial.
    state.upcomingTracks = list.slice(1, 11).map((item) => ({
      title: item.track_title || "Sin título",
      artist: item.track_artist || "Unknown",
      coverUrl: item.track_image || fallbackCover,
    }));

    renderUpcoming();
  } catch (error) {
    console.error("Error al obtener la playlist desde la API", error);
    state.upcomingTracks = [];
    if (selectors.upcomingList) {
      selectors.upcomingList.innerHTML =
        "<p>No se pudo cargar la playlist desde la API.</p>";
    }
  }
}

// -----------------------
// Búsqueda mock (de ejemplo)
// -----------------------

function setupSearchMock() {
  if (!selectors.searchInput) return;

  const mockResults = [
    "Alabanza de la Mañana",
    "Noches de Adoración",
    "Palabra Viva",
    "Juventud Ebenezer",
    "Tiempo de Oración",
  ];

  selectors.searchInput.addEventListener("input", (ev) => {
    const query = ev.target.value.trim().toLowerCase();

    if (!query) {
      selectors.searchResults.className = "search-results search-results--empty";
      selectors.searchResults.innerHTML =
        "<p>Escribe para encontrar programas sugeridos (mock de ejemplo).</p>";
      return;
    }

    const filtered = mockResults.filter((item) =>
      item.toLowerCase().includes(query),
    );

    if (!filtered.length) {
      selectors.searchResults.className = "search-results";
      selectors.searchResults.innerHTML = "<p>Sin resultados.</p>";
      return;
    }

    selectors.searchResults.className = "search-results";
    selectors.searchResults.innerHTML = filtered
      .map(
        (name) => `
          <article class="playlist-card">
            <div class="playlist-cover playlist-cover--gradient-3"></div>
            <h3>${name}</h3>
            <p>Programa de ejemplo para la búsqueda.</p>
          </article>
        `,
      )
      .join("");
  });
}

// -----------------------
// Monitoreo de Red
// -----------------------

function setupNetworkMonitoring() {
  const showOfflineOverlay = () => {
    if (selectors.offlineOverlay) {
      selectors.offlineOverlay.hidden = false;
    }
    selectors.statusText.textContent = "Sin conexión";
    selectors.statusDot.classList.remove("status-dot--playing");
  };

  const hideOfflineOverlay = () => {
    if (selectors.offlineOverlay) {
      selectors.offlineOverlay.hidden = true;
    }
  };

  // 1. Detectar cuando vuelve el internet tras caerse
  window.addEventListener("online", () => {
    console.log("Internet restablecido. Reanudando la app...");
    hideOfflineOverlay();
    if (state.isPlaying || localStorage.getItem("ebenezer_autoplay") === "1") {
      togglePlayback();
    }
  });

  window.addEventListener("offline", () => {
    console.warn("Sin conexión. Mostrando alerta.");
    showOfflineOverlay();
    if (!selectors.audio.paused) {
      selectors.audio.pause();
    }
  });

  // 2. Monitorear cambios en la calidad de la conexión (si el navegador lo soporta)
  // Nota: compatible principalmente con navegadores basados en Chromium (Chrome/Edge/Android)
  if (navigator.connection) {
    navigator.connection.addEventListener("change", () => {
      const { effectiveType } = navigator.connection;
      console.log(`Calidad de red detectada: ${effectiveType}`);

      // Si la calidad baja a niveles muy bajos, reiniciamos para intentar reconectar
      if (effectiveType === "2g" || effectiveType === "slow-2g") {
        console.warn("Calidad de internet muy baja.");
      }
    });

    // También verificamos el estado inicial
    if (navigator.connection.effectiveType === "slow-2g") {
      console.warn("Iniciando con conexión lenta.");
    }
  }

  if (!navigator.onLine) {
    showOfflineOverlay();
  }
}

// -----------------------
// Inicialización
// -----------------------

function initNavigation() {
  selectors.bottomNavItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      switchScreen(btn.dataset.target);
    });
  });

  if (selectors.desktopNavItems) {
    selectors.desktopNavItems.forEach((btn) => {
      btn.addEventListener("click", () => {
        switchScreen(btn.dataset.target);
      });
    });
  }

  // Al hacer clic en el banner de culto, ir directamente al calendario
  if (selectors.cultBanner) {
    selectors.cultBanner.addEventListener("click", () => {
      switchScreen("search");
    });
  }
}

function initPlayer() {
  selectors.playToggle.addEventListener("click", togglePlayback);
  if (selectors.volumeButton && selectors.volumeRange && selectors.audio) {
    selectors.volumeButton.addEventListener("click", () => {
      const currentVol = parseFloat(selectors.volumeRange.value || "0");

      if (currentVol === 0 || state.isMuted) {
        // Restaurar al último volumen guardado
        const restoreVol = state.volume > 0 ? state.volume : 0.5;
        selectors.volumeRange.value = String(restoreVol);
        selectors.audio.volume = restoreVol;
        setMuted(false);
      } else {
        // Guardar el volumen actual y mutear
        state.volume = currentVol;
        selectors.volumeRange.value = "0";
        selectors.audio.volume = 0;
        setMuted(true);
      }
    });
  }
  if (selectors.volumeRange && selectors.audio) {
    // valor inicial
    const initialVol = parseFloat(selectors.volumeRange.value || "1");
    selectors.audio.volume = initialVol;
    state.volume = initialVol;
    selectors.volumeRange.addEventListener("input", (ev) => {
      const value = parseFloat(ev.target.value);
      selectors.audio.volume = value;
      if (value === 0) {
        setMuted(true);
      } else {
        state.volume = value; // recordar último volumen distinto de 0
        if (state.isMuted) {
          setMuted(false);
        }
      }
    });
  }
  handleAudioEvents();
}

// -----------------------
// Calendario mensual con eventos fijos
// -----------------------

function renderCalendar() {
  if (!selectors.calendarContainer) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const dows = ["L", "M", "X", "J", "V", "S", "D"]; // lunes primero

  const firstDay = new Date(year, month, 1);
  // getDay(): 0=domingo...6=sábado. Lo convertimos a 0=lunes...
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6; // si era domingo

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDate = now.getDate();

  // Calcular la fecha específica del PRÓXIMO culto en vivo (domingo 9:00 AM)
  const currentWeekDay = now.getDay(); // 0=domingo..6=sábado
  const currentHour = now.getHours();

  const todayDateOnly = new Date(year, month, todayDate);
  let nextCultoDate = new Date(todayDateOnly);

  if (currentWeekDay === 0 && currentHour < 9) {
    // Hoy es domingo antes del culto -> el culto es hoy
    // nextCultoDate ya es hoy
  } else {
    // Buscar el próximo domingo a partir de mañana
    // Si hoy es domingo pero ya pasó la hora del culto, saltamos al siguiente domingo (+7)
    const daysUntilNextSunday = currentWeekDay === 0 ? 7 : (7 - currentWeekDay);
    nextCultoDate.setDate(todayDateOnly.getDate() + daysUntilNextSunday);
  }

  let html = "";
  html += '<div class="calendar-header">';
  html += `<div class="calendar-month">${monthNames[month]} ${year}</div>`;
  html += "</div>";

  html += '<div class="calendar-grid">';
  // Cabecera días de la semana
  dows.forEach((label) => {
    html += `<div class="calendar-dow">${label}</div>`;
  });

  // Celdas vacías antes del día 1
  for (let i = 0; i < startOffset; i++) {
    html += '<div class="calendar-day--empty"></div>';
  }

  // Días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const weekDay = date.getDay(); // 0=domingo..6=sábado

    const isToday = day === todayDate;
    const isPast = day < todayDate;
    const isNextCultoDay = date.toDateString() === nextCultoDate.toDateString();

    const dots = [];
    const labels = [];

    EVENTS.forEach((ev) => {
      const matches =
        ev.day === "daily" ||
        ev.day === weekDay ||
        (Array.isArray(ev.day) && ev.day.includes(weekDay));
      if (matches) {
        dots.push(ev.id);
        labels.push(`${ev.title} · ${ev.label}`);
      }
    });

    const dayClasses = ["calendar-day"]; // base
    if (isToday) dayClasses.push("calendar-day--today");
    if (isPast) dayClasses.push("calendar-day--past");
    if (dots.length) dayClasses.push("calendar-day--with-events");
    if (isNextCultoDay) dayClasses.push("calendar-day--next-culto");

    const titleText = labels.length
      ? `${day} ${monthNames[month]} ${year}: ${labels.join(" · ")}`
      : `${day} ${monthNames[month]} ${year}`;

    const displayLabel = isPast ? "X" : String(day);

    html += `<div class="${dayClasses.join(" ")}" title="${titleText}">`;
    html += `<span>${displayLabel}</span>`;
    html += '<div class="calendar-dot-row">';
    dots.forEach((type) => {
      html += `<span class="calendar-dot calendar-dot--${type}"></span>`;
    });
    html += "</div>";
    html += "</div>";
  }

  html += "</div>"; // .calendar-grid

  selectors.calendarContainer.innerHTML = html;
}

// -----------------------
// Notificación de fecha centrada (pequeña)
// -----------------------

function updateDateNotification() {
  if (!selectors.calendarNotification) return;

  const now = new Date();
  const weekDay = now.getDay();

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const weekNames = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];

  const events = [];

  const buildDayLabel = (dayIndex) => weekNames[(dayIndex + 7) % 7];

  const formatCountdown = (ms) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const getNextOccurrence = (ev) => {
    if (ev.day === "daily") {
      const target = new Date(now);
      target.setHours(ev.startHour, ev.startMin, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      return target;
    }
    const targetDays = Array.isArray(ev.day) ? ev.day : [ev.day];
    let best = null;
    targetDays.forEach((targetDay) => {
      const target = new Date(now);
      target.setHours(ev.startHour, ev.startMin, 0, 0);
      let diff = (targetDay - now.getDay() + 7) % 7;
      if (diff === 0 && target <= now) diff = 7;
      target.setDate(now.getDate() + diff);
      if (!best || target < best) best = target;
    });
    return best;
  };

  EVENTS.forEach((ev) => {
    const date = getNextOccurrence(ev);
    if (date) {
      events.push({ title: ev.title, date, timeLabel: ev.label });
    }
  });

  events.sort((a, b) => a.date - b.date);

  selectors.calendarNotification.style.display = "block";

  let html = '<div class="notification-history-container">';

  events.forEach((ev, index) => {
    const isMain = index === 0;
    const extraClass = isMain ? "" : "calendar-notification--history";
    const dayLabel = buildDayLabel(ev.date.getDay()).toLowerCase();
    const countdown = formatCountdown(ev.date.getTime() - now.getTime());
    const body = `${ev.title} del día ${dayLabel} · ${ev.timeLabel} · ${countdown}`;

    html += `
      <div class="calendar-notification ${extraClass}">
        <div class="calendar-notification-header">
           <img src="img/logo.png" alt="" class="notification-logo" />
           <div class="calendar-notification-title">${ev.title}</div>
        </div>
        <div class="calendar-notification-body">${body}</div>
      </div>
    `;
  });

  html += "</div>";

  // Reemplazar TODO el contenido del contenedor padre (que ya tenía clase .calendar-notification, ojo)
  // IMPORTANTE: El HTML original tenía <div id="calendar-notification" class="calendar-notification">
  // Al inyectar divs con clase .calendar-notification DENTRO, duplicamos estilos.
  // Solución: Quitamos la clase del padre en JS o ajustamos el CSS.
  // Mejor: Usamos el padre solo como wrapper.

  selectors.calendarNotification.className = ""; // Limpiar clase del container padre para evitar doble estilo
  selectors.calendarNotification.innerHTML = html;
}


function initDiscArtwork() {
  if (!selectors.discInner || !Array.isArray(DISC_IMAGES) || !DISC_IMAGES.length)
    return;

  const randomUrl =
    DISC_IMAGES[Math.floor(Math.random() * DISC_IMAGES.length)];

  // Solo aplicar la imagen encima del degradado existente
  selectors.discInner.style.backgroundImage = `
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2), transparent 55%),
    radial-gradient(circle at 70% 80%, rgba(0, 0, 0, 0.35), transparent 60%),
    url('${randomUrl}')
  `;
  selectors.discInner.style.backgroundSize = "cover";
  selectors.discInner.style.backgroundPosition = "center";
}

function init() {
  initNavigation();
  initPlayer();
  setupSearchMock();
  fetchUpcomingFromApi();

  initDiscArtwork();

  // Calendario
  renderCalendar();

  // Notificación de fecha (se actualiza continuamente) en la sección de avisos
  updateDateNotification();
  setInterval(updateDateNotification, 1000);

  // Monitoreo de internet
  setupNetworkMonitoring();

  // Intentar autoplay inteligente
  attemptAutoplay();

  // Ocultar pantalla de carga tras iniciar la app
  if (selectors.loader) {
    setTimeout(() => {
      selectors.loader.classList.add("app-loader--hidden");
    }, 700);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
