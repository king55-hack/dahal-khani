// The Nepali coin: a gold "mohar" with a beaded rim and the Himal (snow mountains) with the sun, engraved in the middle.
// The shape is defined once in index.html (symbol "nepal-coin"); this builds the little <svg> that shows it.

export const coinHtml = (cls = '') =>
  `<svg class="nc ${cls}" viewBox="0 0 32 32" aria-hidden="true"><use href="#nepal-coin"/></svg>`;

/** Replace the 🪙 emoji in a text with the Nepali coin picture (the text must be shown as HTML). */
export const withCoin = (s: string) => s.replace(/🪙/g, coinHtml());
