// Pure game-flow functions. Each action takes a state and returns a NEW state;
// illegal actions throw. This makes it easy to validate moves on a server later.

import { createDeck, isTen, sameCard, shuffle, SUITS } from './cards';
import type {
  Card,
  CompletedTrick,
  GameSettings,
  GameState,
  Play,
  PointValues,
  RoundResult,
  Rng,
  Seat,
  Suit,
  Team,
} from './types';

export const TRICKS_PER_ROUND = 13;

export const nextSeat = (s: Seat): Seat => ((s + 1) % 4) as Seat;
export const partnerOf = (s: Seat): Seat => ((s + 2) % 4) as Seat;
export const teamOf = (s: Seat): Team => (s % 2) as Team;

function clone(state: GameState): GameState {
  return structuredClone(state);
}

/** Seats in deal order: starting with the player next to the dealer. */
export function dealOrder(dealer: Seat): Seat[] {
  const order: Seat[] = [];
  let s = nextSeat(dealer);
  for (let i = 0; i < 4; i++) {
    order.push(s);
    s = nextSeat(s);
  }
  return order;
}

export interface NewGameOptions {
  rng?: Rng;
  /** Defaults to seat 3, so seat 0 (the human) chooses trump in round 1. */
  firstDealer?: Seat;
}

export function newGame(settings: GameSettings, opts: NewGameOptions = {}): GameState {
  const base: GameState = {
    settings,
    roundNumber: 0,
    dealer: opts.firstDealer ?? 3,
    phase: 'roundOver',
    hands: [[], [], [], []],
    undealt: [],
    trump: null,
    trumpRevealed: false,
    trumpChooser: 0,
    turn: 0,
    leader: 0,
    currentTrick: [],
    completedTricks: [],
    tricksWon: [0, 0],
    tensWon: [0, 0],
    score: [0, 0],
    lastResult: null,
  };
  return dealRound(base, base.dealer, opts.rng ?? Math.random);
}

/** Start the next round; the dealer rotates by one seat. */
export function nextRound(state: GameState, rng: Rng = Math.random): GameState {
  if (state.phase !== 'roundOver') throw new Error('Round is not over yet');
  return dealRound(state, nextSeat(state.dealer), rng);
}

/**
 * Shuffle and deal the first 5 cards each. Trump is chosen before the rest are dealt.
 * In cut hukum nobody chooses trump, so all 13 cards are dealt straight away.
 */
export function dealRound(state: GameState, dealer: Seat, rng: Rng, deck?: Card[]): GameState {
  const cards = deck ? deck.slice() : shuffle(createDeck(), rng);
  if (cards.length !== 52) throw new Error('Deck must have 52 cards');
  const s = clone(state);
  s.roundNumber = state.roundNumber + 1;
  s.dealer = dealer;
  s.hands = [[], [], [], []];
  for (const seat of dealOrder(dealer)) s.hands[seat] = cards.splice(0, 5);
  s.undealt = cards;
  s.trump = null;
  s.trumpRevealed = false;
  s.trumpChooser = nextSeat(dealer);
  s.turn = s.trumpChooser;
  s.leader = s.trumpChooser;
  s.currentTrick = [];
  s.completedTricks = [];
  s.tricksWon = [0, 0];
  s.tensWon = [0, 0];
  s.lastResult = null;
  s.phase = 'choosingTrump';
  if (s.settings.trumpMode === 'cutHukum') {
    dealRemaining(s);
    s.phase = 'playing';
  }
  return s;
}

/** Deal the remaining 8 cards each, in two packets of 4. Mutates `s`. */
function dealRemaining(s: GameState) {
  for (let packet = 0; packet < 2; packet++) {
    for (const seat of dealOrder(s.dealer)) s.hands[seat].push(...s.undealt.splice(0, 4));
  }
}

export function chooseTrump(state: GameState, seat: Seat, suit: Suit): GameState {
  if (state.phase !== 'choosingTrump') throw new Error('Not choosing trump now');
  if (seat !== state.trumpChooser) throw new Error('Only the trump chooser can choose trump');
  if (!SUITS.includes(suit)) throw new Error('Invalid suit');
  const s = clone(state);
  dealRemaining(s);
  s.trump = suit;
  s.trumpRevealed = s.settings.trumpMode === 'open'; // band hukum: secret until someone can't follow
  s.phase = 'playing';
  s.leader = seat;
  s.turn = seat;
  return s;
}

/** The trump suit in effect right now: only a revealed trump counts. */
export function currentTrump(state: GameState): Suit | null {
  return state.trumpRevealed ? state.trump : null;
}

/** The trump as one player knows it (in band hukum the chooser knows the secret trump). */
export function visibleTrump(state: GameState, seat: Seat): Suit | null {
  if (state.trumpRevealed) return state.trump;
  if (state.settings.trumpMode === 'bandHukum' && seat === state.trumpChooser) return state.trump;
  return null;
}

export function legalCards(state: GameState, seat: Seat): Card[] {
  if (state.phase !== 'playing' || state.turn !== seat) return [];
  const hand = state.hands[seat];
  if (state.currentTrick.length === 0) return hand.slice();
  const led = state.currentTrick[0].card.suit;
  const following = hand.filter((c) => c.suit === led);
  return following.length > 0 ? following : hand.slice();
}

export function isLegal(state: GameState, seat: Seat, card: Card): boolean {
  return legalCards(state, seat).some((c) => sameCard(c, card));
}

/** Highest trump wins; otherwise highest card of the led suit. */
export function trickWinner(plays: readonly Play[], trump: Suit | null): Seat {
  if (plays.length === 0) throw new Error('Empty trick');
  const led = plays[0].card.suit;
  let best = plays[0];
  for (const p of plays.slice(1)) {
    const c = p.card;
    const b = best.card;
    const cTrump = c.suit === trump;
    const bTrump = b.suit === trump;
    if (cTrump && !bTrump) best = p;
    else if (cTrump === bTrump && c.suit === b.suit && c.rank > b.rank) best = p;
    else if (!cTrump && !bTrump && c.suit === led && b.suit !== led) best = p;
  }
  return best.seat;
}

export function playCard(state: GameState, seat: Seat, card: Card): GameState {
  if (state.phase !== 'playing') throw new Error('Not in play phase');
  if (seat !== state.turn) throw new Error(`Not seat ${seat}'s turn`);
  if (!isLegal(state, seat, card)) throw new Error('Illegal card');
  const s = clone(state);
  if (s.currentTrick.length > 0 && !s.trumpRevealed) {
    const led = s.currentTrick[0].card.suit;
    const cannotFollow = !s.hands[seat].some((c) => c.suit === led);
    if (cannotFollow && s.settings.trumpMode === 'bandHukum') {
      s.trumpRevealed = true; // hukum khulchha: the hidden trump is shown before this card counts
    } else if (cannotFollow && s.settings.trumpMode === 'cutHukum') {
      s.trump = card.suit; // this card "cuts" and its suit becomes trump for the round
      s.trumpRevealed = true;
      s.trumpChooser = seat;
    }
  }
  s.hands[seat] = s.hands[seat].filter((c) => !sameCard(c, card));
  s.currentTrick.push({ seat, card });
  if (s.currentTrick.length === 4) s.phase = 'trickComplete';
  else s.turn = nextSeat(seat);
  return s;
}

/** Resolve a full trick (4 cards). Separate step so a UI can show the trick before it's taken. */
export function collectTrick(state: GameState): GameState {
  if (state.phase !== 'trickComplete') throw new Error('No complete trick to collect');
  const s = clone(state);
  const winner = trickWinner(s.currentTrick, currentTrump(s));
  const team = teamOf(winner);
  const done: CompletedTrick = { plays: s.currentTrick, winner };
  s.completedTricks.push(done);
  s.tricksWon[team] += 1;
  s.tensWon[team] += s.currentTrick.filter((p) => isTen(p.card)).length;
  s.currentTrick = [];
  s.leader = winner;
  s.turn = winner;

  if (s.completedTricks.length === TRICKS_PER_ROUND) {
    const result = computeRoundResult(s.tensWon, s.tricksWon, s.settings.points);
    s.score[result.winningTeam] += result.points;
    s.lastResult = result;
    s.phase = 'roundOver';
  } else {
    s.phase = 'playing';
  }
  return s;
}

export function computeRoundResult(
  tens: readonly [number, number],
  tricks: readonly [number, number],
  points: PointValues,
): RoundResult {
  let winningTeam: Team;
  if (tens[0] >= 3) winningTeam = 0;
  else if (tens[1] >= 3) winningTeam = 1;
  else winningTeam = tricks[0] > tricks[1] ? 0 : 1; // 2–2 tens: more tricks wins (13 is odd)

  let kind: RoundResult['kind'] = 'normal';
  if (tricks[winningTeam] === TRICKS_PER_ROUND) kind = 'baunne';
  else if (tens[winningTeam] === 4) kind = 'kot';

  return {
    winningTeam,
    kind,
    points: points[kind],
    tens: [tens[0], tens[1]],
    tricks: [tricks[0], tricks[1]],
  };
}
