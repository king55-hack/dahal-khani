// Keeps one tiny connection open to the server's online counter and reports the number.
import { PING } from '../online/protocol';
import type { PresenceMsg } from '../online/presence';

const VISITOR_KEY = 'dahal-khani:visitor';

/** A random id per browser (no personal data) so several open tabs count as one person. */
function visitorId(): string {
  try {
    const saved = localStorage.getItem(VISITOR_KEY);
    if (saved && /^[0-9a-f-]{36}$/.test(saved)) return saved;
    const fresh = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, fresh);
    return fresh;
  } catch {
    return crypto.randomUUID();
  }
}

export function startPresence(server: string, onCount: (online: number | null) => void) {
  const url = `${server.replace(/^http/, 'ws')}/api/presence?v=${visitorId()}`;
  let ws: WebSocket | null = null;
  let retry = 0;
  let ping: number | undefined;
  let reconnectTimer: number | undefined;

  const connect = () => {
    clearTimeout(reconnectTimer);
    try {
      ws = new WebSocket(url);
    } catch {
      return schedule();
    }
    const sock = ws;
    sock.onopen = () => {
      retry = 0;
      clearInterval(ping);
      ping = window.setInterval(() => sock.readyState === WebSocket.OPEN && sock.send(PING), 30_000);
    };
    sock.onmessage = (e) => {
      if (typeof e.data !== 'string' || e.data === 'pong') return;
      try {
        const m = JSON.parse(e.data) as PresenceMsg;
        if (m.t === 'presence' && Number.isInteger(m.online) && m.online >= 0) onCount(m.online);
      } catch {
        /* ignore */
      }
    };
    sock.onclose = () => {
      clearInterval(ping);
      if (sock === ws) {
        onCount(null); // unknown while disconnected
        schedule();
      }
    };
  };

  const schedule = () => {
    retry++;
    reconnectTimer = window.setTimeout(connect, Math.min(2000 * 2 ** (retry - 1), 30_000));
  };

  // phones drop background connections — reconnect as soon as the game is visible again
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && (!ws || ws.readyState > WebSocket.OPEN)) {
      retry = 0;
      connect();
    }
  });

  connect();
}
