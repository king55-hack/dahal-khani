// Illustrated portraits of the AI players (inline SVG, no image files). Players without a portrait
// get a coloured circle with their initial.
import { escapeHtml } from './html';

export type AvatarId = 'gajendra' | 'sita' | 'ranjana';

const SKIN = '#c98b5e';
const SKIN_SHADE = '#b07548';

/** Shared face: eyes, brows, nose, mouth. `soft` adds blush and a gentler smile. */
function face(soft: boolean): string {
  return `
    <ellipse cx="26.5" cy="31" rx="1.9" ry="2.2" fill="#2b1a10"/>
    <ellipse cx="37.5" cy="31" rx="1.9" ry="2.2" fill="#2b1a10"/>
    <circle cx="27.1" cy="30.3" r=".6" fill="#fff"/>
    <circle cx="38.1" cy="30.3" r=".6" fill="#fff"/>
    <path d="M23.5 27.3q3-1.8 5.8-.3M34.7 27q2.8-1.5 5.8.3" stroke="#2b1a10" stroke-width="${soft ? 1 : 1.5}" fill="none" stroke-linecap="round"/>
    <path d="M32 32.5q-1.2 3.6-.3 4.6q.9.5 1.8 0" stroke="${SKIN_SHADE}" stroke-width="1" fill="none" stroke-linecap="round"/>
    ${soft ? '<ellipse cx="24.5" cy="36.5" rx="2.6" ry="1.5" fill="#e8777a" opacity=".35"/><ellipse cx="39.5" cy="36.5" rx="2.6" ry="1.5" fill="#e8777a" opacity=".35"/>' : ''}`;
}

const RANJANA = `<svg viewBox="0 0 64 64" aria-hidden="true">
  <circle cx="32" cy="32" r="32" fill="#fbcfe8"/>
  <path d="M15 34q-2-20 17-22q19 2 17 22l1 30H14z" fill="#1b1210"/>
  <path d="M10 64q2-13 22-13t22 13z" fill="#be123c"/>
  <path d="M27 50h10l-5 7z" fill="${SKIN}"/>
  <rect x="28" y="42" width="8" height="10" rx="3" fill="${SKIN}"/>
  <ellipse cx="32" cy="32" rx="12.5" ry="14.5" fill="${SKIN}"/>
  <ellipse cx="19.6" cy="33" rx="1.8" ry="2.6" fill="${SKIN}"/>
  <ellipse cx="44.4" cy="33" rx="1.8" ry="2.6" fill="${SKIN}"/>
  <circle cx="19.6" cy="37" r="1.3" fill="#fbbf24"/>
  <circle cx="44.4" cy="37" r="1.3" fill="#fbbf24"/>
  <path d="M19 30q0-14 13-14.5q13 .5 13 14.5q-3-8-13-9.5q-10 1.5-13 9.5z" fill="#1b1210"/>
  ${face(true)}
  <path d="M28.6 40.6q3.4 2.4 6.8 0" stroke="#9f1239" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <circle cx="32" cy="24.6" r="1.1" fill="#111"/>
</svg>`;

const SITA = `<svg viewBox="0 0 64 64" aria-hidden="true">
  <circle cx="32" cy="32" r="32" fill="#fed7aa"/>
  <circle cx="32" cy="13.5" r="6.5" fill="#20150f"/>
  <path d="M10 64q2-13 22-13t22 13z" fill="#7f1d1d"/>
  <path d="M10 64q3-12 15-13l20 13z" fill="#b91c1c"/>
  <path d="M14 64q4-11 18-12" stroke="#fbbf24" stroke-width="1.3" fill="none"/>
  <rect x="28" y="42" width="8" height="10" rx="3" fill="${SKIN}"/>
  <path d="M25.5 49q6.5 5 13 0" stroke="#15803d" stroke-width="2" fill="none" stroke-dasharray="1.2 .9"/>
  <ellipse cx="32" cy="32" rx="13" ry="14.5" fill="${SKIN}"/>
  <ellipse cx="19.1" cy="33" rx="1.8" ry="2.6" fill="${SKIN}"/>
  <ellipse cx="44.9" cy="33" rx="1.8" ry="2.6" fill="${SKIN}"/>
  <circle cx="19.1" cy="37.4" r="1.6" fill="#f59e0b"/>
  <circle cx="44.9" cy="37.4" r="1.6" fill="#f59e0b"/>
  <path d="M18.6 31q-.5-13 13.4-14q13.9 1 13.4 14q-2-7-6.5-9.5q-3.5-1.5-6.9 1.2q-3.4-2.7-6.9-1.2q-4.5 2.5-6.5 9.5z" fill="#20150f"/>
  ${face(true)}
  <path d="M28.3 40.4q3.7 2.6 7.4 0" stroke="#7f1d1d" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <path d="M27.8 43.4q4.2 1.3 8.4 0" stroke="${SKIN_SHADE}" stroke-width=".6" fill="none" opacity=".7"/>
</svg>`;

/* dhaka topi: a small woven pattern of red, black, white and green diamonds */
const GAJENDRA = `<svg viewBox="0 0 64 64" aria-hidden="true">
  <defs>
    <pattern id="av-dhaka" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
      <rect width="4" height="4" fill="#b91c1c"/>
      <path d="M2 0l2 2-2 2-2-2z" fill="#1f2937"/>
      <path d="M2 1l1 1-1 1-1-1z" fill="#fde68a"/>
      <rect x="0" y="0" width=".8" height=".8" fill="#f8fafc"/>
      <rect x="0" y="1.8" width=".5" height=".5" fill="#22c55e"/>
    </pattern>
  </defs>
  <circle cx="32" cy="32" r="32" fill="#bae6fd"/>
  <path d="M9 64q2-13 23-13t23 13z" fill="#f5f0e1"/>
  <path d="M9 64q2-12 13-13l3 13zM55 64q-2-12-13-13l-3 13z" fill="#1f2937"/>
  <path d="M27 51l5 7 5-7" fill="none" stroke="#d6cfb8" stroke-width="1.2"/>
  <rect x="27.5" y="42" width="9" height="10" rx="3" fill="${SKIN}"/>
  <ellipse cx="32" cy="32.5" rx="13.5" ry="15" fill="${SKIN}"/>
  <ellipse cx="18.6" cy="33" rx="2" ry="2.8" fill="${SKIN}"/>
  <ellipse cx="45.4" cy="33" rx="2" ry="2.8" fill="${SKIN}"/>
  <path d="M18.6 28q.2-4 2.4-6.5h22q2.2 2.5 2.4 6.5q-2.2-3-4.4-3.4H23q-2.2.4-4.4 3.4z" fill="#3a2a20"/>
  <path d="M18.8 26.5q.5 2 1.3 3M45.2 26.5q-.5 2-1.3 3" stroke="#9ca3af" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M19.4 23.4L21 13.6q11-3.6 22.6-6.4l1.6 16.2q-13-3-25.8 0z" fill="url(#av-dhaka)"/>
  <path d="M32.4 10.6l.9 12.6" stroke="#7f1d1d" stroke-width=".7" opacity=".6"/>
  <path d="M21 13.6q11-3.6 22.6-6.4" stroke="#450a0a" stroke-width="1.1" fill="none" stroke-linecap="round"/>
  <path d="M19.4 23.4q12.9-3 25.8 0" stroke="#111827" stroke-width="1.8" fill="none"/>
  ${face(false)}
  <path d="M25.6 38.6q3.2-2.3 6.4-.8q3.2-1.5 6.4.8q-1.5 1.6-6.4.9q-4.9.7-6.4-.9z" fill="#2b1a10"/>
  <path d="M28.6 42q3.4 1.6 6.8 0" stroke="#7c2d12" stroke-width="1.2" fill="none" stroke-linecap="round"/>
</svg>`;

const PORTRAITS: Record<AvatarId, string> = { gajendra: GAJENDRA, sita: SITA, ranjana: RANJANA };

/** Which portrait a (bot) name belongs to, if any. */
export function avatarFor(name: string): AvatarId | null {
  const n = name.toLowerCase();
  return n === 'gajendra' || n === 'sita' || n === 'ranjana' ? n : null;
}

export function avatarHtml(id: AvatarId | null, displayName: string, team: 0 | 1): string {
  if (id) return `<span class="avatar">${PORTRAITS[id]}</span>`;
  const initial = escapeHtml([...displayName.replace(/^\W+/u, '')][0]?.toUpperCase() ?? '?');
  return `<span class="avatar initial team${team}">${initial}</span>`;
}
