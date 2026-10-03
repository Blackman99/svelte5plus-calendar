# Film critic 1 — film-v1.mp4

**Verdict: NOT SHIP.** The middle (6.6–16.3 s) is good; the time-zone and language beats, the opening and the audio fail. All claims check out against the brief and `src/lib`; nothing from the never-claim list appears.

## 1. Scenes

| Time | Content | Empty | Can lose | Problems |
|---|---|---|---|---|
| 0–1.4 | Hook headline, top-left | 75% | 0.4 s | Small; right 60% empty; still 0.7–1.25 |
| 1.4–2.4 | Chip wall | 61% (94% at 2.4) | 0.2 s | Collides with headline; sparse; chips fade, no collapse |
| 2.4–4.0 | Kicker + code card | 71% | 0.3 s | Code about 8 px on phone; thin strip |
| 4.0–6.5 | Month view builds | 35% | 0.8 s | **Blank card 4.02–4.6** (ledger says fixed); unreadable 1.5 s hold |
| 6.6–10.25 | Carousel | 15% | 0.7 s | Redundant whip to Week; Day nearly blank |
| 10.25–13.0 | Drag / drop / resize | 5–13% | 0.2 s | Best beat; pills cover events |
| 13.0–15.5 | Recurrence | 32% | 0.3 s | Title hidden at entry; code about 6 px on phone |
| 15.6–17.8 | Dark wipe, accents | 30% | 0.6 s | Accent change invisible (diff 0.25/255) |
| 17.9–20.5 | 10 languages | 5% (empty dark grid) | 1.0 s | 2.2 s still; text about 4 px on phone; doubled scripts |
| 20.5–22.5 | Time zone | 20% | 0.7 s | **2-frame jump, not a slide; events leave frame** |
| 22.5–24.3 | "0 runtime dependencies" | 72% | 0.3 s | Word clipped at right; hole fills blue |
| 24.3–28.5 | End card | 75% (96% at 24.6) | 0.8 s | Small stack; static over a dead tail |

## 2. Business clarity on mute

**Mostly yes:** calendar, then "One Svelte 5 component.", then real UI, then `npm i svelte5plus-calendar`.

- The package name is first readable on a phone only at 24.8 s.
- **CTA passes:** the npm line is about 14 px on phone, on screen 25.0–28.5.
- **The URL fails:** about 3 px x-height on phone.

## 3. Defects

- **1.43–1.53** Chips run over "calendar?" and its underline.
- **2.30–2.45** Empty frame.
- **4.02–4.60** Blank white card, then an empty grid.
- **6.52–6.62** Title strip ghosts over the month toolbar.
- **13.10–13.30** "Recurring events." hidden by the calendar while the drag pills linger.
- **18.0–18.1** Title over the zooming header.
- **19.0–21.0** Doubled-text cross-fades.
- **20.50–20.55** Dark-to-white flash; the old "10 languages" label (reverted to English) sits over the new scene.
- **23.8–24.2** "dependencies" clipped at the right edge.
- **24.4–24.8** Near-empty frame.
- **26.20–26.27** Amber bar strikes through "$ npm i".

**Frozen time:** `frozen-time.sh` reports 0.1 s only because slow pushes beat its 0.35 threshold. By change over 0.5 s below 3/255, there is **about 5.0 s of near-still picture before the end card**, worst at 18.3–20.5 and 16.6–17.8. The end card adds 3.4 s.

## 4. Audio

- **Loudness:** −16.4 LUFS against the −14 target; true peak −1.6 dBFS; LRA 3.4 LU. The music alone has an LRA of 2.7 LU, which is flat.
- **Music:** generic corporate stock (120 BPM), cut on bar lines.
  - The hook plays about 5 dB under the body.
  - The track resolves at 26.5 and decays to −40 dBFS under a static CTA.
- **Sync:** good. Detents, cut pops and the 26.5 downbeat all land.
- **Level problems:**
  - **The 15.8–15.9 wipe spikes +15 to +20 dB in 2–8 kHz**, 9 dB above any musical high end in the film. It is the harshest moment.
  - The recurrence pops are near-inaudible (+0.3 to +2.5 dB).
  - 17 ticks in 13 s reads as ticky.

## 5. Top changes, ranked

1. **Rebuild the time-zone beat.** Frame 8 AM–7 PM so both states are in frame, and animate a 0.6 s eased +5 h slide.
2. **Fix the language beat.** Zoom 2.5× so localized text is at least 60 px native. Show 5 scripts at 0.3 s each with hard swaps, and remove the leftover label at 20.5. Saves 1 s.
3. **Fix the audio.** Cut the wipe by 10 dB or low-pass it at 4 kHz. Master to −14 LUFS. Lift or skip the quiet intro. Raise the recurrence pops. Halve the language detents.
4. **Fill the dead frames.** Chips collapse into the code card. Code morphs into the calendar's toolbar and grid instead of leaving a blank card. Bring the logo in large, out of the zero.
5. **Clear the collisions in §3.** The outgoing text must leave before the incoming layer arrives.
6. **Make the package name readable on a phone at first mention.** Use a code card about 90% wide with 2× text, a larger URL, and npm as the largest end-card element.
7. **End the carousel on Week.** This removes the whip and saves 0.7 s. Populate the Day and Agenda cards.
8. **Make the accent visible or cut it.** Change it on the selected block or today column, or cut it and save 0.6 s.
9. **Bookends.** Scale the hook and the end card up about 1.3×, start the chips by 0.6 s, and end at about 27.3 s or hold a sustain under the CTA.

Total after cuts: roughly 24–25 s.
