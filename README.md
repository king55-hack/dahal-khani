# Dahal Khani (Dahal Mara / Dahal Jeet)

Traditional Nepali 4-player card game (2 teams, like Mendikot / Dehla Pakad), as a browser prototype.
Play **offline** against 3 bots (partner Sita; opponents Gajendra and Ranjana) or **online** with friends
(rooms with optional password; bots fill empty seats).
Works on phones (portrait and landscape).

Features: 4 languages (नेपाली, Nepali Roman, English, 日本語), 3 trump modes (Normal, Band hukum,
Cut hukum), coins for winning rounds, unlockable card designs, table backgrounds (Normal, Gundri
straw mat, Galaicha carpet), sound on/off — all in ⚙ Settings. Installable on phones (Add to Home Screen)
and playable offline after the first visit.

**Play online:** https://king55-hack.github.io/dahal-khani/

Created by **Rajan Rimal**.

## Run locally

```
npm install
npm run dev      # open http://localhost:5173
npm test         # rules-engine unit tests
npm run build    # production build in dist/
```

## Online play (friends + bots)

🌐 in the header → pick a room from **Open rooms**, join with a **6-digit room number + password**, or
create your own room (with a password = private 🔒, without = public). Empty seats are filled by bots,
the host picks the mode and starts. Every move is checked on the server, each player only receives
their own cards, and room passwords are stored only as salted PBKDF2 hashes (10 wrong tries per
10 minutes per room).

The room server is a Cloudflare Worker + Durable Objects (free plan) in `server/worker.ts`; the room
logic itself is plain TypeScript in `src/online/` and is unit-tested.

```
npm run server:dev                  # local server on :8787 (the dev site uses it automatically)
node scripts/online-smoke.mjs       # end-to-end test against it
npx wrangler login                  # once, opens Cloudflare in the browser
npm run server:deploy               # prints https://dahal-khani.<account>.workers.dev
gh variable set SERVER_URL --body https://dahal-khani.<account>.workers.dev
```

After `SERVER_URL` is set, the next GitHub Pages deploy shows the 🌐 button on the live site.
Allowed sites are set in `wrangler.jsonc` (`ALLOWED_ORIGINS`).

## Project layout

- `src/engine/` — pure rules engine (no UI): dealing, TURUP, legal moves, Haat, Dahal, scoring, bots,
  and per-player views (no peeking at other hands).
- `src/online/` — room logic and message format shared by browser and server.
- `server/` — Cloudflare Worker / Durable Object glue.
- `src/ui/` — browser UI only: `i18n.ts` (all text, 4 languages), `modals.ts` (settings / info /
  language dialogs), `themes.ts` (card designs and prices), `sound.ts`, `prefs.ts` (saved in the browser).
- `src/settings.ts` — point values, coin rewards, default trump mode, bot speed, creator name.
- Debug: add `?autoplay` to the URL to watch bots play every seat; in `npm run dev`, `?result=kot-lose` (or `baunne-win`, `normal-win`, …) previews a result screen.

## Rules (short)

- 5 cards each → the player after the dealer picks **TURUP** (trump) → 4 + 4 more cards each.
- Follow the led suit if you can; otherwise play anything. Highest trump wins, else highest of the led suit.
- Capture 3 or 4 **Dahal** (10s) to win the round; at 2–2 the team with more **Haat** (tricks) wins.
- **Kot** = all four 10s, **Baunne** = all 13 tricks.

## Copyright

© 2026 Rajan Rimal. All rights reserved.
The source code is public so it can be read, but no licence is granted to copy, modify or redistribute it.
