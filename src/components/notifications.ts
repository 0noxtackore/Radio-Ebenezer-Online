import { selectors } from "../utils/dom";
import { EVENTS } from "../config/constants";
import type { NotificationEvent } from "../types";
import { buildDayLabel, formatCountdown } from "../utils/date";

function getNextOccurrence(ev: (typeof EVENTS)[0]): Date | null {
  const now = new Date();

  if (ev.day === "daily") {
    const target = new Date(now);
    target.setHours(ev.startHour, ev.startMin, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    return target;
  }

  const targetDays = Array.isArray(ev.day) ? ev.day : [ev.day];
  let best: Date | null = null;
  targetDays.forEach((targetDay) => {
    const target = new Date(now);
    target.setHours(ev.startHour, ev.startMin, 0, 0);
    let diff = (targetDay - now.getDay() + 7) % 7;
    if (diff === 0 && target <= now) diff = 7;
    target.setDate(now.getDate() + diff);
    if (!best || target < best) best = target;
  });
  return best;
}

export function updateDateNotification(): void {
  if (!selectors.calendarNotification) return;

  const now = new Date();
  const events: NotificationEvent[] = [];

  EVENTS.forEach((ev) => {
    const date = getNextOccurrence(ev);
    if (date) {
      events.push({ title: ev.title, date, timeLabel: ev.label });
    }
  });

  events.sort((a, b) => a.date.getTime() - b.date.getTime());

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
           <img src="/img/logo.png" alt="" class="notification-logo" />
           <div class="calendar-notification-title">${ev.title}</div>
        </div>
        <div class="calendar-notification-body">${body}</div>
      </div>
    `;
  });

  html += "</div>";

  selectors.calendarNotification.className = "";
  selectors.calendarNotification.innerHTML = html;
}
