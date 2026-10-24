// How many coins a player earns from a finished round (rules live in settings.ts → COIN_REWARDS).
import type { RoundResult, Team } from './engine';
import { COIN_PENALTIES, COIN_REWARDS } from './settings';

export function coinsFor(result: RoundResult, myTeam: Team): number {
  const won = result.winningTeam === myTeam;
  if (!won) {
    // a close loss (2–2 Dahal, fewer tricks) still earns a little for playing
    return result.tens[myTeam] === 2 ? COIN_REWARDS.lostWithTwoTens : 0;
  }
  if (result.kind === 'baunne') return COIN_REWARDS.baunne;
  if (result.kind === 'kot') return COIN_REWARDS.kot;
  if (result.tens[myTeam] >= 3) return COIN_REWARDS.winThreeTens;
  return COIN_REWARDS.winOnTricks;
}

/**
 * Coins lost to a Kot or Baunne against us. A player with fewer than COIN_PENALTIES.minCoins is never charged,
 * so small savings are safe; richer players have something to protect.
 */
export function coinsLostFor(result: RoundResult, myTeam: Team, coinsBefore: number): number {
  if (result.winningTeam === myTeam || coinsBefore < COIN_PENALTIES.minCoins) return 0;
  if (result.kind === 'baunne') return COIN_PENALTIES.baunne;
  if (result.kind === 'kot') return COIN_PENALTIES.kot;
  return 0;
}
