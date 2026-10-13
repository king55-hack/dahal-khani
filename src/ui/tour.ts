// First-run guide: highlights each part of the screen with a short explanation.
// Text lives in i18n.ts (tour.*); this file only knows the order and what to point at.
import type { Strings } from './i18n';

export type TourStepId =
  | 'welcome'
  | 'hand'
  | 'score'
  | 'trump'
  | 'coins'
  | 'online'
  | 'chat'
  | 'info'
  | 'settings'
  | 'done';

interface Step {
  id: TourStepId;
  /** element to highlight; when missing (e.g. 💬 only exists online) the card is shown in the middle */
  target?: string;
  /** small picture shown in the card when there is nothing to point at */
  art?: string;
}

export const TOUR: readonly Step[] = [
  { id: 'welcome', art: '♠ ♥ ♣ ♦' },
  { id: 'hand', target: '.hand' },
  { id: 'score', target: '.panels' },
  { id: 'trump', target: '.trump-badge' },
  { id: 'coins', target: '.coin-chip' },
  { id: 'online', target: '[data-action=online]' },
  { id: 'chat', target: '.say-btn', art: '💬 👍 😂 😢 🙌' },
  { id: 'info', target: '[data-action=info]' },
  { id: 'settings', target: '[data-action=settings]' },
  { id: 'done', art: '🎉' },
];

/** Builds the spotlight + explanation card for one step, positioned next to its target. */
export function tourHtml(t: Strings, index: number): string {
  const step = TOUR[index];
  const text = t.tour[step.id];
  const el = step.target ? document.querySelector(step.target) : null;
  const r = el?.getBoundingClientRect();
  const visible = r && r.width > 0 && r.height > 0;
  const vw = innerWidth;
  const vh = innerHeight;
  const cardW = Math.min(330, vw - 24);

  let spot = '';
  let cardStyle = `left:${(vw - cardW) / 2}px;top:50%;transform:translateY(-50%);width:${cardW}px`;
  if (visible) {
    const pad = 6;
    spot = `<div class="tour-spot" style="left:${r.left - pad}px;top:${r.top - pad}px;width:${r.width + pad * 2}px;height:${r.height + pad * 2}px"></div>`;
    const left = Math.min(Math.max(12, r.left + r.width / 2 - cardW / 2), vw - cardW - 12);
    const below = r.top + r.height / 2 < vh / 2;
    cardStyle = below
      ? `left:${left}px;top:${Math.min(r.bottom + 14, vh - 120)}px;width:${cardW}px`
      : `left:${left}px;bottom:${Math.min(vh - r.top + 14, vh - 120)}px;width:${cardW}px`;
  }
  const dots = TOUR.map((_, i) => `<i class="${i === index ? 'on' : ''}"></i>`).join('');
  const last = index === TOUR.length - 1;
  return `<div class="tour ${visible ? '' : 'no-target'}" role="dialog" aria-modal="true" aria-label="${text.title}">
    ${spot}
    <div class="tour-card" style="${cardStyle}">
      ${!visible && step.art ? `<div class="tour-art">${step.art}</div>` : ''}
      <h3>${text.title}</h3>
      <p>${text.body}</p>
      <div class="tour-dots">${dots}</div>
      <div class="tour-actions">
        ${last ? '' : `<button class="link" data-tour="skip">${t.tourSkip}</button>`}
        <span class="spacer"></span>
        ${index > 0 && !last ? `<button class="ghost" data-tour="back">${t.tourBack}</button>` : ''}
        <button class="primary" data-tour="${last ? 'finish' : 'next'}">${last ? t.tourStart : t.tourNext}</button>
      </div>
    </div>
  </div>`;
}
