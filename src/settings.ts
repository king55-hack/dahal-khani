// Game settings — edit these values to change scoring or (later) the trump variant.
import type { GameSettings } from './engine';

export const GAME_SETTINGS: GameSettings = {
  /** 'open' (default). 'bandHukum' and 'cutHukum' are planned but not implemented yet. */
  trumpMode: 'open',
  points: {
    normal: 1, // won 3 tens, or 2–2 tens with more tricks
    kot: 2, // captured all four 10s
    baunne: 3, // won all 13 tricks (52 cards)
  },
};

/** Delay before each bot move, in ms. */
export const BOT_DELAY_MS = 700;
/** How long a finished trick stays on the table before being collected, in ms. */
export const TRICK_PAUSE_MS = 1100;

/** Shown in the ⓘ "Banaune" (credits) section. */
export const CREATOR_NAME = 'Rajan Rimal';
