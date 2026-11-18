import { selectors } from "../utils/dom";

let lastOpenedCard: HTMLElement | null = null;

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
