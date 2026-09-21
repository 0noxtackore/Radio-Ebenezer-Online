import { selectors } from "../utils/dom";
import { DISC_IMAGES } from "../config/constants";

export function initDiscArtwork(): void {
  if (
    !selectors.discInner ||
    !Array.isArray(DISC_IMAGES) ||
    !DISC_IMAGES.length
  )
    return;

  const randomUrl =
    DISC_IMAGES[Math.floor(Math.random() * DISC_IMAGES.length)];

  selectors.discInner.style.backgroundImage = `
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2), transparent 55%),
    radial-gradient(circle at 70% 80%, rgba(0, 0, 0, 0.35), transparent 60%),
    url('${randomUrl}')
  `;
  selectors.discInner.style.backgroundSize = "cover";
  selectors.discInner.style.backgroundPosition = "center";
}
