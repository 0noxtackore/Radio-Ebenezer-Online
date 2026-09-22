import { selectors } from "../utils/dom";
import { EVENTS } from "../config/constants";
import type { NotificationEvent } from "../types";
import { buildDayLabel, formatCountdown } from "../utils/date";
import { searchEventVideo, type YouTubeResult } from "../utils/youtube";

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

function buildYouTubeThumb(result: YouTubeResult): string {
  const label = result.isChannelFallback
    ? "Ver canal en YouTube"
    : "Ver en YouTube";
  return `
    <a href="${result.videoUrl}" target="_blank" rel="noopener noreferrer" class="notification-youtube">
      <img src="${result.thumbnailUrl}" alt="${label}" class="notification-youtube-thumb" />
      <span class="notification-youtube-label">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
          <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445"/>
        </svg>
        ${label}
      </span>
    </a>
  `;
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
  let isFirst = true;

  events.forEach((ev, index) => {
    const extraClass = index === 0 ? "" : "calendar-notification--history";
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
        <div class="notification-youtube-slot" data-event-title="${ev.title}" data-index="${index}"></div>
      </div>
    `;

    if (isFirst) {
      isFirst = false;
      searchEventVideo(ev.title).then((result) => {
        const slot = selectors.calendarNotification?.querySelector(
          `.notification-youtube-slot[data-index="0"]`
        );
        if (slot) {
          slot.innerHTML = buildYouTubeThumb(result);
        }
      });
    }
  });

  html += "</div>";

  selectors.calendarNotification.className = "";
  selectors.calendarNotification.innerHTML = html;
}
