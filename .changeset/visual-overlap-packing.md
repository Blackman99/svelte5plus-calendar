---
"svelte5plus-calendar": minor
---

Fix event blocks covering each other in the week, day and resource grids. A block is never drawn shorter than a minimum height, but overlap packing only looked at real times, so a short event drawn taller than its duration could cover the events right after it while still taking the full column width. Packing now uses the height you see.

New `eventMinHeight` prop (px, default `18`) sets that minimum height. Use it instead of a CSS `min-height` on `.s5c-block` when a custom `eventContent` needs taller blocks. `layoutDay` takes a matching optional third argument, `{ minDuration }` (minutes), and the new `LayoutDayOptions` type is exported.
