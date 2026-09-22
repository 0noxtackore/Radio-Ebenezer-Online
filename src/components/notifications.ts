import { selectors } from "../utils/dom";
import { EVENTS } from "../config/constants";
import type { NotificationEvent } from "../types";
import { buildDayLabel, formatCountdown } from "../utils/date";
import { searchEventVideo, type YouTubeResult } from "../utils/youtube";

const youtubeCache = new Map<string, YouTubeResult>();
let renderedOnce = false;

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
    : result.videoTitle || "Ver en YouTube";
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

function getSortedEvents(): { ev: (typeof EVENTS)[0]; date: Date }[] {
  const now = new Date();
  const result: { ev: (typeof EVENTS)[0]; date: Date }[] = [];

  EVENTS.forEach((ev) => {
    const date = getNextOccurrence(ev);
    if (date) result.push({ ev, date });
  });

  result.sort((a, b) => a.date.getTime() - b.date.getTime());
  return result;
}

export function updateDateNotification(): void {
  if (!selectors.calendarNotification) return;

  const now = new Date();
  const sorted = getSortedEvents();

  selectors.calendarNotification.style.display = "block";

  if (!renderedOnce) {
    renderedOnce = true;

    let html = '<div class="notification-history-container">';

    sorted.forEach(({ ev, date }, index) => {
      const extraClass = index === 0 ? "" : "calendar-notification--history";
      const dayLabel = buildDayLabel(date.getDay()).toLowerCase();
      const countdown = formatCountdown(date.getTime() - now.getTime());
      const body = `${ev.title} del día ${dayLabel} · ${ev.label} · ${countdown}`;

      html += `
        <div class="calendar-notification ${extraClass}" data-event-id="${ev.id}">
          <div class="calendar-notification-header">
             <img src="/img/logo.png" alt="" class="notification-logo" />
             <div class="calendar-notification-title">${ev.title}</div>
          </div>
          <div class="calendar-notification-body" data-countdown>${body}</div>
          <div class="notification-youtube-slot" data-index="${index}"></div>
        </div>
      `;
    });

    html += "</div>";

    selectors.calendarNotification.className = "";
    selectors.calendarNotification.innerHTML = html;

    const firstEv = sorted[0];
    if (firstEv) {
      const cacheKey = firstEv.ev.title;
      if (youtubeCache.has(cacheKey)) {
        const slot = selectors.calendarNotification.querySelector(
          `.notification-youtube-slot[data-index="0"]`
        );
        if (slot) slot.innerHTML = buildYouTubeThumb(youtubeCache.get(cacheKey)!);
      } else {
        searchEventVideo(firstEv.ev.title).then((result) => {
          youtubeCache.set(cacheKey, result);
          const slot = selectors.calendarNotification?.querySelector(
            `.notification-youtube-slot[data-index="0"]`
          );
          if (slot) slot.innerHTML = buildYouTubeThumb(result);
        });
      }
    }
  } else {
    sorted.forEach(({ ev, date }) => {
      const el = selectors.calendarNotification?.querySelector(
        `[data-event-id="${ev.id}"] .calendar-notification-body`
      );
      if (el) {
        const dayLabel = buildDayLabel(date.getDay()).toLowerCase();
        const countdown = formatCountdown(date.getTime() - now.getTime());
        el.textContent = `${ev.title} del día ${dayLabel} · ${ev.label} · ${countdown}`;
      }
    });
  }
}
