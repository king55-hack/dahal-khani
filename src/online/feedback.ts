// Player feedback (problem reports, ideas, thanks) sent to the game's creator.
// Shared by the browser and the server; everything is validated before it is stored.

export const FEEDBACK_KINDS = ['problem', 'idea', 'thanks'] as const;
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];

export const FEEDBACK_MESSAGE_MAX = 1000;
export const FEEDBACK_CONTACT_MAX = 100;
const META_FIELD_MAX = 160;

/** Optional technical details that help reproduce a problem (the player can untick them). */
export interface FeedbackMeta {
  lang?: string;
  mode?: string;
  online?: string;
  build?: string;
  screen?: string;
  device?: string;
}

export interface FeedbackRequest {
  kind: FeedbackKind;
  message: string;
  /** email / phone if the player wants a reply; may be empty */
  contact: string;
  meta: FeedbackMeta;
}

export interface FeedbackEntry extends FeedbackRequest {
  id: string;
  at: number;
  read: boolean;
}

const META_KEYS: (keyof FeedbackMeta)[] = ['lang', 'mode', 'online', 'build', 'screen', 'device'];

/** Strip control characters (keep line breaks in messages), trim, limit length. */
function clean(raw: unknown, max: number, keepNewlines = false): string {
  if (typeof raw !== 'string') return '';
  const re = keepNewlines ? /[\u0000-\u0009\u000B-\u001F\u007F\p{Cf}]/gu : /[\p{Cc}\p{Cf}]/gu;
  return [...raw.replace(re, '').trim()].slice(0, max).join('');
}

export function parseFeedback(raw: unknown): FeedbackRequest | null {
  if (typeof raw !== 'string' || raw.length > 6000) return null;
  let m: Record<string, unknown>;
  try {
    const v: unknown = JSON.parse(raw);
    if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
    m = v as Record<string, unknown>;
  } catch {
    return null;
  }
  if (!FEEDBACK_KINDS.includes(m.kind as FeedbackKind)) return null;
  const message = clean(m.message, FEEDBACK_MESSAGE_MAX, true);
  if (!message) return null;
  const meta: FeedbackMeta = {};
  if (m.meta && typeof m.meta === 'object') {
    for (const k of META_KEYS) {
      const v = clean((m.meta as Record<string, unknown>)[k], META_FIELD_MAX);
      if (v) meta[k] = v;
    }
  }
  return { kind: m.kind as FeedbackKind, message, contact: clean(m.contact, FEEDBACK_CONTACT_MAX), meta };
}

/** Spam guard: at most FEEDBACK_PER_WINDOW messages per network per window. */
export const FEEDBACK_PER_WINDOW = 5;
export const FEEDBACK_WINDOW_MS = 10 * 60_000;

export function feedbackAllowed(recent: readonly number[], now: number): boolean {
  return recent.filter((t) => now - t < FEEDBACK_WINDOW_MS).length < FEEDBACK_PER_WINDOW;
}

/** Constant-time string comparison for the admin key. */
export function sameSecret(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  let diff = ea.length ^ eb.length;
  for (let i = 0; i < Math.max(ea.length, eb.length); i++) diff |= (ea[i] ?? 0) ^ (eb[i] ?? 0);
  return diff === 0;
}
