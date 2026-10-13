import { describe, expect, it } from 'vitest';
import { countOnline, isVisitorId, MAX_CONNECTIONS_PER_NETWORK, networkHasRoom } from './presence';

const v = (n: number) => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`;

describe('online counter', () => {
  it('counts each visitor once, even with several tabs open', () => {
    expect(countOnline([])).toBe(0);
    expect(
      countOnline([
        { visitor: v(1), net: 'a' },
        { visitor: v(1), net: 'a' }, // second tab
        { visitor: v(2), net: 'a' }, // someone else on the same Wi-Fi
        { visitor: v(3), net: 'b' },
      ]),
    ).toBe(3);
  });

  it('caps connections per network so the number cannot be inflated', () => {
    const many = Array.from({ length: MAX_CONNECTIONS_PER_NETWORK }, (_, i) => ({ visitor: v(i), net: 'x' }));
    expect(networkHasRoom(many, 'x')).toBe(false);
    expect(networkHasRoom(many, 'y')).toBe(true);
  });

  it('only accepts random visitor ids', () => {
    expect(isVisitorId(v(5))).toBe(true);
    expect(isVisitorId('rajan@example.com')).toBe(false);
    expect(isVisitorId(42)).toBe(false);
  });
});
