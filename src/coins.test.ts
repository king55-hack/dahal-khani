import { describe, expect, it } from 'vitest';
import { coinsFor } from './coins';
import { computeRoundResult } from './engine';
import { GAME_SETTINGS } from './settings';

const result = (tens: [number, number], tricks: [number, number]) =>
  computeRoundResult(tens, tricks, GAME_SETTINGS.points);

describe('coins', () => {
  it('lost with 2 Dahal (on tricks) → 5, any other loss → 0', () => {
    expect(coinsFor(result([2, 2], [6, 7]), 0)).toBe(5);
    expect(coinsFor(result([1, 3], [8, 5]), 0)).toBe(0);
    expect(coinsFor(result([0, 4], [5, 8]), 0)).toBe(0); // Kot against us
    expect(coinsFor(result([0, 4], [0, 13]), 0)).toBe(0); // Baunne against us
  });

  it('won on more tricks → 10, with 3 Dahal → 20', () => {
    expect(coinsFor(result([2, 2], [7, 6]), 0)).toBe(10);
    expect(coinsFor(result([3, 1], [5, 8]), 0)).toBe(20);
    expect(coinsFor(result([3, 1], [9, 4]), 0)).toBe(20);
  });

  it('Kot → 30, Baunne (all 52 cards) → 40', () => {
    expect(coinsFor(result([4, 0], [9, 4]), 0)).toBe(30);
    expect(coinsFor(result([4, 0], [13, 0]), 0)).toBe(40);
  });

  it('works from the other team’s side too', () => {
    expect(coinsFor(result([1, 3], [8, 5]), 1)).toBe(20);
    expect(coinsFor(result([2, 2], [7, 6]), 1)).toBe(5);
  });
});
