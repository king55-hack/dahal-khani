// Cloudflare Worker + Durable Object for online rooms.
// One Durable Object per room code holds the room and runs the rules engine, so every move is
// checked on the server. WebSockets use the hibernation API, so idle rooms cost nothing.

import { DurableObject } from 'cloudflare:workers';
import { viewFor, type Seat } from '../src/engine';
import {
  cleanName,
  isRoomCode,
  MAX_MESSAGE_LENGTH,
  parseClientMsg,
  PING,
  PONG,
  randomRoomCode,
  type ErrorCode,
  type ServerMsg,
} from '../src/online/protocol';
import { createRoom, handle, join, nextAutoAt, roomMessage, runAuto, TIMING, type RoomData } from '../src/online/room';

export interface Env {
  ROOMS: DurableObjectNamespace<RoomDO>;
  /** Comma-separated list of sites allowed to connect, e.g. "https://king55-hack.github.io". */
  ALLOWED_ORIGINS: string;
}

interface Attachment {
  seat: Seat;
  /** simple rate limit: messages in the current 10 s window */
  count: number;
  windowStart: number;
}

const RATE_WINDOW_MS = 10_000;
const RATE_MAX = 40;

function originAllowed(origin: string | null, env: Env): boolean {
  if (!origin) return false;
  const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);
  if (allowed.includes(origin)) return true;
  // local development (laptop, or a phone on the same Wi-Fi)
  return /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin);
}

function corsHeaders(origin: string | null, env: Env): Record<string, string> {
  return originAllowed(origin, env)
    ? { 'Access-Control-Allow-Origin': origin!, 'Access-Control-Allow-Methods': 'POST', Vary: 'Origin' }
    : {};
}

const randomInt = (max: number) => crypto.getRandomValues(new Uint32Array(1))[0] % max;

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const origin = req.headers.get('Origin');

    if (url.pathname === '/api/rooms' && req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
    }

    // Create a room: pick an unused code.
    if (url.pathname === '/api/rooms' && req.method === 'POST') {
      if (!originAllowed(origin, env)) return new Response('Forbidden', { status: 403 });
      for (let attempt = 0; attempt < 5; attempt++) {
        const code = randomRoomCode(randomInt);
        const res = await env.ROOMS.get(env.ROOMS.idFromName(code)).fetch(`https://room/init?code=${code}`, {
          method: 'POST',
        });
        if (res.ok) {
          return Response.json({ code }, { headers: corsHeaders(origin, env) });
        }
      }
      return new Response('Try again', { status: 503, headers: corsHeaders(origin, env) });
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
      if (this.room || !isRoomCode(code)) return new Response('Exists', { status: 409 });
      this.room = createRoom(code, Date.now());
      await this.save();
      return new Response('ok');
    }

    const pair = new WebSocketPair();
    const [client, server] = [pair[0], pair[1]];
    const reject = (code: ErrorCode) => {
      server.accept();
      server.send(JSON.stringify({ t: 'error', code } satisfies ServerMsg));
      server.close(4000, code);
      return new Response(null, { status: 101, webSocket: client });
    };
    if (!this.room) return reject('not_found');

    const name = cleanName(url.searchParams.get('name'));
    const token = url.searchParams.get('token');
    const result = join(
      this.room,
      name,
      token && /^[0-9a-f-]{36}$/.test(token) ? token : null,
      () => crypto.randomUUID(),
      Date.now(),
    );
    if ('error' in result) return reject(result.error);

    // A reconnecting player replaces their old connection.
    for (const ws of this.ctx.getWebSockets()) {
      if ((ws.deserializeAttachment() as Attachment | null)?.seat === result.seat) ws.close(4001, 'replaced');
    }
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ seat: result.seat, count: 0, windowStart: Date.now() } satisfies Attachment);
    server.send(JSON.stringify({ t: 'welcome', seat: result.seat, token: result.token, code: this.room.code } satisfies ServerMsg));
    await this.changed();
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

    const msg = parseClientMsg(data);
    if (!msg) return this.sendError(ws, 'bad_request');
    const error = handle(this.room, att.seat, msg, this.connected(), now);
    if (error) return this.sendError(ws, error);
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

  private sockets(except?: WebSocket) {
    return this.ctx.getWebSockets().filter((ws) => ws !== except && ws.readyState === WebSocket.OPEN);
  }

  private connected(except?: WebSocket): boolean[] {
    const c = [false, false, false, false];
    for (const ws of this.sockets(except)) c[(ws.deserializeAttachment() as Attachment).seat] = true;
    return c;
  }

  private async save() {
    if (this.room) await this.ctx.storage.put('room', this.room);
  }

  /** Save, tell everyone, and set the alarm for the next automatic step. */
  private async changed(closing?: WebSocket) {
    if (!this.room) return;
    await this.save();
    const connected = this.connected(closing);
    for (const ws of this.sockets(closing)) {
      const { seat } = ws.deserializeAttachment() as Attachment;
      ws.send(JSON.stringify(roomMessage(this.room, seat, connected)));
      if (this.room.game) {
        ws.send(JSON.stringify({ t: 'state', view: viewFor(this.room.game, seat) } satisfies ServerMsg));
      }
    }
    await this.schedule(closing);
  }

  private async schedule(closing?: WebSocket) {
    if (!this.room) return;
    const auto = nextAutoAt(this.room, this.connected(closing));
    const expiry = this.room.lastActivity + TIMING.idleExpiry + 1000;
    await this.ctx.storage.setAlarm(Math.min(auto ?? expiry, expiry));
  }
}
