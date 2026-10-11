import { describe, expect, it } from 'vitest';
import {
  botChooseCard,
  botChooseTrump,
  cardId,
  rotateView,
  teamOf,
  viewFor,
  type GameState,
  type Seat,
} from '../engine';
import { hashPassword, verifyPassword } from './password';
import { cleanName, cleanPassword, parseClientMsg, parseCreateRoom, parseHello, isRoomCode, randomRoomCode } from './protocol';
import {
  createRoom,
  handle,
  join,
  listingFor,
  nextAutoAt,
  passwordAttemptAllowed,
  PASSWORD_TRIES,
  recordWrongPassword,
  roomMessage,
  runAuto,
  TIMING,
  type RoomData,
} from './room';

let tokenN = 0;
const token = () => `00000000-0000-0000-0000-${String(++tokenN).padStart(12, '0')}`;
const ALL = [true, true, true, true];

function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function lobbyWith(...names: string[]): { room: RoomData; seats: Seat[]; tokens: string[] } {
  const room = createRoom('123456', 0);
  const seats: Seat[] = [];
  const tokens: string[] = [];
  for (const n of names) {
    const r = join(room, n, null, token, 0);
    if ('error' in r) throw new Error(r.error);
    seats.push(r.seat);
    tokens.push(r.token);
  }
  return { room, seats, tokens };
}

describe('protocol', () => {
  it('validates client messages strictly', () => {
    expect(parseClientMsg('{"t":"play","card":{"suit":"H","rank":10}}')).toEqual({
      t: 'play',
      card: { suit: 'H', rank: 10 },
    });
    expect(parseClientMsg('{"t":"play","card":{"suit":"X","rank":10}}')).toBeNull();
    expect(parseClientMsg('{"t":"play","card":{"suit":"H","rank":15}}')).toBeNull();
    expect(parseClientMsg('{"t":"sit","seat":7}')).toBeNull();
    expect(parseClientMsg('{"t":"hack"}')).toBeNull();
    expect(parseClientMsg('not json')).toBeNull();
    expect(parseClientMsg('x'.repeat(5000))).toBeNull();
  });

  it('cleans player names', () => {
    expect(cleanName('  Rajan   Rimal ')).toBe('Rajan Rimal');
    expect(cleanName('<b>x</b>')).toBe('bx/b');
    expect(cleanName('a\u0000b‮c')).toBe('abc');
    expect(cleanName('x'.repeat(40))).toHaveLength(16);
    expect(cleanName('   ')).toBe('Player');
    expect(cleanName(42)).toBe('Player');
  });

  it('makes 6-digit room numbers without a leading zero', () => {
    for (let i = 0; i < 50; i++) {
      const code = randomRoomCode((max) => Math.floor(Math.random() * max));
      expect(isRoomCode(code)).toBe(true);
      expect(code[0]).not.toBe('0');
    }
    expect(isRoomCode('12345')).toBe(false);
    expect(isRoomCode('12a456')).toBe(false);
  });

  it('validates hello and create-room messages', () => {
    expect(parseHello('{"t":"hello","name":" Rajan ","token":null,"password":"abc"}')).toEqual({
      t: 'hello',
      name: 'Rajan',
      token: null,
      password: 'abc',
    });
    expect(parseHello('{"t":"hello","name":"x","token":"not-a-token","password":""}')!.token).toBeNull();
    expect(parseHello('{"t":"hello","name":"x","password":"' + 'p'.repeat(40) + '"}')).toBeNull();
    expect(parseCreateRoom('{"name":"<b>Party</b>","password":""}')).toEqual({ name: 'bParty/b', password: '' });
    expect(parseCreateRoom('{"name":"x","password":42}')).toBeNull();
    expect(cleanPassword('with space ')).toBe('with space ');
    expect(cleanPassword('bad')).toBeNull();
  });
});

describe('room passwords', () => {
  it('stores only a salted hash and verifies it', async () => {
    const stored = await hashPassword('dahal123');
    expect(JSON.stringify(stored)).not.toContain('dahal123');
    expect(await verifyPassword('dahal123', stored)).toBe(true);
    expect(await verifyPassword('dahal124', stored)).toBe(false);
    expect(await verifyPassword('', stored)).toBe(false);
    const again = await hashPassword('dahal123');
    expect(again.salt).not.toBe(stored.salt); // same password, different salt and hash
    expect(again.hash).not.toBe(stored.hash);
  });

  it('limits wrong guesses per room, then allows again after the window', () => {
    const room = createRoom('123456', 0);
    for (let i = 0; i < PASSWORD_TRIES; i++) {
      expect(passwordAttemptAllowed(room, 1000)).toBe(true);
      recordWrongPassword(room, 1000);
    }
    expect(passwordAttemptAllowed(room, 2000)).toBe(false);
    expect(passwordAttemptAllowed(room, 1000 + TIMING.passwordWindow + 1)).toBe(true);
  });

  it('room messages say whether a room is locked but never include the password', async () => {
    const room = createRoom('123456', 0, 'Rajan ko room', await hashPassword('secret'));
    join(room, 'Rajan', null, token, 0);
    const msg = roomMessage(room, 0, ALL);
    expect(msg).toMatchObject({ name: 'Rajan ko room', locked: true });
    expect(JSON.stringify(msg)).not.toMatch(/salt|hash|secret/);
  });
});

describe('room list', () => {
  it('lists rooms with someone connected and a free seat', () => {
    const { room } = lobbyWith('a', 'b');
    expect(listingFor(room, [true, false, true, false], 5)).toMatchObject({
      code: '123456',
      players: 2,
      free: 2,
      locked: false,
      started: false,
    });
    expect(listingFor(room, [false, false, false, false], 5)).toBeNull(); // nobody there
  });

  it('after the start, bot seats count as free; a full human table is not listed', () => {
    const { room } = lobbyWith('a', 'b');
    handle(room, 0, { t: 'start' }, ALL, 0, seeded(9));
    expect(listingFor(room, ALL, 5)).toMatchObject({ free: 2, started: true });
    const full = lobbyWith('a', 'b', 'c', 'd').room;
    expect(listingFor(full, ALL, 5)).toBeNull();
  });
});

describe('room lobby', () => {
  it('seats the first two players as partners and makes the first one host', () => {
    const { room, seats } = lobbyWith('Rajan', 'Sita');
    expect(seats).toEqual([0, 2]);
    expect(room.host).toBe(0);
    expect(teamOf(seats[0])).toBe(teamOf(seats[1]));
  });

  it('is full after four players', () => {
    const { room } = lobbyWith('a', 'b', 'c', 'd');
    expect(join(room, 'e', null, token, 0)).toEqual({ error: 'room_full' });
  });

  it('gives a reconnecting player their seat back', () => {
    const { room, tokens } = lobbyWith('a', 'b');
    expect(join(room, 'b again', tokens[1], token, 0)).toEqual({ seat: 2, token: tokens[1] });
    expect(room.seats[2]!.name).toBe('b again');
  });

  it('lets players change seat in the lobby; the host moves with them', () => {
    const { room } = lobbyWith('a', 'b');
    expect(handle(room, 0, { t: 'sit', seat: 1 }, ALL, 0)).toBeNull();
    expect(room.seats[0]).toBeNull();
    expect(room.seats[1]!.name).toBe('a');
    expect(room.host).toBe(1);
    expect(handle(room, 1, { t: 'sit', seat: 2 }, ALL, 0)).toBe('illegal'); // taken
  });

  it('only the host starts or changes mode, unless the host has left', () => {
    const { room } = lobbyWith('a', 'b');
    expect(handle(room, 2, { t: 'start' }, ALL, 0)).toBe('not_host');
    expect(handle(room, 2, { t: 'mode', mode: 'cutHukum' }, ALL, 0)).toBe('not_host');
    expect(handle(room, 2, { t: 'mode', mode: 'cutHukum' }, [false, true, true, true], 0)).toBeNull();
  });

  it('fills empty seats with bots on start', () => {
    const { room } = lobbyWith('a', 'b');
    expect(handle(room, 0, { t: 'start' }, ALL, 0, seeded(1))).toBeNull();
    expect(room.seats.map((s) => s!.bot)).toEqual([false, true, false, true]);
    expect(room.game!.phase).toBe('choosingTrump');
    expect(handle(room, 0, { t: 'sit', seat: 1 }, ALL, 0)).toBe('started');
  });

  it('lets a newcomer take over a bot seat mid-game', () => {
    const { room } = lobbyWith('a');
    handle(room, 0, { t: 'start' }, ALL, 0, seeded(1));
    const r = join(room, 'late', null, token, 0);
    expect(r).toMatchObject({ seat: 2 });
    expect(room.seats[2]).toMatchObject({ name: 'late', bot: false });
  });
});

describe('room game', () => {
  it('rejects moves out of turn and illegal cards', () => {
    const { room } = lobbyWith('a', 'b');
    handle(room, 0, { t: 'start' }, ALL, 0, seeded(2));
    expect(handle(room, 2, { t: 'trump', suit: 'S' }, ALL, 0)).toBe('illegal'); // not the chooser
    expect(handle(room, 0, { t: 'trump', suit: 'S' }, ALL, 0)).toBeNull();
    const notMine = room.game!.hands[1][0];
    expect(handle(room, 0, { t: 'play', card: notMine }, ALL, 0)).toBe('illegal');
  });

  it('bots, disconnected players and AFK players are moved automatically on time', () => {
    const { room } = lobbyWith('a', 'b');
    handle(room, 0, { t: 'start' }, ALL, 0, seeded(3));
    // seat 0 (human, connected) must choose trump: nothing happens until the AFK timeout
    expect(nextAutoAt(room, ALL)).toBe(TIMING.afk);
    expect(runAuto(room, ALL, TIMING.afk - 1)).toBe(false);
    // if they disconnect, a bot steps in quickly
    const away = [false, true, true, true];
    expect(nextAutoAt(room, away)).toBe(TIMING.disconnected);
    expect(runAuto(room, away, TIMING.disconnected)).toBe(true);
    expect(room.game!.phase).toBe('playing');
  });

  it('plays a full online round: two humans via messages, two bots automatically', () => {
    const { room } = lobbyWith('a', 'b');
    handle(room, 0, { t: 'start' }, ALL, 0, seeded(4));
    let now = 0;
    for (let steps = 0; room.game!.phase !== 'roundOver' && steps < 500; steps++) {
      const g: GameState = room.game!;
      now += 2000;
      const human = g.phase === 'choosingTrump' ? g.trumpChooser : g.turn;
      if (g.phase !== 'trickComplete' && !room.seats[human]!.bot) {
        // humans decide from their own redacted view only
        const view = viewFor(g, human);
        const msg =
          g.phase === 'choosingTrump'
            ? ({ t: 'trump', suit: botChooseTrump(view.hands[human]) } as const)
            : ({ t: 'play', card: botChooseCard(view, human) } as const);
        expect(handle(room, human, msg, ALL, now)).toBeNull();
      } else {
        expect(runAuto(room, ALL, now)).toBe(true);
      }
    }
    const g = room.game!;
    expect(g.phase).toBe('roundOver');
    expect(g.tricksWon[0] + g.tricksWon[1]).toBe(13);
    expect(handle(room, 2, { t: 'next' }, ALL, now)).toBeNull();
    expect(room.game!.roundNumber).toBe(2);
  });
});

describe('player views', () => {
  function startedGame(mode: 'open' | 'bandHukum' = 'open') {
    const { room } = lobbyWith('a', 'b');
    handle(room, 0, { t: 'mode', mode }, ALL, 0);
    handle(room, 0, { t: 'start' }, ALL, 0, seeded(5));
    handle(room, 0, { t: 'trump', suit: 'H' }, ALL, 0);
    return room.game!;
  }

  it('show only your own hand', () => {
    const g = startedGame();
    const v = viewFor(g, 2);
    expect(v.hands[2].map(cardId)).toEqual(g.hands[2].map(cardId));
    expect(v.hands[0]).toEqual([]);
    expect(v.hands[1]).toEqual([]);
    expect(v.handCounts).toEqual([13, 13, 13, 13]);
    expect(v.undealt).toEqual([]);
  });

  it('hide a band hukum trump from everyone but the chooser', () => {
    const g = startedGame('bandHukum');
    expect(viewFor(g, 0).trump).toBe('H');
    expect(viewFor(g, 1).trump).toBeNull();
    expect(viewFor(g, 2).trump).toBeNull();
  });

  it('rotate so you are at the bottom and your team is team 0', () => {
    const g = { ...startedGame(), tricksWon: [3, 5] as [number, number], score: [1, 4] as [number, number] };
    const v = rotateView(viewFor(g, 1), 1);
    expect(v.hands[0].map(cardId)).toEqual(g.hands[1].map(cardId));
    expect(v.tricksWon).toEqual([5, 3]);
    expect(v.score).toEqual([4, 1]);
    expect(v.trumpChooser).toBe(3); // server seat 0 is local seat 3 for the player in seat 1
    expect(v.turn).toBe(3);
  });
});
