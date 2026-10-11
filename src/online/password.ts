// Room passwords are never stored as typed: only a salted PBKDF2 hash is kept.
// Iterations are modest because rooms live for hours, not years, guesses are rate-limited per room,
// and the Workers free plan has a small CPU budget per request.

export interface PasswordHash {
  salt: string;
  hash: string;
}

const ITERATIONS = 20_000;
const enc = new TextEncoder();

const toB64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function derive(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations: ITERATIONS },
    key,
    256,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<PasswordHash> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { salt: toB64(salt), hash: toB64(await derive(password, salt)) };
}

export async function verifyPassword(password: string, stored: PasswordHash): Promise<boolean> {
  const actual = await derive(password, fromB64(stored.salt));
  const expected = fromB64(stored.hash);
  // constant-time comparison
  let diff = actual.length ^ expected.length;
  for (let i = 0; i < Math.min(actual.length, expected.length); i++) diff |= actual[i] ^ expected[i];
  return diff === 0;
}
