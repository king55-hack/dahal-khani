// Messages between the browser and the room server. Shared by both sides.
// Everything arriving from the network is validated here before anyone trusts it.

import { SUITS } from '../engine/cards';
import type { Card, PlayerView, Rank, Seat, Suit, TrumpMode } from '../engine';

/** First message on a new connection. The password travels here, never in the URL. */
export interface Hello {
  t: 'hello';
  name: string;
  token: string | null;
  password: string;
}

/**
 * Reactions and quick messages. Only these fixed ids can be sent — there is no free typing,
 * so nobody can tell their partner what cards they hold. Each player sees them in their own language.
 */
export const REACTIONS = ['like', 'laugh', 'sad', 'yess', 'fire', 'wow'] as const;
export const QUICK_MESSAGES = [
  'fast',
  'nicePlay',
  'good',
  'interesting',
  'wellDone',
  'lucky',
  'thanks',
  'sorry',
  'gg',
  'again',
] as const;
export type SayId = (typeof REACTIONS)[number] | (typeof QUICK_MESSAGES)[number];
const SAY_IDS: readonly string[] = [...REACTIONS, ...QUICK_MESSAGES];
export const isSayId = (v: unknown): v is SayId => typeof v === 'string' && SAY_IDS.includes(v);

export type ClientMsg =
  | { t: 'say'; id: SayId }
  /** leaving on purpose (not a dropped connection): frees the seat */
  | { t: 'leave' }
  /** host only: remove a player */
  | { t: 'kick'; seat: Seat }
  /** host only: close the room for everyone */
  | { t: 'close' }
  | { t: 'sit'; seat: Seat }
  | { t: 'mode'; mode: TrumpMode }
  | { t: 'start' }
  | { t: 'trump'; suit: Suit }
  | { t: 'play'; card: Card }
  | { t: 'next' };

export interface SeatPublic {
  name: string;
  bot: boolean;
  connected: boolean;
}

export type ErrorCode =
  | 'not_found'
  | 'room_full'
  | 'wrong_password'
  | 'too_many_attempts'
  | 'room_closed'
  | 'kicked'
  | 'bad_request'
  | 'not_host'
  | 'illegal'
  | 'started'
  | 'rate_limited';

export type ServerMsg =
  | { t: 'welcome'; seat: Seat; token: string; code: string }
  | {
      t: 'room';
      code: string;
      name: string;
      locked: boolean;
      you: Seat;
      host: Seat | null;
      mode: TrumpMode;
      started: boolean;
      seats: (SeatPublic | null)[];
    }
  | { t: 'state'; view: PlayerView }
  | { t: 'say'; seat: Seat; id: SayId }
  | { t: 'error'; code: ErrorCode };

/** One row of the public room list. */
export interface RoomListing {
  code: string;
  name: string;
  /** needs a password */
  locked: boolean;
  /** humans currently connected */
  players: number;
  /** seats a newcomer can take (empty, or a bot's seat once the game runs) */
  free: number;
  started: boolean;
  mode: TrumpMode;
  updatedAt: number;
}

/** Body of POST /api/rooms */
export interface CreateRoomRequest {
  name: string;
  /** empty = public room without password */
  password: string;
}

/** Raw text the client sends to keep the connection alive; the server answers PONG without waking up. */
export const PING = 'ping';
export const PONG = 'pong';

export const MAX_MESSAGE_LENGTH = 1000;
export const NAME_MAX = 16;
export const ROOM_NAME_MAX = 24;
export const PASSWORD_MAX = 32;

/** Room numbers: 6 digits, easy to type on a phone keypad and to say aloud. */
export const ROOM_CODE_LENGTH = 6;
const CODE_RE = /^[0-9]{6}$/;

export function isRoomCode(v: unknown): v is string {
  return typeof v === 'string' && CODE_RE.test(v);
}

export function normalizeRoomCode(v: string): string {
  return v.replace(/[^0-9]/g, '').slice(0, ROOM_CODE_LENGTH);
}

export function randomRoomCode(randomInt: (max: number) => number): string {
  let code = String(1 + randomInt(9)); // no leading zero
  while (code.length < ROOM_CODE_LENGTH) code += String(randomInt(10));
  return code;
}

/** Trim, drop control/format characters and angle brackets, collapse spaces, limit length. */
export function cleanName(raw: unknown, fallback = 'Player', max = NAME_MAX): string {
  if (typeof raw !== 'string') return fallback;
  const name = raw
    .replace(/[\p{Cc}\p{Cf}<>]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
  return [...name].slice(0, max).join('') || fallback;
}

/** Passwords are kept as typed (no trimming), but must be printable and at most PASSWORD_MAX long. */
export function cleanPassword(raw: unknown): string | null {
  if (raw === undefined || raw === null || raw === '') return '';
  if (typeof raw !== 'string' || [...raw].length > PASSWORD_MAX || /[\p{Cc}]/u.test(raw)) return null;
  return raw;
}

const isSeat = (v: unknown): v is Seat => v === 0 || v === 1 || v === 2 || v === 3;
const isSuit = (v: unknown): v is Suit => SUITS.includes(v as Suit);
const isRank = (v: unknown): v is Rank => Number.isInteger(v) && (v as number) >= 2 && (v as number) <= 14;
const isMode = (v: unknown): v is TrumpMode => v === 'open' || v === 'bandHukum' || v === 'cutHukum';
const TOKEN_RE = /^[0-9a-f-]{36}$/;

function parseObject(raw: unknown): Record<string, unknown> | null {
  if (typeof raw !== 'string' || raw.length > MAX_MESSAGE_LENGTH) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function parseHello(raw: unknown): Hello | null {
  const m = parseObject(raw);
  if (!m || m.t !== 'hello') return null;
  const password = cleanPassword(m.password);
  if (password === null) return null;
  const token = typeof m.token === 'string' && TOKEN_RE.test(m.token) ? m.token : null;
  return { t: 'hello', name: cleanName(m.name), token, password };
}

export function parseCreateRoom(raw: unknown): CreateRoomRequest | null {
  const m = parseObject(raw);
  if (!m) return null;
  const password = cleanPassword(m.password);
  if (password === null) return null;
  return { name: cleanName(m.name, 'Dahal Khani', ROOM_NAME_MAX), password };
}

export function parseClientMsg(raw: unknown): ClientMsg | null {
  const m = parseObject(raw);
  if (!m) return null;
  switch (m.t) {
    case 'say':
      return isSayId(m.id) ? { t: 'say', id: m.id } : null;
    case 'leave':
      return { t: 'leave' };
    case 'close':
      return { t: 'close' };
    case 'kick':
      return isSeat(m.seat) ? { t: 'kick', seat: m.seat } : null;
    case 'sit':
      return isSeat(m.seat) ? { t: 'sit', seat: m.seat } : null;
    case 'mode':
      return isMode(m.mode) ? { t: 'mode', mode: m.mode } : null;
    case 'start':
      return { t: 'start' };
    case 'next':
      return { t: 'next' };
    case 'trump':
      return isSuit(m.suit) ? { t: 'trump', suit: m.suit } : null;
    case 'play': {
      const c = m.card as Record<string, unknown> | undefined;
      return c && typeof c === 'object' && isSuit(c.suit) && isRank(c.rank)
        ? { t: 'play', card: { suit: c.suit, rank: c.rank } }
        : null;
    }
    default:
      return null;
  }
}
