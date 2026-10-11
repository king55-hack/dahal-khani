import type { Card, Rank, Rng, Suit } from './types';

export const SUITS: readonly Suit[] = ['S', 'H', 'C', 'D'];
export const RANKS: readonly Rank[] = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];

export const SUIT_SYMBOL: Record<Suit, string> = { S: '♠', H: '♥', D: '♦', C: '♣' };
export const SUIT_NAME: Record<Suit, string> = { S: 'Spade', H: 'Heart', D: 'Diamond', C: 'Club' };

export function rankLabel(rank: Rank): string {
  switch (rank) {
    case 14: return 'A';
    case 13: return 'K';
    case 12: return 'Q';
    case 11: return 'J';
    default: return String(rank);
  }
}

export function cardId(card: Card): string {
  return rankLabel(card.rank) + card.suit;
}

export function sameCard(a: Card, b: Card): boolean {
  return a.suit === b.suit && a.rank === b.rank;
}

export function isTen(card: Card): boolean {
  return card.rank === 10;
}

export function isRed(suit: Suit): boolean {
  return suit === 'H' || suit === 'D';
}

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) for (const rank of RANKS) deck.push({ suit, rank });
  return deck;
}

/** Fisher–Yates shuffle; returns a new array. */
export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Sort by suit (trump first, colours alternating), then rank high to low. */
export function sortHand(hand: readonly Card[], trump: Suit | null = null): Card[] {
  const order = trump ? [trump, ...SUITS.filter((s) => s !== trump)] : [...SUITS];
  return hand
    .slice()
    .sort((a, b) => order.indexOf(a.suit) - order.indexOf(b.suit) || b.rank - a.rank);
}
