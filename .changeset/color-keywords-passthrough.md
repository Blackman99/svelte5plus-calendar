---
"svelte5plus-calendar": patch
---

Fix named CSS color keywords (e.g. `coral`, `tomato`, `white`) being misinterpreted as palette names and falling back to blue. `colorVars` now resolves palette variables via the `PALETTE` whitelist instead of a naive lowercase regex, so arbitrary CSS colors pass through untouched.
