// Player preferences saved in this browser (localStorage). Everything is validated on load
// and every storage access is guarded, so private mode or blocked storage still works.
import type { TrumpMode } from '../engine';
import { LANGS, type Lang } from './i18n';
import { isBackgroundId, isThemeId, type BackgroundId, type ThemeId } from './themes';

export interface Prefs {
  /** null until the player picks a language on first launch */
  lang: Lang | null;
  theme: ThemeId;
  background: BackgroundId;
  sound: boolean;
  /** dealing / throwing / pick-up animations */
  animations: boolean;
  mode: TrumpMode;
  coins: number;
  unlocked: ThemeId[];
  /** name used in online rooms */
  playerName: string;
}

const KEY = 'dahal-khani:prefs:v1';
const MODES: readonly TrumpMode[] = ['open', 'bandHukum', 'cutHukum'];

export const DEFAULT_PREFS: Prefs = {
  lang: null,
  theme: 'classic',
  background: 'normal',
  sound: true,
  animations: true,
  mode: 'open',
  coins: 0,
  unlocked: ['classic', 'blue'],
  playerName: '',
};

export function loadPrefs(): Prefs {
  let raw: unknown = null;
  try {
    raw = JSON.parse(localStorage.getItem(KEY) ?? 'null');
  } catch {
    /* storage blocked or corrupt — use defaults */
  }
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const unlocked = Array.isArray(r.unlocked) ? r.unlocked.filter(isThemeId) : [];
  const prefs: Prefs = {
    lang: LANGS.includes(r.lang as Lang) ? (r.lang as Lang) : null,
    theme: isThemeId(r.theme) ? r.theme : DEFAULT_PREFS.theme,
    background: isBackgroundId(r.background) ? r.background : DEFAULT_PREFS.background,
    sound: typeof r.sound === 'boolean' ? r.sound : DEFAULT_PREFS.sound,
    animations:
      typeof r.animations === 'boolean'
        ? r.animations
        : !(typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches),
    mode: MODES.includes(r.mode as TrumpMode) ? (r.mode as TrumpMode) : DEFAULT_PREFS.mode,
    coins:
      typeof r.coins === 'number' && Number.isFinite(r.coins) && r.coins >= 0 ? Math.floor(r.coins) : 0,
    unlocked: [...new Set<ThemeId>([...DEFAULT_PREFS.unlocked, ...unlocked])],
    playerName: typeof r.playerName === 'string' ? r.playerName.slice(0, 16) : '',
  };
  if (!prefs.unlocked.includes(prefs.theme)) prefs.theme = DEFAULT_PREFS.theme;
  return prefs;
}

export function savePrefs(prefs: Prefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* ignore — preferences just won't persist */
  }
}
