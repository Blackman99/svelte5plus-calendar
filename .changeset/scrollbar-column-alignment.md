---
"svelte5plus-calendar": patch
---

Fix week/day and month view column misalignment when classic (space-consuming) scrollbars are active: the header and all-day rows are now compensated by the measured scrollbar width, keeping them aligned with the scrollable grid body.
