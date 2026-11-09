// The look of a playing card's face: a rank and suit in two corners, and a proper layout in the middle
// (the pips of a 2–10 laid out like on a real card, a big pip on the Ace, a framed letter on J / Q / K).
// Suits are small SVG shapes (defined once in index.html) so they look the same on every phone —
// the ♥ ♦ text symbols turn into coloured emoji on some devices.
import { rankLabel, type Rank, type Suit } from '../engine';

const L = 0, C = 0.5, R = 1;
const SIX: [number, number][] = [[L, 0], [R, 0], [L, 0.5], [R, 0.5], [L, 1], [R, 1]];
const EIGHT: [number, number][] = [[L, 0], [R, 0], [L, 1 / 3], [R, 1 / 3], [L, 2 / 3], [R, 2 / 3], [L, 1], [R, 1]];
/** Where the pips go (x across, y down, both 0–1 inside the pip area), as on a real deck. */
const PIPS: Partial<Record<Rank, [number, number][]>> = {
  2: [[C, 0], [C, 1]],
  3: [[C, 0], [C, 0.5], [C, 1]],
  4: [[L, 0], [R, 0], [L, 1], [R, 1]],
  5: [[L, 0], [R, 0], [C, 0.5], [L, 1], [R, 1]],
  6: SIX,
  7: [...SIX, [C, 0.25]],
  8: [...SIX, [C, 0.25], [C, 0.75]],
  9: [...EIGHT, [C, 0.5]],
  10: [...EIGHT, [C, 1 / 6], [C, 5 / 6]],
};

const suit = (s: Suit, cls = '') => `<svg class="s ${cls}" viewBox="0 0 24 24" aria-hidden="true"><use href="#s-${s}"/></svg>`;

/** Everything inside a card's box, for a face-up card. */
export function cardFaceHtml(rank: Rank, s: Suit): string {
  const r = rankLabel(rank);
  const index = `<b>${r}</b>${suit(s)}`;
  let middle: string;
  if (rank === 14) middle = `<span class="pips">${suit(s, 'pip ace')}</span>`;
  else if (rank >= 11) {
    middle = `<span class="royal"><span class="royal-s">${suit(s)}</span><i>${r}</i><span class="royal-s flip">${suit(s)}</span></span>`;
  } else {
    const pips = (PIPS[rank] ?? [])
      .map(([x, y]) => `<svg class="s pip ${y > 0.5 ? 'flip' : ''}" viewBox="0 0 24 24" style="left:${x * 100}%;top:${y * 100}%" aria-hidden="true"><use href="#s-${s}"/></svg>`)
      .join('');
    middle = `<span class="pips">${pips}</span>`;
  }
  return `<span class="idx">${index}</span><span class="idx br">${index}</span>${middle}`;
}
