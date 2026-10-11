// Browser UI. All game rules live in ../engine; this file only renders state and schedules bot moves.
import './style.css';
import {
  botChooseCard,
  botChooseTrump,
  chooseTrump,
  collectTrick,
  isRed,
  isTen,
  legalCards,
  newGame,
  nextRound,
  playCard,
  rankLabel,
  sameCard,
  sortHand,
  SUITS,
  SUIT_NAME,
  SUIT_SYMBOL,
  teamOf,
  trickWinner,
  type Card,
  type GameState,
  type Seat,
  type Suit,
} from '../engine';
import { BOT_DELAY_MS, GAME_SETTINGS, TRICK_PAUSE_MS } from '../settings';
import { renderInfo, type InfoTab } from './info';

const HUMAN: Seat = 0;
const NAMES: Record<Seat, string> = { 0: 'Tapaai', 1: 'Hari', 2: 'Sita', 3: 'Gopal' };
const TEAM_NAMES = ['Hamro team', 'Uniharu'] as const;
/** Screen position for each seat (play goes counter-clockwise: bottom → right → top → left). */
const POS: Record<Seat, string> = { 0: 'bottom', 1: 'right', 2: 'top', 3: 'left' };

/** Debug: open with ?autoplay to let a bot play your seat too (useful for testing). */
const AUTOPLAY = new URLSearchParams(location.search).has('autoplay');

const app = document.getElementById('app')!;
const infoRoot = document.createElement('div');
document.body.appendChild(infoRoot);
/** Which info tab is open; bots pause while it's open. */
let infoTab: InfoTab | null = null;
let state: GameState = newGame(GAME_SETTINGS);
let timer: number | null = null;
let toast: string | null = null;
let toastTimer: number | null = null;

// ---------- flow ----------

function apply(next: GameState) {
  state = next;
  render();
  schedule();
}

function showToast(text: string, ms = 1800) {
  toast = text;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast = null;
    render();
  }, ms);
}

function schedule() {
  if (timer !== null || infoTab !== null) return;
  const s = state;
  if (s.phase === 'trickComplete') {
    timer = window.setTimeout(() => {
      timer = null;
      const winner = trickWinner(s.currentTrick, s.trump);
      const tens = s.currentTrick.filter((p) => isTen(p.card)).length;
      if (tens > 0) showToast(`${NAMES[winner]} le ${tens} Dahal jityo!`, 1400);
      apply(collectTrick(s));
    }, AUTOPLAY ? 80 : TRICK_PAUSE_MS);
  } else if (s.phase === 'choosingTrump' && (s.trumpChooser !== HUMAN || AUTOPLAY)) {
    timer = window.setTimeout(() => {
      timer = null;
      const suit = botChooseTrump(s.hands[s.trumpChooser]);
      showToast(`${NAMES[s.trumpChooser]} le TURUP chunyo: ${SUIT_SYMBOL[suit]} ${SUIT_NAME[suit]}`, 2200);
      apply(chooseTrump(s, s.trumpChooser, suit));
    }, BOT_DELAY_MS * 1.5);
  } else if (s.phase === 'playing' && (s.turn !== HUMAN || AUTOPLAY)) {
    timer = window.setTimeout(() => {
      timer = null;
      apply(playCard(s, s.turn, botChooseCard(s, s.turn)));
    }, AUTOPLAY ? 60 : BOT_DELAY_MS);
  } else if (s.phase === 'roundOver' && AUTOPLAY && s.lastResult?.kind === 'normal') {
    timer = window.setTimeout(() => {
      timer = null;
      apply(nextRound(s));
    }, 800);
  }
}

function resetGame() {
  if (timer !== null) clearTimeout(timer);
  timer = null;
  apply(newGame(GAME_SETTINGS));
}

// ---------- rendering helpers ----------

function cardHtml(card: Card, opts: { cls?: string; data?: string } = {}): string {
  const color = isRed(card.suit) ? 'red' : 'black';
  const ten = isTen(card) ? ' ten' : '';
  const r = rankLabel(card.rank);
  const sym = SUIT_SYMBOL[card.suit];
  return `<div class="card ${color}${ten} ${opts.cls ?? ''}" ${opts.data ?? ''}>
    <span class="corner">${r}<br>${sym}</span>
    <span class="pip">${sym}</span>
  </div>`;
}

function tensDots(n: number): string {
  return Array.from({ length: 4 }, (_, i) => `<i class="dot ${i < n ? 'on' : ''}"></i>`).join('');
}

function seatHtml(seat: Seat): string {
  const s = state;
  const active =
    (s.phase === 'playing' && s.turn === seat) || (s.phase === 'choosingTrump' && s.trumpChooser === seat);
  const dealer = s.dealer === seat ? '<span class="chip">Dealer</span>' : '';
  const chooser = s.trumpChooser === seat && s.trump ? '<span class="chip gold">TURUP</span>' : '';
  const partner = seat === 2 ? ' <small>(Saathi)</small>' : '';
  const n = s.hands[seat].length;
  const backs = Array.from({ length: Math.min(n, 13) }, () => '<i class="back"></i>').join('');
  return `<div class="seat seat-${POS[seat]} team${teamOf(seat)} ${active ? 'active' : ''}">
    <div class="name">${NAMES[seat]}${partner}</div>
    <div class="backs">${backs}</div>
    <div class="chips">${dealer}${chooser}<span class="count">${n}</span></div>
  </div>`;
}

function trickHtml(): string {
  const s = state;
  const winner =
    s.phase === 'trickComplete' ? trickWinner(s.currentTrick, s.trump) : null;
  const slots = s.currentTrick
    .map((p) => cardHtml(p.card, { cls: `slot slot-${POS[p.seat]} ${p.seat === winner ? 'winner' : ''}` }))
    .join('');
  let center = '';
  if (s.phase === 'choosingTrump' && s.trumpChooser === HUMAN) {
    const hand = s.hands[HUMAN];
    center = `<div class="trump-pick">
      <div class="title">TURUP chunnus</div>
      <div class="sub">Tapaaiko 5 patti herera rang chunnus</div>
      <div class="suits">${SUITS.map(
        (suit) => `<button class="suit-btn ${isRed(suit) ? 'red' : 'black'}" data-suit="${suit}" aria-label="${SUIT_NAME[suit]}">
          <span>${SUIT_SYMBOL[suit]}</span><small>${hand.filter((c) => c.suit === suit).length}</small>
        </button>`,
      ).join('')}</div>
    </div>`;
  } else if (s.phase === 'choosingTrump') {
    center = `<div class="waiting">${NAMES[s.trumpChooser]} TURUP chundai chha…</div>`;
  }
  return `<div class="trick">${slots}${center}</div>`;
}

function statusText(): string {
  const s = state;
  if (s.phase === 'choosingTrump') return s.trumpChooser === HUMAN ? 'Tapaaiko paalo: TURUP chunnus' : '';
  if (s.phase === 'trickComplete') {
    const w = trickWinner(s.currentTrick, s.trump);
    return `${NAMES[w]} le haat jityo`;
  }
  if (s.phase === 'playing') {
    if (s.turn !== HUMAN) return `${NAMES[s.turn]} ko paalo…`;
    if (s.currentTrick.length === 0) return 'Tapaaiko paalo — jun patti pani khelna milchha';
    const led = s.currentTrick[0].card.suit;
    const canFollow = s.hands[HUMAN].some((c) => c.suit === led);
    return canFollow
      ? `Tapaaiko paalo — ${SUIT_SYMBOL[led]} khelnu parchha`
      : `Tapaaiko paalo — ${SUIT_SYMBOL[led]} chhaina, TURUP ya jun sukai`;
  }
  return '';
}

function handHtml(): string {
  const s = state;
  const hand = sortHand(s.hands[HUMAN], s.trump);
  const legal = legalCards(s, HUMAN);
  const cards = hand
    .map((card, i) => {
      const ok = legal.some((l) => sameCard(l, card));
      return cardHtml(card, {
        cls: ok ? 'playable' : s.phase === 'playing' && s.turn === HUMAN ? 'disabled' : '',
        data: `data-card="${i}" style="--i:${i}"`,
      });
    })
    .join('');
  return `<div class="hand" style="--n:${Math.max(hand.length, 1)}">${cards}</div>`;
}

function teamPanel(team: 0 | 1): string {
  const s = state;
  return `<div class="team-panel team${team}">
    <div class="tname">${TEAM_NAMES[team]}</div>
    <div class="stat"><span>Dahal</span><b>${tensDots(s.tensWon[team])}</b></div>
    <div class="stat"><span>Haat</span><b>${s.tricksWon[team]}</b></div>
  </div>`;
}

function summaryHtml(): string {
  const s = state;
  const r = s.lastResult;
  if (s.phase !== 'roundOver' || !r) return '';
  const weWon = r.winningTeam === 0;
  const kindTitle =
    r.kind === 'baunne' ? 'BAUNNE! (52)' : r.kind === 'kot' ? 'KOT!' : weWon ? 'Jityo!' : 'Haryo';
  const why =
    r.kind === 'baunne'
      ? 'Sabai 13 haat jityo!'
      : r.kind === 'kot'
        ? 'Chaarai Dahal (10) jityo!'
        : r.tens[r.winningTeam] >= 3
          ? `${r.tens[r.winningTeam]} ota Dahal jityo`
          : `2–2 Dahal, dherai haat (${r.tricks[r.winningTeam]}) jityo`;
  const confettiCount = r.kind === 'baunne' ? 120 : r.kind === 'kot' ? 60 : 0;
  const confetti = Array.from({ length: confettiCount }, (_, i) => {
    const colors = ['#ffd54a', '#ff5a5f', '#4ade80', '#60a5fa', '#f472b6', '#fff'];
    const left = (i * 37) % 100;
    const delay = ((i * 13) % 30) / 10;
    const dur = 2.5 + ((i * 7) % 20) / 10;
    return `<i class="confetti" style="left:${left}%;background:${colors[i % colors.length]};animation-delay:${delay}s;animation-duration:${dur}s"></i>`;
  }).join('');
  return `<div class="overlay ${r.kind}">
    ${confetti}
    <div class="modal">
      <div class="result-title ${r.kind} ${weWon ? 'win' : 'lose'}">${kindTitle}</div>
      <div class="result-team">${TEAM_NAMES[r.winningTeam]} le round jityo (+${r.points})</div>
      <div class="why">${why}</div>
      <table>
        <tr><th></th><th>${TEAM_NAMES[0]}</th><th>${TEAM_NAMES[1]}</th></tr>
        <tr><td>Dahal</td><td>${r.tens[0]}</td><td>${r.tens[1]}</td></tr>
        <tr><td>Haat</td><td>${r.tricks[0]}</td><td>${r.tricks[1]}</td></tr>
        <tr class="total"><td>Jamma score</td><td>${s.score[0]}</td><td>${s.score[1]}</td></tr>
      </table>
      <button class="primary" data-action="next">Next round ▶</button>
    </div>
  </div>`;
}

function render() {
  const s = state;
  const trump = s.trump
    ? `<span class="trump-badge ${isRed(s.trump) ? 'red' : 'black'}">TURUP <b>${SUIT_SYMBOL[s.trump]}</b></span>`
    : `<span class="trump-badge none">TURUP ?</span>`;
  app.innerHTML = `
    <header>
      <div class="score"><span class="team0">Hami ${s.score[0]}</span> – <span class="team1">${s.score[1]} Uniharu</span></div>
      <div class="round">Round ${s.roundNumber}</div>
      ${trump}
      <button class="small" data-action="info" title="Kasari khelne / Banaune" aria-label="Info">ⓘ</button>
      <button class="small" data-action="reset" title="Naya khel" aria-label="Naya khel">↺</button>
    </header>
    <div class="panels">${teamPanel(0)}${teamPanel(1)}</div>
    <main class="table">
      ${seatHtml(2)}${seatHtml(3)}${trickHtml()}${seatHtml(1)}
    </main>
    <div class="status">${statusText()}</div>
    ${handHtml()}
    ${toast ? `<div class="toast">${toast}</div>` : ''}
    ${summaryHtml()}
  `;
}

// ---------- input ----------

app.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-card],[data-suit],[data-action]');
  if (!el) return;
  if (el.dataset.action === 'next') return apply(nextRound(state));
  if (el.dataset.action === 'info') return setInfo('rules');
  if (el.dataset.action === 'reset') {
    if (confirm('Naya khel suru garne? Score 0 hunchha.')) resetGame();
    return;
  }
  if (el.dataset.suit && state.phase === 'choosingTrump' && state.trumpChooser === HUMAN) {
    return apply(chooseTrump(state, HUMAN, el.dataset.suit as Suit));
  }
  if (el.dataset.card !== undefined && state.phase === 'playing' && state.turn === HUMAN) {
    const card = sortHand(state.hands[HUMAN], state.trump)[Number(el.dataset.card)];
    if (card && legalCards(state, HUMAN).some((c) => sameCard(c, card))) apply(playCard(state, HUMAN, card));
  }
});

function setInfo(tab: InfoTab | null) {
  infoTab = tab;
  if (tab && timer !== null) {
    clearTimeout(timer); // pause bots; schedule() restarts from the current state
    timer = null;
  }
  renderInfo(infoRoot, tab);
  if (!tab) schedule();
}

infoRoot.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const el = target.closest<HTMLElement>('[data-info]');
  if (!el) return;
  const what = el.dataset.info;
  if (what === 'close' || (what === 'backdrop' && el === target)) setInfo(null);
  else if (what === 'rules' || what === 'credits') setInfo(what);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && infoTab) setInfo(null);
});

render();
schedule();
