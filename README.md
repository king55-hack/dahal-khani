# Dahal Khani (Dahal Mara)

Traditional Nepali 4-player card game (2 teams, like Mendikot / Dehla Pakad), as a browser prototype.
You play against 3 computer bots. Works on phones (portrait and landscape).

**Play online:** https://king55-hack.github.io/dahal-khani/

Created by **Rajan Rimal**.

## Run locally

```
npm install
npm run dev      # open http://localhost:5173
npm test         # rules-engine unit tests
npm run build    # production build in dist/
```

## Project layout

- `src/engine/` — pure rules engine (no UI): dealing, TURUP, legal moves, Haat, Dahal, scoring, bots.
  It validates every move, so it can run on a server for online multiplayer later.
- `src/ui/` — browser UI only (`info.ts` is the ⓘ How to play / Credits dialog).
- `src/settings.ts` — point values (normal / Kot / Baunne), trump mode, bot speed, creator name.
- Debug: add `?autoplay` to the URL to watch bots play every seat.

## Rules (short)

- 5 cards each → the player after the dealer picks **TURUP** (trump) → 4 + 4 more cards each.
- Follow the led suit if you can; otherwise play anything. Highest trump wins, else highest of the led suit.
- Capture 3 or 4 **Dahal** (10s) to win the round; at 2–2 the team with more **Haat** (tricks) wins.
- **Kot** = all four 10s, **Baunne** = all 13 tricks.
