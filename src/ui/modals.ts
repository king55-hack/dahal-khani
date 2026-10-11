// HTML for the dialogs: first-launch language picker, ⓘ info (how to play / credits) and ⚙ settings.
// All text comes from i18n.ts; the creator name is inserted with textContent by main.ts.
import type { TrumpMode } from '../engine';
import { COIN_REWARDS, GAME_SETTINGS } from '../settings';
import { LANGS, STRINGS, type Strings } from './i18n';
import type { Prefs } from './prefs';
import { BACKGROUNDS, THEMES } from './themes';

export type Modal = { kind: 'lang' } | { kind: 'info'; tab: 'rules' | 'credits' } | { kind: 'settings' };

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
      <div class="suits-line big">♠ ♥ ♣ ♦</div>
      <h2>Dahal Khani</h2>
      <p class="muted">${title}</p>
      <div class="lang-grid">${languageButtons(null)}</div>
    </div>`,
    { closable: false, cls: 'lang-modal', label: 'Language' },
  );
}

export function infoHtml(t: Strings, tab: 'rules' | 'credits'): string {
  const body =
    tab === 'rules'
      ? t.rulesHtml(GAME_SETTINGS.points, COIN_REWARDS)
      : `<h2>${t.credits}</h2>
         <div class="credit-card">
           <div class="by">${t.creditsBy}</div>
           <div class="who"></div>
           <div class="sub">Dahal Khani · Dahal Mara</div>
           <div class="suits-line">♠ ♥ ♣ ♦</div>
         </div>
         <p>${t.creditsText}</p>`;
  return shell(
    `<div class="tabs">
      <button data-tab="rules" class="${tab === 'rules' ? 'on' : ''}">${t.howToPlay}</button>
      <button data-tab="credits" class="${tab === 'credits' ? 'on' : ''}">${t.credits}</button>
    </div>
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

export function settingsHtml(t: Strings, prefs: Prefs, message: string, install: InstallState): string {
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
    <button class="danger" data-m="newgame">↺ ${t.newGame}</button>`,
    { closable: true, cls: 'settings-modal', label: t.settings },
  );
}
