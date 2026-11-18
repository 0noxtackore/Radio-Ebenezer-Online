import { selectors } from "../utils/dom";

let lastOpenedCard: HTMLElement | null = null;

interface TestimonioVerse {
  text: string;
  ref: string;
}

const TESTIMONIO_VERSES: TestimonioVerse[] = [
  {
    text: "Y ellos le han vencido por medio de la sangre del Cordero y de la palabra del testimonio que tenían.",
    ref: "Apocalipsis 12:11",
  },
  {
    text: "Venid, oíd, todos los que de Dios teméis; contaré lo que ha hecho a mi alma.",
    ref: "Salmo 66:16",
  },
  {
    text: "Grandes cosas ha hecho Jehová con nosotros; estaremos alegres.",
    ref: "Salmo 126:3",
  },
  {
    text: "Te alabaré, oh Jehová, con todo mi corazón; contaré todas tus maravillas.",
    ref: "Salmo 9:1",
  },
  {
    text: "Este es el testimonio: que Dios nos ha dado vida eterna; y esta vida está en su Hijo.",
    ref: "1 Juan 5:11",
  },
  {
    text: "Estad siempre preparados para presentar defensa con mansedumbre y reverencia ante todo el que os demande razón de la esperanza que hay en vosotros.",
    ref: "1 Pedro 3:15",
  },
  {
    text: "Lo que hemos visto y oído, eso os anunciamos, para que también vosotros tengáis comunión con nosotros.",
    ref: "1 Juan 1:3",
  },
  {
    text: "Porque no me avergüenzo del evangelio, porque es poder de Dios para salvación a todo aquel que cree.",
    ref: "Romanos 1:16",
  },
];

let lastVerseIndex = -1;

export function refreshTestimonioVerse(): void {
  const el = document.getElementById("testimonios-verse");
  if (!el) return;

  let index = Math.floor(Math.random() * TESTIMONIO_VERSES.length);
  if (TESTIMONIO_VERSES.length > 1 && index === lastVerseIndex) {
    index = (index + 1) % TESTIMONIO_VERSES.length;
  }
  lastVerseIndex = index;
  const verse = TESTIMONIO_VERSES[index];

  el.textContent = "";
  const text = document.createElement("span");
  text.className = "testimonios-verse-text";
  text.textContent = `\u201C${verse.text}\u201D`;
  const ref = document.createElement("span");
  ref.className = "testimonios-verse-ref";
  ref.textContent = verse.ref;
  el.append(text, ref);
}

export function getTestimonioModal(): HTMLElement | null {
  return document.getElementById("testimonio-modal");
}

export function openTestimonioFromCard(card: HTMLElement): void {
  const modal = document.getElementById("testimonio-modal");
  const titleEl = modal?.querySelector<HTMLElement>("#testimonio-modal-title");
  const modalImg = modal?.querySelector<HTMLImageElement>("#testimonio-modal-img");
  if (!modal || !titleEl) return;

  const title = card.querySelector<HTMLElement>(".testimonio-card-name");
  const img = card.querySelector<HTMLImageElement>(".testimonio-card-img");
  if (title) titleEl.textContent = title.textContent ?? "";
  if (img && modalImg) modalImg.src = img.src;

  lastOpenedCard = card;
  modal.hidden = false;
  document.body.classList.add("testimonio-modal-open");
  const btn = card.querySelector<HTMLElement>(".testimonio-toggle");
  if (btn) btn.setAttribute("aria-expanded", "true");
}

export function closeTestimonio(): void {
  const modal = document.getElementById("testimonio-modal");
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove("testimonio-modal-open");
  const card = lastOpenedCard;
  const btn = card?.querySelector<HTMLElement>(".testimonio-toggle");
  if (btn) btn.setAttribute("aria-expanded", "false");
  lastOpenedCard = null;
}

export function initTestimonios(): void {
  refreshTestimonioVerse();

  // Click handler para imagen fullscreen en galería de testimonios
  document.querySelectorAll<HTMLElement>(".testimonios-images img").forEach((img) => {
    img.addEventListener("click", (e) => {
      e.stopPropagation();
      openTestimonioFullscreen(img);
    });
  });

  document.querySelectorAll<HTMLElement>(".testimonios-images").forEach((container) => {
    container.addEventListener("contextmenu", (e) => e.preventDefault());
    container.addEventListener("dragstart", (e) => e.preventDefault());
  });

  const modal = document.getElementById("testimonio-modal");
  const closeBtn = document.getElementById("testimonio-modal-close");
  if (!modal || !closeBtn) return;

  modal.querySelector<HTMLElement>(".testimonio-modal-overlay")?.addEventListener("click", closeTestimonio);
  closeBtn.addEventListener("click", closeTestimonio);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeTestimonio();
  });

  document.querySelectorAll<HTMLElement>(".testimonio-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest<HTMLElement>(".testimonio-card");
      if (card) openTestimonioFromCard(card);
    });
  });
}

export function openTestimonioFullscreen(img: HTMLImageElement): void {
  const modal = document.getElementById("testimonio-modal");
  if (!modal) return;

  // Poblar el modal con la imagen clickeada
  const modalImg = modal.querySelector<HTMLElement>("#testimonio-modal-img");
  if (modalImg) {
    modalImg.src = img.src;
    modalImg.alt = img.alt;
  }

  // Activar modo galería (solo imagen, sin título/autor)
  modal.classList.add("testimonio-modal--galeria");

  // Mostrar el modal
  modal.hidden = false;
  document.body.classList.add("testimonio-modal-open");
}

// Mantener la función existente para compatibilidad
export function openTestimonioFromCard(card: HTMLElement): void {
  const modal = document.getElementById("testimonio-modal");
  const titleEl = modal?.querySelector<HTMLElement>("#testimonio-modal-title");
  if (!modal || !titleEl) return;

  const title = card.querySelector<HTMLElement>(".testimonio-card-name");
  const img = card.querySelector<HTMLImageElement>(".testimonio-card-img");
  if (title) titleEl.textContent = title.textContent ?? "";
  if (img && modal.querySelector<HTMLElement>("#testimonio-modal-img")) {
    ;// modal.querySelector<HTMLElement>("#testimonio-modal-img").src = img.src;
  }

  lastOpenedCard = card;
  modal.hidden = false;
  document.body.classList.add("testimonio-modal-open");
  const btn = card.querySelector<HTMLElement>(".testimonio-toggle");
  if (btn) btn.setAttribute("aria-expanded", "true");
}
