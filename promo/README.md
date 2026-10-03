# Launch film

A 22.5 s launch film for `svelte5plus-calendar`, built with the
[`business-motion-film`](https://github.com/echris6/motion-video-kit) skill (brief → storyboard →
build → independent critics → measured audio).

**Every calendar on screen is the real `<Calendar>` component** imported from `../src/lib`, rendered in
headless Chromium. The film is a Svelte app whose every pixel is a pure function of one seek clock, so
any frame renders identically in any order (see `tools/determinism.mjs`).

| File | What it is |
|---|---|
| `BRIEF.md` | Audience, single CTA, allowed / forbidden claims |
| `STORYBOARD.md` | Beat sheet on a 120 BPM grid |
| `LEDGER.md` | Gauntlet ledger: what each critic found → what changed → measured result |
| `review/` | Critic reports and per-effect mix reports |
| `src/` | The film (`Film.svelte` + `scenes/`) |
| `tools/` | Renderer, mixer and measurement scripts |

## Render

```sh
cd promo
npm install                         # playwright-core (uses the cached Playwright Chromium)
npm run dev                         # live preview: http://localhost:5199/?play  or  ?t=12.3
node tools/render.mjs --shutter 1 --jpeg --out renders/draft.mp4    # ~45 s draft
node tools/render.mjs --out renders/picture.mp4                      # final: 4 sub-frames of motion blur per frame
python3 tools/mix.py renders/picture.mp4 renders/film.mp4           # music edit + effects + music-only fallback
tools/frozen-time.sh renders/film.mp4 && tools/frozen-window.py renders/film.mp4 && tools/loudness.sh renders/film.mp4
tools/fx-check.py renders/film.mp4 renders/film-music-only.mp4      # every effect vs the music, 2–8 kHz, on the render
node tools/determinism.mjs                                           # same frame after different seek histories
```

The render pins `timezoneId: 'America/New_York'` and the film freezes "now" at Tue 13 Oct 2026 09:41
(`src/freeze-time.ts`), so the today highlight and now-indicator never drift.

## Third-party code

`tools/contact-sheet.sh`, `tools/frozen-time.sh`, `tools/loudness.sh`, `tools/soften-sfx.sh` and
`tools/sfx-candidates.py` are copied from [motion-video-kit](https://github.com/echris6/motion-video-kit),
and `tools/mix.py` is adapted from its `offline-mix.py` — MIT, © 2026 echris6
(`tools/LICENSE.motion-video-kit`).

## Audio credits

Licensed audio is **not** committed (see `.gitignore`); `tools/mix.py` expects it in `assets/`.

- Music: "Better Times are Coming" by Alejandro Magaña (A. M.) — Mixkit Stock Music Free License,
  `https://assets.mixkit.co/music/173/173.mp3` → `assets/music/better-times-are-coming.mp3`
- Effects: Mixkit Sound Effects Free License, softened with `tools/soften-sfx.sh` (high-pass 160 Hz,
  low-pass 9.5 kHz — 4 kHz for the wipe — click-free fades). Source ids: air-pass 168, swoosh-short 1461, wipe 1490,
  click 1109, seat 1120, tick 2568, detent 2585, pop-bright 2357, pop-hard 2364, pop-whoosh 3005,
  typing 1396 (a 0.62 s slice from 5.25 s) — `https://assets.mixkit.co/active_storage/sfx/<id>/<id>-preview.mp3`
