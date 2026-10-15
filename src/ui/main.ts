// Browser UI. All game rules live in ../engine; this file only renders state and schedules bot moves.
import './style.css';
import {
  botChooseCard,
  botChooseTrump,
  chooseTrump,
  collectTrick,
  computeRoundResult,
  currentTrump,
  dealRound,
  isRed,
  isTen,
  legalCards,
  newGame,
  nextRound,
  playCard,
  rankLabel,
  rotateView,
  sameCard,
  sortHand,
  SUITS,
  SUIT_NAME,
  SUIT_SYMBOL,
  teamOf,
  trickWinner,
  visibleTrump,
  type Card,
  type GameState,
  type PlayerView,
  type Seat,
  type Suit,
  type TrumpMode,
} from '../engine';
import { coinsFor } from '../coins';
import { BOT_DELAY_MS, COPYRIGHT, CREATOR_NAME, GAME_SETTINGS, TRICK_PAUSE_MS } from '../settings';
import {
  cleanName,
  isRoomCode,
  normalizeRoomCode,
  QUICK_MESSAGES,
  REACTIONS,
  ROOM_NAME_MAX,
  type RoomListing,
  type SayId,
  type ServerMsg,
} from '../online/protocol';
import { escapeHtml } from './html';
import { LANGS, STRINGS, type Lang, type Strings } from './i18n';
import { infoHtml, languagePickerHtml, nameHtml, onlineHtml, settingsHtml, type Modal, type RoomInfo } from './modals';
import { startPresence } from './presence';
import { TOUR, tourHtml } from './tour';
import {
  feedbackHtml,
  fetchInbox,
  inboxHtml,
  loadAdminKey,
  saveAdminKey,
  sendFeedback,
  updateInbox,
  type FeedbackForm,
  type Inbox,
} from './feedback';
import type { FeedbackKind } from '../online/feedback';
import { bubble, clearFx, dealCards } from './fx';
import { createRoom, listRooms, OnlineClient, SERVER_URL, type ConnStatus, type FatalReason } from './online';
import { loadPrefs, savePrefs } from './prefs';
import { setSoundEnabled, sfx, unlockAudio } from './sound';
import { BACKGROUNDS, isBackgroundId, isThemeId, MODE_PRICES, THEMES } from './themes';

const HUMAN: Seat = 0;
/** Screen position for each seat (play goes counter-clockwise: bottom → right → top → left). */
const POS: Record<Seat, string> = { 0: 'bottom', 1: 'right', 2: 'top', 3: 'left' };

/** Debug: open with ?autoplay to let a bot play your seat too (useful for testing). */
const AUTOPLAY = new URLSearchParams(location.search).has('autoplay');

const prefs = loadPrefs();
if (AUTOPLAY && !prefs.lang) prefs.lang = 'neRom';
setSoundEnabled(prefs.sound);
let t: Strings = STRINGS[prefs.lang ?? 'neRom'];

const app = document.getElementById('app')!;
const modalRoot = document.createElement('div');
document.body.appendChild(modalRoot);

/** Open dialog; bots pause while one is open. First launch asks for the language. */
if (AUTOPLAY) {
  prefs.playerName ||= 'Bot';
  prefs.tourDone = true;
}
/** First run: language → name → guide. */
function onboardingStep(): Modal | null {
  if (!prefs.lang) return { kind: 'lang' };
  if (!cleanName(prefs.playerName, '')) return { kind: 'name' };
  if (!prefs.tourDone) return { kind: 'tour', step: 0 };
  return null;
}
let modal: Modal | null = onboardingStep();
let nameError = '';
/** what is typed in the name box (kept if we have to re-render it) */
let nameDraft = '';
let settingsMsg = '';
let state: GameState = newGame({ ...GAME_SETTINGS, trumpMode: prefs.mode });
let timer: number | null = null;
let toast: string | null = null;
let toastTimer: number | null = null;
/** Coins earned in the round that just ended (shown in the summary). */
let roundCoins = 0;
/** While cards are flying out to the players, my hand stays hidden and bots wait. */
let dealingUntil = 0;
/** briefly after a deal, my cards slide in */
let handInUntil = 0;
/** last trick position rendered — only a newly played card gets the throw animation */
let lastTrickKey = '';
/** reactions panel (online) */
let sayOpen = false;
/** showing the previous trick (only that one) in the middle of the table, for a few seconds */
let peekLast = false;
let peekTimer = 0;
const PEEK_MS = 3000;
/** player feedback form */
const fbForm: FeedbackForm = { kind: 'problem', message: '', contact: '', includeInfo: true, sending: false, sent: false, error: '' };
/** creator's inbox (only on a device where the admin key was entered) */
const inboxState: { key: string; inbox: Inbox | null; loading: boolean; error: string } = {
  key: loadAdminKey(),
  inbox: null,
  loading: false,
  error: '',
};
/** people with the game open right now (null = unknown) */
let liveCount: number | null = null;
const REACTION_EMOJI: Record<(typeof REACTIONS)[number], string> = {
  like: '👍',
  laugh: '😂',
  sad: '😢',
  yess: '🙌',
  fire: '🔥',
  wow: '😮',
};

/** Online session (null = playing offline against bots). */
interface OnlineSession {
  client: OnlineClient;
  code: string;
  /** my real seat on the server; the view is rotated so I am always at the bottom */
  seat: Seat;
  room: RoomInfo | null;
  status: ConnStatus | null;
  /** first game state after connecting: don't play sounds for the jump from the offline game */
  fresh: boolean;
  /** a move was sent and we wait for the server's answer (ignore double taps) */
  waiting: boolean;
}
let online: OnlineSession | null = null;
const roomFromUrl = new URLSearchParams(location.search).get('room');
const onlineForm = {
  name: prefs.playerName,
  codeInput: roomFromUrl && isRoomCode(normalizeRoomCode(roomFromUrl)) ? normalizeRoomCode(roomFromUrl) : '',
  joinPassword: '',
  roomName: '',
  createPassword: '',
  rooms: null as RoomListing[] | null,
  /** password of the room this browser created, so the invite can include it */
  created: null as { code: string; password: string } | null,
  busy: false,
  error: '',
  notice: '',
};

// ---------- flow ----------

/** Display name for a (local) seat — already HTML-escaped. */
function name(seat: Seat): string {
  const info = online?.room?.seats[(seat + online.seat) % 4];
  if (!online || !info || seat === HUMAN) return t.names[seat];
  return escapeHtml((info.bot ? '🤖 ' : '') + info.name);
}

function handCount(seat: Seat): number {
  return online ? ((state as PlayerView).handCounts?.[seat] ?? 0) : state.hands[seat].length;
}
const suitLabel = (s: Suit) => `${SUIT_SYMBOL[s]} ${SUIT_NAME[s]}`;

function apply(next: GameState) {
  const prev = state;
  state = next;
  react(prev, next);
  render();
  dealFx(prev, next);
  schedule();
}

/** Fly cards out from the dealer when a round is dealt (5 each, then 8 more once trump is set). */
function dealFx(prev: GameState | null, next: GameState) {
  if (!prefs.animations) return;
  const fresh = next.completedTricks.length === 0 && next.currentTrick.length === 0;
  let perPlayer = 0;
  if ((!prev || prev.roundNumber !== next.roundNumber) && fresh) {
    perPlayer = next.phase === 'choosingTrump' ? 5 : next.phase === 'playing' ? 13 : 0;
  } else if (prev?.phase === 'choosingTrump' && next.phase === 'playing') perPlayer = 8;
  if (!perPlayer) return;
  const ms = dealCards(next.dealer, perPlayer);
  dealingUntil = Date.now() + ms;
  handInUntil = dealingUntil + 450;
  for (let i = 0; i * 140 < ms; i++) window.setTimeout(() => sfx.card(), i * 140);
  render(); // hide my hand while it is being dealt
  window.setTimeout(render, ms + 10);
  window.setTimeout(render, ms + 470);
}

/** Sounds, toasts and coins, derived from what changed between two states. */
function react(prev: GameState, next: GameState) {
  const mode = next.settings.trumpMode;
  if (prev.phase === 'choosingTrump' && next.phase === 'playing') {
    if (mode === 'open' && next.trump) {
      showToast(t.toastTrumpChosen(name(next.trumpChooser), suitLabel(next.trump)), 2200);
    } else if (mode === 'bandHukum' && next.trumpChooser !== HUMAN) {
      showToast(t.toastTrumpHidden(name(next.trumpChooser)), 2200);
    }
  } else if (!prev.trumpRevealed && next.trumpRevealed && next.trump && prev.phase !== 'choosingTrump') {
    sfx.reveal();
    showToast(
      mode === 'cutHukum'
        ? t.toastCut(name(next.trumpChooser), suitLabel(next.trump))
        : t.toastReveal(suitLabel(next.trump)),
      2400,
    );
  }

  if (next.currentTrick.length > prev.currentTrick.length) sfx.card();
  if (next.currentTrick.length !== prev.currentTrick.length || next.phase !== prev.phase) stopPeek();

  if (next.completedTricks.length > prev.completedTricks.length && next.completedTricks.length > 0) {
    const last = next.completedTricks[next.completedTricks.length - 1];
    const tens = last.plays.filter((p) => isTen(p.card)).length;
    if (tens > 0) {
      sfx.dahal();
      showToast(t.toastDahal(name(last.winner), tens), 1500);
    } else sfx.trick();
  }

  if (prev.phase !== 'roundOver' && next.phase === 'roundOver' && next.lastResult) {
    const r = next.lastResult;
    // team 0 is always "us" (online views are rotated so)
    roundCoins = coinsFor(r, 0);
    if (roundCoins > 0) {
      prefs.coins += roundCoins;
      savePrefs(prefs);
      window.setTimeout(() => sfx.coin(), 900);
    }
    const weWon = r.winningTeam === 0;
    if (weWon) {
      if (r.kind === 'baunne') sfx.baunne();
      else if (r.kind === 'kot') sfx.kot();
      else sfx.win();
    } else if (r.kind !== 'normal') sfx.ouch();
    else sfx.lose();
  }
}

function showToast(text: string, ms = 1800) {
  toast = text;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast = null;
    render();
  }, ms);
}

function stopTimer() {
  if (timer !== null) clearTimeout(timer);
  timer = null;
}

function schedule() {
  if (online || timer !== null || modal !== null) return;
  const s = state;
  const dealing = Date.now() < dealingUntil;
  if (dealing && s.phase !== 'trickComplete') {
    // let the cards land before anyone moves
    timer = window.setTimeout(() => {
      timer = null;
      schedule();
    }, dealingUntil - Date.now() + 50);
    return;
  }
  if (s.phase === 'trickComplete') {
    timer = window.setTimeout(() => {
      timer = null;
      apply(collectTrick(s));
    }, AUTOPLAY ? 80 : TRICK_PAUSE_MS);
  } else if (s.phase === 'choosingTrump' && (s.trumpChooser !== HUMAN || AUTOPLAY)) {
    timer = window.setTimeout(() => {
      timer = null;
      apply(chooseTrump(s, s.trumpChooser, botChooseTrump(s.hands[s.trumpChooser])));
    }, BOT_DELAY_MS * 1.5);
  } else if (s.phase === 'playing' && (s.turn !== HUMAN || AUTOPLAY)) {
    timer = window.setTimeout(() => {
      timer = null;
      apply(playCard(s, s.turn, botChooseCard(s, s.turn)));
    }, AUTOPLAY ? 60 : BOT_DELAY_MS);
  } else if (s.phase === 'roundOver' && AUTOPLAY && s.lastResult?.kind === 'normal') {
    timer = window.setTimeout(() => {
      timer = null;
      startNextRound();
    }, 800);
  }
}

/** The chosen mode is only applied at a fresh deal, never in the middle of a round. */
function withChosenMode(s: GameState): GameState {
  return { ...s, settings: { ...s.settings, trumpMode: prefs.mode } };
}

function startNextRound() {
  if (online) return sendMove({ t: 'next' });
  apply(nextRound(withChosenMode(state)));
}

function resetGame() {
  stopTimer();
  clearFx();
  roundCoins = 0;
  apply(newGame({ ...GAME_SETTINGS, trumpMode: prefs.mode }));
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
  const dealer = s.dealer === seat ? `<span class="chip">${t.dealer}</span>` : '';
  let chooser = '';
  if (s.trumpChooser === seat && s.trumpRevealed) chooser = `<span class="chip gold">${t.trump}</span>`;
  else if (s.trumpChooser === seat && s.trump) chooser = `<span class="chip gold">🔒</span>`;
  const partner = seat === 2 ? ` <small>${t.partner}</small>` : '';
  const n = handCount(seat);
  const backs = Array.from({ length: Math.min(n, 13) }, () => '<i class="back"></i>').join('');
  return `<div class="seat seat-${POS[seat]} team${teamOf(seat)} ${active ? 'active' : ''}">
    <div class="name">${name(seat)}${partner}</div>
    <div class="backs">${backs}</div>
    <div class="chips">${dealer}${chooser}<span class="count">${n}</span></div>
  </div>`;
}

function canPeek(): boolean {
  return state.phase === 'playing' && state.completedTricks.length > 0;
}

function stopPeek() {
  peekLast = false;
  window.clearTimeout(peekTimer);
}

/** The previous trick, shown instead of the current one while the 🕘 button is on. */
function lastTrickHtml(): string {
  const last = state.completedTricks[state.completedTricks.length - 1];
  const slots = last.plays
    .map((p) => cardHtml(p.card, { cls: `slot slot-${POS[p.seat]} ${p.seat === last.winner ? 'winner' : ''}` }))
    .join('');
  return `<div class="trick peek"><div class="trick-cards">${slots}</div><div class="peek-label">🕘 ${t.lastTrick}</div></div>`;
}

function trickHtml(): string {
  const s = state;
  if (peekLast && canPeek()) return lastTrickHtml();
  const winner = s.phase === 'trickComplete' ? trickWinner(s.currentTrick, currentTrump(s)) : null;
  const key = `${s.roundNumber}:${s.completedTricks.length}:${s.currentTrick.length}`;
  const isNew = key !== lastTrickKey;
  lastTrickKey = key;
  const last = s.currentTrick.length - 1;
  const slots = s.currentTrick
    .map((p, i) =>
      cardHtml(p.card, {
        cls: `slot slot-${POS[p.seat]} ${p.seat === winner ? 'winner' : ''} ${isNew && i === last ? 'enter' : ''}`,
      }),
    )
    .join('');
  const sweep = winner !== null ? `sweep sweep-${POS[winner]}` : '';
  let center = '';
  if (s.phase === 'choosingTrump' && s.trumpChooser === HUMAN) {
    const hidden = s.settings.trumpMode === 'bandHukum';
    const hand = s.hands[HUMAN];
    center = `<div class="trump-pick">
      <div class="title">${hidden ? t.chooseTrumpHidden : t.chooseTrump}</div>
      <div class="sub">${hidden ? t.chooseTrumpHiddenSub : t.chooseTrumpSub}</div>
      <div class="suits">${SUITS.map(
        (suit) => `<button class="suit-btn ${isRed(suit) ? 'red' : 'black'}" data-suit="${suit}" aria-label="${SUIT_NAME[suit]}">
          <span>${SUIT_SYMBOL[suit]}</span><small>${hand.filter((c) => c.suit === suit).length}</small>
        </button>`,
      ).join('')}</div>
    </div>`;
  } else if (s.phase === 'choosingTrump') {
    center = `<div class="waiting">${t.waitingTrump(name(s.trumpChooser))}</div>`;
  }
  return `<div class="trick"><div class="trick-cards ${sweep}">${slots}</div>${center}</div>`;
}

function statusText(): string {
  const s = state;
  if (s.phase === 'choosingTrump') return s.trumpChooser === HUMAN ? t.yourTurnChooseTrump : '';
  if (s.phase === 'trickComplete') return t.trickWonBy(name(trickWinner(s.currentTrick, currentTrump(s))));
  if (s.phase === 'playing') {
    if (s.turn !== HUMAN) return t.turnOf(name(s.turn));
    if (s.currentTrick.length === 0) return t.yourTurnLead;
    const led = s.currentTrick[0].card.suit;
    const sym = SUIT_SYMBOL[led];
    if (s.hands[HUMAN].some((c) => c.suit === led)) return t.yourTurnFollow(sym);
    if (!s.trumpRevealed && s.settings.trumpMode === 'bandHukum') return t.yourTurnVoidBand(sym);
    if (!s.trumpRevealed && s.settings.trumpMode === 'cutHukum') return t.yourTurnVoidCut(sym);
    return t.yourTurnVoid(sym);
  }
  return '';
}

function handHtml(): string {
  const s = state;
  const hand = sortHand(s.hands[HUMAN], visibleTrump(s, HUMAN));
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
  const now = Date.now();
  const phase = now < dealingUntil ? 'hand-wait' : now < handInUntil ? 'hand-in' : '';
  return `<div class="hand ${phase}" style="--n:${Math.max(hand.length, 1)}">${cards}</div>`;
}

function teamPanel(team: 0 | 1): string {
  const s = state;
  return `<div class="team-panel team${team}">
    <div class="tname">${team === 0 ? t.teamUs : t.teamThem}</div>
    <div class="stat"><span>${t.dahal}</span><b>${tensDots(s.tensWon[team])}</b></div>
    <div class="stat"><span>${t.haat}</span><b>${s.tricksWon[team]}</b></div>
  </div>`;
}

function trumpBadge(): string {
  const s = state;
  const label = `<span class="tlabel">${t.trump}</span>`;
  if (s.trumpRevealed && s.trump) {
    return `<span class="trump-badge ${isRed(s.trump) ? 'red' : 'black'}">${label} <b>${SUIT_SYMBOL[s.trump]}</b></span>`;
  }
  const mine = visibleTrump(s, HUMAN);
  // band hukum: trump picked but secret (online, only the chooser's view contains it)
  if (s.settings.trumpMode === 'bandHukum' && s.phase !== 'choosingTrump' && s.phase !== 'roundOver') {
    return mine
      ? `<span class="trump-badge secret ${isRed(mine) ? 'red' : 'black'}">🔒 <b>${SUIT_SYMBOL[mine]}</b></span>`
      : `<span class="trump-badge none">🔒 ${label} ?</span>`;
  }
  if (s.settings.trumpMode === 'cutHukum') return `<span class="trump-badge none">✂ ${label} ?</span>`;
  return `<span class="trump-badge none">${label} ?</span>`;
}

/** The four 10s flying in and fanning out — shown when we make Kot. */
function tenFan(): string {
  const tens: Card[] = (['S', 'H', 'C', 'D'] as const).map((suit) => ({ suit, rank: 10 }));
  return `<div class="ten-fan">${tens
    .map((c, k) => cardHtml(c, { cls: 'fan-card', data: `style="--k:${k}"` }))
    .join('')}</div>`;
}

function summaryHtml(): string {
  const s = state;
  const r = s.lastResult;
  if (s.phase !== 'roundOver' || !r) return '';
  const weWon = r.winningTeam === 0;
  const teamName = (team: 0 | 1) => (team === 0 ? t.teamUs : t.teamThem);
  // six different screens: normal / Kot / Baunne, each for winning or losing
  const mood = `${r.kind}-${weWon ? 'win' : 'lose'}`;
  const titles: Record<string, string> = {
    'normal-win': t.win,
    'normal-lose': t.lose,
    'kot-win': t.kot,
    'kot-lose': t.kotAgainst,
    'baunne-win': t.flawless,
    'baunne-lose': t.baunneAgainst,
  };
  const why =
    mood === 'kot-lose'
      ? t.whyKotAgainst
      : mood === 'baunne-lose'
        ? t.whyBaunneAgainst
        : r.kind === 'baunne'
          ? t.whyBaunne
          : r.kind === 'kot'
            ? t.whyKot
            : r.tens[r.winningTeam] >= 3
              ? t.whyTens(r.tens[r.winningTeam])
              : t.whyTricks(r.tricks[r.winningTeam]);
  const spread = (n: number, f: (i: number, left: number, delay: number, dur: number) => string) =>
    Array.from({ length: n }, (_, i) => f(i, (i * 37) % 100, ((i * 13) % 30) / 10, 2.5 + ((i * 7) % 20) / 10)).join('');
  const colors = ['#ffd54a', '#ff5a5f', '#4ade80', '#60a5fa', '#f472b6', '#fff'];
  const confetti = (n: number) =>
    spread(
      n,
      (i, left, delay, dur) =>
        `<i class="confetti" style="left:${left}%;background:${colors[i % colors.length]};animation-delay:${delay}s;animation-duration:${dur}s"></i>`,
    );
  const coins = (n: number) =>
    spread(
      n,
      (_i, left, delay, dur) =>
        `<i class="coin-fall" style="left:${left}%;animation-delay:${delay / 2}s;animation-duration:${dur * 0.8}s">🪙</i>`,
    );
  const bursts = (n: number) =>
    spread(
      n,
      (i, left, delay) =>
        `<i class="burst" style="left:${10 + (left * 0.8)}%;top:${12 + ((i * 29) % 45)}%;animation-delay:${delay / 2}s;--c:${colors[i % colors.length]}"></i>`,
    );
  const tears = (n: number) =>
    spread(n, (_i, left, delay, dur) => `<i class="tear" style="left:${left}%;animation-delay:${delay}s;animation-duration:${dur}s">💧</i>`);
  const fx: Record<string, string> = {
    'normal-win': roundCoins > 0 ? coins(12) : '',
    'normal-lose': '',
    'kot-win': '<i class="rays"></i>' + bursts(4) + confetti(60) + coins(25),
    'kot-lose': tears(14),
    'baunne-win': bursts(10) + confetti(110) + coins(45),
    'baunne-lose': tears(24),
  };
  return `<div class="overlay result ${r.kind} ${mood}">
    ${fx[mood]}
    <div class="modal">
      <div class="result-main">
      ${mood === 'kot-win' ? tenFan() : ''}
      <div class="result-title ${r.kind} ${weWon ? 'win' : 'lose'}">${titles[mood]}</div>
      ${mood === 'baunne-win' ? `<div class="result-sub">${t.baunne}</div>` : ''}
      <div class="result-team">${t.roundWonBy(teamName(r.winningTeam), r.points)}</div>
      <div class="why">${why}</div>
      ${roundCoins > 0 ? `<div class="coins-earned">${t.coinsEarned(roundCoins)}</div>` : ''}
      </div>
      <div class="result-side">
      <table>
        <tr><th></th><th>${t.teamUs}</th><th>${t.teamThem}</th></tr>
        <tr><td>${t.dahal}</td><td>${r.tens[0]}</td><td>${r.tens[1]}</td></tr>
        <tr><td>${t.haat}</td><td>${r.tricks[0]}</td><td>${r.tricks[1]}</td></tr>
        <tr class="total"><td>${t.totalScore}</td><td>${s.score[0]}</td><td>${s.score[1]}</td></tr>
      </table>
      <button class="primary" data-action="next">${t.nextRound}</button>
      </div>
    </div>
  </div>`;
}

function render() {
  const s = state;
  app.innerHTML = `
    <header>
      <div class="score"><span class="team0">${t.us} ${s.score[0]}</span> – <span class="team1">${s.score[1]} ${t.them}</span></div>
      <div class="round">${t.round(s.roundNumber)}</div>
      ${trumpBadge()}
      <span class="coin-chip" title="${t.coins}">🪙 ${prefs.coins}</span>
      ${
        online
          ? `<button class="small room-chip" data-action="online" title="${t.online}">${online.status === 'open' ? '🌐' : '⏳'} ${online.code}${liveBadge()}</button>`
          : SERVER_URL
            ? `<button class="small globe-btn" data-action="online" title="${t.playOnline}" aria-label="${t.online}">🌐${liveBadge()}</button>`
            : ''
      }
      <button class="small" data-action="info" title="${t.info}" aria-label="${t.info}">ⓘ</button>
      <button class="small" data-action="settings" title="${t.settings}" aria-label="${t.settings}">⚙</button>
    </header>
    <div class="panels">${teamPanel(0)}${teamPanel(1)}</div>
    <main class="table">
      ${seatHtml(2)}${seatHtml(3)}${trickHtml()}${seatHtml(1)}
    </main>
    <div class="status-row">
      ${canPeek() ? `<button class="last-btn ${peekLast ? 'on' : ''}" data-action="last" aria-pressed="${peekLast}" aria-label="${t.lastTrick}" title="${t.lastTrick}">🕘</button>` : ''}
      <div class="status">${statusText()}</div>
      ${online ? `<button class="say-btn" data-action="say" aria-label="${t.sayTitle}" title="${t.sayTitle}">💬</button>` : ''}
    </div>
    ${handHtml()}
    ${online && sayOpen ? sayPanelHtml() : ''}
    ${toast ? `<div class="toast">${toast}</div>` : ''}
    ${summaryHtml()}
  `;
}

/** "● 3" next to the 🌐 button: how many people have the game open (whatever they are playing). */
function liveBadge(): string {
  if (liveCount === null) return '';
  return `<span class="live-badge" title="${t.liveTitle(liveCount)}" aria-label="${t.liveTitle(liveCount)}"><i class="live-dot"></i>${liveCount}</span>`;
}

function sayPanelHtml(): string {
  const emojis = REACTIONS.map(
    (id) => `<button class="say-emoji" data-say="${id}" aria-label="${id}">${REACTION_EMOJI[id]}</button>`,
  ).join('');
  const msgs = QUICK_MESSAGES.map((id) => `<button class="say-msg" data-say="${id}">${t.say[id]}</button>`).join('');
  return `<div class="say-panel" role="dialog" aria-label="${t.sayTitle}">
    <div class="say-emojis">${emojis}</div>
    <div class="say-msgs">${msgs}</div>
  </div>`;
}

function sayText(id: SayId): { text: string; emoji: boolean } {
  return (REACTIONS as readonly string[]).includes(id)
    ? { text: REACTION_EMOJI[id as (typeof REACTIONS)[number]], emoji: true }
    : { text: t.say[id as (typeof QUICK_MESSAGES)[number]], emoji: false };
}

// ---------- dialogs ----------

function renderModal() {
  const prevScroll = modalRoot.querySelector('.overlay')?.scrollTop ?? 0;
  if (!modal) modalRoot.innerHTML = '';
  else if (modal.kind === 'lang') modalRoot.innerHTML = languagePickerHtml();
  else if (modal.kind === 'name') modalRoot.innerHTML = nameHtml(t, nameDraft || prefs.playerName, nameError);
  else if (modal.kind === 'tour') modalRoot.innerHTML = tourHtml(t, modal.step);
  else if (modal.kind === 'info') modalRoot.innerHTML = infoHtml(t, prefs.lang ?? 'neRom', modal.tab);
  else if (modal.kind === 'online') {
    modalRoot.innerHTML = onlineHtml(t, {
      available: SERVER_URL !== null,
      name: onlineForm.name,
      codeInput: onlineForm.codeInput,
      joinPassword: onlineForm.joinPassword,
      roomName: onlineForm.roomName,
      createPassword: onlineForm.createPassword,
      rooms: onlineForm.rooms,
      busy: onlineForm.busy,
      status: online?.status ?? null,
      room: online?.room ?? null,
      error: onlineForm.error,
      notice: onlineForm.notice,
      unlockedModes: prefs.unlockedModes,
    });
  } else if (modal.kind === 'feedback') modalRoot.innerHTML = feedbackHtml(t, fbForm, CREATOR_NAME);
  else if (modal.kind === 'inbox') modalRoot.innerHTML = inboxHtml(inboxState);
  else {
    const unread = inboxState.key ? (inboxState.inbox?.unread ?? 0) : null;
    modalRoot.innerHTML = settingsHtml(t, prefs, settingsMsg, installState(), online !== null, unread);
  }
  const who = modalRoot.querySelector('.who');
  if (who) who.textContent = CREATOR_NAME; // never parsed as HTML
  const copyright = modalRoot.querySelector('.copyright');
  if (copyright) copyright.textContent = COPYRIGHT;
  const overlay = modalRoot.querySelector('.overlay');
  if (overlay) overlay.scrollTop = prevScroll;
}

function openModal(m: Modal | null) {
  const sameKind = modal && m && modal.kind === m.kind;
  modal = m;
  if (!sameKind) settingsMsg = '';
  if (m) stopTimer(); // pause bots; schedule() restarts from the current state
  renderModal();
  if (!sameKind) modalRoot.querySelector('.overlay')?.scrollTo(0, 0);
  if (!sameKind && m?.kind === 'online' && !online) void refreshRooms();
  if (!sameKind && (m?.kind === 'inbox' || (m?.kind === 'settings' && inboxState.key))) void loadInbox();
  if (!sameKind && m?.kind === 'feedback') {
    fbForm.sent = false;
    fbForm.error = '';
  }
  if (!m) schedule();
}

function applyLookAndLanguage() {
  document.body.className = `theme-${prefs.theme} bg-${prefs.background}${prefs.animations ? '' : ' no-anim'}`;
  document.documentElement.lang = t.htmlLang;
}

/** Next screen once a first-run step is done. */
function afterOnboarding(): Modal | null {
  return onboardingStep() ?? (onlineForm.codeInput && SERVER_URL && !online ? { kind: 'online' } : null);
}

function submitName() {
  const input = modalRoot.querySelector<HTMLInputElement>('#name-input');
  const n = cleanName(input?.value ?? '', '');
  if (!n) {
    nameError = t.nameRequired;
    renderModal();
    modalRoot.querySelector<HTMLInputElement>('#name-input')?.focus();
    return;
  }
  nameError = '';
  prefs.playerName = n;
  onlineForm.name = n;
  savePrefs(prefs);
  openModal(afterOnboarding());
}

function endTour() {
  prefs.tourDone = true;
  savePrefs(prefs);
  openModal(afterOnboarding());
  if (!online && !modal && state.completedTricks.length === 0 && state.currentTrick.length === 0) dealFx(null, state);
}

function setLanguage(lang: Lang) {
  prefs.lang = lang;
  t = STRINGS[lang];
  savePrefs(prefs);
  applyLookAndLanguage();
  render();
  if (modal?.kind === 'lang') openModal(afterOnboarding());
  else renderModal();
}

/** Make sure a mode is owned, paying for it if needed. False (with a message) when coins are short. */
function buyMode(mode: TrumpMode): boolean {
  if (prefs.unlockedModes.includes(mode)) return true;
  const price = MODE_PRICES[mode];
  const msg = prefs.coins < price ? t.notEnoughCoins(price - prefs.coins) : '';
  if (msg) {
    if (modal?.kind === 'online') onlineForm.error = msg;
    else settingsMsg = msg;
    renderModal();
    return false;
  }
  prefs.coins -= price;
  prefs.unlockedModes.push(mode);
  savePrefs(prefs);
  sfx.coin();
  render();
  return true;
}

function setMode(mode: TrumpMode) {
  if (online) {
    settingsMsg = t.modeHostOnly;
    return renderModal();
  }
  if (mode === prefs.mode) return;
  settingsMsg = '';
  if (!buyMode(mode)) return;
  prefs.mode = mode;
  savePrefs(prefs);
  // If no card has been played yet this round, re-deal right away in the new mode.
  const untouched =
    state.phase !== 'roundOver' && state.completedTricks.length === 0 && state.currentTrick.length === 0;
  if (untouched) {
    stopTimer();
    state = dealRound(withChosenMode({ ...state, roundNumber: state.roundNumber - 1 }), state.dealer, Math.random);
    settingsMsg = t.modeNow;
    render();
  } else {
    settingsMsg = t.modeNextRound;
  }
  renderModal();
}

function pickTheme(id: string) {
  if (!isThemeId(id)) return;
  const theme = THEMES.find((th) => th.id === id)!;
  settingsMsg = '';
  if (!prefs.unlocked.includes(id)) {
    if (prefs.coins < theme.price) {
      settingsMsg = t.notEnoughCoins(theme.price - prefs.coins);
      renderModal();
      return;
    }
    prefs.coins -= theme.price;
    prefs.unlocked.push(id);
    sfx.coin();
  }
  prefs.theme = id;
  savePrefs(prefs);
  applyLookAndLanguage();
  render();
  renderModal();
}

function pickBackground(id: string) {
  if (!isBackgroundId(id)) return;
  const bg = BACKGROUNDS.find((b) => b.id === id)!;
  settingsMsg = '';
  if (!prefs.unlockedBgs.includes(id)) {
    if (prefs.coins < bg.price) {
      settingsMsg = t.notEnoughCoins(bg.price - prefs.coins);
      renderModal();
      return;
    }
    prefs.coins -= bg.price;
    prefs.unlockedBgs.push(id);
    sfx.coin();
  }
  prefs.background = id;
  savePrefs(prefs);
  applyLookAndLanguage();
  render();
  renderModal();
}

modalRoot.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const tourBtn = target.closest<HTMLElement>('[data-tour]');
  if (tourBtn && modal?.kind === 'tour') {
    const a = tourBtn.dataset.tour;
    if (a === 'skip' || a === 'finish') return endTour();
    const step = Math.max(0, Math.min(TOUR.length - 1, modal.step + (a === 'next' ? 1 : -1)));
    modal = { kind: 'tour', step };
    return renderModal();
  }
  const el = target.closest<HTMLElement>(
    '[data-m],[data-tab],[data-lang],[data-sound],[data-anim],[data-kick],[data-fb-kind],[data-fb-read],[data-fb-delete],[data-mode],[data-theme],[data-bg],[data-sit],[data-online-mode],[data-pick]',
  );
  if (!el) return;
  const d = el.dataset;
  const mustAnswer = modal?.kind === 'lang' || modal?.kind === 'name';
  if (d.m === 'close' || (d.m === 'backdrop' && el === target && !mustAnswer)) return openModal(null);
  if (d.m === 'name-ok') return submitName();
  if (d.m === 'tour') return openModal({ kind: 'tour', step: 0 });
  if (d.m === 'newgame') {
    if (confirm(t.confirmReset)) {
      openModal(null);
      resetGame();
    }
    return;
  }
  if (d.tab === 'rules' || d.tab === 'allRules' || d.tab === 'online' || d.tab === 'credits') {
    return openModal({ kind: 'info', tab: d.tab });
  }
  if (d.m === 'feedback') return openModal({ kind: 'feedback' });
  if (d.m === 'inbox') return openModal({ kind: 'inbox' });
  if (d.fbKind) {
    fbForm.kind = d.fbKind as FeedbackKind;
    return renderModal();
  }
  if (d.m === 'fb-send') return void submitFeedback();
  if (d.m === 'inbox-login') {
    inboxState.key = modalRoot.querySelector<HTMLInputElement>('#admin-key')?.value.trim() ?? '';
    inboxState.error = '';
    return void loadInbox();
  }
  if (d.m === 'inbox-logout') {
    inboxState.key = '';
    inboxState.inbox = null;
    saveAdminKey('');
    return renderModal();
  }
  if (d.m === 'inbox-refresh') return void loadInbox();
  if (d.m === 'inbox-read-all') return void inboxAction((inboxState.inbox?.items ?? []).filter((f) => !f.read).map((f) => f.id), 'read');
  if (d.fbRead) return void inboxAction([d.fbRead], 'read');
  if (d.fbDelete) {
    if (confirm('Yo sandesh mettaune? / Delete this message?')) void inboxAction([d.fbDelete], 'delete');
    return;
  }
  if (d.m === 'create') return void onlineCreate();
  if (d.m === 'refresh') return void refreshRooms();
  if (d.pick) return pickRoom(d.pick);
  if (d.m === 'join') return onlineJoin();
  if (d.m === 'share') return void onlineShare();
  if (d.m === 'leave') return onlineLeave();
  if (d.m === 'start') return online?.client.send({ t: 'start' });
  if (d.kick !== undefined) {
    if (confirm(t.kickConfirm(d.name ?? ''))) online?.client.send({ t: 'kick', seat: Number(d.kick) as Seat });
    return;
  }
  if (d.m === 'close-room') {
    if (confirm(t.closeRoomConfirm) && online) {
      closingMyRoom = true;
      online.client.send({ t: 'close' });
    }
    return;
  }
  if (d.sit !== undefined) return online?.client.send({ t: 'sit', seat: Number(d.sit) as Seat });
  const om = d.onlineMode;
  if (om === 'open' || om === 'bandHukum' || om === 'cutHukum') {
    if (!buyMode(om)) return;
    return online?.client.send({ t: 'mode', mode: om });
  }
  if (d.lang && LANGS.includes(d.lang as Lang)) return setLanguage(d.lang as Lang);
  if (d.anim) {
    prefs.animations = d.anim === 'on';
    savePrefs(prefs);
    applyLookAndLanguage();
    return renderModal();
  }
  if (d.sound) {
    prefs.sound = d.sound === 'on';
    setSoundEnabled(prefs.sound);
    savePrefs(prefs);
    sfx.click();
    return renderModal();
  }
  if (d.mode === 'open' || d.mode === 'bandHukum' || d.mode === 'cutHukum') return setMode(d.mode);
  if (d.theme) return pickTheme(d.theme);
  if (d.bg) return pickBackground(d.bg);
  if (d.m === 'install' && installPrompt) {
    const p = installPrompt;
    installPrompt = null;
    void p.prompt();
    void p.userChoice.finally(renderModal);
  }
});

modalRoot.addEventListener('input', (e) => {
  const el = e.target as HTMLInputElement;
  if (el.id === 'online-name') onlineForm.name = el.value;
  if (el.id === 'name-input') nameDraft = el.value;
  if (el.id === 'fb-message') {
    fbForm.message = el.value;
    const count = modalRoot.querySelector('#fb-count');
    if (count) count.textContent = String([...el.value].length);
  }
  if (el.id === 'fb-contact') fbForm.contact = el.value;
  if (el.id === 'fb-info') fbForm.includeInfo = el.checked;
  if (el.id === 'online-join-pw') onlineForm.joinPassword = el.value;
  if (el.id === 'online-room-name') onlineForm.roomName = el.value;
  if (el.id === 'online-create-pw') onlineForm.createPassword = el.value;
  if (el.id === 'online-code') {
    const v = normalizeRoomCode(el.value);
    if (v !== el.value) el.value = v;
    onlineForm.codeInput = v;
  }
});
modalRoot.addEventListener('keydown', (e) => {
  const id = (e.target as HTMLElement).id;
  if (e.key === 'Enter' && (id === 'online-code' || id === 'online-join-pw')) onlineJoin();
  if (e.key === 'Enter' && id === 'name-input') submitName();
});

// ---------- feedback ----------

async function submitFeedback() {
  if (!SERVER_URL || fbForm.sending) return;
  if (!fbForm.message.trim()) {
    fbForm.error = t.feedbackEmpty;
    return renderModal();
  }
  fbForm.sending = true;
  fbForm.error = '';
  renderModal();
  const meta = fbForm.includeInfo
    ? {
        lang: prefs.lang ?? '',
        mode: prefs.mode,
        online: online ? `room ${online.code}` : 'offline',
        build: __APP_BUILD__,
        screen: `${innerWidth}x${innerHeight} @${devicePixelRatio}x`,
        device: navigator.userAgent,
      }
    : {};
  const result = await sendFeedback(SERVER_URL, {
    kind: fbForm.kind,
    message: fbForm.message,
    contact: fbForm.contact,
    meta,
  });
  fbForm.sending = false;
  if (result === 'ok') {
    fbForm.sent = true;
    fbForm.message = '';
    sfx.coin();
  } else fbForm.error = result === 'too_many' ? t.feedbackTooMany : t.feedbackFailed;
  if (modal?.kind === 'feedback') renderModal();
}

async function loadInbox() {
  if (!SERVER_URL || !inboxState.key) return renderModal();
  inboxState.loading = true;
  if (modal?.kind === 'inbox') renderModal();
  const result = await fetchInbox(SERVER_URL, inboxState.key);
  inboxState.loading = false;
  if (result === 'unauthorized') {
    inboxState.error = 'unauthorized';
    inboxState.inbox = null;
    saveAdminKey('');
  } else if (result === 'error') {
    inboxState.error = t.feedbackFailed;
  } else {
    inboxState.error = '';
    inboxState.inbox = result;
    saveAdminKey(inboxState.key); // the key worked: remember it on this device
  }
  if (modal?.kind === 'inbox' || modal?.kind === 'settings') renderModal();
}

async function inboxAction(ids: string[], action: 'read' | 'delete') {
  if (!SERVER_URL || !inboxState.key || !ids.length) return;
  await updateInbox(SERVER_URL, inboxState.key, ids, action);
  await loadInbox();
}

// ---------- online play ----------

/** The name for online play — required, so friends can tell who is who. */
function onlineName(): string | null {
  const n = cleanName(onlineForm.name, '');
  if (!n) {
    onlineForm.error = t.nameRequired;
    renderModal();
    modalRoot.querySelector<HTMLInputElement>('#online-name')?.focus();
    return null;
  }
  prefs.playerName = n;
  savePrefs(prefs);
  return n;
}

function setRoomInUrl(code: string | null) {
  const url = new URL(location.href);
  if (code) url.searchParams.set('room', code);
  else url.searchParams.delete('room');
  history.replaceState(null, '', url);
}

async function onlineCreate() {
  if (!SERVER_URL || onlineForm.busy || !cleanName(onlineForm.name, '')) {
    if (!cleanName(onlineForm.name, '')) onlineName();
    return;
  }
  onlineForm.busy = true;
  onlineForm.error = '';
  renderModal();
  const name = onlineName();
  if (!name) return;
  const roomName = cleanName(onlineForm.roomName, t.roomNamePlaceholder(name), ROOM_NAME_MAX);
  const password = onlineForm.createPassword;
  try {
    const code = await createRoom(SERVER_URL, { name: roomName, password });
    onlineForm.created = { code, password };
    connectTo(code, password);
  } catch {
    onlineForm.error = t.onlineErrors.network;
  } finally {
    onlineForm.busy = false;
    renderModal();
  }
}

function onlineJoin() {
  const code = normalizeRoomCode(onlineForm.codeInput);
  if (!isRoomCode(code)) {
    onlineForm.error = t.onlineErrors.not_found;
    return renderModal();
  }
  connectTo(code, onlineForm.joinPassword);
}

async function refreshRooms() {
  if (!SERVER_URL) return;
  onlineForm.rooms = null;
  if (modal?.kind === 'online') renderModal();
  try {
    onlineForm.rooms = await listRooms(SERVER_URL);
  } catch {
    onlineForm.rooms = [];
    onlineForm.error = t.onlineErrors.network;
  }
  if (modal?.kind === 'online' && !online) renderModal();
}

/** Tap on a room in the list: join right away, or ask for its password first. */
function pickRoom(code: string) {
  const room = onlineForm.rooms?.find((r) => r.code === code);
  if (!room) return;
  if (!room.locked) return connectTo(code, '');
  onlineForm.codeInput = code;
  onlineForm.joinPassword = '';
  onlineForm.error = '';
  onlineForm.notice = t.enterPasswordFor(room.name);
  renderModal();
  modalRoot.querySelector<HTMLInputElement>('#online-join-pw')?.focus();
}

function connectTo(code: string, password = '') {
  if (!SERVER_URL) return;
  online?.client.stop();
  stopTimer();
  onlineForm.error = '';
  onlineForm.notice = '';
  const playerName = onlineName();
  if (!playerName) return;
  const client = new OnlineClient(SERVER_URL, code, playerName, password, {
    onMessage: onServerMessage,
    onStatus: (st) => {
      if (online?.client !== client) return;
      online.status = st;
      render();
      if (modal?.kind === 'online') renderModal();
    },
    onFatal: (reason) => {
      if (online?.client === client) leaveOnline(reason);
    },
  });
  online = { client, code, seat: 0, room: null, status: 'connecting', fresh: true, waiting: false };
  setRoomInUrl(code);
  client.connect();
  render();
  renderModal();
}

function onServerMessage(m: ServerMsg) {
  if (!online) return;
  if (m.t === 'welcome') online.seat = m.seat;
  else if (m.t === 'room') {
    online.room = m;
    online.seat = m.you;
    if (!m.started && modal?.kind !== 'online') openModal({ kind: 'online' });
    else if (modal?.kind === 'online') renderModal();
    render();
  } else if (m.t === 'state') {
    online.waiting = false;
    const next = rotateView(m.view, online.seat);
    if (online.fresh) {
      online.fresh = false;
      roundCoins = 0;
      state = next;
      if (modal?.kind === 'online') openModal(null);
      render();
      dealFx(null, next);
      return;
    }
    const prev = state;
    state = next;
    react(prev, next);
    render();
    dealFx(prev, next);
  } else if (m.t === 'say') {
    const local = ((m.seat - online.seat + 4) % 4) as Seat;
    const { text, emoji } = sayText(m.id);
    bubble(local, text, emoji);
    sfx.click();
  } else if (m.t === 'error') {
    online.waiting = false;
    const msg = t.onlineErrors[m.code];
    if (modal?.kind === 'online') {
      onlineForm.error = msg;
      renderModal();
    } else showToast(msg, 2200);
  }
}

let waitingTimer: number | undefined;

function sendMove(msg: Parameters<OnlineClient['send']>[0]) {
  if (!online || online.waiting) return;
  if (!online.client.send(msg)) {
    online.client.wake(); // not connected: reconnect; the player can tap again
    return;
  }
  online.waiting = true;
  // if the answer got lost with a dying connection, don't block taps forever
  clearTimeout(waitingTimer);
  waitingTimer = window.setTimeout(() => {
    if (!online?.waiting) return;
    online.waiting = false;
    online.client.wake();
  }, 4000);
}

async function onlineShare() {
  if (!online) return;
  const url = new URL(location.href);
  url.search = `?room=${online.code}`;
  const pw = onlineForm.created?.code === online.code ? onlineForm.created.password : '';
  const text = t.inviteText(online.code) + (pw ? `\n${t.invitePassword(pw)}` : '');
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Dahal Khani', text, url: url.href });
      return;
    }
    await navigator.clipboard.writeText(`${text}\n${url.href}`);
    onlineForm.notice = t.copied;
  } catch {
    onlineForm.notice = url.href;
  }
  renderModal();
}

/** set when this player (the host) closes the room, so they aren't told "the host closed the room" */
let closingMyRoom = false;

/** Back to the offline game (after leaving, or when the room is gone). */
function leaveOnline(reason?: FatalReason) {
  if (reason === 'room_closed' && closingMyRoom) {
    closingMyRoom = false;
    reason = undefined;
    online?.client.stop();
    online = null;
    sayOpen = false;
    clearFx();
    setRoomInUrl(null);
    onlineForm.error = '';
    resetGame();
    openModal(null);
    return;
  }
  // keep the number typed in, so a wrong password can simply be retried
  if (online && (reason === 'wrong_password' || reason === 'too_many_attempts')) onlineForm.codeInput = online.code;
  online?.client.stop();
  online = null;
  sayOpen = false;
  clearFx();
  setRoomInUrl(null);
  onlineForm.error = reason ? t.onlineErrors[reason] : '';
  onlineForm.notice = '';
  resetGame();
  if (reason) openModal({ kind: 'online' });
}

function onlineLeave() {
  online?.client.leave();
  leaveOnline();
  openModal(null);
}

// keep the guide's spotlight on its target when the phone rotates
window.addEventListener('resize', () => {
  if (modal?.kind === 'tour') renderModal();
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') online?.client.wake();
});
window.addEventListener('online', () => online?.client.wake());

// ---------- install as an app (PWA) ----------

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
let installPrompt: BeforeInstallPromptEvent | null = null;

function installState() {
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return { canPrompt: installPrompt !== null, installed: standalone };
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); // offer our own Install button in settings instead of the browser mini-bar
  installPrompt = e as BeforeInstallPromptEvent;
  if (modal?.kind === 'settings') renderModal();
});

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* offline support is optional */
    });
  });
}

// ---------- input ----------

app.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-card],[data-suit],[data-action],[data-say]');
  if (el?.dataset.action === 'say') {
    sayOpen = !sayOpen;
    return render();
  }
  if (el?.dataset.action === 'last') {
    if (peekLast) stopPeek();
    else if (canPeek()) {
      peekLast = true;
      peekTimer = window.setTimeout(() => {
        peekLast = false;
        render();
      }, PEEK_MS);
    }
    return render();
  }
  if (el?.dataset.say) {
    online?.client.send({ t: 'say', id: el.dataset.say as SayId });
    sayOpen = false;
    return render();
  }
  if (sayOpen && !(e.target as HTMLElement).closest('.say-panel')) {
    sayOpen = false;
    render();
  }
  if (!el) return;
  if (el.dataset.action === 'next' && state.phase === 'roundOver') return startNextRound();
  if (el.dataset.action === 'info') return openModal({ kind: 'info', tab: 'rules' });
  if (el.dataset.action === 'settings') return openModal({ kind: 'settings' });
  if (el.dataset.action === 'online') return openModal({ kind: 'online' });
  if (el.dataset.suit && state.phase === 'choosingTrump' && state.trumpChooser === HUMAN) {
    const suit = el.dataset.suit as Suit;
    if (!SUITS.includes(suit)) return;
    if (online) sendMove({ t: 'trump', suit });
    else apply(chooseTrump(state, HUMAN, suit));
    return;
  }
  if (el.dataset.card !== undefined && state.phase === 'playing' && state.turn === HUMAN) {
    const card = sortHand(state.hands[HUMAN], visibleTrump(state, HUMAN))[Number(el.dataset.card)];
    if (!card || !legalCards(state, HUMAN).some((c) => sameCard(c, card))) return;
    if (online) sendMove({ t: 'play', card });
    else apply(playCard(state, HUMAN, card));
  }
});

document.addEventListener('pointerdown', unlockAudio, { once: true });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal && modal.kind !== 'lang' && modal.kind !== 'name') {
    if (modal.kind === 'tour') endTour();
    else openModal(null);
  }
});

applyLookAndLanguage();
// Dev only (stripped from the live build): pretend to be a phone with a notch, e.g. ?safe=47,0,34,0
const fakeSafe = import.meta.env.DEV ? new URLSearchParams(location.search).get('safe') : null;
if (fakeSafe) {
  const [top, right, bottom, left] = fakeSafe.split(',').map((n) => `${Number(n) || 0}px`);
  const root = document.documentElement.style;
  root.setProperty('--sat', top);
  root.setProperty('--sar', right ?? '0px');
  root.setProperty('--sab', bottom ?? '0px');
  root.setProperty('--sal', left ?? '0px');
  for (const cls of ['dev-safe-top', 'dev-safe-bottom', 'dev-safe-left', 'dev-safe-right']) {
    const bar = document.createElement('div');
    bar.className = cls;
    document.body.appendChild(bar);
  }
}
// Dev only (stripped from the live build): preview a result screen, e.g. ?result=kot-lose
const previewResult = import.meta.env.DEV ? new URLSearchParams(location.search).get('result') : null;
if (previewResult) {
  const [kind, side] = previewResult.split('-');
  const ours = side === 'win';
  const tens: [number, number] = kind === 'normal' ? (ours ? [3, 1] : [2, 2]) : ours ? [4, 0] : [0, 4];
  const tricks: [number, number] = kind === 'baunne' ? (ours ? [13, 0] : [0, 13]) : ours ? [8, 5] : [6, 7];
  const r = computeRoundResult(tens, tricks, GAME_SETTINGS.points);
  roundCoins = coinsFor(r, 0);
  state = { ...state, phase: 'roundOver', lastResult: r, tensWon: tens, tricksWon: tricks };
}
// The creator opens their inbox with ?admin
if (new URLSearchParams(location.search).has('admin') && SERVER_URL && !modal) modal = { kind: 'inbox' };
// Opened from an invite link: rejoin straight away if we were already in that room, else ask for a name.
if (onlineForm.codeInput && SERVER_URL && !modal) {
  let rejoin = false;
  try {
    rejoin = !!localStorage.getItem(`dahal-khani:token:${onlineForm.codeInput}`) && !!prefs.playerName;
  } catch {
    /* no storage */
  }
  if (rejoin) connectTo(onlineForm.codeInput);
  else modal = { kind: 'online' };
}
render();
renderModal();
if (!online && !modal) dealFx(null, state);
if (SERVER_URL && !AUTOPLAY) {
  startPresence(SERVER_URL, (n) => {
    liveCount = n;
    render();
  });
}
schedule();
