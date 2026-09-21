export interface Attendance {
  date: string; // YYYY-MM-DD
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
  achievements: Achievement[];
  lastAttendanceDate: string | null;
}

const STORAGE_KEY = "ebenezer_gamification";

const STREAK_ICONS = {
  fire: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  trophy: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`,
  crown: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/></svg>`,
};

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: "first_step", title: "Primer Paso", description: "Asistió a su primer evento", icon: "🎯", unlocked: false },
  { id: "faithful_5", title: "Fiel Seguidor", description: "Asistió a 5 eventos", icon: "⭐", unlocked: false },
  { id: "faithful_10", title: "Devoto", description: "Asistió a 10 eventos", icon: "🌟", unlocked: false },
  { id: "faithful_25", title: "Inquebrantable", description: "Asistió a 25 eventos", icon: "💪", unlocked: false },
  { id: "streak_3", title: "Constancia", description: "Racha de 3 días consecutivos", icon: STREAK_ICONS.fire, isSvg: true, unlocked: false },
  { id: "streak_7", title: "Semana Perfecta", description: "Racha de 7 días consecutivos", icon: STREAK_ICONS.trophy, isSvg: true, unlocked: false },
  { id: "streak_14", title: "Imparable", description: "Racha de 14 días consecutivos", icon: STREAK_ICONS.crown, isSvg: true, unlocked: false },
  { id: "sunday_warrior", title: "Guerrero del Domingo", description: "Asistió a 4 domingos consecutivos", icon: "⛪", unlocked: false },
  { id: "night_owl", title: "Noctámbulo", description: "Asistió a 3 eventos nocturnos", icon: "🌙", unlocked: false },
  { id: "early_bird", title: "Madrugador", description: "Asistió a 3 eventos de la mañana", icon: "🌅", unlocked: false },
];

export function loadGamificationState(): GamificationState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (_) {
    /* empty */
  }
  return {
    points: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalAttendances: 0,
    attendanceDates: [],
    achievements: DEFAULT_ACHIEVEMENTS.map((a) => ({ ...a })),
    lastAttendanceDate: null,
  };
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
    { level: 2, name: "Activo", min: 50 },
    { level: 3, name: "Dedicado", min: 150 },
    { level: 4, name: "Fiel", min: 300 },
    { level: 5, name: "Líder", min: 500 },
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

  const progressInLevel = points - currentLevel.min;
  const neededForNext = nextLevel.min - currentLevel.min;

  return {
    level: currentLevel.level,
    name: currentLevel.name,
    current: progressInLevel,
    needed: neededForNext,
  };
}

export function markAttendance(eventId: string): GamificationState {
  const state = loadGamificationState();
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];

  const alreadyMarked = state.attendanceDates.includes(dateStr);
  if (alreadyMarked) return state;

  const POINTS_PER_ATTENDANCE = 10;
  const STREAK_BONUS_3 = 25;
  const STREAK_BONUS_7 = 50;

  state.totalAttendances++;
  state.attendanceDates.push(dateStr);
  state.lastAttendanceDate = dateStr;
  state.points += POINTS_PER_ATTENDANCE;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (state.lastAttendanceDate === yesterdayStr || state.currentStreak === 0) {
    state.currentStreak++;
  } else {
    state.currentStreak = 1;
  }

  if (state.currentStreak > state.bestStreak) {
    state.bestStreak = state.currentStreak;
  }

  if (state.currentStreak === 3) {
    state.points += STREAK_BONUS_3;
  }
  if (state.currentStreak === 7) {
    state.points += STREAK_BONUS_7;
  }

  state.achievements.forEach((ach) => {
    if (ach.unlocked) return;

    switch (ach.id) {
      case "first_step":
        if (state.totalAttendances >= 1) {
          ach.unlocked = true;
          ach.unlockedAt = Date.now();
        }
        break;
      case "faithful_5":
        if (state.totalAttendances >= 5) {
          ach.unlocked = true;
          ach.unlockedAt = Date.now();
        }
        break;
      case "faithful_10":
        if (state.totalAttendances >= 10) {
          ach.unlocked = true;
          ach.unlockedAt = Date.now();
        }
        break;
      case "faithful_25":
        if (state.totalAttendances >= 25) {
          ach.unlocked = true;
          ach.unlockedAt = Date.now();
        }
        break;
      case "streak_3":
        if (state.currentStreak >= 3) {
          ach.unlocked = true;
          ach.unlockedAt = Date.now();
        }
        break;
      case "streak_7":
        if (state.currentStreak >= 7) {
          ach.unlocked = true;
          ach.unlockedAt = Date.now();
        }
        break;
      case "streak_14":
        if (state.currentStreak >= 14) {
          ach.unlocked = true;
          ach.unlockedAt = Date.now();
        }
        break;
    }
  });

  saveGamificationState(state);
  return state;
}

export function getAchievements(): Achievement[] {
  const state = loadGamificationState();
  return state.achievements;
}

export function getGamificationSummary() {
  const state = loadGamificationState();
  const levelInfo = getPointsForLevel(state.points);
  const unlockedCount = state.achievements.filter((a) => a.unlocked).length;

  return {
    ...state,
    levelInfo,
    unlockedAchievements: unlockedCount,
    totalAchievements: state.achievements.length,
  };
}
