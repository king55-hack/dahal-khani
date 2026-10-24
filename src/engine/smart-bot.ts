// Medium and hard bots: "determinization" search. The bot never looks at other hands. It works out which
// cards it has not seen yet (its memory), deals them out at random to the other seats while respecting what
// it knows (hand sizes, suits a seat has failed to follow), plays each legal card to the end of the round in
// every guessed deal, and picks the card that does best on average. Only public information is read:
// own hand, played cards, the current trick and the score, so it cannot cheat.

import { createDeck, isTen, shuffle, SUITS } from './cards';
import { computeRoundResult, legalCards, partnerOf, teamOf, trickWinner, visibleTrump } from './game';
import type { Card, Difficulty, GameState, Play, Rng, Seat, Suit } from './types';

/** How a bot level thinks. */
export interface Brain {
  /** how many finished tricks it remembers in full (tens are always remembered) */
  memoryTricks: number;
  /** guessed deals per decision */
  samples: number;
  /** stop sampling after this many ms (a safety net for slow phones; at least 3 samples are always done) */
  budgetMs: number;
}

export const BRAINS: Record<Exclude<Difficulty, 'easy'>, Brain> = {
  medium: { memoryTricks: 3, samples: 30, budgetMs: 150 },
  hard: { memoryTricks: Infinity, samples: 200, budgetMs: 400 },
};

const TRICKS_PER_ROUND = 13;

/** What this bot remembers: the cards it has seen go by, and who it knows is out of which suit. */
function recall(state: GameState, brain: Brain) {
  const done = state.completedTricks;
  const from = Math.max(0, done.length - brain.memoryTricks);
  const kept = done.slice(from);
  const forgotten = done.slice(0, from);
  const seen: Card[] = [
    ...kept.flatMap((t) => t.plays.map((p) => p.card)),
    // tens are what the game is about: everybody remembers which ones are gone
    ...forgotten.flatMap((t) => t.plays.map((p) => p.card)).filter(isTen),
    ...state.currentTrick.map((p) => p.card),
  ];
  const voids = [new Set<Suit>(), new Set<Suit>(), new Set<Suit>(), new Set<Suit>()];
  for (const plays of [...kept.map((t) => t.plays), state.currentTrick]) {
    if (plays.length === 0) continue;
    const led = plays[0].card.suit;
    for (const p of plays) if (p.card.suit !== led) voids[p.seat].add(led);
  }
  return { seen, voids };
}

/** Cards each seat still holds, from public information only (never reads another seat's hand). */
function handSizes(state: GameState): number[] {
  return ([0, 1, 2, 3] as Seat[]).map(
    (s) => TRICKS_PER_ROUND - state.completedTricks.length - (state.currentTrick.some((p) => p.seat === s) ? 1 : 0),
  );
}

/**
 * One guessed deal of the unseen cards to the other seats. Cards that fit the fewest seats are placed first,
 * so a seat known to be out of a suit is never given it. `pool` may be larger than the seats can hold when
 * the bot has forgotten some played cards; the extras are simply left out.
 */
function guessHands(
  pool: readonly Card[],
  sizes: readonly number[],
  voids: readonly Set<Suit>[],
  me: Seat,
  myHand: readonly Card[],
  rng: Rng,
): Card[][] | null {
  const others = ([0, 1, 2, 3] as Seat[]).filter((s) => s !== me);
  const room = sizes.slice();
  const spare = pool.length - others.reduce<number>((n, s) => n + sizes[s], 0);
  let spareLeft = spare;
  const hands: Card[][] = [[], [], [], []];
  hands[me] = myHand.slice();
  const fits = (suit: Suit) => others.filter((s) => !voids[s].has(suit)).length;
  const order = shuffle(pool, rng).sort((a, b) => fits(a.suit) - fits(b.suit));
  for (const card of order) {
    const open = others.filter((s) => room[s] > 0 && !voids[s].has(card.suit));
    if (open.length === 0) {
      if (spareLeft-- > 0) continue;
      return null;
    }
    let pick = rng() * open.reduce<number>((n, s) => n + room[s], 0);
    let seat = open[open.length - 1];
    for (const s of open) {
      pick -= room[s];
      if (pick < 0) {
        seat = s;
        break;
      }
    }
    hands[seat].push(card);
    room[seat]--;
  }
  // a deal that left a seat short (the spare cards were all it could hold) is no use
  return others.every((s) => room[s] === 0) ? hands : null;
}

/** Ignore what is known about voids: used only when no consistent deal was found. */
function looseHands(pool: readonly Card[], sizes: readonly number[], me: Seat, myHand: readonly Card[], rng: Rng) {
  const hands: Card[][] = [[], [], [], []];
  hands[me] = myHand.slice();
  const order = shuffle(pool, rng);
  for (const s of [0, 1, 2, 3] as Seat[]) if (s !== me) hands[s] = order.splice(0, sizes[s]);
  return hands;
}

// ---------- the round simulator (fast, mutable, only used for look-ahead) ----------

interface Sim {
  hands: Card[][];
  trick: Play[];
  turn: Seat;
  trump: Suit | null;
  revealed: boolean;
  mode: GameState['settings']['trumpMode'];
  tricks: [number, number];
  tens: [number, number];
}

const nextSeat = (s: Seat): Seat => ((s + 1) % 4) as Seat;

function simLegal(sim: Sim, seat: Seat): Card[] {
  const hand = sim.hands[seat];
  if (sim.trick.length === 0) return hand;
  const led = sim.trick[0].card.suit;
  const following = hand.filter((c) => c.suit === led);
  return following.length ? following : hand;
}

/** Same rules as game.ts playCard + collectTrick, without validation or copying. */
function simPlay(sim: Sim, seat: Seat, card: Card) {
  const hand = sim.hands[seat];
  if (sim.trick.length > 0 && !sim.revealed && !hand.some((c) => c.suit === sim.trick[0].card.suit)) {
    if (sim.mode === 'bandHukum') sim.revealed = true;
    else if (sim.mode === 'cutHukum') {
      sim.trump = card.suit;
      sim.revealed = true;
    }
  }
  hand.splice(hand.findIndex((c) => c.suit === card.suit && c.rank === card.rank), 1);
  sim.trick.push({ seat, card });
  if (sim.trick.length < 4) {
    sim.turn = nextSeat(seat);
    return;
  }
  const winner = trickWinner(sim.trick, sim.revealed ? sim.trump : null);
  sim.tricks[teamOf(winner)]++;
  sim.tens[teamOf(winner)] += sim.trick.filter((p) => isTen(p.card)).length;
  sim.trick = [];
  sim.turn = winner;
}

function cost(card: Card, trump: Suit | null): number {
  return card.rank + (isTen(card) ? 100 : 0) + (card.suit === trump ? 30 : 0);
}

const lowest = (cards: Card[], trump: Suit | null) =>
  cards.reduce((best, c) => (cost(c, trump) < cost(best, trump) ? c : best));

/** The quick-and-simple player used for everybody's moves inside the look-ahead. */
function rolloutPick(sim: Sim, seat: Seat): Card {
  const legal = simLegal(sim, seat);
  if (legal.length === 1) return legal[0];
  const trump = sim.revealed ? sim.trump : null;
  const nonTens = legal.filter((c) => !isTen(c));
  if (sim.trick.length === 0) {
    const ace = legal.find((c) => c.rank === 14 && c.suit !== trump);
    return ace ?? lowest(nonTens.length ? nonTens : legal, trump);
  }
  const winSeat = trickWinner(sim.trick, trump);
  const last = sim.trick.length === 3;
  if (winSeat === partnerOf(seat)) {
    const ten = legal.find(isTen);
    if (last && ten) return ten; // partner has it won: feed them a Dahal
    return lowest(nonTens.length ? nonTens : legal, trump);
  }
  const winners = legal.filter((c) => trickWinner([...sim.trick, { seat, card: c }], trump) === seat);
  if (last) {
    const ten = winners.find(isTen);
    if (ten) return ten;
    if (winners.length) return lowest(winners, trump);
  } else {
    const safe = winners.filter((c) => !isTen(c));
    if (safe.length) return lowest(safe, trump);
  }
  return lowest(nonTens.length ? nonTens : legal, trump);
}

/** Play the round out and rate it for `team`: winning counts for more with Kot / Baunne, tens break ties. */
function finish(sim: Sim, state: GameState, team: 0 | 1): number {
  while (sim.hands[sim.turn].length > 0) {
    const seat = sim.turn;
    simPlay(sim, seat, rolloutPick(sim, seat));
  }
  const r = computeRoundResult(sim.tens, sim.tricks, state.settings.points);
  const swing = r.winningTeam === team ? r.points : -r.points;
  return swing * 3 + (sim.tens[team] - sim.tens[1 - team]) * 0.5 + (sim.tricks[team] - sim.tricks[1 - team]) * 0.05;
}

/**
 * Choose a card for `seat` by looking ahead in guessed deals. `rng` makes the guesses reproducible in tests.
 */
export function smartChooseCard(state: GameState, seat: Seat, brain: Brain, rng: Rng = Math.random): Card {
  const legal = legalCards(state, seat);
  if (legal.length === 0) throw new Error('Bot has no legal card');
  if (legal.length === 1) return legal[0];

  const myHand = state.hands[seat];
  const { seen, voids } = recall(state, brain);
  const known = [...myHand, ...seen];
  const pool = createDeck().filter((c) => !known.some((k) => k.suit === c.suit && k.rank === c.rank));
  const sizes = handSizes(state);
  const team = teamOf(seat);
  const knownTrump = visibleTrump(state, seat);
  const mode = state.settings.trumpMode;

  const totals = legal.map(() => 0);
  const started = Date.now();
  let samples = 0;
  while (samples < brain.samples && (samples < 3 || Date.now() - started < brain.budgetMs)) {
    let hands: Card[][] | null = null;
    for (let tries = 0; tries < 12 && !hands; tries++) hands = guessHands(pool, sizes, voids, seat, myHand, rng);
    hands ??= looseHands(pool, sizes, seat, myHand, rng);
    // a secret trump that this bot does not know is guessed too
    const trump = knownTrump ?? (mode === 'bandHukum' ? SUITS[Math.floor(rng() * SUITS.length)] : null);
    legal.forEach((card, i) => {
      const sim: Sim = {
        hands: hands.map((h) => h.slice()),
        trick: state.currentTrick.map((p) => ({ ...p })),
        turn: seat,
        trump,
        revealed: state.trumpRevealed,
        mode,
        tricks: [state.tricksWon[0], state.tricksWon[1]],
        tens: [state.tensWon[0], state.tensWon[1]],
      };
      simPlay(sim, seat, card);
      totals[i] += finish(sim, state, team);
    });
    samples++;
  }

  // best average; if two cards rate the same, give away the less valuable one
  let best = 0;
  for (let i = 1; i < legal.length; i++) {
    const diff = totals[i] - totals[best];
    if (diff > 1e-9 || (Math.abs(diff) <= 1e-9 && cost(legal[i], knownTrump) < cost(legal[best], knownTrump))) best = i;
  }
  return legal[best];
}
