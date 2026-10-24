import { describe, expect, it } from 'vitest';
import {
  botChooseCard,
  botChooseTrump,
  cardId,
  chooseTrump,
  collectTrick,
  legalCards,
  newGame,
  playCard,
  smartChooseCard,
  type Brain,
  type Card,
  type GameSettings,
  type GameState,
  type Rank,
  type Seat,
  type Suit,
  type TrumpMode,
} from './index';

const settings = (trumpMode: TrumpMode): GameSettings => ({ trumpMode, points: { normal: 1, kot: 2, baunne: 3 } });

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
/** Tiny brains so the tests stay fast and repeatable (no clock cut-off). */
const quick = (memoryTricks: number): Brain => ({ memoryTricks, samples: 6, budgetMs: Infinity });

function toFirstPlay(mode: TrumpMode, seed: number): GameState {
  let s = newGame(settings(mode), { rng: seeded(seed) });
  if (s.phase === 'choosingTrump') s = chooseTrump(s, s.trumpChooser, botChooseTrump(s.hands[s.trumpChooser]));
  return s;
}

describe('medium and hard bots', () => {
  for (const mode of ['open', 'bandHukum', 'cutHukum'] as const) {
    for (const [name, memory] of [['medium', 3], ['hard', Infinity]] as const) {
      it(`${name} bots play a whole ${mode} round legally`, () => {
        const rng = seeded(7);
        let s = toFirstPlay(mode, 11);
        while (s.phase !== 'roundOver') {
          if (s.phase === 'trickComplete') s = collectTrick(s);
          else {
            const card = smartChooseCard(s, s.turn, quick(memory), rng);
            expect(legalCards(s, s.turn).map(cardId)).toContain(cardId(card));
            s = playCard(s, s.turn, card);
          }
        }
        expect(s.completedTricks).toHaveLength(13);
      });
    }
  }

  it('botChooseCard defaults to the original easy bot and accepts every level', () => {
    const s = toFirstPlay('open', 3);
    const easy = botChooseCard(s, s.turn);
    expect(cardId(botChooseCard(s, s.turn, 'easy'))).toBe(cardId(easy));
    for (const level of ['medium', 'hard'] as const) {
      const card = botChooseCard(s, s.turn, level, seeded(5));
      expect(legalCards(s, s.turn).map(cardId)).toContain(cardId(card));
    }
  });

  it('never looks at the other hands: shuffling them changes nothing', () => {
    // play a few tricks first so there is history to remember
    let s = toFirstPlay('open', 21);
    for (let i = 0; i < 20; i++) {
      s = s.phase === 'trickComplete' ? collectTrick(s) : playCard(s, s.turn, botChooseCard(s, s.turn));
    }
    while (s.phase === 'trickComplete') s = collectTrick(s);
    const me = s.turn;
    const others = ([0, 1, 2, 3] as Seat[]).filter((x) => x !== me);
    // swap the hands of two other seats that hold the same number of cards
    const [a, b] = others.filter((x) => s.hands[x].length === s.hands[others[0]].length);
    expect(b).toBeDefined();
    const swapped = structuredClone(s);
    swapped.hands[a] = s.hands[b];
    swapped.hands[b] = s.hands[a];
    for (const memory of [3, Infinity]) {
      const one = smartChooseCard(s, me, quick(memory), seeded(99));
      const two = smartChooseCard(swapped, me, quick(memory), seeded(99));
      expect(cardId(two)).toBe(cardId(one));
    }
  });

  it('feeds a Dahal to a partner who is certain to win the trick', () => {
    const base = newGame(settings('open'), { rng: seeded(1) });
    const hand0 = [c(10, 'H'), c(2, 'H'), c(3, 'C')];
    const s: GameState = {
      ...base,
      phase: 'playing',
      hands: [hand0, [], [], []] as GameState['hands'],
      trump: 'S',
      trumpRevealed: true,
      turn: 0,
      leader: 1,
      currentTrick: [
        { seat: 1, card: c(5, 'H') },
        { seat: 2, card: c(13, 'H') },
        { seat: 3, card: c(4, 'H') },
      ],
    };
    for (const memory of [3, Infinity]) {
      expect(cardId(smartChooseCard(s, 0, quick(memory), seeded(4)))).toBe('10H');
    }
  });

  it('takes a trick with a 10 in it when it can win it safely as last player', () => {
    const base = newGame(settings('open'), { rng: seeded(1) });
    const s: GameState = {
      ...base,
      phase: 'playing',
      hands: [[c(14, 'D'), c(3, 'D')], [], [], []] as GameState['hands'],
      trump: 'S',
      trumpRevealed: true,
      turn: 0,
      leader: 1,
      currentTrick: [
        { seat: 1, card: c(10, 'D') },
        { seat: 2, card: c(5, 'D') },
        { seat: 3, card: c(9, 'D') },
      ],
    };
    for (const memory of [3, Infinity]) {
      expect(cardId(smartChooseCard(s, 0, quick(memory), seeded(4)))).toBe('AD');
    }
  });
});
