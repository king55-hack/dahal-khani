// "🟢 N online": how many people have the game open right now.
// Each browser sends a random visitor id (no personal data), so several tabs count once.
// A per-network cap stops one person from inflating the number by opening many connections.

export interface PresenceConn {
  visitor: string;
  /** salted hash of the network address — only used for the cap, never stored or shown */
  net: string;
}

export const MAX_CONNECTIONS_PER_NETWORK = 12;
const VISITOR_RE = /^[0-9a-f-]{36}$/;

export const isVisitorId = (v: unknown): v is string => typeof v === 'string' && VISITOR_RE.test(v);

/** Number of distinct visitors among the open connections. */
export function countOnline(conns: readonly PresenceConn[]): number {
  return new Set(conns.map((c) => c.visitor)).size;
}

/** May one more connection from this network be accepted? */
export function networkHasRoom(conns: readonly PresenceConn[], net: string): boolean {
  return conns.filter((c) => c.net === net).length < MAX_CONNECTIONS_PER_NETWORK;
}

/** Message the server sends to every open page. */
export interface PresenceMsg {
  t: 'presence';
  online: number;
}
