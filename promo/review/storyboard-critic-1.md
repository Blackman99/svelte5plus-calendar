# Storyboard critic 1 — v1

The order (pain → code → UI → features → trust → install) fits how developers judge a library. The problems are in claims, continuity and timing.

1. **The code card overstates.** `<Calendar bind:events />` defaults to `editable = false` (`Calendar.svelte:194`), so this line can't produce the drag and resize in beats 6–7. **Fix:** show `<Calendar bind:events editable />`, as the README quick start does.

2. **The actor vanishes in its own hero beat.** It's dropped on Thursday, then `BYDAY=MO,WE,FR` is typed. The weekly expander only produces BYDAY days (`recurrence.ts`), so Thursday disappears. **Fix:** type `BYDAY=TU,TH`.

3. **"Rides every view" is false.** Month view draws timed events as dot + text; only all-day events get bars (`EventItem.svelte:26`). Year view shows a 4 px dot that isn't amber (`YearView.svelte:57`). So beat 8's "multiplying" is tiny dots on a phone. **Fix:** run beat 8 in the week grid, where the actor is a solid block, and drop "rides every view".

4. **The name first appears at 25.5 s, and beat 3 is overloaded.** It packs a 7-word kicker and a code card into 1.5 s. **Fix:** beat 2 → 1.0 s, beat 3 → 2.0 s, kicker "One Svelte 5 component.", and add `import { Calendar } from 'svelte5plus-calendar'` to the card.

5. **The carousel is off-grid and too small.** 0.65 s steps miss the 0.5 s beat, and six tilted cards break the 60–85 % fill rule. **Fix:** 6 × 0.5 s steps with the front card ≥ 60 % (3.0 s), and give the saved 1 s to beat 11.

6. **The time-zone beat can't be read in 1.0 s.** It has two IANA strings, motion and a caption. Berlin → Tokyo is +7 h, so afternoon blocks wrap past midnight. (The library has no transitions, so the slide is a tween.) **Fix:** make it 2.0 s and place the blocks between 08:00 and 13:00.

7. **The accent change may be invisible.** `--s5c-accent` only colours today, the buttons and events without `color`. **Fix:** leave 3–4 visible events without a colour and frame the today cell.

8. **Beat 12 mixes two jobs.** Keyboard a11y and ICS are features, not trust signals, and 4 chips plus the headline in 2.5 s is dense. **Fix:** cut the chips to "TypeScript · MIT".

9. **The end card has five elements,** and "MIT" repeats beat 12. **Fix:** make the npm line the largest element, have it land by 26.5 s, put the URL second and drop "MIT".

10. **Beats 6 and 7 are one shot split in two.** Same close-up and cursor. 15-minute snapping can't be seen in 1.5 s. **Fix:** one continuous 3.0 s take with "Drag. Drop. Resize."

11. *(Cosmetic)* **At 0.25 s per flip, the Latin-script languages look alike.** **Fix:** alternate scripts (EN → 中文 → DE → 日本語 …) and keep "10 languages" fixed on screen.

**Verified true:** six views, 15-minute snap, the RRULE subset, themes, `--s5c-accent`, 10 UI languages, IANA `timeZone`, zero runtime dependencies (`svelte` peer only), MIT, ICS, Alt+arrow editing, touch, and DST support.
