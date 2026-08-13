---
"svelte5plus-calendar": minor
---

Quick-create now also activates on `editable` calendars: clicking or drag-selecting empty space opens the built-in quick-create popover when the calendar is `selectable` **or** `editable` (previously `selectable` only). Calendars with neither flag remain read-only. Opt out with `quickCreate={false}`.
