import { getGamificationSummary, markAttendance } from "../state/gamification";
import { EVENTS } from "../config/constants";

const STAT_ICONS = {
  streak: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  trophy: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`,
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>`,
  star: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
};

let container: HTMLElement | null = null;
let onAttendanceCallback: (() => void) | null = null;

export function setGamificationContainer(el: HTMLElement | null): void {
  container = el;
}

export function onAttendanceUpdate(callback: () => void): void {
  onAttendanceCallback = callback;
}

export function renderGamificationProfile(): void {
  if (!container) return;

  const summary = getGamificationSummary();
  const levelPercent = summary.levelInfo.needed > 0
    ? Math.round((summary.levelInfo.current / summary.levelInfo.needed) * 100)
    : 100;

  let html = `
    <div class="gamification-card">
      <div class="gamification-header">
        <div class="gamification-level">
          <div class="gamification-level-badge">${summary.levelInfo.level}</div>
          <div class="gamification-level-info">
            <span class="gamification-level-name">${summary.levelInfo.name}</span>
            <div class="gamification-level-bar">
              <div class="gamification-level-fill" style="width: ${levelPercent}%"></div>
            </div>
            <span class="gamification-level-progress">${summary.levelInfo.current} / ${summary.levelInfo.needed} pts</span>
          </div>
        </div>
        <div class="gamification-points">
          <span class="gamification-points-value">${summary.points}</span>
          <span class="gamification-points-label">puntos</span>
        </div>
      </div>

      <div class="gamification-stats">
        <div class="gamification-stat">
          <span class="gamification-stat-icon">${STAT_ICONS.streak}</span>
          <span class="gamification-stat-value">${summary.currentStreak}</span>
          <span class="gamification-stat-label">Racha</span>
        </div>
        <div class="gamification-stat">
          <span class="gamification-stat-icon">${STAT_ICONS.trophy}</span>
          <span class="gamification-stat-value">${summary.bestStreak}</span>
          <span class="gamification-stat-label">Mejor</span>
        </div>
        <div class="gamification-stat">
          <span class="gamification-stat-icon">${STAT_ICONS.calendar}</span>
          <span class="gamification-stat-value">${summary.totalAttendances}</span>
          <span class="gamification-stat-label">Asistencias</span>
        </div>
        <div class="gamification-stat">
          <span class="gamification-stat-icon">${STAT_ICONS.star}</span>
          <span class="gamification-stat-value">${summary.unlockedAchievements}/${summary.totalAchievements}</span>
          <span class="gamification-stat-label">Logros</span>
        </div>
      </div>

      <div class="gamification-achievements">
        <div class="gamification-achievements-title">Logros</div>
        <div class="gamification-achievements-grid">
  `;

  summary.achievements.forEach((ach) => {
    const unlockedClass = ach.unlocked ? "gamification-achievement--unlocked" : "gamification-achievement--locked";
    const iconContent = ach.isSvg
      ? `<span class="gamification-achievement-icon-svg">${ach.icon}</span>`
      : `<span class="gamification-achievement-icon">${ach.icon}</span>`;
    html += `
      <div class="gamification-achievement ${unlockedClass}" title="${ach.description}">
        ${iconContent}
        <span class="gamification-achievement-title">${ach.title}</span>
      </div>
    `;
  });

  html += `
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

export function handleCalendarDayClick(day: number, month: number, year: number): void {
  const now = new Date();
  const date = new Date(year, month, day);
  const weekDay = date.getDay();

  const hasEventToday = EVENTS.some((ev) => {
    if (ev.day === "daily") return true;
    if (ev.day === weekDay) return true;
    if (Array.isArray(ev.day) && ev.day.includes(weekDay)) return true;
    return false;
  });

  if (!hasEventToday) return;

  const dateStr = date.toISOString().split("T")[0];
  const todayStr = now.toISOString().split("T")[0];
  const isToday = dateStr === todayStr;
  const isPast = date < new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (isToday || isPast) {
    markAttendance(EVENTS[0].id);
    renderGamificationProfile();
    if (onAttendanceCallback) onAttendanceCallback();
  }
}
