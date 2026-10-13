// Game settings — edit these values to change scoring or (later) the trump variant.
import type { GameSettings } from './engine';

export const GAME_SETTINGS: GameSettings = {
  /** Default mode: 'open' (normal), 'bandHukum' (hidden trump) or 'cutHukum'. Players can change it in ⚙. */
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
/** Shown under the creator's name. */
export const COPYRIGHT = `© 2026 ${CREATOR_NAME}. All rights reserved.`;

/** Coins a player earns per round (see coins.ts). Spent to unlock card designs. */
export const COIN_REWARDS = {
  lostWithTwoTens: 5, // lost, but took 2 Dahal (lost only on tricks) — any other loss: 0
  winOnTricks: 10, // won 2–2 Dahal with more tricks
  winThreeTens: 20, // won with 3 Dahal
  kot: 30, // won with all four Dahal
  baunne: 40, // won all 13 tricks (all 52 cards) — the maximum
};
