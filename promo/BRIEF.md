# Brief — svelte5plus-calendar launch film

Made with the `business-motion-film` skill (github.com/echris6/motion-video-kit), adapted from
"business commercial" to "open-source developer library launch film".

| | |
|---|---|
| **Product** | `svelte5plus-calendar` v0.5.4 — an MIT, zero-runtime-dependency calendar component for Svelte 5 |
| **Viewer (buyer)** | Svelte developers and small teams building scheduling, booking, CRM or internal tools; scrolling GitHub / X / the docs site |
| **Viewer's problem** | A real calendar is a pile of hard sub-problems (drag & drop, recurrence, time zones, i18n, overlap layout, dark mode, keyboard a11y); rolling your own takes weeks |
| **Single action (CTA)** | `npm i svelte5plus-calendar` → docs at `blackman99.github.io/svelte5plus-calendar` |
| **Length / format** | ~30 s, 1920×1080, 60 fps, H.264 MP4 + AAC; poster frame; contact sheet |
| **Brand** | Blue `#0f3cd9` (gradient `#0a2ca8 → #2b54ee`), amber `#ffb52e`, white; the logo tile (3×3 day cells, a bright "today" cell, an amber event pill); system UI type (SF Pro on macOS), `ui-monospace` for code |
| **Real assets** | The library itself — every calendar on screen is the real `<Calendar>` component from `src/lib`, rendered live in Chromium, never a mock-up or AI image |
| **Tone / music** | Confident, fast developer-launch energy (the viewer *is* a tech audience, so launch-film grammar fits); licensed library music edited to picture, no vocals, no trailer hits |

## Provably true (allowed claims, each checked in the source)

- Six views: month, week, day, year, agenda, resources (`CalendarView` in `src/lib/types.ts`)
- Drag & drop move, resize, drag-to-create; snaps to 15 min by default (`snapDuration = 15`)
- Recurring events from RRULE strings — a *practical subset* (`FREQ`, `INTERVAL`, `COUNT`, `UNTIL`, `BYDAY`, `BYMONTHDAY`) plus "this event" / "this and following" edits
- Light / dark / auto themes; every color is a CSS custom property (`--s5c-accent`, …)
- 10 built-in UI languages (en, zh-CN, de, fr, es, pt, ja, ko, ru, it — `BUILT_IN` in `src/lib/i18n.ts`); any BCP-47 locale for dates via `Intl`; `timeZone` prop accepts IANA zones
- Zero runtime dependencies (`package.json` has no `dependencies`); TypeScript-first; MIT
- ICS import/export (`parseICS` / `toICS`); keyboard navigation and Alt+arrow editing

## Never claim

- Download counts, GitHub stars, "used by" logos, benchmarks, or "fastest / smallest" anything
- "Full RRULE" (it is a practical subset) or a horizontal timeline view (not shipped)
- Anything about named competitors (no logos, no comparisons in the film)

## Done means

The skill's quality bar (`references/quality-bar.md`): frame 0 is a finished composition; frozen time ≤ ~1 s;
no text collisions; lead subject fills 60–85 % in feature beats; on mute, a first-time viewer can say
"it's a Svelte 5 calendar component with every view, and I install it with npm"; CTA readable ≥ 1.5 s;
loudness measured; independent critics sign off (SHIP) or remaining items are cosmetic.
