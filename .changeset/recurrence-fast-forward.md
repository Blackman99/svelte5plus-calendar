---
"svelte5plus-calendar": patch
---

Speed up recurrence expansion for series whose DTSTART lies far before the visible range. `expandRecurrence` now fast-forwards past occurrences that end before the range (daily, weekly, monthly and yearly, with conservative jumps that never skip an occurrence) instead of iterating from DTSTART. A "every day since 2000" event previously looped ~10k times per render; it now jumps directly to the visible window. COUNT-bearing rules keep counting from DTSTART, so their semantics are unchanged.
