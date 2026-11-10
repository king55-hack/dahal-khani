// The coin: a gold coin made for the game, with the Nepali inscription "श्री रेशम लाल रिमाल" and "नेपाल २०८०".
// src/ui/textures/coin.webp (256 px) is used everywhere; coin-large.webp (768 px) is for big displays.

const small = new URL('./textures/coin.webp', import.meta.url).href;
export const coinLargeUrl = new URL('./textures/coin-large.webp', import.meta.url).href;

export const coinHtml = (cls = '') => `<img class="nc ${cls}" src="${small}" alt="" draggable="false" width="64" height="64">`;

/** Replace the 🪙 emoji in a text with the coin picture (the text must be shown as HTML). */
export const withCoin = (s: string) => s.replace(/🪙/g, coinHtml());

/** Shows the coin big on top of everything (tap anywhere or press Esc to close), so the writing on it can be read. */
export function showCoinZoom() {
  if (document.querySelector('.coin-lightbox')) return;
  const box = document.createElement('div');
  box.className = 'coin-lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  const img = document.createElement('img');
  img.src = coinLargeUrl;
  img.alt = '';
  img.draggable = false;
  const x = document.createElement('button');
  x.type = 'button';
  x.className = 'lb-close';
  x.setAttribute('aria-label', 'Close');
  x.textContent = '×';
  box.append(img, x);
  const close = () => {
    box.remove();
    document.removeEventListener('keydown', onKey, true);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
    }
  };
  box.addEventListener('click', close);
  document.addEventListener('keydown', onKey, true);
  document.body.appendChild(box);
}
