import { selectors } from "../utils/dom";
import { state } from "../state/app-state";
import {
  ICON_VOLUME_ON_PATH_MAIN,
  ICON_VOLUME_ON_PATH_WAVE,
  ICON_VOLUME_MUTE_PATH,
} from "../config/constants";

export function updateVolumeIcon(): void {
  if (!selectors.volumeIcon) return;
  const paths = selectors.volumeIcon.querySelectorAll("path");
  if (state.isMuted) {
    if (paths[0]) {
      paths[0].setAttribute("d", ICON_VOLUME_MUTE_PATH);
      if (paths[1]) {
        selectors.volumeIcon.removeChild(paths[1]);
      }
    }
  } else {
    if (!paths.length) return;
    paths[0].setAttribute("d", ICON_VOLUME_ON_PATH_MAIN);
    if (!paths[1]) {
      const wavePath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      wavePath.setAttribute("d", ICON_VOLUME_ON_PATH_WAVE);
      wavePath.setAttribute("stroke", "currentColor");
      wavePath.setAttribute("stroke-width", "1");
      wavePath.setAttribute("fill", "none");
      wavePath.setAttribute("stroke-linecap", "round");
      selectors.volumeIcon.appendChild(wavePath);
    } else {
      paths[1].setAttribute("d", ICON_VOLUME_ON_PATH_WAVE);
      paths[1].setAttribute("stroke", "currentColor");
      paths[1].setAttribute("stroke-width", "1");
      paths[1].setAttribute("fill", "none");
      paths[1].setAttribute("stroke-linecap", "round");
    }
  }
}
