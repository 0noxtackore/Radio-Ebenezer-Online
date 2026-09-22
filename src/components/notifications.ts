import { selectors } from "../utils/dom";
import { EVENTS } from "../config/constants";
import type { NotificationEvent } from "../types";
import { buildDayLabel, getCountdownBlocks } from "../utils/date";
import { searchEventVideo, type YouTubeResult } from "../utils/youtube";

const EVENT_ICONS: Record<string, string> = {
  culto: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16m0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15"/></svg>`,
  oracion: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 -960 960 960"><path d="M620-320v-109l-45-81q-7 5-11 13t-4 17v229L663-80h-93l-90-148v-252q0-31 15-57t41-43l-56-99q-20-38-17.5-80.5T495-832l68-68 276 324 41 496h-80l-39-464-203-238-6 6q-10 10-11.5 23t4.5 25l155 278v130h-80Zm-360 0v-130l155-278q6-12 4.5-25T408-776l-6-6-203 238-39 464H80l41-496 276-324 68 68q30 30 32.5 72.5T480-679l-56 99q26 17 41 43t15 57v252L390-80h-93l103-171v-229q0-9-4-17t-11-13l-45 81v109h-80Z"/></svg>`,
  predicacion: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 -960 960 960"><path d="m138-80-57-57 97-97q-29-29-43.5-66T120-377q0-41 15-77t43-64l57-56 28 28q5-32 19-61t37-52l57-56 28 28q5-32 19.5-61t37.5-52l114-113 56 56-56 57q23 23 37 52t19 61l193-193 56 57-192 193q32 5 61 19t52 37l56-57 57 57-112 113q-23 24-53 38.5T687-403l28 27-56 56q-23 23-52.5 37.5T545-263l29 28-57 57q-29 29-65.5 43.5T375-120q-34 0-68.5-14.5T236-179l-98 99Zm97-212q17-17 26-38.5t9-45.5q0-23-9-45.5T235-461q-17 17-26.5 39.5T199-376q0 24 9.5 45.5T235-292Zm141 93q24-1 46-10t39-26q-17-17-39.5-26t-45.5-9q-23 0-45.5 9.5T291-234q17 17 39 26t46 9Zm0-234q17-17 26-39t9-45q0-24-9-46t-26-39q-17 17-26.5 39t-9.5 46q0 23 9.5 45t26.5 39Zm142 93q24 0 45.5-9.5T602-376q-17-17-38.5-26t-45.5-9q-24 0-46 9.5T433-375q17 17 39 26t46 9Zm0-234q17-17 25.5-39t8.5-46q0-23-8.5-45.5T518-744q-17 17-26.5 39.5T482-659q0 24 9.5 46t26.5 39Zm141 92q23 0 45.5-9.5T744-518q-18-17-40.5-26t-45.5-9q-23 1-45 10t-39 26q17 17 39.5 26.5T659-482Z"/></svg>`,
  jovenes: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 -960 960 960"><path d="m422-232 207-248H469l29-227-185 267h139l-30 208ZM320-80l40-280H160l360-520h80l-40 320h240L400-80h-80Zm151-390Z"/></svg>`,
};

const EVENT_COLORS: Record<string, string> = {
  culto: "#ff4d4d",
  oracion: "#4da6ff",
  predicacion: "#b366ff",
  jovenes: "#00e676",
};

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

function buildBombTimer(ms: number): string {
  const b = getCountdownBlocks(ms);
  return `
    <div class="bomb-timer">
      <div class="bomb-timer-block">
        <span class="bomb-timer-digit">${b.days}</span>
        <span class="bomb-timer-label">Días</span>
      </div>
      <div class="bomb-timer-separator">:</div>
      <div class="bomb-timer-block">
        <span class="bomb-timer-digit">${b.hours}</span>
        <span class="bomb-timer-label">Horas</span>
      </div>
      <div class="bomb-timer-separator">:</div>
      <div class="bomb-timer-block">
        <span class="bomb-timer-digit">${b.minutes}</span>
        <span class="bomb-timer-label">Min</span>
      </div>
      <div class="bomb-timer-separator">:</div>
      <div class="bomb-timer-block">
        <span class="bomb-timer-digit">${b.seconds}</span>
        <span class="bomb-timer-label">Seg</span>
      </div>
    </div>
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
      const icon = EVENT_ICONS[ev.id] || "";

      html += `
        <div class="calendar-notification ${extraClass}" data-event-id="${ev.id}">
          <div class="calendar-notification-header">
             <span class="notification-event-icon" style="color:#ffd54a">${icon}</span>
             <div class="calendar-notification-title">${ev.title}</div>
          </div>
          <div class="calendar-notification-body">
            <span>${ev.title} del día ${dayLabel} · ${ev.label}</span>
          </div>
          <div class="notification-countdown-slot" data-countdown-slot>${buildBombTimer(date.getTime() - now.getTime())}</div>
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
        `[data-event-id="${ev.id}"] [data-countdown-slot]`
      );
      if (el) {
        el.innerHTML = buildBombTimer(date.getTime() - now.getTime());
      }
    });
  }
}
