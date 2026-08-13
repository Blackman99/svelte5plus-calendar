---
"svelte5plus-calendar": patch
---

Fix `MiniCalendar` stretching to fill fixed-height parents: the shared `.s5c` base style sets `height: 100%`, which made the mini calendar consume its container's full height (pushing sibling content into overflow). It now sizes to its content.
