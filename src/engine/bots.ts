// Simple, sensible bot heuristics. Pure functions: they only read the game state.

import { createDeck, isTen, sameCard, SUITS } from './cards';
import { currentTrump, legalCards, partnerOf, teamOf, trickWinner } from './game';
import type { Card, GameState, Play, Seat, Suit } from './types';

/** Pick the suit with the most cards; break ties by high cards (A, then K, ...). */
export function botChooseTrump(hand: readonly Card[]): Suit {
  let best: Suit = SUITS[0];
  let bestKey = -1;
  for (const suit of SUITS) {
    const ranks = hand.filter((c) => c.suit === suit).map((c) => c.rank).sort((a, b) => b - a);
    // count dominates; then sum of high-card weights (A=2^14 etc.) breaks ties
    const key = ranks.length * 1e6 + ranks.reduce((sum, r) => sum + 2 ** (r - 2), 0);
    if (key > bestKey) {
      bestKey = key;
      best = suit;
    }
  }
  return best;
}

/** Cards not in this seat's hand and not yet played this round. */
function unseenCards(state: GameState, seat: Seat): Card[] {
  const seen: Card[] = [
    ...state.hands[seat],
    ...state.currentTrick.map((p) => p.card),
    ...state.completedTricks.flatMap((t) => t.plays.map((p) => p.card)),
  ];
  return createDeck().filter((c) => !seen.some((s) => sameCard(s, c)));
}

/** Suits each seat has shown it does not hold (failed to follow). */
function knownVoids(state: GameState): Set<Suit>[] {
  const voids = [new Set<Suit>(), new Set<Suit>(), new Set<Suit>(), new Set<Suit>()];
  const tricks = [...state.completedTricks.map((t) => t.plays), state.currentTrick];
  for (const plays of tricks) {
    if (plays.length === 0) continue;
    const led = plays[0].card.suit;
    for (const p of plays) if (p.card.suit !== led) voids[p.seat].add(led);
  }
  return voids;
}

/** Would `card` beat every play currently in the trick? */
function beats(trick: readonly Play[], seat: Seat, card: Card, trump: Suit | null): boolean {
  return trickWinner([...trick, { seat, card }], trump) === seat;
}

/**
 * Is the winning card of `trick` safe from all players still to play, as far as `me` can tell?
 * Considers higher unseen cards of the same suit, and trumping by opponents known void in the led suit.
 * `trick` may or may not already include my own card.
 */
function winnerIsSafe(state: GameState, me: Seat, trick: readonly Play[], trump: Suit | null): boolean {
  if (trick.length === 4) return true;
  const remaining: Seat[] = [];
  let s = trick[trick.length - 1].seat;
  for (let i = trick.length; i < 4; i++) {
    s = ((s + 1) % 4) as Seat;
    if (s !== me) remaining.push(s);
  }
  if (remaining.length === 0) return true;
  const winSeat = trickWinner(trick, trump);
  const winCard = trick.find((p) => p.seat === winSeat)!.card;
  // only opponents threaten us; a higher card from partner is fine
  const opponents = remaining.filter((r) => teamOf(r) !== teamOf(winSeat));
  if (opponents.length === 0) return true;
  const unseen = unseenCards(state, me).filter(
    (c) => !trick.some((p) => sameCard(p.card, c)),
  );
  const led = trick[0].card.suit;

  if (unseen.some((c) => c.suit === winCard.suit && c.rank > winCard.rank)) return false;
  if (trump && winCard.suit !== trump && unseen.some((c) => c.suit === trump)) {
    const voids = knownVoids(state);
    if (opponents.some((r) => voids[r].has(led))) return false;
  }
  return true;
}

/** Cost of giving a card away: tens are precious, trumps are useful, high cards matter. */
function throwCost(card: Card, trump: Suit | null): number {
  let cost = card.rank;
  if (isTen(card)) cost += 100;
  if (card.suit === trump) cost += 30;
  return cost;
}

const cheapest = (cards: Card[], trump: Suit | null) =>
  cards.slice().sort((a, b) => throwCost(a, trump) - throwCost(b, trump))[0];

function chooseLead(hand: Card[], trump: Suit | null): Card {
  // Lead a non-trump Ace (likely wins, draws out cards), else a low card from the longest side suit.
  const aces = hand.filter((c) => c.rank === 14 && c.suit !== trump);
  if (aces.length) return aces[0];
  const sideSuits = SUITS.filter((s) => s !== trump && hand.some((c) => c.suit === s && !isTen(c)));
  if (sideSuits.length) {
    sideSuits.sort(
      (a, b) => hand.filter((c) => c.suit === b).length - hand.filter((c) => c.suit === a).length,
    );
    return cheapest(hand.filter((c) => c.suit === sideSuits[0] && !isTen(c)), trump);
  }
  return cheapest(hand, trump);
}

export function botChooseCard(state: GameState, seat: Seat): Card {
  const legal = legalCards(state, seat);
  if (legal.length === 0) throw new Error('Bot has no legal card');
  if (legal.length === 1) return legal[0];
  const trump = currentTrump(state);
  const trick = state.currentTrick;

  if (trick.length === 0) return chooseLead(legal, trump);

  const winSeat = trickWinner(trick, trump);
  const partnerWinning = winSeat === partnerOf(seat);
  const safe = winnerIsSafe(state, seat, trick, trump);
  const tens = legal.filter(isTen);
  const nonTens = legal.filter((c) => !isTen(c));

  // 1. Partner clearly winning → give them a 10 (Dahal) if we can, else throw low.
  if (partnerWinning && safe) {
    if (tens.length) return tens[0];
    return cheapest(legal, trump);
  }

  // 2. Partner winning but not safe → don't overtake, don't risk a 10.
  if (partnerWinning) return cheapest(nonTens.length ? nonTens : legal, trump);

  // 3. Opponent winning → try to win cheaply.
  const winners = legal.filter((c) => beats(trick, seat, c, trump));
  const lastToPlay = trick.length === 3;
  const trickHasTen = trick.some((p) => isTen(p.card));
  if (winners.length) {
    const sorted = winners.slice().sort((a, b) => throwCost(a, trump) - throwCost(b, trump));
    // If we're last, our own 10 is guaranteed safe — capture it.
    if (lastToPlay) {
      const winningTen = winners.find(isTen);
      if (winningTen) return winningTen;
      return sorted[0];
    }
    // Not last: prefer a winner that can't be beaten afterwards; never risk a 10.
    const safeWinners = sorted.filter((c) => {
      return !isTen(c) || winnerIsSafe(state, seat, [...trick, { seat, card: c }], trump);
    });
    const choice = safeWinners.find((c) => !isTen(c)) ?? safeWinners[0];
    // Don't waste a trump on a cheap trick with nothing in it, unless we must.
    if (choice && (trickHasTen || choice.suit !== trump || choice.suit === trick[0].card.suit)) {
      return choice;
    }
    if (choice && nonTens.every((c) => c.suit === trump)) return choice;
  }

  // 4. Can't (or won't) win → throw the lowest useless card, never a 10 if avoidable.
  return cheapest(nonTens.length ? nonTens : legal, trump);
}
