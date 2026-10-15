import type { TrumpMode } from '../engine';

// Card designs. Styling lives in style.css under body.theme-<id>; prices are in coins (0 = free).
export type ThemeId = 'classic' | 'blue' | 'dhaka' | 'neon' | 'gold';

export interface Theme {
  id: ThemeId;
  price: number;
}

export const THEMES: readonly Theme[] = [
  { id: 'classic', price: 0 },
  { id: 'blue', price: 10 },
  { id: 'dhaka', price: 50 },
  { id: 'neon', price: 100 },
  { id: 'gold', price: 200 },
];

export const isThemeId = (v: unknown): v is ThemeId => THEMES.some((t) => t.id === v);

/** Table backgrounds (styling in style.css under .bg-<id>); prices in coins (0 = free). */
export type BackgroundId = 'normal' | 'gundri' | 'galaicha';

export interface Background {
  id: BackgroundId;
  price: number;
}

export const BACKGROUNDS: readonly Background[] = [
  { id: 'normal', price: 0 },
  { id: 'gundri', price: 10 },
  { id: 'galaicha', price: 20 },
];
export const isBackgroundId = (v: unknown): v is BackgroundId => BACKGROUNDS.some((b) => b.id === v);

/** Game modes: a new player starts with Normal and buys the others once they know the game. */
export const MODE_PRICES: Readonly<Record<TrumpMode, number>> = { open: 0, bandHukum: 10, cutHukum: 20 };
