// Illustrated portraits of the AI players (inline SVG, no image files). Players without a portrait
// get a coloured circle with their initial.
import { escapeHtml } from './html';

export type AvatarId = 'gajendra' | 'sita' | 'ranjana';

/** Himal (snow mountains) behind every portrait, in a soft tone, so the avatars feel like they are from Nepal. */
const HIMAL =
  '<path d="M0 47 11 35l5 5 9-13 9 14 6-7 7 8 17-9v32H0z" fill="#fff" opacity=".28"/><path d="M25 27l-3 4 3-1.3 2 1.3z" fill="#fff" opacity=".5"/>';

const SKIN = '#c98b5e';
const SKIN_SHADE = '#a8693f';

/** Skin with a gentle light from the upper left. */
const skinGradient = (id: string) =>
  `<radialGradient id="${id}" cx=".4" cy=".32" r=".8"><stop offset="0" stop-color="#e6aa7c"/><stop offset=".55" stop-color="${SKIN}"/><stop offset="1" stop-color="${SKIN_SHADE}"/></radialGradient>`;

/** One eye: white, iris, pupil, a bright spot, and an upper lid (with a lash flick for the women). */
function eye(cx: number, cy: number, lash: boolean, flip = 1): string {
  return `<g>
    <ellipse cx="${cx}" cy="${cy}" rx="2.8" ry="2" fill="#fff"/>
    <circle cx="${cx}" cy="${cy + 0.1}" r="1.6" fill="#4a2c18"/>
    <circle cx="${cx}" cy="${cy + 0.1}" r=".85" fill="#0d0805"/>
    <circle cx="${cx + 0.6}" cy="${cy - 0.6}" r=".5" fill="#fff"/>
    <path d="M${cx - 2.9} ${cy - 0.1}q2.9-2.9 5.8 0" stroke="#1b0f08" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    ${lash ? `<path d="M${cx + 2.7 * flip} ${cy - 0.6}l${1.3 * flip}-1.1" stroke="#1b0f08" stroke-width=".9" stroke-linecap="round"/>` : ''}
  </g>`;
}

/** Eyes (they blink: see .av-eyes in style.css), brows, nose, and a blush for the women. */
function face(soft: boolean, brow = '#2b1a10'): string {
  return `
    <g class="av-eyes">${eye(26.5, 31, soft)}${eye(37.5, 31, soft, -1)}</g>
    <path d="M23.4 27.2q3.1-2 6-.2M34.6 27q2.9-1.8 6 .2" stroke="${brow}" stroke-width="${soft ? 1 : 1.7}" fill="none" stroke-linecap="round"/>
    <path d="M32 32.8q-1.4 3.6-.4 4.6q1 .6 2 0" stroke="${SKIN_SHADE}" stroke-width="1" fill="none" stroke-linecap="round"/>
    ${soft ? '<ellipse cx="24" cy="36.6" rx="2.8" ry="1.6" fill="#ef6f79" opacity=".34"/><ellipse cx="40" cy="36.6" rx="2.8" ry="1.6" fill="#ef6f79" opacity=".34"/>' : ''}`;
}

/** Soft shadow under the chin and on the neck. */
const CHIN = '<ellipse cx="32" cy="48.2" rx="8" ry="2" fill="#000" opacity=".16"/>';

const RANJANA = `<svg viewBox="0 0 64 64" aria-hidden="true">
  <defs>${skinGradient('sk-r')}
    <radialGradient id="bg-r" cx=".5" cy=".3" r=".9"><stop offset="0" stop-color="#fff1f6"/><stop offset="1" stop-color="#f9a8d4"/></radialGradient>
    <linearGradient id="hr-r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a2620"/><stop offset="1" stop-color="#120b09"/></linearGradient>
  </defs>
  <circle cx="32" cy="32" r="32" fill="url(#bg-r)"/>${HIMAL}
  <path d="M14.5 36q-3-22 17.5-23.5q20.5 1.5 17.5 23.5l2.5 28H12z" fill="url(#hr-r)"/>
  <path d="M9 64q2-14 23-14t23 14z" fill="#be123c"/>
  <path d="M9 64q3-12 15-13.4l5 13.4z" fill="#e11d48"/>
  <path d="M23 51q9 8 18 0" stroke="#fbbf24" stroke-width="1.4" fill="none"/>
  <circle cx="32" cy="57" r="1.6" fill="#fde68a" stroke="#d97706" stroke-width=".5"/>
  <rect x="28" y="42" width="8" height="10" rx="3" fill="url(#sk-r)"/>${CHIN}
  <ellipse cx="32" cy="32" rx="12.5" ry="14.5" fill="url(#sk-r)"/>
  <ellipse cx="19.6" cy="33" rx="1.8" ry="2.6" fill="url(#sk-r)"/>
  <ellipse cx="44.4" cy="33" rx="1.8" ry="2.6" fill="url(#sk-r)"/>
  <circle cx="19.6" cy="37.2" r="1.4" fill="#fbbf24" stroke="#d97706" stroke-width=".4"/>
  <circle cx="44.4" cy="37.2" r="1.4" fill="#fbbf24" stroke="#d97706" stroke-width=".4"/>
  <path d="M19 30.5q0-15 13-15.5q13 .5 13 15.5q-3-8.5-13-10q-10 1.5-13 10z" fill="url(#hr-r)"/>
  <path d="M24 19.5q4-3 9-2.4M38 18q3 1 5 4" stroke="#6b4a3a" stroke-width=".9" fill="none" stroke-linecap="round" opacity=".7"/>
  <path d="M40 17q3-1 5 1.4q-2.2.8-4 .2z" fill="#f43f5e"/>
  ${face(true)}
  <path d="M28.4 40.6q3.6 2.8 7.2 0q-1.4 3-3.6 3q-2.2 0-3.6-3z" fill="#be123c"/>
  <path d="M28.4 40.6q3.6-1.1 7.2 0" stroke="#7f1d1d" stroke-width=".7" fill="none"/>
</svg>`;

const SITA = `<svg viewBox="0 0 64 64" aria-hidden="true">
  <defs>${skinGradient('sk-s')}
    <radialGradient id="bg-s" cx=".5" cy=".3" r=".9"><stop offset="0" stop-color="#fff7e6"/><stop offset="1" stop-color="#fdba74"/></radialGradient>
    <linearGradient id="sari-s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dc2626"/><stop offset="1" stop-color="#7f1d1d"/></linearGradient>
  </defs>
  <circle cx="32" cy="32" r="32" fill="url(#bg-s)"/>${HIMAL}
  <circle cx="32" cy="12.5" r="7.2" fill="#20150f"/>
  <circle cx="32" cy="12.5" r="7.2" fill="none" stroke="#4a3426" stroke-width=".6" stroke-dasharray="1.4 1.6" opacity=".7"/>
  <g transform="translate(40.5 10)"><circle r="3.1" fill="#f97316"/><circle r="2" fill="#fbbf24"/><circle r=".9" fill="#b45309"/></g>
  <path d="M9 64q2-14 23-14t23 14z" fill="url(#sari-s)"/>
  <path d="M9 64q3-12 16-13.4L47 64z" fill="#b91c1c"/>
  <path d="M13 64q4-10 19-12" stroke="#fbbf24" stroke-width="1.5" fill="none"/>
  <path d="M16 64q4-8 17-10" stroke="#fde68a" stroke-width=".6" fill="none" stroke-dasharray="1 1.4"/>
  <rect x="28" y="42" width="8" height="10" rx="3" fill="url(#sk-s)"/>${CHIN}
  <path d="M24.8 48.6q7.2 6.4 14.4 0" stroke="#15803d" stroke-width="2.2" fill="none" stroke-dasharray="1.2 .9"/>
  <circle cx="32" cy="55" r="1.5" fill="#fbbf24" stroke="#b45309" stroke-width=".5"/>
  <ellipse cx="32" cy="32" rx="13" ry="14.5" fill="url(#sk-s)"/>
  <ellipse cx="19.1" cy="33" rx="1.8" ry="2.6" fill="url(#sk-s)"/>
  <ellipse cx="44.9" cy="33" rx="1.8" ry="2.6" fill="url(#sk-s)"/>
  <circle cx="19.1" cy="37.6" r="1.7" fill="#f59e0b" stroke="#b45309" stroke-width=".4"/>
  <circle cx="44.9" cy="37.6" r="1.7" fill="#f59e0b" stroke="#b45309" stroke-width=".4"/>
  <path d="M18.6 31q-.5-13.5 13.4-14.4q13.9.9 13.4 14.4q-2-7.5-6.5-10q-3.5-1.5-6.9 1.2q-3.4-2.7-6.9-1.2q-4.5 2.5-6.5 10z" fill="#20150f"/>
  <path d="M31.8 18.6v3.2" stroke="#8b6a55" stroke-width=".6"/>
  ${face(true)}
  <circle cx="32" cy="24.4" r="1.35" fill="#dc2626"/>
  <circle cx="29" cy="37.1" r="1.5" fill="none" stroke="#fbbf24" stroke-width=".8"/>
  <path d="M28.3 40.6q3.7 2.7 7.4 0q-1.3 3.1-3.7 3.1q-2.4 0-3.7-3.1z" fill="#b91c1c"/>
  <path d="M28.3 40.6q3.7-1.1 7.4 0" stroke="#7f1d1d" stroke-width=".7" fill="none"/>
</svg>`;

/* dhaka topi: a small woven pattern of red, black, white and green diamonds */
const GAJENDRA = `<svg viewBox="0 0 64 64" aria-hidden="true">
  <defs>${skinGradient('sk-g')}
    <radialGradient id="bg-g" cx=".5" cy=".3" r=".9"><stop offset="0" stop-color="#f0f9ff"/><stop offset="1" stop-color="#7dd3fc"/></radialGradient>
    <pattern id="av-dhaka" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
      <rect width="4" height="4" fill="#b91c1c"/>
      <path d="M2 0l2 2-2 2-2-2z" fill="#1f2937"/>
      <path d="M2 1l1 1-1 1-1-1z" fill="#fde68a"/>
      <rect x="0" y="0" width=".8" height=".8" fill="#f8fafc"/>
      <rect x="0" y="1.8" width=".5" height=".5" fill="#22c55e"/>
    </pattern>
  </defs>
  <circle cx="32" cy="32" r="32" fill="url(#bg-g)"/>${HIMAL}
  <path d="M9 64q2-14 23-14t23 14z" fill="#f5f0e1"/>
  <path d="M9 64q2-12 13-13.6l3 13.6zM55 64q-2-12-13-13.6l-3 13.6z" fill="#27303f"/>
  <path d="M27 51l5 7 5-7" fill="none" stroke="#cfc7ad" stroke-width="1.2"/>
  <circle cx="32" cy="60" r=".9" fill="#d6cfb8"/>
  <rect x="27.5" y="42" width="9" height="10" rx="3" fill="url(#sk-g)"/>${CHIN}
  <ellipse cx="32" cy="32.5" rx="13.5" ry="15" fill="url(#sk-g)"/>
  <ellipse cx="18.6" cy="33" rx="2" ry="2.8" fill="url(#sk-g)"/>
  <ellipse cx="45.4" cy="33" rx="2" ry="2.8" fill="url(#sk-g)"/>
  <path d="M18.6 28q.2-4 2.4-6.5h22q2.2 2.5 2.4 6.5q-2.2-3-4.4-3.4H23q-2.2.4-4.4 3.4z" fill="#3a2a20"/>
  <path d="M18.8 26.5q.5 2 1.3 3M45.2 26.5q-.5 2-1.3 3" stroke="#9ca3af" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M19.4 23.4L21 13.6q11-3.6 22.6-6.4l1.6 16.2q-13-3-25.8 0z" fill="url(#av-dhaka)"/>
  <path d="M32.4 10.6l.9 12.6" stroke="#7f1d1d" stroke-width=".7" opacity=".6"/>
  <path d="M21 13.6q11-3.6 22.6-6.4" stroke="#450a0a" stroke-width="1.1" fill="none" stroke-linecap="round"/>
  <path d="M19.4 23.4q12.9-3 25.8 0" stroke="#111827" stroke-width="1.8" fill="none"/>
  ${face(false)}
  <path d="M23.5 40q-1.5-5 1.5-6.5M40.5 40q1.5-5-1.5-6.5" stroke="#3a2a20" stroke-width=".8" fill="none" opacity=".45"/>
  <path d="M25.6 38.8q3.2-2.4 6.4-.9q3.2-1.5 6.4.9q-1.5 1.8-6.4 1q-4.9.8-6.4-1z" fill="#2b1a10"/>
  <path d="M28.6 42.2q3.4 1.8 6.8 0" stroke="#7c2d12" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  <circle cx="32" cy="24.6" r="1.1" fill="#f59e0b"/>
</svg>`;

const PORTRAITS: Record<AvatarId, string> = { gajendra: GAJENDRA, sita: SITA, ranjana: RANJANA };

/** Which portrait a (bot) name belongs to, if any. */
export function avatarFor(name: string): AvatarId | null {
  const n = name.toLowerCase();
  return n === 'gajendra' || n === 'sita' || n === 'ranjana' ? n : null;
}

export function avatarHtml(id: AvatarId | null, displayName: string, team: 0 | 1): string {
  if (id) return `<span class="avatar av-${id}">${PORTRAITS[id]}</span>`;
  const initial = escapeHtml([...displayName.replace(/^\W+/u, '')][0]?.toUpperCase() ?? '?');
  return `<span class="avatar initial team${team}">${initial}</span>`;
}
