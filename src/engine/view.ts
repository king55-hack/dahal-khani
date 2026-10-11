// What one player is allowed to see. The server sends only this, so nobody can peek at
// other hands or a hidden (band hukum) trump through the network.

import { visibleTrump } from './game';
import type { GameState, RoundResult, Seat, Team } from './types';

export interface PlayerView extends GameState {
  /** Card counts for every seat (other players' hands are emptied). */
  handCounts: [number, number, number, number];
}

export function viewFor(state: GameState, seat: Seat): PlayerView {
  const hands: GameState['hands'] = [[], [], [], []];
  hands[seat] = state.hands[seat].map((c) => ({ ...c }));
  return {
    ...structuredClone(state),
    hands,
    undealt: [],
    trump: visibleTrump(state, seat),
    handCounts: [
      state.hands[0].length,
      state.hands[1].length,
      state.hands[2].length,
      state.hands[3].length,
    ],
  };
}

/**
 * Rotate a view so that `mySeat` becomes seat 0 (bottom of the screen). Partner stays opposite
 * (seat 2), so teams are preserved; if mySeat is odd, team indexes swap so "team 0" is always us.
 */
export function rotateView(view: PlayerView, mySeat: Seat): PlayerView {
  if (mySeat === 0) return view;
  const r = (s: Seat): Seat => ((s - mySeat + 4) % 4) as Seat;
  const swap = mySeat % 2 === 1;
  const team = <T>(pair: [T, T]): [T, T] => (swap ? [pair[1], pair[0]] : [pair[0], pair[1]]);
  const byLocal = <T>(arr: readonly T[]): T[] => [0, 1, 2, 3].map((i) => arr[(i + mySeat) % 4]);

  let lastResult: RoundResult | null = view.lastResult;
  if (lastResult) {
    lastResult = {
      ...lastResult,
      winningTeam: (swap ? 1 - lastResult.winningTeam : lastResult.winningTeam) as Team,
      tens: team(lastResult.tens),
      tricks: team(lastResult.tricks),
    };
  }
  return {
    ...view,
    dealer: r(view.dealer),
    trumpChooser: r(view.trumpChooser),
    turn: r(view.turn),
    leader: r(view.leader),
    hands: byLocal(view.hands) as GameState['hands'],
    handCounts: byLocal(view.handCounts) as PlayerView['handCounts'],
    currentTrick: view.currentTrick.map((p) => ({ ...p, seat: r(p.seat) })),
    completedTricks: view.completedTricks.map((t) => ({
      winner: r(t.winner),
      plays: t.plays.map((p) => ({ ...p, seat: r(p.seat) })),
    })),
    tricksWon: team(view.tricksWon),
    tensWon: team(view.tensWon),
    score: team(view.score),
    lastResult,
  };
}
