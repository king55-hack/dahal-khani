// Browser connection to the room server: create/join a room, reconnect automatically,
// keep the seat across reloads (a per-room token saved in this browser).
import { isRoomCode, PING, PONG, type ClientMsg, type ErrorCode, type ServerMsg } from '../online/protocol';

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

const FATAL_ERRORS: ErrorCode[] = ['not_found', 'room_full'];
const tokenKey = (code: string) => `dahal-khani:token:${code}`;

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

export async function createRoom(server: string): Promise<string> {
  const res = await fetch(`${server}/api/rooms`, { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const { code } = (await res.json()) as { code?: unknown };
  if (!isRoomCode(code)) throw new Error('bad code');
  return code;
}

export class OnlineClient {
  private ws: WebSocket | null = null;
  private stopped = false;
  private retries = 0;
  private pingTimer: number | undefined;

  constructor(
    private readonly server: string,
    readonly code: string,
    private readonly name: string,
    private readonly h: OnlineHandlers,
  ) {}

  connect() {
    if (this.stopped) return;
    const token = loadToken(this.code);
    const url =
      `${this.server.replace(/^http/, 'ws')}/api/rooms/${this.code}/ws?name=${encodeURIComponent(this.name)}` +
      (token ? `&token=${encodeURIComponent(token)}` : '');
    this.h.onStatus(this.retries ? 'reconnecting' : 'connecting');
    const ws = new WebSocket(url);
    this.ws = ws;

    ws.onopen = () => {
      this.retries = 0;
      this.h.onStatus('open');
      clearInterval(this.pingTimer);
      this.pingTimer = window.setInterval(() => ws.readyState === WebSocket.OPEN && ws.send(PING), 25_000);
    };
    ws.onmessage = (e) => {
      if (e.data === PONG || typeof e.data !== 'string') return;
      let m: ServerMsg;
      try {
        m = JSON.parse(e.data) as ServerMsg;
      } catch {
        return;
      }
      if (m.t === 'welcome') saveToken(this.code, m.token);
      if (m.t === 'error' && FATAL_ERRORS.includes(m.code)) {
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
      window.setTimeout(() => this.connect(), Math.min(1000 * 2 ** (this.retries - 1), 10_000));
    };
  }

  /** Phones drop sockets in the background; reconnect right away when the game is visible again. */
  wake() {
    if (!this.stopped && this.ws && this.ws.readyState > WebSocket.OPEN) {
      this.retries = 0;
      this.connect();
    }
  }

  send(msg: ClientMsg) {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(msg));
  }

  stop() {
    this.stopped = true;
    clearInterval(this.pingTimer);
    this.ws?.close(1000);
  }
}
