// Player preferences saved in this browser (localStorage). Everything is validated on load
// and every storage access is guarded, so private mode or blocked storage still works.
import type { Difficulty, TrumpMode } from '../engine';
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
  /** how well the offline bots play */
  difficulty: Difficulty;
  /** bot levels bought with coins */
  unlockedLevels: Difficulty[];
  coins: number;
  unlocked: ThemeId[];
  /** table backgrounds bought with coins */
  unlockedBgs: BackgroundId[];
  /** game modes bought with coins */
  unlockedModes: TrumpMode[];
  /** name used in online rooms */
  playerName: string;
  /** the first-run guide was finished or skipped */
  tourDone: boolean;
}

const KEY = 'dahal-khani:prefs:v1';
const MODES: readonly TrumpMode[] = ['open', 'bandHukum', 'cutHukum'];
const LEVELS: readonly Difficulty[] = ['easy', 'medium', 'hard'];

export const DEFAULT_PREFS: Prefs = {
  lang: null,
  theme: 'classic',
  background: 'normal',
  sound: true,
  animations: true,
  mode: 'open',
  difficulty: 'easy',
  unlockedLevels: ['easy'],
  coins: 0,
  unlocked: ['classic'],
  unlockedBgs: ['normal'],
  unlockedModes: ['open'],
  playerName: '',
  tourDone: false,
};

export function loadPrefs(): Prefs {
  let raw: unknown = null;
  try {
    raw = JSON.parse(localStorage.getItem(KEY) ?? 'null');
  } catch {
    /* storage blocked or corrupt — use defaults */
  }
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  // Saves from before blue cards, backgrounds and modes had a price have no unlockedBgs. Those players keep
  // whatever they are using right now; the rest has to be bought like everything else.
  const oldSave = !Array.isArray(r.unlockedBgs);
  const unlocked = (Array.isArray(r.unlocked) ? r.unlocked.filter(isThemeId) : []).filter(
    (id) => !(oldSave && id === 'blue' && r.theme !== 'blue'),
  );
  const unlockedBgs = oldSave
    ? isBackgroundId(r.background) ? [r.background] : []
    : (r.unlockedBgs as unknown[]).filter(isBackgroundId);
  const isLevel = (v: unknown): v is Difficulty => LEVELS.includes(v as Difficulty);
  const isMode = (v: unknown): v is TrumpMode => MODES.includes(v as TrumpMode);
  const unlockedModes = Array.isArray(r.unlockedModes)
    ? r.unlockedModes.filter(isMode)
    : isMode(r.mode) ? [r.mode] : [];
  const unlockedLevels = Array.isArray(r.unlockedLevels) ? r.unlockedLevels.filter(isLevel) : [];
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
    difficulty: LEVELS.includes(r.difficulty as Difficulty) ? (r.difficulty as Difficulty) : DEFAULT_PREFS.difficulty,
    coins:
      typeof r.coins === 'number' && Number.isFinite(r.coins) && r.coins >= 0 ? Math.floor(r.coins) : 0,
    unlocked: [...new Set<ThemeId>([...DEFAULT_PREFS.unlocked, ...unlocked])],
    unlockedBgs: [...new Set<BackgroundId>([...DEFAULT_PREFS.unlockedBgs, ...unlockedBgs])],
    unlockedLevels: [...new Set<Difficulty>([...DEFAULT_PREFS.unlockedLevels, ...unlockedLevels])],
    unlockedModes: [...new Set<TrumpMode>([...DEFAULT_PREFS.unlockedModes, ...unlockedModes])],
    playerName: typeof r.playerName === 'string' ? r.playerName.slice(0, 16) : '',
    tourDone: r.tourDone === true,
  };
  if (!prefs.unlocked.includes(prefs.theme)) prefs.theme = DEFAULT_PREFS.theme;
  if (!prefs.unlockedBgs.includes(prefs.background)) prefs.background = DEFAULT_PREFS.background;
  if (!prefs.unlockedLevels.includes(prefs.difficulty)) prefs.difficulty = DEFAULT_PREFS.difficulty;
  if (!prefs.unlockedModes.includes(prefs.mode)) prefs.mode = DEFAULT_PREFS.mode;
  return prefs;
}

export function savePrefs(prefs: Prefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* ignore — preferences just won't persist */
  }
}
