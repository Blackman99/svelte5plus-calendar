# Gauntlet ledger

Builder ≠ judge: every review below was done by a fresh agent that saw only the brief, the storyboard or
the rendered MP4 (never the builder's reasoning) and measured the render itself. Reports are in `review/`.

| Round | Artifact | Critic's top findings | Changes made | Measured result |
|---|---|---|---|---|
| Storyboard 1 | `STORYBOARD.md` v1 | Code card `<Calendar bind:events />` can't drag (`editable` defaults to false); BYDAY=MO,WE,FR would make the dropped event vanish; "rides every view" false; name unseen until 25.5 s; carousel off-grid and too small; time-zone beat unreadable; accent change invisible; trust beat and end card overloaded; drag/resize split in two | `editable` + import line on the card; recurrence moved to the week grid (dropped on Monday, BYDAY=MO–FR: one block becomes five); carousel on the beat with a ≥ 60 % front card; one drag-drop-resize take; end card led by `npm i` | — |
| Builder stills | stills + draft | Chip collisions, clipped code line, blank white card, unreadable "0", late end card, crowding | Non-overtaking chip lanes, wider card, month view materialises inside the morphing frame, paper counter, earlier end card | Frozen time 3.8 s → 0.1 s after linear hold-pushes |
| Film 1 | `film-v1.mp4` 28.5 s | NOT SHIP. Time-zone "slide" was a 2-frame jump with events leaving frame; language beat 4 px on phone with doubled scripts (motion-blur sub-frames straddling text swaps); blank card 4.0–4.6; six text collisions; 5 s near-still by a stricter metric; wipe +15–20 dB at 2–8 kHz; −16.4 LUFS; hook the quietest second | Re-timed to 24.5 s; discrete state on a frame clock (`clock.tf`); time zones stepped through five real IANA zones one hour apart, 07–24 h framing, ghosts + "+5 h"; language header at 3× with all ten names; month grid cross-fades under the fading code; carousel ends on Week; accent beat cut; bigger hook, code card and end card; music re-cut so the groove lands on the chip wall | −14.5 LUFS, LRA 3.1, TP −1.3 dBFS |
| Film 2 | `film-v2.mp4` 24.5 s | ONE MORE PASS. 9/9 top changes landed or partly; wipe still +9–27 dB at 2–8 kHz on the render (the mix log said +2.4: the mixer's 0.4 s window missed a peak at 0.42 s); dark-mode and time-zone holds ~0.9 s; chips over code at 1.53; one double-exposed frame at the 16.5 cut; pill crossing the URL | Mixer measures the whole effect; wipe low-passed at 1.5 kHz; holds cut by 0.5 s each (22.5 s, final downbeat kept on a bar line at 21.0); hard cuts moved half a frame early so no frame's sub-frames straddle them; pill flies in along the logo's slot line; recurrence rule as one 44 px line | Wipe +2.6 dB at 2–8 kHz on the render |
| Film 3 | `film-v3.mp4` 22.5 s | ONE MORE PASS, audio only. All round-2 fixes FIXED; no glitch frames in 1,350; claims verified. Eight 10 ms ticks peaked above the music's loudest 2–8 kHz content (a 50 ms window understates a 10 ms click). Optional: "Six views." 0.3 s earlier, lift the 17–19 s bed, cosmetic edge clip, wipe bar under the title, empty chip before typing | New mixer rule: an effect's 2–8 kHz sample peak may not exceed the local music's 2–8 kHz peak (−1 dB); ticks low-passed at 4 kHz; `tools/fx-check.py` measures every effect on the decoded render; ring and labels 0.3 s earlier; bed lifted ~2 dB; recurrence camera keeps the card in frame; wipe bar fades at the edge; rule chip appears with the typing | 0 effects over the limit (`review/fx-check-v4.txt`); −14.5 LUFS, LRA 2.9, TP −1.4 dBFS; frozen 0.0 s on both metrics |
| Film 4 | `film-v4.mp4` 22.5 s | **SHIP.** Ticks pass the bar (peaks 0.9–4.0 dB under the music's loudest 2–8 kHz peak); all round-3 items FIXED; no glitch frames in 1,350; claims verified. Optional, cosmetic: trim the ticks at 6.05 / 7.05 by ~4 dB; recurrence chip covers the 6 PM row; view tabs small on phones | Remix only: a per-event trim (−5 dB) on the two ticks | Tick-centred 50 ms lift 6.05: +8.9 → +4.9 dB, 7.05: +8.5 → +4.7 dB; −14.6 LUFS, LRA 2.9, TP −1.3 dBFS. Recurrence chip and tab size left as is (cosmetic) |

Determinism: `tools/determinism.mjs` renders frames after different seek histories; every frame matches,
three of them within ±1/255 (GPU rounding while a huge SVG is scaled ×13 or a calendar relayouts).

## Generation ledger

No AI imagery or AI audio: every frame is code (the real component + HTML/SVG), the music and effects are
licensed Mixkit library recordings (ids in `README.md`). Nobody has listened to the mix: every audio
judgement above is measured (ebur128 loudness, band-limited peaks against a music-only render).

| Asset | Source | Accepted window / edit |
|---|---|---|
| Music | Mixkit 173 "Better Times are Coming" (119.99 BPM measured, first beat 0.128 s) | film 0–19.0 ← track 37.128–56.128 (end of the breakdown → groove returns on bar 19 = film 1.0); film 19.0–22.5 ← track 94.128–97.628 (final downbeat 96.128 = film 21.0); 30 ms equal-power crossfade at the splice; +3 dB on the first second; bass sweeps out 16.0–17.5 and slams back at 19.0 |
| Effects | 11 Mixkit recordings, screened with `tools/sfx-candidates.py`, softened with `tools/soften-sfx.sh` | 34 events in `assets/sfx/plan.json`, levels solved per event in-band by `tools/mix.py`, verified on the render by `tools/fx-check.py` |
