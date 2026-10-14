// End-to-end check against a running room server (default: local `npm run server:dev`).
// - a public room shows up in the room list; a password room is locked
// - wrong password is refused, right password joins
// - two players play a whole round with two bots; nobody ever receives another player's cards
//   node scripts/online-smoke.mjs [serverUrl] [origin]

const SERVER = process.argv[2] ?? 'http://localhost:8787';
const ORIGIN = process.argv[3] ?? 'http://localhost:5173';
const WS = SERVER.replace(/^http/, 'ws');
const headers = { Origin: ORIGIN, 'Content-Type': 'application/json' };

function fail(msg) {
  console.error('FAIL:', msg);
  process.exit(1);
}

async function create(name, password) {
  const res = await fetch(`${SERVER}/api/rooms`, { method: 'POST', headers, body: JSON.stringify({ name, password }) });
  if (!res.ok) fail(`create room: HTTP ${res.status}`);
  return (await res.json()).code;
}
async function list() {
  const res = await fetch(`${SERVER}/api/rooms`, { headers: { Origin: ORIGIN } });
  if (!res.ok) fail(`list rooms: HTTP ${res.status}`);
  return res.json();
}

/** Connect and send hello; resolves with the player, or with { error } if refused. */
function player(code, name, password = '') {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${WS}/api/rooms/${code}/ws`, { headers: { Origin: ORIGIN } });
    const p = { name, ws, seat: null, room: null, view: null, errors: [], waiters: [] };
    ws.addEventListener('open', () => ws.send(JSON.stringify({ t: 'hello', name, token: null, password })));
    ws.addEventListener('message', (e) => {
      if (e.data === 'pong') return;
      const m = JSON.parse(e.data);
      if (m.t === 'welcome') {
        p.seat = m.seat;
        resolve(p);
      }
      if (m.t === 'room') p.room = m;
      if (m.t === 'state') {
        p.view = m.view;
        m.view.hands.forEach((h, s) => {
          if (s !== p.seat && h.length) fail(`${name} received seat ${s}'s cards`);
        });
        if (m.view.undealt.length) fail(`${name} received undealt cards`);
      }
      if (m.t === 'error') {
        p.errors.push(m.code);
        if (p.seat === null) resolve({ error: m.code });
      }
      p.waiters.forEach((w) => w());
    });
    ws.addEventListener('error', () => reject(new Error(`${name} socket error`)));
  });
}

const send = (p, msg) => p.ws.send(JSON.stringify(msg));
const until = (p, cond, ms = 20000) =>
  new Promise((resolve, reject) => {
    if (cond()) return resolve();
    const timer = setTimeout(() => reject(new Error(`timeout waiting for ${p.name}`)), ms);
    p.waiters.push(() => {
      if (cond()) {
        clearTimeout(timer);
        resolve();
      }
    });
  });

// ---- password room ----
const secret = await create('Rajan ko room', 'dahal123');
console.log('private room', secret);
const host = await player(secret, 'Rajan', 'dahal123');
if (host.seat !== 0) fail('host should get seat 0');
const wrong = await player(secret, 'Thief', 'guess');
if (wrong.error !== 'wrong_password') fail(`wrong password should be refused, got ${JSON.stringify(wrong)}`);
const friend = await player(secret, 'Sita', 'dahal123');
if (friend.seat !== 2) fail('friend with the right password should join as partner');
await until(host, () => host.room?.seats[2]?.name === 'Sita');
if (!host.room.locked || host.room.name !== 'Rajan ko room') fail('room message should show name + lock');
console.log('password: wrong refused, right accepted');

// ---- reactions: fixed ids are relayed to everyone, free text is refused ----
host.said = [];
host.ws.addEventListener('message', (e) => {
  if (e.data !== 'pong' && JSON.parse(e.data).t === 'say') {
    host.said.push(JSON.parse(e.data));
    host.waiters.forEach((w) => w());
  }
});
send(friend, { t: 'say', id: 'nicePlay' });
await until(host, () => host.said.length === 1);
if (host.said[0].seat !== 2 || host.said[0].id !== 'nicePlay') fail(`bad relay ${JSON.stringify(host.said)}`);
await new Promise((r) => setTimeout(r, 1600)); // cooldown
send(friend, { t: 'say', id: 'I have no hearts' });
await until(friend, () => friend.errors.includes('bad_request'));
friend.errors.length = 0;
console.log('reactions: relayed, free text refused');

// ---- room list ----
const pub = await create('Public table', '');
const lonely = await player(pub, 'Hari');
await new Promise((r) => setTimeout(r, 300));
const rooms = await list();
const lp = rooms.find((r) => r.code === pub);
const ls = rooms.find((r) => r.code === secret);
if (!lp || lp.locked || lp.players !== 1) fail(`public room missing/wrong in list: ${JSON.stringify(lp)}`);
if (!ls || !ls.locked || ls.players !== 2) fail(`private room missing/wrong in list: ${JSON.stringify(ls)}`);
if (JSON.stringify(rooms).match(/dahal123|salt|hash/)) fail('list leaks password data');
console.log('list:', rooms.map((r) => `${r.locked ? '🔒' : ''}${r.name}#${r.code}(${r.players})`).join(', '));
lonely.ws.close();

// ---- play a round in the private room ----
send(host, { t: 'start' });
await until(host, () => host.view !== null);

function act(p) {
  const v = p.view;
  if (!v) return;
  const step = `${v.roundNumber}:${v.phase}:${v.completedTricks.length}:${v.currentTrick.length}`;
  if (p.lastStep === step) return;
  p.lastStep = step;
  if (v.phase === 'choosingTrump' && v.trumpChooser === p.seat) send(p, { t: 'trump', suit: v.hands[p.seat][0].suit });
  if (v.phase === 'playing' && v.turn === p.seat) {
    const hand = v.hands[p.seat];
    const led = v.currentTrick[0]?.card.suit;
    send(p, { t: 'play', card: hand.find((c) => c.suit === led) ?? hand[0] });
  }
}
for (const p of [host, friend]) p.waiters.push(() => act(p));
act(host);

const t0 = Date.now();
await until(host, () => host.view.phase === 'roundOver', 120000);
const v = host.view;
console.log(`round over in ${((Date.now() - t0) / 1000).toFixed(1)}s — tricks`, v.tricksWon, 'tens', v.tensWon);
if (v.tricksWon[0] + v.tricksWon[1] !== 13) fail('tricks do not add up to 13');
if (host.errors.length || friend.errors.length) fail(`unexpected errors: ${host.errors} / ${friend.errors}`);

for (const p of [host, friend]) p.ws.close();

// ---- leave / kick / close ----
const room2 = await create('Leave test', '');
const h2 = await player(room2, 'Host2');
const f2 = await player(room2, 'Friend2');
f2.ws.send(JSON.stringify({ t: 'leave' }));
await until(h2, () => h2.room?.seats[2] === null);
console.log('leave in lobby: seat freed');
const g2 = await player(room2, 'Guest2');
if (g2.seat !== 2) fail('freed seat should be reused');
const kicked = new Promise((resolve) => g2.ws.addEventListener('close', (e) => resolve(e.code)));
send(h2, { t: 'kick', seat: 2 });
if ((await kicked) !== 4004 || !g2.errors.includes('kicked')) fail('kicked player should be told and disconnected');
await until(h2, () => h2.room?.seats[2] === null);
console.log('kick: player removed');
const x2 = await player(room2, 'Other2');
const closed = new Promise((resolve) => x2.ws.addEventListener('close', (e) => resolve(e.code)));
send(x2, { t: 'close' });
await until(x2, () => x2.errors.includes('not_host'));
send(h2, { t: 'close' });
if ((await closed) !== 4005 || !x2.errors.includes('room_closed')) fail('close should tell everyone');
const gone = await player(room2, 'Late2');
if (gone.error !== 'not_found') fail('closed room should be gone');
console.log('close: only host, everyone told, room deleted');
console.log('PASS');
process.exit(0);
