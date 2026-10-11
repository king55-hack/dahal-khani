import { defineConfig, type Plugin } from 'vitest/config';

// Strict Content-Security-Policy for the built site (not in dev, where Vite's HMR needs websockets).
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'", // inline style="--i:…" attributes
  "img-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

const securityHeaders = (): Plugin => ({
  name: 'security-meta',
  apply: 'build',
  transformIndexHtml: (html) =>
    html.replace(
      '<meta charset="UTF-8" />',
      `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />\n    <meta name="referrer" content="no-referrer" />`,
    ),
});

export default defineConfig({
  base: './', // works from any sub-path (e.g. GitHub Pages)
  plugins: [securityHeaders()],
  server: {
    host: true, // also reachable from a phone on the same Wi-Fi
    port: 5173,
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
