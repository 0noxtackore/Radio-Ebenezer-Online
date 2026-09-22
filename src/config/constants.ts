import type { ScheduleEvent } from "../types";

export const STREAM_URL = import.meta.env.VITE_STREAM_URL;

export const YOUTUBE_CHANNEL_HANDLE = import.meta.env.VITE_YOUTUBE_CHANNEL_HANDLE;
export const YOUTUBE_CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;
export const YOUTUBE_CHANNEL_URL = `https://www.youtube.com/${YOUTUBE_CHANNEL_HANDLE}`;
export const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
export const YOUTUBE_CHANNEL_BANNER = "https://yt3.googleusercontent.com/pvzEJPe6v_8w58wJdeV6R8bsPtxKcjL9zcnQ7iwQK2hxjZXdfU2ZnUeUczygDiwcjY9FbWjcYQ=w1060-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj";

export const ICON_PLAY_PATH =
  "m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393";

export const ICON_PAUSE_PATH =
  "M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5";

export const ICON_VOLUME_ON_PATH_MAIN =
  "M9 4.5a.5.5 0 0 0-.812-.39L6.825 5.5H4.5A.5.5 0 0 0 4 6v4a.5.5 0 0 0 .5.5h2.325l1.363 1.39A.5.5 0 0 0 9 11.5z";

export const ICON_VOLUME_ON_PATH_WAVE =
  "M11.5 5.5a3.5 3.5 0 0 1 0 5";

export const ICON_VOLUME_MUTE_PATH =
  "M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06m7.137 2.096a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0";

export const DISC_IMAGES = ["/img/eagle.jpeg"];

export const EVENTS: ScheduleEvent[] = [
  {
    id: "culto",
    title: "Culto en vivo",
    day: 0,
    startHour: 9,
    startMin: 0,
    color: "#ff4d4d",
    label: "9:00 AM",
  },
  {
    id: "oracion",
    title: "Culto de oración",
    day: [1, 2, 3, 4, 5],
    startHour: 15,
    startMin: 0,
    color: "#4da6ff",
    label: "3:00 PM",
  },
  {
    id: "predicacion",
    title: "Predicación especial",
    day: "daily",
    startHour: 18,
    startMin: 0,
    color: "#b366ff",
    label: "6:00 PM",
  },
  {
    id: "jovenes",
    title: "Clase de Jovenes",
    day: 6,
    startHour: 9,
    startMin: 30,
    endHour: 12,
    endMin: 0,
    color: "#00e676",
    label: "9:30 AM - 12:00 PM",
  },
];
