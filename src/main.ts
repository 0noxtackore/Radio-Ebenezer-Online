import "./styles/main.css";
import { selectors } from "./utils/dom";
import { initNavigation } from "./components/navigation";
import { initPlayer, attemptAutoplay } from "./components/player";
import { renderCalendar } from "./components/calendar";
import { updateDateNotification } from "./components/notifications";
import { setupNetworkMonitoring } from "./components/network";
import { initDiscArtwork } from "./components/disc";
import { initTestimonios } from "./components/testimonios";

function init(): void {
  initTestimonios();
  initNavigation();
  initPlayer();

  initDiscArtwork();

  renderCalendar();

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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
