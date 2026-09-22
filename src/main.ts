import "./styles/main.css";
import { selectors } from "./utils/dom";
import { initNavigation } from "./components/navigation";
import { initPlayer, attemptAutoplay } from "./components/player";
import { renderCalendar } from "./components/calendar";
import { updateDateNotification } from "./components/notifications";
import { setupNetworkMonitoring } from "./components/network";
import { initDiscArtwork } from "./components/disc";
import {
  renderGamificationProfile,
  setGamificationContainer,
  handleCalendarDayClick,
} from "./components/gamification";

function init(): void {
  initNavigation();
  initPlayer();

  initDiscArtwork();

  const gamificationContainer = document.getElementById("gamification-profile");
  setGamificationContainer(gamificationContainer);
  renderGamificationProfile();

  renderCalendar();
  setupCalendarClicks();

  updateDateNotification();
  setInterval(updateDateNotification, 1000);

  setupNetworkMonitoring();

  attemptAutoplay();

  if (selectors.loader) {
    setTimeout(() => {
      selectors.loader!.classList.add("app-loader--hidden");
    }, 700);
  }
}

function setupCalendarClicks(): void {
  const calendarContainer = document.getElementById("schedule-calendar");
  if (!calendarContainer) return;

  calendarContainer.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const dayEl = target.closest(".calendar-day");
    if (!dayEl) return;

    const titleAttr = dayEl.getAttribute("title");
    if (!titleAttr) return;

    const match = titleAttr.match(/^(\d+)\s+(\w+)\s+(\d{4})/);
    if (!match) return;

    const day = parseInt(match[1], 10);
    const monthNames = [
      "Enero","Febrero","Marzo","Abril","Mayo","Junio",
      "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
    ];
    const month = monthNames.indexOf(match[2]);
    const year = parseInt(match[3], 10);

    if (month >= 0) {
      handleCalendarDayClick(day, month, year);
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
