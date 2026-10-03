# Film critic 2: film-v2.mp4

**Verdict: ONE MORE PASS.** A big step up; one v1 audio fault, two holds and three micro-collisions remain.

## v1 §3 defects

- **FIXED:**
  - Chips over "calendar?": the headline lifts out at 0.87–0.97.
  - Empty frame: worst left is 1.77–1.87.
  - Title ghosting over the month toolbar.
  - Hidden "Recurring events.": it lands at 11.13 on clear blue.
  - Title over the zooming header.
  - Doubled cross-fades.
  - Clipped "dependencies": only during the 20.2 push-through.
  - Near-empty frame.
- **PARTLY: blank card.** 3.43–3.63 (was 0.58 s).
- **PARTLY: leftover label.** One English frame at **16.500**.
- **PARTLY: amber strike-through.** The pill now crosses the URL at **22.667–22.70**.
- **PARTLY: frozen time.** The scripts read 0.0 s only because the background drifts. By eye, **13.35–14.30** and **17.55–18.47** hold about 0.9 s each (rule: 0.6 s). Total about 2.9 s (was 5.0 s).

## v1 §5 changes

1. **Time zones: FIXED.** At 17.0–17.5 the events slide in eased hour steps, with ghost slots and "+5 h". Nothing leaves frame.
2. **Languages: FIXED.** The header is about 10 px on a phone. Six scripts swap hard in 1.9 s.
3. **Audio: PARTLY.**
4. **Dead frames: FIXED.**
5. **Collisions: PARTLY.**
6. **Phone legibility: FIXED.** Code is about 10 px, npm 12–15 px, URL x-height about 6 px.
7. **Ends on Week: FIXED.** Day and Agenda are still sparse.
8. **Accent: FIXED** (cut).
9. **Bookends: FIXED.** The hook is about 2× larger, the chips start at 0.8 s, and the music resolves at 23.0, fading out by 24.5.

## Audio

- **Fixed:**
  - Mix: −14.5 LUFS, true peak −1.3 dBFS, LRA 3.1 LU (the music alone is 2.3).
  - The hook matches the body.
  - Recurrence pops are +5 to +9 dB.
  - The 11 ticks are each under +3 dB at 2–8 kHz.
- **Wipe: STILL PRESENT.**
  - 2–8 kHz is **+9 to +27 dB over the music at 12.84–13.16**.
  - That is **8.4 dB above any musical high end** in the film.
  - Momentary loudness hits −9.4 LUFS against −16.4 for the music.
  - The mix log's "+2.4 dB" is wrong.
- **Requested spots:**
  - 1.0 and 18.5: clean.
  - 18.6–20.4: the track's own breakdown (about −22 LUFS). It works because the beat returns on the 20.5 logo.
  - 21.0: the music edit is seamless.
  - 23.0: clean, +5 dB.

## New defects

- **1.53–1.63:** The chips "popovers" and "focus trap" slide across the code text.
- **11.6–12.9:** The recurrence code card covers about a quarter of the calendar, and its code is about 5 px on a phone (unreadable).
- **Minor:** The view tabs are 5–6 px on a phone.
- **No single-frame glitches.**

## Claims

Every claim is true against BRIEF.md and `src/lib`. The RRULE stays in the subset, the +5 h shift is correct, every chip exists in the source, and nothing from the never-claim list appears.

## ONE MORE PASS

1. **Tame the wipe.** Cut it about 15 dB or swap in a soft air-pass. Aim for at most +4 dB at 2–8 kHz, measured on the render.
2. **Shorten both holds to 0.5 s or less.** Zoom to the header at about 13.8 and leave the time zones at about 18.05.
3. **Clear the micro-collisions.**
   - Fade the chips before the code text appears.
   - Hard-cut at 16.5 while holding the Russian state.
   - Keep the amber pill clear of the URL.
