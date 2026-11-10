// Portraits of the AI players. Players without a portrait get a coloured circle with their initial.
import { escapeHtml } from './html';

export type AvatarId = 'gajendra' | 'sita' | 'ranjana';

// The portraits are pictures made for the game (src/ui/portraits/<name>.webp, 192 px, face in the middle).
const url = (name: string) => new URL(`./portraits/${name}.webp`, import.meta.url).href;
const PORTRAITS: Record<AvatarId, string> = { gajendra: url('gajendra'), sita: url('sita'), ranjana: url('ranjana') };
const ALT: Record<AvatarId, string> = { gajendra: 'Gajendra', sita: 'Sita', ranjana: 'Ranjana' };

/** Which portrait a (bot) name belongs to, if any. */
export function avatarFor(name: string): AvatarId | null {
  const n = name.toLowerCase();
  return n === 'gajendra' || n === 'sita' || n === 'ranjana' ? n : null;
}

export function avatarHtml(id: AvatarId | null, displayName: string, team: 0 | 1): string {
  if (id) return `<span class="avatar av-${id}"><img src="${PORTRAITS[id]}" alt="${ALT[id]}" draggable="false" width="96" height="96"></span>`;
  const initial = escapeHtml([...displayName.replace(/^\W+/u, '')][0]?.toUpperCase() ?? '?');
  return `<span class="avatar initial team${team}">${initial}</span>`;
}
