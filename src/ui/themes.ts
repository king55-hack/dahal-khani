// Card designs. Styling lives in style.css under body.theme-<id>; prices are in coins (0 = free).
export type ThemeId = 'classic' | 'blue' | 'dhaka' | 'neon' | 'gold';

export interface Theme {
  id: ThemeId;
  price: number;
}

export const THEMES: readonly Theme[] = [
  { id: 'classic', price: 0 },
  { id: 'blue', price: 0 },
  { id: 'dhaka', price: 50 },
  { id: 'neon', price: 100 },
  { id: 'gold', price: 200 },
];

export const isThemeId = (v: unknown): v is ThemeId => THEMES.some((t) => t.id === v);

/** Table backgrounds (styling in style.css under .bg-<id>). All free. */
export type BackgroundId = 'normal' | 'gundri' | 'galaicha';
export const BACKGROUNDS: readonly BackgroundId[] = ['normal', 'gundri', 'galaicha'];
export const isBackgroundId = (v: unknown): v is BackgroundId => BACKGROUNDS.includes(v as BackgroundId);
