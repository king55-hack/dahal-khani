// Browser connection to the room server: create/join a room, reconnect automatically,
// keep the seat across reloads (a per-room token saved in this browser).
import {
  isRoomCode,
  PING,
  PONG,
  type ClientMsg,
  type CreateRoomRequest,
  type ErrorCode,
  type Hello,
  type RoomListing,
  type ServerMsg,
} from '../online/protocol';

/** Where the room server lives: set VITE_SERVER_URL at build time; in dev, the local wrangler server. */
export const SERVER_URL: string | null =
  (import.meta.env.VITE_SERVER_URL as string | undefined) ||
  (import.meta.env.DEV ? `${location.protocol}//${location.hostname}:8787` : null);

export type ConnStatus = 'connecting' | 'open' | 'reconnecting';
export type FatalReason = ErrorCode | 'network' | 'replaced';

export interface OnlineHandlers {
  onMessage(m: ServerMsg): void;
  onStatus(s: ConnStatus): void;
  /** The connection is over for good (room gone/full, or gave up reconnecting). */
  onFatal(reason: FatalReason): void;
}

const FATAL_ERRORS: ErrorCode[] = ['not_found', 'room_full', 'wrong_password', 'too_many_attempts', 'room_closed', 'kicked'];
const tokenKey = (code: string) => `dahal-khani:token:${code}`;
const PING_MS = 10_000;
const STALE_MS = 20_000;

function loadToken(code: string): string | null {
  try {
    return localStorage.getItem(tokenKey(code));
  } catch {
    return null;
  }
}

function saveToken(code: string, token: string) {
  try {
    localStorage.setItem(tokenKey(code), token);
  } catch {
    /* seat just won't survive a reload */
  }
}

export async function createRoom(server: string, req: CreateRoomRequest): Promise<string> {
  const res = await fetch(`${server}/api/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const { code } = (await res.json()) as { code?: unknown };
  if (!isRoomCode(code)) throw new Error('bad code');
  return code;
}

export async function listRooms(server: string): Promise<RoomListing[]> {
  const res = await fetch(`${server}/api/rooms`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const list = (await res.json()) as unknown;
  return Array.isArray(list) ? (list as RoomListing[]).filter((r) => isRoomCode(r?.code)) : [];
}

export class OnlineClient {
  private ws: WebSocket | null = null;
  private stopped = false;
  private retries = 0;
  private pingTimer: number | undefined;
  private seated = false;
  /** last time anything (including a pong) arrived — a silent socket is a dead socket */
  private lastHeard = 0;

  constructor(
    private readonly server: string,
    readonly code: string,
    private readonly name: string,
    /** only needed for the first join; afterwards the seat token is enough */
    private password: string,
    private readonly h: OnlineHandlers,
  ) {}

  connect() {
    if (this.stopped) return;
    const token = loadToken(this.code);
    this.h.onStatus(this.retries ? 'reconnecting' : 'connecting');
    const ws = new WebSocket(`${this.server.replace(/^http/, 'ws')}/api/rooms/${this.code}/ws`);
    this.ws = ws;

    ws.onopen = () => {
      this.retries = 0;
      this.lastHeard = Date.now();
      // name + password go in the first message, never in the URL
      ws.send(JSON.stringify({ t: 'hello', name: this.name, token, password: this.password } satisfies Hello));
      this.h.onStatus('open');
      clearInterval(this.pingTimer);
      // Heartbeat: phones switching Wi-Fi/4G can leave a socket "open" that delivers nothing.
      // Ping every 10 s; if nothing at all came back for 20 s, drop it and reconnect at once.
      this.pingTimer = window.setInterval(() => {
        if (ws !== this.ws || ws.readyState !== WebSocket.OPEN) return;
        if (Date.now() - this.lastHeard > STALE_MS) return this.dropAndReconnect();
        ws.send(PING);
      }, PING_MS);
    };
    ws.onmessage = (e) => {
      this.lastHeard = Date.now();
      if (e.data === PONG || typeof e.data !== 'string') return;
      let m: ServerMsg;
      try {
        m = JSON.parse(e.data) as ServerMsg;
      } catch {
        return;
      }
      if (m.t === 'welcome') {
        saveToken(this.code, m.token);
        this.seated = true;
        this.password = ''; // not kept around once we have a seat
      }
      // while joining, any refusal ends the attempt; once seated only a vanished room is final
      if (m.t === 'error' && (FATAL_ERRORS.includes(m.code) || !this.seated)) {
        this.stop();
        this.h.onFatal(m.code);
        return;
      }
      this.h.onMessage(m);
    };
    ws.onclose = (e) => {
      clearInterval(this.pingTimer);
      if (this.stopped || ws !== this.ws) return;
      if (e.code === 4001) {
        // this seat was opened in another tab/device
        this.stop();
        this.h.onFatal('replaced');
        return;
      }
      if (++this.retries > 8) {
        this.stop();
        this.h.onFatal('network');
        return;
      }
      this.h.onStatus('reconnecting');
      // first retry is immediate, then back off
      window.setTimeout(() => this.connect(), this.retries === 1 ? 0 : Math.min(1000 * 2 ** (this.retries - 2), 8_000));
    };
  }

  /** Forget the current socket (without waiting for the browser to notice it is dead) and connect again. */
  private dropAndReconnect() {
    if (this.stopped) return;
    const old = this.ws;
    this.ws = null; // its onclose is ignored from now on
    clearInterval(this.pingTimer);
    try {
      old?.close();
    } catch {
      /* already closed */
    }
    this.retries = 0;
    this.connect();
  }

  /**
   * Called when the game becomes visible again or the phone is back online:
   * reconnect right away if the socket is closed or has gone quiet.
   */
  wake() {
    if (this.stopped || !this.ws) return;
    const quiet = Date.now() - this.lastHeard > PING_MS + 2000;
    if (this.ws.readyState > WebSocket.OPEN || (this.ws.readyState === WebSocket.OPEN && quiet)) {
      this.dropAndReconnect();
    }
  }

  /** Returns false if the message could not be sent (not connected). */
  send(msg: ClientMsg): boolean {
    if (this.ws?.readyState !== WebSocket.OPEN) return false;
    this.ws.send(JSON.stringify(msg));
    return true;
  }

  /** Leave on purpose: tell the server so the seat is freed (not kept for a reconnect), then close. */
  leave() {
    this.send({ t: 'leave' });
    this.stop();
  }

  stop() {
    this.stopped = true;
    clearInterval(this.pingTimer);
    this.ws?.close(1000);
  }
}
