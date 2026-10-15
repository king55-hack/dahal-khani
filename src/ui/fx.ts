// Visual effects drawn in their own layer above the game (so re-rendering the table never cuts
// them off): cards flying out when dealing, and speech bubbles for reactions.
import { dealOrder, type Seat } from '../engine';

const layer = document.createElement('div');
layer.className = 'fx-layer';
document.body.appendChild(layer);

/** Screen position of a (local) seat: 0 = my hand at the bottom, 1 right, 2 top, 3 left. */
function seatCenter(seat: Seat): { x: number; y: number } | null {
  const sel = seat === 0 ? '.hand' : seat === 1 ? '.seat-right' : seat === 2 ? '.seat-top' : '.seat-left';
  const el = document.querySelector(sel);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/**
 * Cards fly from the dealer to each player in deal order, `perPlayer` cards each.
 * Returns how long the animation takes, in ms.
 */
export function dealCards(dealer: Seat, perPlayer: number): number {
  const from = seatCenter(dealer) ?? { x: innerWidth / 2, y: innerHeight / 2 };
  const order = dealOrder(dealer);
  const stagger = perPlayer > 5 ? 22 : 34;
  const fly = 360;
  let i = 0;
  for (let round = 0; round < perPlayer; round++) {
    for (const seat of order) {
      const to = seatCenter(seat);
      if (!to) continue;
      const card = document.createElement('i');
      card.className = 'fx-card back';
      card.style.left = `${from.x}px`;
      card.style.top = `${from.y}px`;
      card.style.setProperty('--dx', `${to.x - from.x + (Math.random() * 16 - 8)}px`);
      card.style.setProperty('--dy', `${to.y - from.y + (Math.random() * 10 - 5)}px`);
      card.style.setProperty('--rot', `${Math.random() * 40 - 20}deg`);
      card.style.animationDelay = `${i * stagger}ms`;
      card.style.animationDuration = `${fly}ms`;
      layer.appendChild(card);
      card.addEventListener('animationend', () => card.remove());
      i++;
    }
  }
  return i * stagger + fly;
}

/** A speech bubble above a seat for a few seconds: who said it (in their team colour), then what. */
export function bubble(seat: Seat, who: string, text: string, big: boolean, team: 0 | 1) {
  const at = seatCenter(seat);
  if (!at) return;
  layer.querySelector(`.fx-bubble[data-seat="${seat}"]`)?.remove(); // one bubble per player
  const b = document.createElement('div');
  b.className = `fx-bubble seat-${seat}${big ? ' big' : ''}`;
  b.dataset.seat = String(seat);
  const name = document.createElement('span');
  name.className = `bubble-who team${team}`;
  name.textContent = who; // plain text: player names are never parsed as HTML
  const said = document.createElement('span');
  said.className = 'bubble-text';
  said.textContent = text;
  b.append(name, said);
  b.style.left = `${at.x}px`;
  b.style.top = `${at.y}px`;
  layer.appendChild(b);
  window.setTimeout(() => b.remove(), 3200);
}

export function clearFx() {
  layer.replaceChildren();
}
