// Room logic for online play: seats, host, lobby, and running the game with the rules engine.
// Pure TypeScript (no Cloudflare or browser APIs) so it can be unit-tested; server/worker.ts does the I/O.

import {
  botChooseCard,
  botChooseTrump,
  chooseTrump,
  collectTrick,
  newGame,
  nextRound,
  playCard,
  type GameState,
  type Rng,
  type Seat,
  type TrumpMode,
} from '../engine';
import { GAME_SETTINGS } from '../settings';
import type { PasswordHash } from './password';
import type { ClientMsg, ErrorCode, RoomListing, SeatPublic, ServerMsg } from './protocol';

export interface SeatInfo {
  name: string;
  /** Secret that lets a player reconnect to this seat; null for bots. */
  token: string | null;
  bot: boolean;
}

export interface RoomData {
  code: string;
  name: string;
  /** null = public room */
  password: PasswordHash | null;
  /** wrong-password attempts in the current window (brute-force protection) */
  failed: { count: number; since: number };
  seats: (SeatInfo | null)[];
  host: Seat | null;
  mode: TrumpMode;
  game: GameState | null;
  /** When the game last changed — automatic moves are timed from here. */
  since: number;
  lastActivity: number;
}

/** Bot names per seat (seat 2 is the partner of seat 0). */
export const BOT_NAMES = ['Hari', 'Gajendra', 'Sita', 'Ranjana'] as const;

export const TIMING = {
  bot: 800, // a bot's move
  botTrump: 1200, // a bot choosing trump
  trick: 1100, // a finished trick stays on the table
  disconnected: 1500, // a disconnected player's turn is played by a bot
  afk: 60_000, // a connected player who doesn't move for this long gets an automatic move
  idleExpiry: 6 * 60 * 60_000, // rooms are deleted after 6 hours without activity
  passwordWindow: 10 * 60_000, // at most PASSWORD_TRIES wrong passwords per 10 minutes
};
export const PASSWORD_TRIES = 10;

/** Seats are filled so the first two players are partners: 0, then 2, then 1, 3. */
const JOIN_ORDER: Seat[] = [0, 2, 1, 3];

export function createRoom(
  code: string,
  now: number,
  name = 'Dahal Khani',
  password: PasswordHash | null = null,
): RoomData {
  return {
    code,
    name,
    password,
    failed: { count: 0, since: now },
    seats: [null, null, null, null],
    host: null,
    mode: GAME_SETTINGS.trumpMode,
    game: null,
    since: now,
    lastActivity: now,
  };
}

export type JoinResult = { seat: Seat; token: string } | { error: ErrorCode };

export function join(
  room: RoomData,
  name: string,
  token: string | null,
  newToken: () => string,
  now: number,
  connected: readonly boolean[] = [true, true, true, true],
): JoinResult {
  room.lastActivity = now;
  // Reconnect: same token gets the same seat back.
  if (token) {
    const seat = room.seats.findIndex((s) => s?.token === token);
    if (seat >= 0) {
      room.seats[seat]!.name = name;
      return { seat: seat as Seat, token };
    }
  }
  const fresh = newToken();
  const take = (seat: Seat): JoinResult => {
    room.seats[seat] = { name, token: fresh, bot: false };
    if (room.host === null) room.host = seat;
    return { seat, token: fresh };
  };
  if (!room.game) {
    const free = JOIN_ORDER.find((s) => room.seats[s] === null);
    if (free !== undefined) return take(free);
    // Lobby full: a newcomer may take the seat of someone who has gone offline.
    const away = JOIN_ORDER.find((s) => room.seats[s] && !room.seats[s]!.bot && !connected[s]);
    if (away === undefined) return { error: 'room_full' };
    if (room.host === away) room.host = null;
    return take(away);
  }
  // Game already running: a newcomer may take over a bot's seat.
  const botSeat = JOIN_ORDER.find((s) => room.seats[s]?.bot);
  return botSeat === undefined ? { error: 'room_full' } : take(botSeat);
}

/**
 * Someone left on purpose or was removed. In the lobby the seat becomes free; during a game a bot
 * takes it over (so the round can go on and a newcomer can later take that seat).
 */
export function vacate(room: RoomData, seat: Seat) {
  room.seats[seat] = room.game ? { name: BOT_NAMES[seat], token: null, bot: true } : null;
  if (room.host === seat) {
    const next = JOIN_ORDER.find((s) => room.seats[s] && !room.seats[s]!.bot);
    room.host = next ?? null;
  }
}

/** The host may act; if the host is gone, any connected human may. */
export function canHost(room: RoomData, seat: Seat, connected: readonly boolean[]): boolean {
  return room.host === seat || room.host === null || !connected[room.host];
}

/** Apply one player's message. Returns an error code, or null on success. */
export function handle(
  room: RoomData,
  seat: Seat,
  msg: ClientMsg,
  connected: readonly boolean[],
  now: number,
  rng: Rng = Math.random,
): ErrorCode | null {
  room.lastActivity = now;
  const g = room.game;
  try {
    switch (msg.t) {
      case 'say':
        return null; // chat is relayed by the server glue; it never changes the room
      case 'leave':
        vacate(room, seat);
        return null;
      case 'kick': {
        if (!canHost(room, seat, connected)) return 'not_host';
        const target = room.seats[msg.seat];
        if (msg.seat === seat || !target || target.bot) return 'illegal';
        vacate(room, msg.seat);
        return null;
      }
      case 'close':
        // the server glue does the actual closing once this says the player may
        return canHost(room, seat, connected) ? null : 'not_host';
      case 'sit': {
        if (g) return 'started';
        if (room.seats[msg.seat] !== null) return 'illegal';
        room.seats[msg.seat] = room.seats[seat];
        room.seats[seat] = null;
        if (room.host === seat) room.host = msg.seat;
        return null;
      }
      case 'mode':
        if (g) return 'started';
        if (!canHost(room, seat, connected)) return 'not_host';
        room.mode = msg.mode;
        return null;
      case 'start': {
        if (g) return 'started';
        if (!canHost(room, seat, connected)) return 'not_host';
        room.host = seat;
        for (let s = 0; s < 4; s++) {
          if (room.seats[s] === null) room.seats[s] = { name: BOT_NAMES[s], token: null, bot: true };
        }
        room.game = newGame({ ...GAME_SETTINGS, trumpMode: room.mode }, { rng, firstDealer: 3 });
        room.since = now;
        return null;
      }
      case 'trump':
        if (!g) return 'illegal';
        room.game = chooseTrump(g, seat, msg.suit);
        room.since = now;
        return null;
      case 'play':
        if (!g) return 'illegal';
        room.game = playCard(g, seat, msg.card);
        room.since = now;
        return null;
      case 'next':
        if (!g || g.phase !== 'roundOver') return 'illegal';
        room.game = nextRound(g, rng);
        room.since = now;
        return null;
    }
  } catch {
    return 'illegal'; // the engine rejected the move
  }
}

/** Whose decision the game is waiting for, if anyone's. */
function actor(g: GameState): Seat | null {
  if (g.phase === 'choosingTrump') return g.trumpChooser;
  if (g.phase === 'playing') return g.turn;
  return null;
}

/** When the next automatic step (bot move, trick collection, AFK move) is due, or null. */
export function nextAutoAt(room: RoomData, connected: readonly boolean[]): number | null {
  const g = room.game;
  if (!g) return null;
  if (g.phase === 'trickComplete') return room.since + TIMING.trick;
  const seat = actor(g);
  if (seat === null) return null;
  const info = room.seats[seat];
  if (!info || info.bot) return room.since + (g.phase === 'choosingTrump' ? TIMING.botTrump : TIMING.bot);
  return room.since + (connected[seat] ? TIMING.afk : TIMING.disconnected);
}

/** Perform the automatic step if it is due. Returns true if the game changed. */
export function runAuto(room: RoomData, connected: readonly boolean[], now: number): boolean {
  const at = nextAutoAt(room, connected);
  const g = room.game;
  if (at === null || !g || now < at) return false;
  if (g.phase === 'trickComplete') room.game = collectTrick(g);
  else if (g.phase === 'choosingTrump') {
    room.game = chooseTrump(g, g.trumpChooser, botChooseTrump(g.hands[g.trumpChooser]));
  } else room.game = playCard(g, g.turn, botChooseCard(g, g.turn));
  room.since = now;
  return true;
}

export function roomMessage(room: RoomData, you: Seat, connected: readonly boolean[]): ServerMsg {
  const seats: (SeatPublic | null)[] = room.seats.map((s, i) =>
    s ? { name: s.name, bot: s.bot, connected: s.bot || connected[i] } : null,
  );
  return {
    t: 'room',
    code: room.code,
    name: room.name,
    locked: room.password !== null,
    you,
    host: room.host,
    mode: room.mode,
    started: room.game !== null,
    seats,
  };
}

/** May another password guess be checked now? */
export function passwordAttemptAllowed(room: RoomData, now: number): boolean {
  if (now - room.failed.since > TIMING.passwordWindow) room.failed = { count: 0, since: now };
  return room.failed.count < PASSWORD_TRIES;
}

export function recordWrongPassword(room: RoomData, now: number) {
  if (now - room.failed.since > TIMING.passwordWindow) room.failed = { count: 0, since: now };
  room.failed.count++;
}

/** How the room appears in the public list, or null if nobody could join it right now. */
export function listingFor(room: RoomData, connected: readonly boolean[], now: number): RoomListing | null {
  const players = room.seats.filter((s, i) => s && !s.bot && connected[i]).length;
  const free = room.seats.filter((s) => (room.game ? s?.bot : s === null)).length;
  if (players === 0 || free === 0) return null;
  return {
    code: room.code,
    name: room.name,
    locked: room.password !== null,
    players,
    free,
    started: room.game !== null,
    mode: room.mode,
    updatedAt: now,
  };
}
