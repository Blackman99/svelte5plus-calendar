# Storyboard — as built (22.5 s @ 60 fps)

History: storyboard v1 (30 s) → v2 applied `review/storyboard-critic-1.md` → film v1 (28.5 s) →
v2 (24.5 s) applied `review/film-critic-1.md` → v3 (22.5 s) applied `review/film-critic-2.md`. See `LEDGER.md`.

**Music grid:** the track measures 119.99 BPM. Film 0 is beat 3 of bar 18, so the groove lands on the
bar 19 downbeat at **1.0 s**, as the wall of chips hits. Film bar lines fall on odd seconds. A splice at
19.0 s brings the track's own final downbeat to **21.0 s**, as the amber pill seats in the logo. From the
time-zone cut the bass sweeps out (a build-down) and slams back as the camera flies through the zero.

**Persistent actor:** the amber pill from the logo. It underlines the hook, lands as the amber
"Release sync" event, is dragged, resized and made recurring, becomes the dark-mode wipe, then
flies home into the logo on the last downbeat.

| # | Time (s) | Composition | On screen | Job | Out / carried object |
|---|---|---|---|---|---|
| 1 | 0.0–1.0 | Type impact | "Building a calendar?" at 300 px, amber pill under "calendar"; push | Hook | Headline exits up before any chip reaches it |
| 2 | 0.8–1.6 | Macro density | 30 real feature chips race up in four non-overtaking lanes | Problem: it's a lot | Chips converge and vanish into the code card before its text appears |
| 3 | 1.6–3.4 | Code close-up | "One Svelte 5 component." + `import { Calendar } from 'svelte5plus-calendar'` / `<Calendar bind:events editable />` (typed) at 64 px | Solution and package name | The card's white surface *is* the month card |
| 4 | 3.3–4.9 | UI, materialising | Code fades while the real month grid fades in under it; numbers, events by row, the amber event lands with a ring | Proof it's a real UI | Month card becomes the carousel's front slot |
| 5 | 4.9–8.0 | Dimensional carousel | Month → Day → Year → Agenda → Resources → Week, one step per beat, ≥ 60 % front card; "Six views." with the amber pill sliding under the active tab | Breadth | Ends on Week; straight push in |
| 6 | 8.0–10.8 | UI close-up, one take | Cursor drags the amber block Wed 14:00 → Mon 10:00 (the component's own `.s5c-dragging` + `.s5c-preview` styling), drops, resizes to 11:30; "Drag." "Drop." "Resize." over the empty Monday afternoon | Interaction | Pull back right |
| 7 | 10.8–12.95 | Split: rule → result | `recurrence: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'` types in one 44 px line; Tue → Fri occurrences appear on eighth notes with amber pings | Recurrence | Amber wipe bar enters |
| 8 | 12.9–13.75 | Wipe | The amber pill, stood on end, wipes the same week into the dark theme. "Dark mode." | Theming | The grid folds away under the header |
| 9 | 13.75–16.0 | Header strip at 3× + type | Toolbar + weekday row hard-swap EN → 简体中文 → 日本語 → Deutsch → 한국어 → Русский; "10 languages" with all ten names, the active one amber | i18n | Hard cut on the beat (half a frame early, so no frame blends two states) |
| 10 | 16.0–17.5 | UI mid (07–24 h) | `timeZone` steps through real zones one hour apart, New York → Halifax → Noronha → Cape Verde → Abidjan → London; blocks move with each step; dashed ghosts + "+5 h" | Time zones | Hard cut to the zero |
| 11 | 17.5–19.5 | Type impact | "0 runtime dependencies." + TypeScript · MIT; music at the bottom of its build-down | Trust | The zero's counter opens onto the logo |
| 12 | 19.0–22.5 | End card | Logo, wordmark, **`$ npm i svelte5plus-calendar`** (largest), docs URL; the pill flies in along the logo's slot line and seats on the final downbeat | CTA (readable 20.0–22.5) | End |
