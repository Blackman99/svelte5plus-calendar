---
"svelte5plus-calendar": patch
---

Fix the stylesheet being tree-shaken away for consumers on rolldown-based bundlers (Vite 8+): the side-effect CSS import now lives inside `Calendar.svelte` and `MiniCalendar.svelte` (whose module imports always survive) instead of only the `index.ts` re-export barrel. Calendars rendered by such bundlers were previously unstyled.
