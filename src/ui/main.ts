// Browser UI. All game rules live in ../engine; this file only renders state and schedules bot moves.
import './style.css';
import {
  botChooseCard,
  botChooseTrump,
  chooseTrump,
  collectTrick,
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
import { BOT_DELAY_MS, COIN_REWARDS, CREATOR_NAME, GAME_SETTINGS, TRICK_PAUSE_MS } from '../settings';
import { cleanName, isRoomCode, normalizeRoomCode, ROOM_NAME_MAX, type RoomListing, type ServerMsg } from '../online/protocol';
import { escapeHtml } from './html';
import { LANGS, STRINGS, type Lang, type Strings } from './i18n';
import { infoHtml, languagePickerHtml, onlineHtml, settingsHtml, type Modal, type RoomInfo } from './modals';
import { createRoom, listRooms, OnlineClient, SERVER_URL, type ConnStatus, type FatalReason } from './online';
import { loadPrefs, savePrefs } from './prefs';
import { setSoundEnabled, sfx, unlockAudio } from './sound';
import { isBackgroundId, isThemeId, THEMES } from './themes';

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
let modal: Modal | null = prefs.lang ? null : { kind: 'lang' };
let settingsMsg = '';
let state: GameState = newGame({ ...GAME_SETTINGS, trumpMode: prefs.mode });
let timer: number | null = null;
let toast: string | null = null;
let toastTimer: number | null = null;
/** Coins earned in the round that just ended (shown in the summary). */
let roundCoins = 0;

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
  schedule();
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
    roundCoins = r.winningTeam === 0 ? COIN_REWARDS[r.kind] : 0;
    if (roundCoins > 0) {
      prefs.coins += roundCoins;
      savePrefs(prefs);
      window.setTimeout(() => sfx.coin(), 900);
    }
    if (r.kind === 'baunne') sfx.baunne();
    else if (r.kind === 'kot') sfx.kot();
    else if (r.winningTeam === 0) sfx.win();
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

function trickHtml(): string {
  const s = state;
  const winner = s.phase === 'trickComplete' ? trickWinner(s.currentTrick, currentTrump(s)) : null;
  const slots = s.currentTrick
    .map((p) => cardHtml(p.card, { cls: `slot slot-${POS[p.seat]} ${p.seat === winner ? 'winner' : ''}` }))
    .join('');
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
  return `<div class="trick">${slots}${center}</div>`;
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
        data: `data-card="${i}"`,
      });
    })
    .join('');
  return `<div class="hand" style="--n:${Math.max(hand.length, 1)}">${cards}</div>`;
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
      : `<span class="trump-badge none">🔒 ${t.trump} ?</span>`;
  }
  if (s.settings.trumpMode === 'cutHukum') return `<span class="trump-badge none">✂ ${t.trump} ?</span>`;
  return `<span class="trump-badge none">${t.trump} ?</span>`;
}

function summaryHtml(): string {
  const s = state;
  const r = s.lastResult;
  if (s.phase !== 'roundOver' || !r) return '';
  const weWon = r.winningTeam === 0;
  const teamName = (team: 0 | 1) => (team === 0 ? t.teamUs : t.teamThem);
  const kindTitle = r.kind === 'baunne' ? t.baunne : r.kind === 'kot' ? t.kot : weWon ? t.win : t.lose;
  const why =
    r.kind === 'baunne'
      ? t.whyBaunne
      : r.kind === 'kot'
        ? t.whyKot
        : r.tens[r.winningTeam] >= 3
          ? t.whyTens(r.tens[r.winningTeam])
          : t.whyTricks(r.tricks[r.winningTeam]);
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
      <div class="result-team">${t.roundWonBy(teamName(r.winningTeam), r.points)}</div>
      <div class="why">${why}</div>
      ${roundCoins > 0 ? `<div class="coins-earned">${t.coinsEarned(roundCoins)}</div>` : ''}
      <table>
        <tr><th></th><th>${t.teamUs}</th><th>${t.teamThem}</th></tr>
        <tr><td>${t.dahal}</td><td>${r.tens[0]}</td><td>${r.tens[1]}</td></tr>
        <tr><td>${t.haat}</td><td>${r.tricks[0]}</td><td>${r.tricks[1]}</td></tr>
        <tr class="total"><td>${t.totalScore}</td><td>${s.score[0]}</td><td>${s.score[1]}</td></tr>
      </table>
      <button class="primary" data-action="next">${t.nextRound}</button>
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
          ? `<button class="small room-chip" data-action="online" title="${t.online}">${online.status === 'open' ? '🌐' : '⏳'} ${online.code}</button>`
          : SERVER_URL
            ? `<button class="small" data-action="online" title="${t.playOnline}" aria-label="${t.online}">🌐</button>`
            : ''
      }
      <button class="small" data-action="info" title="${t.info}" aria-label="${t.info}">ⓘ</button>
      <button class="small" data-action="settings" title="${t.settings}" aria-label="${t.settings}">⚙</button>
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

// ---------- dialogs ----------

function renderModal() {
  const prevScroll = modalRoot.querySelector('.overlay')?.scrollTop ?? 0;
  if (!modal) modalRoot.innerHTML = '';
  else if (modal.kind === 'lang') modalRoot.innerHTML = languagePickerHtml();
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
    });
  } else modalRoot.innerHTML = settingsHtml(t, prefs, settingsMsg, installState(), online !== null);
  const who = modalRoot.querySelector('.who');
  if (who) who.textContent = CREATOR_NAME; // never parsed as HTML
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
  if (!m) schedule();
}

function applyLookAndLanguage() {
  document.body.className = `theme-${prefs.theme} bg-${prefs.background}`;
  document.documentElement.lang = t.htmlLang;
}

function setLanguage(lang: Lang) {
  prefs.lang = lang;
  t = STRINGS[lang];
  savePrefs(prefs);
  applyLookAndLanguage();
  render();
  if (modal?.kind === 'lang') openModal(onlineForm.codeInput && SERVER_URL ? { kind: 'online' } : null);
  else renderModal();
}

function setMode(mode: TrumpMode) {
  if (online) {
    settingsMsg = t.modeHostOnly;
    return renderModal();
  }
  if (mode === prefs.mode) return;
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

modalRoot.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const el = target.closest<HTMLElement>(
    '[data-m],[data-tab],[data-lang],[data-sound],[data-mode],[data-theme],[data-bg],[data-sit],[data-online-mode],[data-pick]',
  );
  if (!el) return;
  const d = el.dataset;
  if (d.m === 'close' || (d.m === 'backdrop' && el === target && modal?.kind !== 'lang')) return openModal(null);
  if (d.m === 'newgame') {
    if (confirm(t.confirmReset)) {
      openModal(null);
      resetGame();
    }
    return;
  }
  if (d.tab === 'rules' || d.tab === 'allRules' || d.tab === 'credits') return openModal({ kind: 'info', tab: d.tab });
  if (d.m === 'create') return void onlineCreate();
  if (d.m === 'refresh') return void refreshRooms();
  if (d.pick) return pickRoom(d.pick);
  if (d.m === 'join') return onlineJoin();
  if (d.m === 'share') return void onlineShare();
  if (d.m === 'leave') return onlineLeave();
  if (d.m === 'start') return online?.client.send({ t: 'start' });
  if (d.sit !== undefined) return online?.client.send({ t: 'sit', seat: Number(d.sit) as Seat });
  const om = d.onlineMode;
  if (om === 'open' || om === 'bandHukum' || om === 'cutHukum') return online?.client.send({ t: 'mode', mode: om });
  if (d.lang && LANGS.includes(d.lang as Lang)) return setLanguage(d.lang as Lang);
  if (d.sound) {
    prefs.sound = d.sound === 'on';
    setSoundEnabled(prefs.sound);
    savePrefs(prefs);
    sfx.click();
    return renderModal();
  }
  if (d.mode === 'open' || d.mode === 'bandHukum' || d.mode === 'cutHukum') return setMode(d.mode);
  if (d.theme) return pickTheme(d.theme);
  if (d.bg && isBackgroundId(d.bg)) {
    prefs.background = d.bg;
    savePrefs(prefs);
    applyLookAndLanguage();
    return renderModal();
  }
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
});

// ---------- online play ----------

function onlineName(): string {
  const n = cleanName(onlineForm.name, '');
  if (n) {
    prefs.playerName = n;
    savePrefs(prefs);
  }
  return n || t.names[HUMAN];
}

function setRoomInUrl(code: string | null) {
  const url = new URL(location.href);
  if (code) url.searchParams.set('room', code);
  else url.searchParams.delete('room');
  history.replaceState(null, '', url);
}

async function onlineCreate() {
  if (!SERVER_URL || onlineForm.busy) return;
  onlineForm.busy = true;
  onlineForm.error = '';
  renderModal();
  const name = onlineName();
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
  const client = new OnlineClient(SERVER_URL, code, onlineName(), password, {
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
      return;
    }
    const prev = state;
    state = next;
    react(prev, next);
    render();
  } else if (m.t === 'error') {
    online.waiting = false;
    const msg = t.onlineErrors[m.code];
    if (modal?.kind === 'online') {
      onlineForm.error = msg;
      renderModal();
    } else showToast(msg, 2200);
  }
}

function sendMove(msg: Parameters<OnlineClient['send']>[0]) {
  if (!online || online.waiting) return;
  online.waiting = true;
  online.client.send(msg);
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

/** Back to the offline game (after leaving, or when the room is gone). */
function leaveOnline(reason?: FatalReason) {
  // keep the number typed in, so a wrong password can simply be retried
  if (online && (reason === 'wrong_password' || reason === 'too_many_attempts')) onlineForm.codeInput = online.code;
  online?.client.stop();
  online = null;
  setRoomInUrl(null);
  onlineForm.error = reason ? t.onlineErrors[reason] : '';
  onlineForm.notice = '';
  resetGame();
  if (reason) openModal({ kind: 'online' });
}

function onlineLeave() {
  leaveOnline();
  openModal(null);
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') online?.client.wake();
});

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
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-card],[data-suit],[data-action]');
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
  if (e.key === 'Escape' && modal && modal.kind !== 'lang') openModal(null);
});

applyLookAndLanguage();
// Opened from an invite link: rejoin straight away if we were already in that room, else ask for a name.
if (onlineForm.codeInput && SERVER_URL && prefs.lang) {
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
schedule();
