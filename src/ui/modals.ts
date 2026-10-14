// HTML for the dialogs: first-launch language picker, ⓘ info (how to play / all rules / credits),
// ⚙ settings and the 🌐 online lobby.
// All text comes from i18n.ts; the creator name is inserted with textContent by main.ts.
import type { TrumpMode } from '../engine';
import { COIN_REWARDS, GAME_SETTINGS } from '../settings';
import type { RoomListing, ServerMsg } from '../online/protocol';
import { escapeHtml } from './html';
import { LANGS, STRINGS, type Lang, type Strings } from './i18n';
import type { Prefs } from './prefs';
import { ONLINE_GUIDE } from './online-guide';
import { FULL_RULES } from './rules';
import { BACKGROUNDS, THEMES } from './themes';

export type InfoTab = 'rules' | 'allRules' | 'online' | 'credits';
export type Modal =
  | { kind: 'lang' }
  | { kind: 'name' }
  | { kind: 'tour'; step: number }
  | { kind: 'info'; tab: InfoTab }
  | { kind: 'settings' }
  | { kind: 'online' }
  | { kind: 'feedback' }
  | { kind: 'inbox' };

const MODES: readonly TrumpMode[] = ['open', 'bandHukum', 'cutHukum'];

function shell(inner: string, opts: { closable: boolean; cls?: string; label: string }) {
  return `<div class="overlay dialog" data-m="backdrop">
    <div class="modal sheet ${opts.cls ?? ''}" role="dialog" aria-modal="true" aria-label="${opts.label}">
      ${opts.closable ? `<button class="close" data-m="close" aria-label="Close">×</button>` : ''}
      ${inner}
    </div>
  </div>`;
}

function languageButtons(current: Prefs['lang']) {
  return LANGS.map(
    (l) => `<button class="lang-btn ${l === current ? 'on' : ''}" data-lang="${l}">${STRINGS[l].langName}</button>`,
  ).join('');
}

export function languagePickerHtml(): string {
  const title = LANGS.map((l) => STRINGS[l].chooseLanguage).join(' · ');
  return shell(
    `<div class="lang-pick">
      <img class="hero-art" src="icons/icon-512.png" width="112" height="112"
        alt="Dahal Khani — four tens (Dahal) in a hand" />
      <h2>Dahal Khani</h2>
      <p class="muted">${title}</p>
      <div class="lang-grid">${languageButtons(null)}</div>
    </div>`,
    { closable: false, cls: 'lang-modal', label: 'Language' },
  );
}

/** First run, after the language: everyone needs a name (online players must recognise each other). */
export function nameHtml(t: Strings, value: string, error: string): string {
  return shell(
    `<div class="name-step">
      <div class="suits-line big">♠ ♥ ♣ ♦</div>
      <h2>${t.nameTitle}</h2>
      <p class="muted">${t.nameHint}</p>
      ${error ? `<div class="online-error" role="alert">${error}</div>` : ''}
      <input id="name-input" maxlength="16" autocomplete="nickname" placeholder="${t.namePlaceholder}"
        value="${escapeHtml(value)}" />
      <button class="primary" data-m="name-ok">${t.continueBtn}</button>
    </div>`,
    { closable: false, cls: 'name-modal', label: t.nameTitle },
  );
}

export function infoHtml(t: Strings, lang: Lang, tab: InfoTab): string {
  const body =
    tab === 'rules'
      ? t.rulesHtml(GAME_SETTINGS.points, COIN_REWARDS)
      : tab === 'allRules'
        ? FULL_RULES[lang](GAME_SETTINGS.points, COIN_REWARDS)
        : tab === 'online'
          ? ONLINE_GUIDE[lang]
          : `<h2>${t.credits}</h2>
         <div class="credit-card">
           <div class="by">${t.creditsBy}</div>
           <div class="who"></div>
           <div class="copyright"></div>
           <div class="sub">Dahal Khani · Dahal Mara · Dahal Jeet</div>
           <div class="suits-line">♠ ♥ ♣ ♦</div>
         </div>
         <p>${t.creditsText}</p>`;
  return shell(
    `<div class="tabs">
      <button data-tab="rules" class="${tab === 'rules' ? 'on' : ''}">${t.howToPlay}</button>
      <button data-tab="allRules" class="${tab === 'allRules' ? 'on' : ''}">${t.allRules}</button>
      <button data-tab="online" class="${tab === 'online' ? 'on' : ''}">🌐 ${t.onlineTab}</button>
      <button data-tab="credits" class="${tab === 'credits' ? 'on' : ''}">${t.credits}</button>
    </div>
    <button class="ghost guide-btn" data-m="tour">${t.replayGuide}</button>
    ${body}`,
    { closable: true, cls: 'info-modal', label: t.info },
  );
}

export interface InstallState {
  /** the browser offered an install prompt we can trigger */
  canPrompt: boolean;
  /** already running as an installed app */
  installed: boolean;
}

export function settingsHtml(
  t: Strings,
  prefs: Prefs,
  message: string,
  install: InstallState,
  online = false,
  /** creator's device only: unread feedback count (null = not the creator) */
  inboxUnread: number | null = null,
): string {
  const bgs = BACKGROUNDS.map(
    (b) => `<button class="bg-tile ${prefs.background === b ? 'on' : ''}" data-bg="${b}">
      <span class="bg-preview bg-${b}"></span>
      <span class="theme-name">${t.backgrounds[b]}</span>
    </button>`,
  ).join('');
  const installBox = install.installed
    ? `<p>${t.installed}</p>`
    : `${install.canPrompt ? `<button class="install" data-m="install">${t.installButton}</button>` : ''}
       <p>${t.installHint}</p>`;
  const modes = MODES.map(
    (m) => `<button class="mode-opt ${prefs.mode === m ? 'on' : ''}" data-mode="${m}">
      <b>${t.modes[m].name}</b><small>${t.modes[m].desc}</small>
    </button>`,
  ).join('');
  const themes = THEMES.map((th) => {
    const owned = prefs.unlocked.includes(th.id);
    const tag = owned ? (prefs.theme === th.id ? '✔' : '') : `🔒 ${th.price} 🪙`;
    return `<button class="theme-tile ${prefs.theme === th.id ? 'on' : ''} ${owned ? '' : 'locked'}"
        data-theme="${th.id}" title="${owned ? t.themes[th.id] : t.unlockFor(th.price)}">
      <span class="theme-preview theme-${th.id}">
        <span class="card red mini"><span class="corner">A<br>♥</span><span class="pip">♥</span></span>
        <span class="mini-back"></span>
      </span>
      <span class="theme-name">${t.themes[th.id]}</span>
      <span class="theme-tag">${tag}</span>
    </button>`;
  }).join('');
  return shell(
    `<h2>⚙ ${t.settings}</h2>
    <div class="coin-row">🪙 ${t.coins}: <b>${prefs.coins}</b></div>
    ${message ? `<div class="settings-msg" role="status">${message}</div>` : ''}
    <section>
      <h3>${t.language}</h3>
      <div class="lang-grid">${languageButtons(prefs.lang)}</div>
    </section>
    <section>
      <h3>${t.sound}</h3>
      <div class="seg">
        <button data-sound="on" class="${prefs.sound ? 'on' : ''}">🔊 ${t.on}</button>
        <button data-sound="off" class="${prefs.sound ? '' : 'on'}">🔇 ${t.off}</button>
      </div>
    </section>
    <section>
      <h3>${t.animations}</h3>
      <div class="seg">
        <button data-anim="on" class="${prefs.animations ? 'on' : ''}">✨ ${t.on}</button>
        <button data-anim="off" class="${prefs.animations ? '' : 'on'}">⏹ ${t.off}</button>
      </div>
      <p class="muted">${t.animationsHint}</p>
    </section>
    <section>
      <h3>${t.gameMode}</h3>
      <div class="modes">${modes}</div>
    </section>
    <section>
      <h3>${t.cardDesign}</h3>
      <div class="themes">${themes}</div>
    </section>
    <section>
      <h3>${t.background}</h3>
      <div class="bgs">${bgs}</div>
    </section>
    <section>
      <h3>${t.installApp}</h3>
      <div class="install-box">${installBox}</div>
    </section>
    ${
      online
        ? `<button class="danger" data-m="leave">${t.leaveRoom}</button>`
        : `<button class="danger" data-m="newgame">↺ ${t.newGame}</button>`
    }
    <section class="fb-section">
      <h3>${t.feedbackSection}</h3>
      <button class="primary fb-open" data-m="feedback">${t.feedbackOpen}</button>
      ${
        inboxUnread !== null
          ? `<button class="ghost inbox-open" data-m="inbox">📬 Inbox${inboxUnread ? ` <span class="badge">${inboxUnread}</span>` : ''}</button>`
          : ''
      }
    </section>`,
    { closable: true, cls: 'settings-modal', label: t.settings },
  );
}

// ---------- online lobby ----------

export type RoomInfo = Extract<ServerMsg, { t: 'room' }>;

export interface OnlineView {
  /** null when no server is configured */
  available: boolean;
  name: string;
  codeInput: string;
  joinPassword: string;
  roomName: string;
  createPassword: string;
  /** null while loading */
  rooms: RoomListing[] | null;
  busy: boolean;
  status: 'connecting' | 'open' | 'reconnecting' | null;
  room: RoomInfo | null;
  error: string;
  notice: string;
}

function seatCard(t: Strings, room: RoomInfo, seat: number, isHost: boolean): string {
  const s = room.seats[seat];
  if (!s) {
    return `<button class="seat-card empty" data-sit="${seat}">
      <span class="seat-name">${t.emptySeat}</span><small>${t.sitHere} · 🤖 ${t.botTag}</small>
    </button>`;
  }
  const tags = [
    seat === room.you ? `<b class="tag you">${t.youTag}</b>` : '',
    seat === room.host ? `<b class="tag host">👑 ${t.hostTag}</b>` : '',
    s.bot ? `<b class="tag">🤖 ${t.botTag}</b>` : '',
    !s.bot && !s.connected ? `<b class="tag away">${t.awayTag}</b>` : '',
  ].join('');
  // the host can remove other human players
  const kick =
    isHost && seat !== room.you && !s.bot
      ? `<button class="kick-btn" data-kick="${seat}" data-name="${escapeHtml(s.name)}">✕ ${t.kick}</button>`
      : '';
  return `<div class="seat-card ${seat === room.you ? 'me' : ''}">
    <span class="seat-name">${escapeHtml(s.name)}</span><span class="tags">${tags}</span>${kick}
  </div>`;
}

export function onlineHtml(t: Strings, v: OnlineView): string {
  const banner = [
    v.error ? `<div class="online-error" role="alert">${v.error}</div>` : '',
    v.notice ? `<div class="settings-msg" role="status">${escapeHtml(v.notice)}</div>` : '',
    v.status && v.status !== 'open' ? `<div class="online-status">⏳ ${v.status === 'reconnecting' ? t.reconnecting : t.connecting}</div>` : '',
  ].join('');

  if (!v.available) {
    return shell(`<h2>🌐 ${t.online}</h2><p>${t.onlineUnavailable}</p>`, {
      closable: true,
      cls: 'online-modal',
      label: t.online,
    });
  }

  if (!v.room) {
    const rooms =
      v.rooms === null
        ? `<p class="muted">⏳</p>`
        : v.rooms.length === 0
          ? `<p class="muted">${t.noRooms}</p>`
          : `<div class="room-list">${v.rooms
              .map(
                (r) => `<button class="room-row" data-pick="${r.code}">
                  <span class="room-row-name">${r.locked ? '🔒 ' : ''}${escapeHtml(r.name)}</span>
                  <small>#${r.code} · ${t.playersCount(r.players, r.free)} · ${r.started ? t.inGame : t.inLobby}</small>
                </button>`,
              )
              .join('')}</div>`;
    return shell(
      `<h2>🌐 ${t.online}</h2>
      <p class="muted">${t.onlineIntro}</p>
      ${banner}
      <label class="field">${t.yourName}
        <input id="online-name" maxlength="16" autocomplete="nickname" value="${escapeHtml(v.name)}" />
      </label>

      <section>
        <div class="section-head"><h3>${t.openRooms}</h3><button class="link" data-m="refresh">${t.refresh}</button></div>
        ${rooms}
      </section>

      <section>
        <h3>${t.joinSection}</h3>
        <div class="join-grid">
          <input id="online-code" inputmode="numeric" maxlength="6" autocomplete="off" placeholder="${t.roomNumber}"
            value="${escapeHtml(v.codeInput)}" />
          <input id="online-join-pw" type="password" maxlength="32" autocomplete="off" placeholder="${t.password}"
            value="${escapeHtml(v.joinPassword)}" />
          <button class="primary" data-m="join" ${v.busy ? 'disabled' : ''}>${t.join}</button>
        </div>
      </section>

      <section>
        <h3>${t.createSection}</h3>
        <label class="field">${t.roomName}
          <input id="online-room-name" maxlength="24" autocomplete="off"
            placeholder="${escapeHtml(t.roomNamePlaceholder(v.name || t.names[0]))}" value="${escapeHtml(v.roomName)}" />
        </label>
        <label class="field">${t.passwordOptional}
          <input id="online-create-pw" maxlength="32" autocomplete="off" value="${escapeHtml(v.createPassword)}" />
        </label>
        <p class="muted">${t.publicHint}</p>
        <button class="primary" data-m="create" ${v.busy ? 'disabled' : ''}>${t.createRoom}</button>
      </section>`,
      { closable: true, cls: 'online-modal', label: t.online },
    );
  }

  const r = v.room;
  const isHost = r.host === r.you || r.host === null || !r.seats[r.host]?.connected;
  const modes = MODES.map(
    (m) => `<button class="mode-opt ${r.mode === m ? 'on' : ''}" data-online-mode="${m}" ${isHost ? '' : 'disabled'}>
      <b>${t.modes[m].name}</b><small>${t.modes[m].desc}</small>
    </button>`,
  ).join('');
  return shell(
    `<h2>🌐 ${escapeHtml(r.name)}</h2>
    <p class="room-meta"><span class="room-code">${escapeHtml(r.code)}</span>
      <span class="tag ${r.locked ? 'host' : ''}">${r.locked ? t.privateTag : t.publicTag}</span></p>
    ${banner}
    <button class="primary share" data-m="share">${t.shareInvite}</button>
    <div class="teams">
      <div class="team-col team0"><h3>${t.teamA}</h3>${seatCard(t, r, 0, isHost)}${seatCard(t, r, 2, isHost)}</div>
      <div class="team-col team1"><h3>${t.teamB}</h3>${seatCard(t, r, 1, isHost)}${seatCard(t, r, 3, isHost)}</div>
    </div>
    ${
      r.started
        ? `<p class="muted">${t.modes[r.mode].name}</p>`
        : `<p class="muted">${t.botsFill}</p>
    <section>
      <h3>${t.gameMode}</h3>
      <div class="modes">${modes}</div>
    </section>
    ${
      isHost
        ? `<button class="primary start" data-m="start">${t.startGame}</button>`
        : `<p class="waiting-host">${t.waitingHost}</p>`
    }`
    }
    ${isHost ? `<button class="danger" data-m="close-room">🗑 ${t.closeRoom}</button>` : ''}
    <button class="danger" data-m="leave">${t.leaveRoom}</button>`,
    { closable: true, cls: 'online-modal', label: t.online },
  );
}
