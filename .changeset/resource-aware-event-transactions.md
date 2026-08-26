---
"svelte5plus-calendar": patch
---

Make event creation and edits resource-aware when `eventOverlap` is disabled, so simultaneous events in different resources remain valid while collisions within one resource are rejected. Event mutations now share one transaction path for valid-range checks, time-zone conversion, callbacks, and recurring-series edits.
