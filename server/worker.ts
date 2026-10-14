// Cloudflare Worker + Durable Objects for online rooms.
// - RoomDO: one per room number; holds the room and runs the rules engine, so every move is checked
//   on the server. WebSockets use the hibernation API, so idle rooms cost nothing.
// - LobbyDO: a single directory of joinable rooms for the public room list.
// - PresenceDO: counts how many people have the game open ("🟢 N online").
// - FeedbackDO: problem reports / ideas / thanks for the creator, read with an admin key.

import { DurableObject } from 'cloudflare:workers';
import { viewFor, type Seat } from '../src/engine';
import { feedbackAllowed, parseFeedback, sameSecret, type FeedbackEntry } from '../src/online/feedback';
import { hashPassword, verifyPassword } from '../src/online/password';
import {
  countOnline,
  isVisitorId,
  networkHasRoom,
  type PresenceConn,
  type PresenceMsg,
} from '../src/online/presence';
import {
  isRoomCode,
  MAX_MESSAGE_LENGTH,
  parseClientMsg,
  parseCreateRoom,
  parseHello,
  PING,
  PONG,
  randomRoomCode,
  type ErrorCode,
  type RoomListing,
  type ServerMsg,
} from '../src/online/protocol';
import {
  createRoom,
  handle,
  join,
  listingFor,
  nextAutoAt,
  passwordAttemptAllowed,
  recordWrongPassword,
  roomMessage,
  runAuto,
  TIMING,
  type RoomData,
} from '../src/online/room';

export interface Env {
  ROOMS: DurableObjectNamespace<RoomDO>;
  LOBBY: DurableObjectNamespace<LobbyDO>;
  PRESENCE: DurableObjectNamespace<PresenceDO>;
  FEEDBACK: DurableObjectNamespace<FeedbackDO>;
  /** secret (wrangler secret put ADMIN_KEY): lets the creator read feedback */
  ADMIN_KEY?: string;
  /** Comma-separated list of sites allowed to connect, e.g. "https://king55-hack.github.io". */
  ALLOWED_ORIGINS: string;
}

interface Attachment {
  /** null until the player has sent a valid hello */
  seat: Seat | null;
  /** simple rate limit: messages in the current 10 s window */
  count: number;
  windowStart: number;
  /** last reaction/quick message, for a per-player cooldown */
  lastSay?: number;
}

const RATE_WINDOW_MS = 10_000;
const RATE_MAX = 40;
const SAY_COOLDOWN_MS = 1500;
const LIST_LIMIT = 30;
const LIST_MAX_AGE = 2 * 60 * 60_000;

function originAllowed(origin: string | null, env: Env): boolean {
  if (!origin) return false;
  const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);
  if (allowed.includes(origin)) return true;
  // local development (laptop, or a phone on the same Wi-Fi)
  return /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin);
}

function corsHeaders(origin: string | null, env: Env): Record<string, string> {
  return originAllowed(origin, env)
    ? {
        'Access-Control-Allow-Origin': origin!,
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        Vary: 'Origin',
      }
    : {};
}

const randomInt = (max: number) => crypto.getRandomValues(new Uint32Array(1))[0] % max;
const lobby = (env: Env) => env.LOBBY.get(env.LOBBY.idFromName('lobby'));

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const origin = req.headers.get('Origin');
    const cors = corsHeaders(origin, env);

    if (url.pathname === '/api/rooms') {
      if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
      if (!originAllowed(origin, env)) return new Response('Forbidden', { status: 403 });

      // Public room list
      if (req.method === 'GET') {
        const res = await lobby(env).fetch('https://lobby/list');
        return new Response(res.body, { headers: { ...cors, 'Content-Type': 'application/json' } });
      }

      // Create a room: pick an unused number.
      if (req.method === 'POST') {
        const body = await req.text();
        if (body.length > MAX_MESSAGE_LENGTH || !parseCreateRoom(body)) {
          return new Response('Bad request', { status: 400, headers: cors });
        }
        for (let attempt = 0; attempt < 5; attempt++) {
          const code = randomRoomCode(randomInt);
          const res = await env.ROOMS.get(env.ROOMS.idFromName(code)).fetch(`https://room/init?code=${code}`, {
            method: 'POST',
            body,
          });
          if (res.ok) return Response.json({ code }, { headers: cors });
        }
        return new Response('Try again', { status: 503, headers: cors });
      }
    }

    // Join a room over WebSocket.
    const m = /^\/api\/rooms\/([^/]+)\/ws$/.exec(url.pathname);
    if (m && isRoomCode(m[1])) {
      if (req.headers.get('Upgrade') !== 'websocket') return new Response('Expected WebSocket', { status: 426 });
      if (!originAllowed(origin, env)) return new Response('Forbidden', { status: 403 });
      return env.ROOMS.get(env.ROOMS.idFromName(m[1])).fetch(req);
    }

    // Feedback: players send, the creator reads with the admin key.
    if (url.pathname === '/api/feedback' || url.pathname === '/api/feedback/update') {
      if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
      if (!originAllowed(origin, env)) return new Response('Forbidden', { status: 403 });
      const box = env.FEEDBACK.get(env.FEEDBACK.idFromName('inbox'));
      if (url.pathname === '/api/feedback' && req.method === 'POST') {
        const body = await req.text();
        if (!parseFeedback(body)) return new Response('Bad request', { status: 400, headers: cors });
        const res = await box.fetch('https://feedback/add', {
          method: 'POST',
          body,
          headers: { 'X-Net': req.headers.get('CF-Connecting-IP') ?? 'unknown' },
        });
        return new Response(res.body, { status: res.status, headers: cors });
      }
      // everything else is for the creator only
      const key = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
      if (!env.ADMIN_KEY || !key || !sameSecret(key, env.ADMIN_KEY)) {
        return new Response('Unauthorized', { status: 401, headers: cors });
      }
      const path = url.pathname === '/api/feedback' ? '/list' : '/update';
      const res = await box.fetch(`https://feedback${path}`, { method: req.method, body: req.method === 'POST' ? await req.text() : undefined });
      return new Response(res.body, { status: res.status, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    // Live "N online" counter.
    if (url.pathname === '/api/presence') {
      if (req.headers.get('Upgrade') !== 'websocket') return new Response('Expected WebSocket', { status: 426 });
      if (!originAllowed(origin, env)) return new Response('Forbidden', { status: 403 });
      return env.PRESENCE.get(env.PRESENCE.idFromName('global')).fetch(req);
    }

    if (url.pathname === '/') return new Response('Dahal Khani room server');
    return new Response('Not found', { status: 404 });
  },
};

export class RoomDO extends DurableObject<Env> {
  private room: RoomData | null = null;
  /** last listing sent to the lobby (avoid needless updates) */
  private lastListing = '';

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair(PING, PONG));
    ctx.blockConcurrencyWhile(async () => {
      this.room = (await ctx.storage.get<RoomData>('room')) ?? null;
    });
  }

  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === '/init') {
      const code = url.searchParams.get('code');
      const create = parseCreateRoom(await req.text());
      if (this.room || !isRoomCode(code) || !create) return new Response('Exists', { status: 409 });
      const password = create.password ? await hashPassword(create.password) : null;
      this.room = createRoom(code, Date.now(), create.name, password);
      await this.save();
      await this.schedule();
      return new Response('ok');
    }

    const pair = new WebSocketPair();
    const [client, server] = [pair[0], pair[1]];
    if (!this.room) {
      server.accept();
      server.send(JSON.stringify({ t: 'error', code: 'not_found' } satisfies ServerMsg));
      server.close(4000, 'not_found');
      return new Response(null, { status: 101, webSocket: client });
    }
    // The player is seated only after a valid "hello" (name + password) message.
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ seat: null, count: 0, windowStart: Date.now() } satisfies Attachment);
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, data: string | ArrayBuffer) {
    if (!this.room) return;
    if (typeof data !== 'string' || data.length > MAX_MESSAGE_LENGTH) return;
    const att = ws.deserializeAttachment() as Attachment;
    const now = Date.now();
    if (now - att.windowStart > RATE_WINDOW_MS) {
      att.windowStart = now;
      att.count = 0;
    }
    att.count++;
    ws.serializeAttachment(att);
    if (att.count > RATE_MAX) return this.sendError(ws, 'rate_limited');

    if (att.seat === null) return this.hello(ws, att, data, now);

    const msg = parseClientMsg(data);
    if (!msg) return this.sendError(ws, 'bad_request');
    if (msg.t === 'say') {
      // reactions are only relayed (never stored), with a short cooldown against spam
      if (now - (att.lastSay ?? 0) < SAY_COOLDOWN_MS) return;
      att.lastSay = now;
      ws.serializeAttachment(att);
      const out = JSON.stringify({ t: 'say', seat: att.seat, id: msg.id } satisfies ServerMsg);
      for (const p of this.seated()) p.ws.send(out);
      return;
    }
    // which sockets belong to a player about to be removed (looked up before the seat changes)
    const kickedSockets = msg.t === 'kick' ? this.seated().filter((p) => p.seat === msg.seat).map((p) => p.ws) : [];
    const error = handle(this.room, att.seat, msg, this.connected(), now);
    if (error) return this.sendError(ws, error);

    if (msg.t === 'close') return this.closeRoom();
    if (msg.t === 'leave') {
      ws.serializeAttachment({ ...att, seat: null }); // no longer seated
      ws.close(1000, 'left');
      return this.changed(ws);
    }
    for (const k of kickedSockets) {
      this.sendError(k, 'kicked');
      k.serializeAttachment({ ...(k.deserializeAttachment() as Attachment), seat: null });
      k.close(4004, 'kicked');
    }
    await this.changed(...kickedSockets);
  }

  /** Host closed the room: tell everyone, then delete it. */
  private async closeRoom() {
    for (const ws of this.ctx.getWebSockets()) {
      if (ws.readyState !== WebSocket.OPEN) continue;
      this.sendError(ws, 'room_closed');
      ws.close(4005, 'room_closed');
    }
    await this.updateLobby(null);
    this.room = null;
    await this.ctx.storage.deleteAll();
  }

  private async hello(ws: WebSocket, att: Attachment, data: string, now: number) {
    const room = this.room!;
    const hello = parseHello(data);
    const fail = async (code: ErrorCode) => {
      await this.save();
      this.sendError(ws, code);
      ws.close(4003, code);
    };
    if (!hello) return fail('bad_request');

    // A returning player (valid seat token) doesn't need the password again.
    const returning = hello.token !== null && room.seats.some((s) => s?.token === hello.token);
    if (room.password && !returning) {
      if (!passwordAttemptAllowed(room, now)) return fail('too_many_attempts');
      if (!(await verifyPassword(hello.password, room.password))) {
        recordWrongPassword(room, now);
        return fail('wrong_password');
      }
    }

    const result = join(room, hello.name, hello.token, () => crypto.randomUUID(), now, this.connected(ws));
    if ('error' in result) return fail(result.error);

    // A reconnecting player replaces their old connection.
    for (const other of this.ctx.getWebSockets()) {
      if (other !== ws && (other.deserializeAttachment() as Attachment | null)?.seat === result.seat) {
        other.close(4001, 'replaced');
      }
    }
    att.seat = result.seat;
    ws.serializeAttachment(att);
    ws.send(JSON.stringify({ t: 'welcome', seat: result.seat, token: result.token, code: room.code } satisfies ServerMsg));
    await this.changed();
  }

  async webSocketClose(ws: WebSocket) {
    await this.changed(ws);
  }

  async webSocketError(ws: WebSocket) {
    await this.changed(ws);
  }

  async alarm() {
    if (!this.room) return;
    const now = Date.now();
    if (now - this.room.lastActivity > TIMING.idleExpiry) {
      for (const ws of this.ctx.getWebSockets()) ws.close(4002, 'expired');
      await this.updateLobby(null);
      this.room = null;
      await this.ctx.storage.deleteAll();
      return;
    }
    if (runAuto(this.room, this.connected(), now)) await this.changed();
    else await this.schedule();
  }

  // ---------- helpers ----------

  private sendError(ws: WebSocket, code: ErrorCode) {
    ws.send(JSON.stringify({ t: 'error', code } satisfies ServerMsg));
  }

  /** Open sockets of seated players. */
  private seated(...except: WebSocket[]): { ws: WebSocket; seat: Seat }[] {
    const out: { ws: WebSocket; seat: Seat }[] = [];
    for (const ws of this.ctx.getWebSockets()) {
      if (except.includes(ws) || ws.readyState !== WebSocket.OPEN) continue;
      const seat = (ws.deserializeAttachment() as Attachment | null)?.seat;
      if (seat !== null && seat !== undefined) out.push({ ws, seat });
    }
    return out;
  }

  private connected(...except: WebSocket[]): boolean[] {
    const c = [false, false, false, false];
    for (const { seat } of this.seated(...except)) c[seat] = true;
    return c;
  }

  private async save() {
    if (this.room) await this.ctx.storage.put('room', this.room);
  }

  /** Save, tell everyone, update the public list, and set the alarm for the next automatic step. */
  private async changed(...closing: WebSocket[]) {
    if (!this.room) return;
    await this.save();
    const connected = this.connected(...closing);
    for (const { ws, seat } of this.seated(...closing)) {
      ws.send(JSON.stringify(roomMessage(this.room, seat, connected)));
      if (this.room.game) {
        ws.send(JSON.stringify({ t: 'state', view: viewFor(this.room.game, seat) } satisfies ServerMsg));
      }
    }
    await this.updateLobby(listingFor(this.room, connected, Date.now()));
    await this.schedule(...closing);
  }

  private async updateLobby(listing: RoomListing | null) {
    if (!this.room) return;
    // compare without the timestamp so we only write when something visible changed
    const key = listing ? JSON.stringify({ ...listing, updatedAt: 0 }) : '';
    if (key === this.lastListing) return;
    this.lastListing = key;
    await lobby(this.env).fetch('https://lobby/update', {
      method: 'POST',
      body: JSON.stringify({ code: this.room.code, listing }),
    });
  }

  private async schedule(...closing: WebSocket[]) {
    if (!this.room) return;
    const auto = nextAutoAt(this.room, this.connected(...closing));
    const expiry = this.room.lastActivity + TIMING.idleExpiry + 1000;
    await this.ctx.storage.setAlarm(Math.min(auto ?? expiry, expiry));
  }
}

/** Directory of joinable rooms (one instance, only reachable from RoomDO and the Worker). */
export class LobbyDO extends DurableObject<Env> {
  private rooms = new Map<string, RoomListing>();

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => {
      this.rooms = await ctx.storage.list<RoomListing>();
    });
  }

  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === '/update' && req.method === 'POST') {
      const { code, listing } = (await req.json()) as { code: string; listing: RoomListing | null };
      if (!isRoomCode(code)) return new Response('bad', { status: 400 });
      if (listing) {
        this.rooms.set(code, listing);
        await this.ctx.storage.put(code, listing);
      } else if (this.rooms.delete(code)) {
        await this.ctx.storage.delete(code);
      }
      return new Response('ok');
    }
    if (url.pathname === '/list') {
      const now = Date.now();
      const stale = [...this.rooms.values()].filter((r) => now - r.updatedAt > LIST_MAX_AGE).map((r) => r.code);
      for (const code of stale) this.rooms.delete(code);
      if (stale.length) await this.ctx.storage.delete(stale);
      const list = [...this.rooms.values()]
        .sort((a, b) => Number(a.started) - Number(b.started) || b.updatedAt - a.updatedAt)
        .slice(0, LIST_LIMIT);
      return Response.json(list);
    }
    return new Response('Not found', { status: 404 });
  }
}

/** Counts open pages. Connections sleep (hibernation) between updates, so this costs almost nothing. */
export class PresenceDO extends DurableObject<Env> {
  private salt = '';

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair(PING, PONG));
    ctx.blockConcurrencyWhile(async () => {
      this.salt = (await ctx.storage.get<string>('salt')) ?? crypto.randomUUID();
      await ctx.storage.put('salt', this.salt);
    });
  }

  async fetch(req: Request): Promise<Response> {
    const visitor = new URL(req.url).searchParams.get('v');
    if (!isVisitorId(visitor)) return new Response('Bad request', { status: 400 });
    // the network address is only hashed (with a secret salt) to cap connections per network
    const ip = req.headers.get('CF-Connecting-IP') ?? 'unknown';
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(this.salt + ip));
    const net = btoa(String.fromCharCode(...new Uint8Array(digest).slice(0, 12)));
    const conns = this.conns();
    if (!networkHasRoom(conns, net)) return new Response('Too many connections', { status: 429 });

    const pair = new WebSocketPair();
    const [client, server] = [pair[0], pair[1]];
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ visitor, net } satisfies PresenceConn);
    // the newcomer hears the number right away; everyone else on the next (throttled) update
    server.send(JSON.stringify({ t: 'presence', online: countOnline([...conns, { visitor, net }]) } satisfies PresenceMsg));
    await this.soon();
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage() {
    /* clients only send pings, answered automatically */
  }

  async webSocketClose() {
    await this.soon();
  }

  async webSocketError() {
    await this.soon();
  }

  /** Tell everyone the new number shortly (many joins/leaves together become one update). */
  private async soon() {
    if ((await this.ctx.storage.getAlarm()) === null) await this.ctx.storage.setAlarm(Date.now() + 1500);
  }

  async alarm() {
    const sockets = this.ctx.getWebSockets().filter((ws) => ws.readyState === WebSocket.OPEN);
    const msg = JSON.stringify({ t: 'presence', online: countOnline(this.conns()) } satisfies PresenceMsg);
    for (const ws of sockets) ws.send(msg);
  }

  private conns(): PresenceConn[] {
    return this.ctx
      .getWebSockets()
      .filter((ws) => ws.readyState === WebSocket.OPEN)
      .map((ws) => ws.deserializeAttachment() as PresenceConn)
      .filter((c): c is PresenceConn => !!c?.visitor);
  }
}

/** Stores feedback messages (newest kept, oldest dropped past MAX). Only reachable through the Worker. */
export class FeedbackDO extends DurableObject<Env> {
  private static readonly MAX = 2000;
  /** recent send times per network (hashed), for the spam guard — memory only */
  private recent = new Map<string, number[]>();

  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const now = Date.now();

    if (url.pathname === '/add') {
      const fb = parseFeedback(await req.text());
      if (!fb) return new Response('Bad request', { status: 400 });
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('fb:' + (req.headers.get('X-Net') ?? '')));
      const net = btoa(String.fromCharCode(...new Uint8Array(digest).slice(0, 12)));
      const times = (this.recent.get(net) ?? []).filter((t) => now - t < 3_600_000);
      if (!feedbackAllowed(times, now)) return new Response('Too many', { status: 429 });
      this.recent.set(net, [...times, now]);

      const id = `${now.toString(36)}-${crypto.randomUUID().slice(0, 8)}`;
      await this.ctx.storage.put(`fb:${String(now).padStart(15, '0')}:${id}`, { ...fb, id, at: now, read: false } satisfies FeedbackEntry);
      // keep the inbox bounded
      const keys = [...(await this.ctx.storage.list({ prefix: 'fb:' })).keys()];
      if (keys.length > FeedbackDO.MAX) await this.ctx.storage.delete(keys.slice(0, keys.length - FeedbackDO.MAX));
      return Response.json({ ok: true });
    }

    if (url.pathname === '/list') {
      const all = [...(await this.ctx.storage.list<FeedbackEntry>({ prefix: 'fb:', reverse: true, limit: 300 })).values()];
      return Response.json({ unread: all.filter((f) => !f.read).length, items: all });
    }

    if (url.pathname === '/update' && req.method === 'POST') {
      let body: { ids?: unknown; action?: unknown };
      try {
        body = (await req.json()) as typeof body;
      } catch {
        return new Response('Bad request', { status: 400 });
      }
      const ids = Array.isArray(body.ids) ? body.ids.filter((x): x is string => typeof x === 'string').slice(0, 300) : [];
      const entries = await this.ctx.storage.list<FeedbackEntry>({ prefix: 'fb:' });
      for (const [key, f] of entries) {
        if (!ids.includes(f.id)) continue;
        if (body.action === 'delete') await this.ctx.storage.delete(key);
        else if (body.action === 'read') await this.ctx.storage.put(key, { ...f, read: true });
      }
      return Response.json({ ok: true });
    }
    return new Response('Not found', { status: 404 });
  }
}
