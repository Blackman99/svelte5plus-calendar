---
"svelte5plus-calendar": minor
---

Touch support, recurring-series editing, range notifications, and all-day drag:

- **Touch devices** — long-press (~300 ms, with haptic tick) to drag, resize or select; plain swipes scroll as usual; `pointercancel` is handled so interrupted drags no longer leave stale state.
- **Recurring event editing** — instances of a series can now be dragged/resized: a confirm popover detaches that occurrence into a standalone event (the series gains an exdate). The details popover offers “Delete this occurrence” and “Delete series”. New `onSeriesDetach({ series, detached, occurrence })` callback; `onEventDelete` gains an optional `occurrence` argument. Pure helpers `detachOccurrence` / `excludeOccurrence` are exported.
- **`onRangeChange(start, end)`** — fires whenever the visible date range changes (including mount), the natural hook for fetching events from a server.
- **All-day lane drag** — all-day bars in week/day views can be dragged to another day.
