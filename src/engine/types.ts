// Core types for the Dahal Khani rules engine.
// Everything in src/engine is pure (no DOM, no timers) so it can run on a server later.

export type Suit = 'S' | 'H' | 'D' | 'C';
/** 2..10, J=11, Q=12, K=13, A=14 */
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export interface Card {
  suit: Suit;
  rank: Rank;
}

/** Seats go round in play order: 0 = bottom (human), 1 = right, 2 = top (partner), 3 = left. */
export type Seat = 0 | 1 | 2 | 3;
/** Team 0 = seats 0 & 2, team 1 = seats 1 & 3. */
export type Team = 0 | 1;

/**
 * How the trump suit (TURUP / Rang) is decided.
 * - open:      the player after the dealer picks trump openly after seeing 5 cards (implemented)
 * - bandHukum: trump is chosen face-down and revealed when someone first cannot follow suit (TODO)
 * - cutHukum:  the first card played by someone who cannot follow suit sets the trump (TODO)
 */
export type TrumpMode = 'open' | 'bandHukum' | 'cutHukum';

export interface PointValues {
  normal: number;
  kot: number;
  baunne: number;
}

export interface GameSettings {
  trumpMode: TrumpMode;
  points: PointValues;
}

export interface Play {
  seat: Seat;
  card: Card;
}

export interface CompletedTrick {
  plays: Play[];
  winner: Seat;
}

export type Phase = 'choosingTrump' | 'playing' | 'trickComplete' | 'roundOver';

export type WinKind = 'normal' | 'kot' | 'baunne';

export interface RoundResult {
  winningTeam: Team;
  kind: WinKind;
  points: number;
  tens: [number, number];
  tricks: [number, number];
}

export interface GameState {
  settings: GameSettings;
  roundNumber: number;
  dealer: Seat;
  phase: Phase;
  hands: [Card[], Card[], Card[], Card[]];
  /** Cards not yet dealt (the 32 remaining while trump is being chosen). */
  undealt: Card[];
  trump: Suit | null;
  trumpChooser: Seat;
  /** Whose action is awaited. During 'trickComplete' this is meaningless. */
  turn: Seat;
  leader: Seat;
  currentTrick: Play[];
  completedTricks: CompletedTrick[];
  tricksWon: [number, number];
  tensWon: [number, number];
  /** Running score across rounds. */
  score: [number, number];
  lastResult: RoundResult | null;
}

export type Rng = () => number;
