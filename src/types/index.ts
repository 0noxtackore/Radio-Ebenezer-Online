export interface ScheduleEvent {
  id: string;
  title: string;
  day: number | number[] | "daily";
  startHour: number;
  startMin: number;
  endHour?: number;
  endMin?: number;
  color: string;
  label: string;
}

export interface AppState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  serverDown: boolean;
}

export interface NotificationEvent {
  title: string;
  date: Date;
  timeLabel: string;
}

export interface Selectors {
  screens: Record<string, HTMLElement | null>;
  bottomNavItems: NodeListOf<HTMLButtonElement>;
  desktopNavItems: NodeListOf<HTMLButtonElement> | null;
  loader: HTMLElement | null;
  audio: HTMLAudioElement;
  playToggle: HTMLButtonElement;
  playIcon: SVGSVGElement | null;
  statusText: HTMLElement;
  statusDot: HTMLElement;
  discInner: HTMLElement | null;
  tonearm: HTMLElement | null;
  logoCircle: HTMLElement | null;
  offlineOverlay: HTMLElement | null;
  serverOverlay: HTMLElement | null;
  volumeButton: HTMLButtonElement | null;
  volumeIcon: SVGSVGElement | null;
  volumeRange: HTMLInputElement | null;
  calendarContainer: HTMLElement | null;
  calendarNotification: HTMLElement | null;
}
