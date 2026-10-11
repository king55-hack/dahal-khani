// End-to-end check against a running room server (default: local `npm run server:dev`).
// Two players connect over real WebSockets, play a whole round with two bots, and we check
// that nobody ever receives another player's cards.
//   node scripts/online-smoke.mjs [serverUrl] [origin]

const SERVER = process.argv[2] ?? 'http://localhost:8787';
const ORIGIN = process.argv[3] ?? 'http://localhost:5173';
const WS = SERVER.replace(/^http/, 'ws');

function fail(msg) {
  console.error('FAIL:', msg);
  process.exit(1);
}

const res = await fetch(`${SERVER}/api/rooms`, { method: 'POST', headers: { Origin: ORIGIN } });
if (!res.ok) fail(`create room: HTTP ${res.status}`);
const { code } = await res.json();
console.log('room', code);

function player(name) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${WS}/api/rooms/${code}/ws?name=${encodeURIComponent(name)}`, {
      headers: { Origin: ORIGIN },
    });
    const p = { name, ws, seat: null, room: null, view: null, errors: [], waiters: [] };
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
        // privacy: only our own hand may contain cards
        m.view.hands.forEach((h, s) => {
          if (s !== p.seat && h.length) fail(`${name} received seat ${s}'s cards`);
        });
        if (m.view.undealt.length) fail(`${name} received undealt cards`);
      }
      if (m.t === 'error') p.errors.push(m.code);
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

const a = await player('Rajan');
const b = await player('Saathi');
console.log('seats', a.seat, b.seat);
if (a.seat !== 0 || b.seat !== 2) fail('expected partners in seats 0 and 2');

// a bad message and a non-host start must be rejected
b.ws.send('{"t":"hack"}');
send(b, { t: 'start' });
await until(b, () => b.errors.includes('bad_request') && b.errors.includes('not_host'));

// ping is answered without waking the room
await new Promise((resolve) => {
  a.ws.addEventListener('message', function on(e) {
    if (e.data === 'pong') {
      a.ws.removeEventListener('message', on);
      resolve();
    }
  });
  a.ws.send('ping');
});

send(a, { t: 'start' });
await until(a, () => a.view !== null);
console.log('started; bots:', a.room.seats.map((s) => (s.bot ? 'bot' : s.name)).join(', '));

// play: whenever it is one of our players' turn, follow suit with the first legal card
function act(p) {
  const v = p.view;
  if (!v) return;
  // act once per game step (room + state messages both wake us up)
  const step = `${v.roundNumber}:${v.phase}:${v.completedTricks.length}:${v.currentTrick.length}`;
  if (p.lastStep === step) return;
  p.lastStep = step;
  if (v.phase === 'choosingTrump' && v.trumpChooser === p.seat) send(p, { t: 'trump', suit: v.hands[p.seat][0].suit });
  if (v.phase === 'playing' && v.turn === p.seat) {
    const hand = v.hands[p.seat];
    const led = v.currentTrick[0]?.card.suit;
    const card = hand.find((c) => c.suit === led) ?? hand[0];
    send(p, { t: 'play', card });
  }
}
for (const p of [a, b]) p.waiters.push(() => act(p));
act(a);

const t0 = Date.now();
await until(a, () => a.view.phase === 'roundOver', 120000);
const v = a.view;
console.log(`round over in ${((Date.now() - t0) / 1000).toFixed(1)}s — tricks`, v.tricksWon, 'tens', v.tensWon, 'score', v.score);
if (v.tricksWon[0] + v.tricksWon[1] !== 13) fail('tricks do not add up to 13');
if (a.errors.length || b.errors.filter((e) => !['bad_request', 'not_host'].includes(e)).length) {
  fail(`unexpected errors: ${a.errors} / ${b.errors}`);
}

// reconnect: a third connection with no token cannot take a human seat but takes a bot seat
const c = await player('Late');
console.log('late joiner took seat', c.seat);
if (![1, 3].includes(c.seat)) fail('late joiner should replace a bot');

for (const p of [a, b, c]) p.ws.close();
console.log('PASS');
process.exit(0);
