export interface Attendance {
  date: string; // YYYY-MM-DD (fecha LOCAL, no UTC)
  eventId: string;
  timestamp: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isSvg?: boolean;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface GamificationState {
  points: number;
  currentStreak: number;
  bestStreak: number;
  totalAttendances: number;
  attendanceDates: string[];
  records: Attendance[];
  achievements: Achievement[];
  lastAttendanceDate: string | null;
}

const STORAGE_KEY = "ebenezer_gamification";

// --- Recompensas (ajustadas para que sea facil ganar puntos) ---
const POINTS_PER_ATTENDANCE = 10;
const POINTS_PER_STREAK_DAY = 2; // extra por cada dia de racha
const POINTS_MULTI_EVENT_DAY = 15; //.asistir a 2+ eventos el mismo dia
const STREAK_MILESTONES: Record<number, number> = {
  3: 20,
  7: 50,
  14: 100,
  30: 200,
};

const STREAK_ICONS = {
  fire: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  trophy: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`,
  crown: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a.5.5 0 0 1-.956.734H5.81a.5.5 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/></svg>`,
};

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: "first_step", title: "Primer Paso", description: "Asistio a su primer evento", icon: "\uD83C\uDFAF", unlocked: false },
  { id: "faithful_5", title: "Fiel Seguidor", description: "Asistio a 5 eventos", icon: "\u2B50", unlocked: false },
  { id: "faithful_10", title: "Devoto", description: "Asistio a 10 eventos", icon: "\uD83C\uDF1F", unlocked: false },
  { id: "faithful_25", title: "Inquebrantable", description: "Asistio a 25 eventos", icon: "\uD83D\uDCAA", unlocked: false },
  { id: "streak_3", title: "Constancia", description: "Racha de 3 dias consecutivos", icon: STREAK_ICONS.fire, isSvg: true, unlocked: false },
  { id: "streak_7", title: "Semana Perfecta", description: "Racha de 7 dias consecutivos", icon: STREAK_ICONS.trophy, isSvg: true, unlocked: false },
  { id: "streak_14", title: "Imparable", description: "Racha de 14 dias consecutivos", icon: STREAK_ICONS.crown, isSvg: true, unlocked: false },
  { id: "sunday_warrior", title: "Guerrero del Domingo", description: "Asistio a 4 domingos consecutivos", icon: "\u26EA", unlocked: false },
  { id: "night_owl", title: "Noctambulo", description: "Asistio a 3 eventos nocturnos", icon: "\uD83C\uDF19", unlocked: false },
  { id: "early_bird", title: "Madrugador", description: "Asistio a 3 eventos de la manana", icon: "\uD83C\uDF05", unlocked: false },
];

// --- Utilidades de fecha LOCAL (fix del bug de UTC) ---
export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function keyToDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function emptyState(): GamificationState {
  return {
    points: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalAttendances: 0,
    attendanceDates: [],
    records: [],
    achievements: DEFAULT_ACHIEVEMENTS.map((a) => ({ ...a })),
    lastAttendanceDate: null,
  };
}

// Migra estados antiguos (sin `records`) para no perder progreso
function migrate(stored: Partial<GamificationState>): GamificationState {
  const base = emptyState();
  const state: GamificationState = {
    ...base,
    ...stored,
    achievements: stored.achievements?.length
      ? stored.achievements
      : base.achievements,
    attendanceDates: stored.attendanceDates ?? [],
    records: stored.records ?? [],
  };

  if (!stored.records && state.attendanceDates.length) {
    state.records = state.attendanceDates.map((date) => ({
      date,
      eventId: "migrated",
      timestamp: Date.now(),
    }));
  }
  return state;
}

export function loadGamificationState(): GamificationState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrate(JSON.parse(raw) as Partial<GamificationState>);
  } catch (_) {
    /* empty */
  }
  return emptyState();
}

export function saveGamificationState(state: GamificationState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_) {
    /* empty */
  }
}

export function getPointsForLevel(points: number): { level: number; name: string; current: number; needed: number } {
  const levels = [
    { level: 1, name: "Miembro", min: 0 },
    { level: 2, name: "Activo", min: 30 },
    { level: 3, name: "Dedicado", min: 80 },
    { level: 4, name: "Fiel", min: 150 },
    { level: 5, name: "Lider", min: 250 },
  ];

  let currentLevel = levels[0];
  let nextLevel = levels[1];

  for (let i = levels.length - 1; i >= 0; i--) {
    if (points >= levels[i].min) {
      currentLevel = levels[i];
      nextLevel = levels[i + 1] || levels[i];
      break;
    }
  }

  return {
    level: currentLevel.level,
    name: currentLevel.name,
    current: points - currentLevel.min,
    needed: nextLevel.min - currentLevel.min,
  };
}

// Racha real: cuenta dias consecutivos hacia atras desde hoy (o ayer)
export function computeStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const set = new Set(dates);
  const now = new Date();
  let cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!set.has(localDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(localDateKey(cursor))) return 0;
  }
  let streak = 0;
  while (set.has(localDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// Domingos consecutivos asistidos
function computeSundayStreak(dates: string[]): number {
  const set = new Set(dates);
  const now = new Date();
  let cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  cursor.setDate(cursor.getDate() - cursor.getDay());
  if (!set.has(localDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 7);
    if (!set.has(localDateKey(cursor))) return 0;
  }
  let streak = 0;
  while (set.has(localDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

function refreshAchievements(state: GamificationState): void {
  const nightCount = state.records.filter((r) => {
    const h = new Date(r.timestamp).getHours();
    return h >= 18 || h < 5;
  }).length;
  const morningCount = state.records.filter((r) => {
    const h = new Date(r.timestamp).getHours();
    return h >= 5 && h < 12;
  }).length;
  const sundayStreak = computeSundayStreak(state.attendanceDates);

  const conditions: Record<string, boolean> = {
    first_step: state.totalAttendances >= 1,
    faithful_5: state.totalAttendances >= 5,
    faithful_10: state.totalAttendances >= 10,
    faithful_25: state.totalAttendances >= 25,
    streak_3: state.currentStreak >= 3,
    streak_7: state.currentStreak >= 7,
    streak_14: state.currentStreak >= 14,
    sunday_warrior: sundayStreak >= 4,
    night_owl: nightCount >= 3,
    early_bird: morningCount >= 3,
  };

  state.achievements.forEach((ach) => {
    if (ach.unlocked) return;
    if (conditions[ach.id]) {
      ach.unlocked = true;
      ach.unlockedAt = Date.now();
    }
  });
}

export function markAttendance(eventId: string, when?: Date): GamificationState {
  const state = loadGamificationState();
  const whenDate = when ?? new Date();
  const dateStr = localDateKey(whenDate);

  // Un registro por (dia, evento): se puede asistir a varios eventos el mismo dia
  const already = state.records.some(
    (r) => r.date === dateStr && r.eventId === eventId
  );
  if (already) return state;

  const eventsThatDay = state.records.filter((r) => r.date === dateStr).length;
  const isMultiEvent = eventsThatDay >= 1;

  state.records.push({ date: dateStr, eventId, timestamp: whenDate.getTime() });
  state.totalAttendances++;
  state.points += POINTS_PER_ATTENDANCE;

  if (!state.attendanceDates.includes(dateStr)) {
    state.attendanceDates.push(dateStr);
    state.attendanceDates.sort();
  }
  state.lastAttendanceDate = dateStr;

  // Racha recalculada desde el historial (fix del bug)
  state.currentStreak = computeStreak(state.attendanceDates);
  if (state.currentStreak > state.bestStreak) {
    state.bestStreak = state.currentStreak;
  }

  // Bonos: racha + hito + varios eventos el mismo dia
  state.points += state.currentStreak * POINTS_PER_STREAK_DAY;
  const milestone = STREAK_MILESTONES[state.currentStreak];
  if (milestone) state.points += milestone;
  if (isMultiEvent) state.points += POINTS_MULTI_EVENT_DAY;

  refreshAchievements(state);

  saveGamificationState(state);
  return state;
}

export function getAchievements(): Achievement[] {
  return loadGamificationState().achievements;
}

export function getGamificationSummary() {
  const state = loadGamificationState();
  return {
    ...state,
    levelInfo: getPointsForLevel(state.points),
    unlockedAchievements: state.achievements.filter((a) => a.unlocked).length,
    totalAchievements: state.achievements.length,
  };
}