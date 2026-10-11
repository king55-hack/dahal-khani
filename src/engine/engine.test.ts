import { describe, expect, it } from 'vitest';
import {
  botChooseCard,
  botChooseTrump,
  cardId,
  chooseTrump,
  collectTrick,
  computeRoundResult,
  createDeck,
  dealRound,
  legalCards,
  newGame,
  nextRound,
  playCard,
  trickWinner,
  type Card,
  type GameSettings,
  type GameState,
  type Play,
  type Rank,
  type Seat,
  type Suit,
} from './index';

const SETTINGS: GameSettings = { trumpMode: 'open', points: { normal: 1, kot: 2, baunne: 3 } };

/** Small deterministic RNG (mulberry32) so tests are repeatable. */
function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const c = (rank: Rank, suit: Suit): Card => ({ rank, suit });
const play = (seat: Seat, card: Card): Play => ({ seat, card });

/** Build a state in the 'playing' phase with exact hands (for targeted tests). */
function stateWithHands(hands: Card[][], trump: Suit, turn: Seat = 0): GameState {
  const g = newGame(SETTINGS, { rng: seeded(1) });
  return {
    ...g,
    phase: 'playing',
    hands: hands.map((h) => h.slice()) as GameState['hands'],
    undealt: [],
    trump,
    turn,
    leader: turn,
  };
}

/** Play out a whole round with bots in every seat. */
function playRoundWithBots(state: GameState): GameState {
  let s = state;
  s = chooseTrump(s, s.trumpChooser, botChooseTrump(s.hands[s.trumpChooser]));
  while (s.phase !== 'roundOver') {
    if (s.phase === 'trickComplete') s = collectTrick(s);
    else s = playCard(s, s.turn, botChooseCard(s, s.turn));
  }
  return s;
}

describe('deck', () => {
  it('has 52 unique cards, no jokers', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
    expect(new Set(deck.map(cardId)).size).toBe(52);
  });
});

describe('dealing and trump', () => {
  it('deals 5 cards each, and the player after the dealer chooses trump', () => {
    const g = newGame(SETTINGS, { rng: seeded(42), firstDealer: 3 });
    expect(g.phase).toBe('choosingTrump');
    expect(g.hands.map((h) => h.length)).toEqual([5, 5, 5, 5]);
    expect(g.undealt).toHaveLength(32);
    expect(g.trumpChooser).toBe(0);
    expect(g.turn).toBe(0);
  });

  it('deals the rest after trump is chosen so everyone has 13 and the chooser leads', () => {
    const g = newGame(SETTINGS, { rng: seeded(7), firstDealer: 1 });
    expect(g.trumpChooser).toBe(2);
    const firstFive = g.hands[2].map(cardId);
    const s = chooseTrump(g, 2, 'H');
    expect(s.trump).toBe('H');
    expect(s.hands.map((h) => h.length)).toEqual([13, 13, 13, 13]);
    expect(s.hands[2].slice(0, 5).map(cardId)).toEqual(firstFive);
    expect(new Set(s.hands.flat().map(cardId)).size).toBe(52);
    expect(s.phase).toBe('playing');
    expect(s.turn).toBe(2);
  });

  it('deals in packets starting from the player next to the dealer', () => {
    const deck = createDeck(); // unshuffled
    const g = dealRound(newGame(SETTINGS), 0, seeded(1), deck);
    // dealer 0 → seat 1 gets the first 5 cards
    expect(g.hands[1].map(cardId)).toEqual(deck.slice(0, 5).map(cardId));
    const s = chooseTrump(g, 1, 'S');
    // then 4 each starting at seat 1, then 4 more each
    expect(s.hands[1].slice(5, 9).map(cardId)).toEqual(deck.slice(20, 24).map(cardId));
    expect(s.hands[1].slice(9).map(cardId)).toEqual(deck.slice(36, 40).map(cardId));
  });

  it('rejects trump from the wrong player', () => {
    const g = newGame(SETTINGS, { rng: seeded(3), firstDealer: 3 });
    expect(() => chooseTrump(g, 1, 'S')).toThrow();
  });

  it('rejects an invalid trump suit', () => {
    const g = newGame(SETTINGS, { rng: seeded(3), firstDealer: 3 });
    expect(() => chooseTrump(g, 0, 'X' as Suit)).toThrow(/Invalid suit/);
  });

  it('rejects trump modes that are not implemented yet', () => {
    const g = newGame({ ...SETTINGS, trumpMode: 'bandHukum' }, { rng: seeded(3) });
    expect(() => chooseTrump(g, g.trumpChooser, 'S')).toThrow(/not implemented/);
  });

  it('rotates the dealer every round', () => {
    let s = newGame(SETTINGS, { rng: seeded(5), firstDealer: 3 });
    const dealers: Seat[] = [];
    for (let i = 0; i < 5; i++) {
      dealers.push(s.dealer);
      s = playRoundWithBots(s);
      s = nextRound(s, seeded(i));
    }
    expect(dealers).toEqual([3, 0, 1, 2, 3]);
  });
});

describe('following suit', () => {
  it('must follow the led suit when possible', () => {
    let s = stateWithHands(
      [[c(5, 'S'), c(9, 'H')], [c(2, 'S'), c(14, 'H')], [c(3, 'D')], [c(4, 'C')]],
      'D',
    );
    s = playCard(s, 0, c(5, 'S'));
    expect(legalCards(s, 1).map(cardId)).toEqual(['2S']);
    expect(() => playCard(s, 1, c(14, 'H'))).toThrow(/Illegal/);
  });

  it('may play any card when void in the led suit', () => {
    let s = stateWithHands([[c(5, 'S')], [c(14, 'H'), c(2, 'D')], [c(3, 'D')], [c(4, 'C')]], 'D');
    s = playCard(s, 0, c(5, 'S'));
    expect(legalCards(s, 1)).toHaveLength(2);
  });

  it('rejects a card the player does not hold', () => {
    const s = stateWithHands([[c(5, 'S')], [c(2, 'S')], [c(3, 'S')], [c(4, 'S')]], 'D');
    expect(() => playCard(s, 0, c(14, 'S'))).toThrow(/Illegal/);
  });

  it('rejects playing out of turn', () => {
    const s = stateWithHands([[c(5, 'S')], [c(2, 'S')], [c(3, 'S')], [c(4, 'S')]], 'D');
    expect(() => playCard(s, 1, c(2, 'S'))).toThrow(/turn/);
  });
});

describe('trick winner', () => {
  it('highest card of the led suit wins when no trump is played', () => {
    expect(
      trickWinner([play(0, c(5, 'S')), play(1, c(13, 'S')), play(2, c(14, 'H')), play(3, c(9, 'S'))], 'D'),
    ).toBe(1);
  });

  it('any trump beats the led suit; highest trump wins', () => {
    expect(
      trickWinner([play(0, c(14, 'S')), play(1, c(2, 'D')), play(2, c(5, 'D')), play(3, c(13, 'S'))], 'D'),
    ).toBe(2);
  });

  it('off-suit non-trump cards never win', () => {
    expect(
      trickWinner([play(0, c(2, 'S')), play(1, c(14, 'H')), play(2, c(14, 'C')), play(3, c(3, 'S'))], 'D'),
    ).toBe(3);
  });

  it('winner leads the next trick and captures the tens', () => {
    let s = stateWithHands(
      [[c(10, 'S'), c(2, 'C')], [c(3, 'S'), c(3, 'C')], [c(14, 'S'), c(4, 'C')], [c(10, 'H'), c(5, 'C')]],
      'D',
    );
    s = playCard(s, 0, c(10, 'S'));
    s = playCard(s, 1, c(3, 'S'));
    s = playCard(s, 2, c(14, 'S'));
    s = playCard(s, 3, c(10, 'H'));
    expect(s.phase).toBe('trickComplete');
    s = collectTrick(s);
    expect(s.turn).toBe(2);
    expect(s.tensWon).toEqual([2, 0]);
    expect(s.tricksWon).toEqual([1, 0]);
  });
});

describe('round result', () => {
  const P = SETTINGS.points;
  it('3 tens wins', () => {
    expect(computeRoundResult([3, 1], [5, 8], P)).toMatchObject({ winningTeam: 0, kind: 'normal', points: 1 });
    expect(computeRoundResult([1, 3], [9, 4], P)).toMatchObject({ winningTeam: 1, kind: 'normal' });
  });
  it('2–2 tens: more tricks wins', () => {
    expect(computeRoundResult([2, 2], [7, 6], P)).toMatchObject({ winningTeam: 0, kind: 'normal' });
    expect(computeRoundResult([2, 2], [6, 7], P)).toMatchObject({ winningTeam: 1, kind: 'normal' });
  });
  it('Kot: all four tens', () => {
    expect(computeRoundResult([0, 4], [3, 10], P)).toMatchObject({ winningTeam: 1, kind: 'kot', points: 2 });
  });
  it('Baunne: all 13 tricks', () => {
    expect(computeRoundResult([4, 0], [13, 0], P)).toMatchObject({ winningTeam: 0, kind: 'baunne', points: 3 });
  });
  it('uses configurable point values', () => {
    expect(computeRoundResult([0, 4], [3, 10], { normal: 1, kot: 5, baunne: 10 }).points).toBe(5);
  });
});

describe('bots', () => {
  it('choose the longest suit as trump, ties broken by high cards', () => {
    expect(botChooseTrump([c(2, 'H'), c(3, 'H'), c(14, 'S'), c(13, 'S'), c(4, 'D')])).toBe('S');
    expect(botChooseTrump([c(2, 'H'), c(3, 'H'), c(4, 'H'), c(14, 'S'), c(13, 'S')])).toBe('H');
  });

  it('throw a 10 onto a trick the partner is surely winning', () => {
    // seat 0 led A♠ (partner of seat 2), seat 1 followed; seat 2 has 10♠ and 2♠, seat 3 to play last.
    let s = stateWithHands(
      [[c(14, 'S')], [c(3, 'S')], [c(10, 'S'), c(2, 'S')], [c(4, 'S')]],
      'D',
    );
    s = playCard(s, 0, c(14, 'S'));
    s = playCard(s, 1, c(3, 'S'));
    expect(cardId(botChooseCard(s, 2))).toBe('10S');
  });

  it('avoid playing a 10 when the opponents could still win', () => {
    // seat 1 (opponent of 2) led 5♠; seat 2 could play 10♠ but A/K♠ are unseen → plays low.
    let s = stateWithHands(
      [[c(14, 'S')], [c(5, 'S')], [c(10, 'S'), c(2, 'S')], [c(13, 'S')]],
      'D',
      1,
    );
    s = playCard(s, 1, c(5, 'S'));
    expect(cardId(botChooseCard(s, 2))).toBe('2S');
  });

  it('capture with their own 10 when playing last', () => {
    let s = stateWithHands(
      [[c(9, 'S')], [c(5, 'S')], [c(4, 'S')], [c(10, 'S'), c(2, 'S'), c(14, 'S')]],
      'D',
    );
    s = playCard(s, 0, c(9, 'S'));
    s = playCard(s, 1, c(5, 'S'));
    s = playCard(s, 2, c(4, 'S'));
    expect(cardId(botChooseCard(s, 3))).toBe('10S');
  });

  it('always make legal moves over many full rounds, with consistent totals', () => {
    let s = newGame(SETTINGS, { rng: seeded(99) });
    let totalPoints = 0;
    for (let round = 0; round < 200; round++) {
      s = playRoundWithBots(s);
      expect(s.tricksWon[0] + s.tricksWon[1]).toBe(13);
      expect(s.tensWon[0] + s.tensWon[1]).toBe(4);
      expect(s.hands.every((h) => h.length === 0)).toBe(true);
      totalPoints += s.lastResult!.points;
      expect(s.score[0] + s.score[1]).toBe(totalPoints);
      s = nextRound(s, seeded(round + 1000));
    }
  });
});
