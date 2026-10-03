# Film critic 3: film-v3.mp4

**Verdict: ONE MORE PASS, audio only.** All three round-2 fixes landed and the picture is clean.

## Round-2 items

- **FIXED:**
  - **Wipe.** The 2–8 kHz peak is −18.6 dBFS at 13.05 (v2: −5.2); momentary is +0.9 LU (v2: +7).
  - **Holds.** Dark mode holds 13.40–13.73. The time-zone holds are each 0.5 s or less. "0 deps" holds 18.40–18.95.
  - **Chips over code.** The chips are gone at 1.600; code starts at 1.633.
  - **Leftover label.** A clean cut at 16.000.
  - **Amber pill.** It flies at logo height, 20.70–20.92.
  - **Blank card.** Now 3.43–3.50.
  - **Earlier fixes still hold.** Frame 0 is finished.
- **PARTLY: recurrence code.** It is about 7 px on a phone (readable), but still covers the calendar's bottom-left eighth, 11.4–12.9.
- **STILL PRESENT (cosmetic): view tabs.** They are about 4–5 px on a phone.
- **No glitch frames** (all 1,350 scanned).

## Audio

- **Levels:** −14.5 LUFS, true peak −1.3 dBFS, LRA 2.9 LU (the music alone is 3.1).
- **Requested spots:**
  - 13.1: clean.
  - 17.5: the hit lands on the cut, +6 dB.
  - 19.0: clean. The push-through is the loudest effect (+3.9 LU), on the beat's return.
  - 21.0: the dock hit lands 80 ms after the pill settles, which is fine.
  - The music resolves cleanly by 22.4.
- **Music edit:** a beat-aligned one-bar splice, with no click.
- **Ticks too hot (missed in round 2):**
  - There are eight 10 ms ticks: 5.55–7.55 and 14.30, 14.90, 15.50.
  - They peak at −3.2 to −6.7 dBFS in 2–8 kHz, above the music's loudest high end (−6.9).
  - That is +9 to +15 dB RMS over the surrounding music, and 1–3 dB hotter than v2.
- **Music hole:** 17.0–18.9 sits at −23 to −26.5 LUFS momentary, 4 dB below v2's breakdown.

## New defects

- **4.0–4.95:** the month grid reads as still for about 0.95 s, with only a thin amber ring at 4.40. Borderline.
- **12.0–12.9:** the calendar runs off the right edge. Cosmetic.
- **13.20–13.40:** the wipe bar grazes 12–15 px under "Dark mode.". Cosmetic.
- **11.00–11.13:** an empty code chip shows before the title. Cosmetic.

## Claims

All claims match BRIEF.md and `src/lib`:
- The RRULE stays in the subset.
- The 10 chips match `BUILT_IN`.
- NY to London is +5 h.
- There are no dependencies, and the license is MIT.

Nothing from the never-claim list appears.

## ONE MORE PASS

1. **Cut the eight ticks 8–10 dB**, to at most +4 dB at 2–8 kHz. This is a remix only.
2. **Optional: bring "Six views." in about 0.3 s earlier.**
3. **Optional: lift the 17.0–18.9 music bed 3–4 dB.**

Item 1 is the only quality-bar fail; everything else is cosmetic. Once item 1 is done: SHIP.
