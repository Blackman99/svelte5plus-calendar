---
'svelte5plus-calendar': patch
---

Fix the day, week and resource grids on narrow screens: the hour column shrank to 44px while the header and all-day lane stayed at 56px, so day columns sat 12px to the right of the time labels. All three now share `--s5c-time-gutter`.
