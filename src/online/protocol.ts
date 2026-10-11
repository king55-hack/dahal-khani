// Messages between the browser and the room server. Shared by both sides.
// Everything arriving from the network is validated here before anyone trusts it.

import { SUITS } from '../engine/cards';
import type { Card, PlayerView, Rank, Seat, Suit, TrumpMode } from '../engine';

export type ClientMsg =
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
      you: Seat;
      host: Seat | null;
      mode: TrumpMode;
      started: boolean;
      seats: (SeatPublic | null)[];
    }
  | { t: 'state'; view: PlayerView }
  | { t: 'error'; code: ErrorCode };

/** Raw text the client sends to keep the connection alive; the server answers PONG without waking up. */
export const PING = 'ping';
export const PONG = 'pong';

export const MAX_MESSAGE_LENGTH = 1000;
export const NAME_MAX = 16;

// No I, O, 0, 1 — easy to read aloud and type on a phone.
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const ROOM_CODE_LENGTH = 5;
const CODE_RE = new RegExp(`^[${ROOM_CODE_ALPHABET}]{${ROOM_CODE_LENGTH}}$`);

export function isRoomCode(v: unknown): v is string {
  return typeof v === 'string' && CODE_RE.test(v);
}

export function normalizeRoomCode(v: string): string {
  return v.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function randomRoomCode(randomInt: (max: number) => number): string {
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) code += ROOM_CODE_ALPHABET[randomInt(ROOM_CODE_ALPHABET.length)];
  return code;
}

/** Trim, drop control/format characters and angle brackets, collapse spaces, limit length. */
export function cleanName(raw: unknown, fallback = 'Player'): string {
  if (typeof raw !== 'string') return fallback;
  const name = raw
    .replace(/[\p{Cc}\p{Cf}<>]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
  return [...name].slice(0, NAME_MAX).join('') || fallback;
}

const isSeat = (v: unknown): v is Seat => v === 0 || v === 1 || v === 2 || v === 3;
const isSuit = (v: unknown): v is Suit => SUITS.includes(v as Suit);
const isRank = (v: unknown): v is Rank => Number.isInteger(v) && (v as number) >= 2 && (v as number) <= 14;
const isMode = (v: unknown): v is TrumpMode => v === 'open' || v === 'bandHukum' || v === 'cutHukum';

export function parseClientMsg(raw: unknown): ClientMsg | null {
  if (typeof raw !== 'string' || raw.length > MAX_MESSAGE_LENGTH) return null;
  let m: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    m = parsed as Record<string, unknown>;
  } catch {
    return null;
  }
  switch (m.t) {
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
