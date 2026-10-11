// Cloudflare Worker + Durable Objects for online rooms.
// - RoomDO: one per room number; holds the room and runs the rules engine, so every move is checked
//   on the server. WebSockets use the hibernation API, so idle rooms cost nothing.
// - LobbyDO: a single directory of joinable rooms for the public room list.

import { DurableObject } from 'cloudflare:workers';
import { viewFor, type Seat } from '../src/engine';
import { hashPassword, verifyPassword } from '../src/online/password';
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
  /** Comma-separated list of sites allowed to connect, e.g. "https://king55-hack.github.io". */
  ALLOWED_ORIGINS: string;
}

interface Attachment {
  /** null until the player has sent a valid hello */
  seat: Seat | null;
  /** simple rate limit: messages in the current 10 s window */
  count: number;
  windowStart: number;
}

const RATE_WINDOW_MS = 10_000;
const RATE_MAX = 40;
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
        'Access-Control-Allow-Headers': 'Content-Type',
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
    const error = handle(this.room, att.seat, msg, this.connected(), now);
    if (error) return this.sendError(ws, error);
    await this.changed();
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

    const result = join(room, hello.name, hello.token, () => crypto.randomUUID(), now);
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
  private seated(except?: WebSocket): { ws: WebSocket; seat: Seat }[] {
    const out: { ws: WebSocket; seat: Seat }[] = [];
    for (const ws of this.ctx.getWebSockets()) {
      if (ws === except || ws.readyState !== WebSocket.OPEN) continue;
      const seat = (ws.deserializeAttachment() as Attachment | null)?.seat;
      if (seat !== null && seat !== undefined) out.push({ ws, seat });
    }
    return out;
  }

  private connected(except?: WebSocket): boolean[] {
    const c = [false, false, false, false];
    for (const { seat } of this.seated(except)) c[seat] = true;
    return c;
  }

  private async save() {
    if (this.room) await this.ctx.storage.put('room', this.room);
  }

  /** Save, tell everyone, update the public list, and set the alarm for the next automatic step. */
  private async changed(closing?: WebSocket) {
    if (!this.room) return;
    await this.save();
    const connected = this.connected(closing);
    for (const { ws, seat } of this.seated(closing)) {
      ws.send(JSON.stringify(roomMessage(this.room, seat, connected)));
      if (this.room.game) {
        ws.send(JSON.stringify({ t: 'state', view: viewFor(this.room.game, seat) } satisfies ServerMsg));
      }
    }
    await this.updateLobby(listingFor(this.room, connected, Date.now()));
    await this.schedule(closing);
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

  private async schedule(closing?: WebSocket) {
    if (!this.room) return;
    const auto = nextAutoAt(this.room, this.connected(closing));
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
