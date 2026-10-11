import { loadEnv, type Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

/** Origins the page may connect to: itself, plus the online room server (https + wss) if configured. */
function connectSources(serverUrl: string | undefined): string {
  if (!serverUrl) return "'self'";
  const u = new URL(serverUrl);
  if (u.protocol !== 'https:') throw new Error('VITE_SERVER_URL must be an https:// URL');
  return `'self' ${u.origin} wss://${u.host}`;
}

// Strict Content-Security-Policy for the built site (not in dev, where Vite's HMR needs websockets).
const csp = (serverUrl: string | undefined) =>
  [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'", // inline style="--i:…" attributes
    "img-src 'self' data:",
    `connect-src ${connectSources(serverUrl)}`,
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join('; ');

const securityHeaders = (CSP: string): Plugin => ({
  name: 'security-meta',
  apply: 'build',
  transformIndexHtml: (html) =>
    html.replace(
      '<meta charset="UTF-8" />',
      `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />\n    <meta name="referrer" content="no-referrer" />`,
    ),
});

export default defineConfig(({ mode }) => ({
  base: './', // works from any sub-path (e.g. GitHub Pages)
  plugins: [securityHeaders(csp(loadEnv(mode, process.cwd(), 'VITE_').VITE_SERVER_URL))],
  server: {
    host: true, // also reachable from a phone on the same Wi-Fi
    port: 5173,
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
}));
