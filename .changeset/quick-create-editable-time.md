---
"svelte5plus-calendar": patch
---

Quick-create popover: the picked time range is now editable before saving. Start and end use native date/time inputs (free down to the minute — values are no longer snapped to `slotDuration`), an "all day" toggle converts the range to whole days and back, and multi-day ranges can be adjusted. An end time earlier than the start on the same day rolls over to the next day (cross-midnight events, e.g. 22:00–03:00). Two new `CalendarMessages` keys, `starts` and `ends`, label the fields (added to all ten built-in locales).
