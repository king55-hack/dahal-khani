// Visual effects drawn in their own layer above the game (so re-rendering the table never cuts
// them off): cards flying out when dealing, and speech bubbles for reactions.
import { dealOrder, type Seat } from '../engine';
import { coinHtml } from './coin';

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

/**
 * Coins jump out of `from` and fly in an arc to the element `to` (the coin counter in the header).
 * `onArrive` runs once for every coin that lands. With animations off they all "land" at once.
 */
export function flyCoins(from: DOMRect, to: Element | null, n: number, animate: boolean, onArrive: () => void) {
  const end = to?.getBoundingClientRect();
  if (!animate || !end || typeof Element.prototype.animate !== 'function') {
    for (let i = 0; i < n; i++) onArrive();
    return;
  }
  const sx = from.left + from.width / 2;
  const sy = from.top + from.height / 2;
  const ex = end.left + end.width / 2;
  const ey = end.top + end.height / 2;
  for (let i = 0; i < n; i++) {
    const el = document.createElement('i');
    el.className = 'fly-coin';
    el.innerHTML = coinHtml();
    el.style.left = `${sx}px`;
    el.style.top = `${sy}px`;
    document.body.appendChild(el);
    const spread = (Math.random() * 2 - 1) * 70;
    const dx = ex - sx;
    const dy = ey - sy;
    const anim = el.animate(
      [
        { transform: 'translate(0, 0) scale(.5) rotateY(0deg)', opacity: 0 },
        { transform: `translate(${spread}px, -50px) scale(1.1) rotateY(360deg)`, opacity: 1, offset: 0.25 },
        { transform: `translate(${dx * 0.6 + spread * 0.4}px, ${dy * 0.5 - 40}px) scale(1) rotateY(720deg)`, opacity: 1, offset: 0.65 },
        { transform: `translate(${dx}px, ${dy}px) scale(.55) rotateY(1080deg)`, opacity: 0.9 },
      ],
      { duration: 850, delay: i * 90, easing: 'cubic-bezier(.4,.1,.3,1)', fill: 'both' },
    );
    anim.onfinish = () => {
      el.remove();
      onArrive();
    };
  }
}

export function clearFx() {
  layer.replaceChildren();
}
