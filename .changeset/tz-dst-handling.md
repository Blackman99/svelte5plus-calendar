---
"svelte5plus-calendar": patch
---

Clarify and harden `timeZone` DST handling. `fromZoned` now iterates to convergence (bounded) instead of a fixed 3 steps and documents the two inherent ambiguities of a wall-clock-only `Date`: the fall-back overlap resolves deterministically, and the spring-forward gap (a wall-clock that does not exist) returns a best-effort instant. Added specs covering round-trips across the spring-forward jump, overlap determinism, and the non-existent wall-clock.
