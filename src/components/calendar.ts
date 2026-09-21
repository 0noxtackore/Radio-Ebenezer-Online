import { selectors } from "../utils/dom";
import { EVENTS } from "../config/constants";
import { MONTH_NAMES, DOW_LABELS } from "../utils/date";
import { loadGamificationState } from "../state/gamification";

const EVENT_ICONS: Record<string, string> = {
  culto: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16m0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15"/></svg>`,
  oracion: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 -960 960 960"><path d="M620-320v-109l-45-81q-7 5-11 13t-4 17v229L663-80h-93l-90-148v-252q0-31 15-57t41-43l-56-99q-20-38-17.5-80.5T495-832l68-68 276 324 41 496h-80l-39-464-203-238-6 6q-10 10-11.5 23t4.5 25l155 278v130h-80Zm-360 0v-130l155-278q6-12 4.5-25T408-776l-6-6-203 238-39 464H80l41-496 276-324 68 68q30 30 32.5 72.5T480-679l-56 99q26 17 41 43t15 57v252L390-80h-93l103-171v-229q0-9-4-17t-11-13l-45 81v109h-80Z"/></svg>`,
  predicacion: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 -960 960 960"><path d="m138-80-57-57 97-97q-29-29-43.5-66T120-377q0-41 15-77t43-64l57-56 28 28q5-32 19-61t37-52l57-56 28 28q5-32 19.5-61t37.5-52l114-113 56 56-56 57q23 23 37 52t19 61l193-193 56 57-192 193q32 5 61 19t52 37l56-57 57 57-112 113q-23 24-53 38.5T687-403l28 27-56 56q-23 23-52.5 37.5T545-263l29 28-57 57q-29 29-65.5 43.5T375-120q-34 0-68.5-14.5T236-179l-98 99Zm97-212q17-17 26-38.5t9-45.5q0-23-9-45.5T235-461q-17 17-26.5 39.5T199-376q0 24 9.5 45.5T235-292Zm141 93q24-1 46-10t39-26q-17-17-39.5-26t-45.5-9q-23 0-45.5 9.5T291-234q17 17 39 26t46 9Zm0-234q17-17 26-39t9-45q0-24-9-46t-26-39q-17 17-26.5 39t-9.5 46q0 23 9.5 45t26.5 39Zm142 93q24 0 45.5-9.5T602-376q-17-17-38.5-26t-45.5-9q-24 0-46 9.5T433-375q17 17 39 26t46 9Zm0-234q17-17 25.5-39t8.5-46q0-23-8.5-45.5T518-744q-17 17-26.5 39.5T482-659q0 24 9.5 46t26.5 39Zm141 92q23 0 45.5-9.5T744-518q-18-17-40.5-26t-45.5-9q-23 1-45 10t-39 26q17 17 39.5 26.5T659-482Z"/></svg>`,
  jovenes: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 -960 960 960"><path d="m422-232 207-248H469l29-227-185 267h139l-30 208ZM320-80l40-280H160l360-520h80l-40 320h240L400-80h-80Zm151-390Z"/></svg>`,
};

export function renderCalendar(): void {
  if (!selectors.calendarContainer) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDate = now.getDate();
  const currentWeekDay = now.getDay();
  const currentHour = now.getHours();

  const firstDay = new Date(year, month, 1);
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayDateOnly = new Date(year, month, todayDate);
  let nextCultoDate = new Date(todayDateOnly);

  if (currentWeekDay === 0 && currentHour < 9) {
    // nextCultoDate ya es hoy
  } else {
    const daysUntilNextSunday =
      currentWeekDay === 0 ? 7 : 7 - currentWeekDay;
    nextCultoDate.setDate(todayDateOnly.getDate() + daysUntilNextSunday);
  }

  const gamification = loadGamificationState();

  let html = "";
  html += '<div class="calendar-header">';
  html += `<div class="calendar-month">${MONTH_NAMES[month]} ${year}</div>`;
  html += "</div>";

  html += '<div class="calendar-grid">';
  DOW_LABELS.forEach((label) => {
    html += `<div class="calendar-dow">${label}</div>`;
  });

  for (let i = 0; i < startOffset; i++) {
    html += '<div class="calendar-day--empty"></div>';
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const weekDay = date.getDay();

    const isToday = day === todayDate;
    const isPast = day < todayDate;
    const isNextCultoDay =
      date.toDateString() === nextCultoDate.toDateString();

    const dateStr = date.toISOString().split("T")[0];
    const isAttended = gamification.attendanceDates.includes(dateStr);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    const isCurrentWeekSunday = weekDay === 0 && date >= startOfWeek && date <= endOfWeek;
    const isCurrentWeekDay = date >= startOfWeek && date <= endOfWeek && weekDay !== 0;

    const dots: string[] = [];
    const labels: string[] = [];

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

    const dayClasses = ["calendar-day"];
    if (isToday) dayClasses.push("calendar-day--today");
    if (isPast) dayClasses.push("calendar-day--past");
    if (dots.length) dayClasses.push("calendar-day--with-events");
    if (isNextCultoDay) dayClasses.push("calendar-day--next-culto");
    if (isAttended) dayClasses.push("calendar-day--attended");
    if (isCurrentWeekSunday) dayClasses.push("calendar-day--sunday-marked");
    if (isCurrentWeekDay) dayClasses.push("calendar-day--current-week");

    const titleText = labels.length
      ? `${day} ${MONTH_NAMES[month]} ${year}: ${labels.join(" · ")}`
      : `${day} ${MONTH_NAMES[month]} ${year}`;

    const displayLabel = isPast ? "X" : String(day);

    html += `<div class="${dayClasses.join(" ")}" title="${titleText}">`;
    html += `<span>${displayLabel}</span>`;
    html += '<div class="calendar-icon-row">';
    dots.forEach((type) => {
      html += `<span class="calendar-icon calendar-icon--${type}">${EVENT_ICONS[type]}</span>`;
    });
    html += "</div>";
    if (isAttended) {
      html += '<span class="calendar-check">✓</span>';
    }
    html += "</div>";
  }

  html += "</div>";

  selectors.calendarContainer.innerHTML = html;
}
