---
"svelte5plus-calendar": minor
---

Resources view, display time zones, constraints, ICS, series splitting, keyboard editing, and 8 new locales:

- **Resources view** — `view="resources"` renders one day split into columns per `resources` entry (rooms, people). Events link via `event.resourceId`; dragging sideways reassigns the resource (`onEventChange` gains `resourceId`/`oldResourceId`), and quick-create pre-assigns the clicked column.
- **Display time zone** — the `timeZone` prop renders the whole calendar in any IANA zone. Event `Date`s stay real instants; drags, quick-create and popovers are interpreted in the zone and converted back automatically. `toZoned`/`fromZoned` exported.
- **Constraints** — `validRange` limits navigation/interaction to a date window (outside days dimmed and inert); `eventOverlap={false}` rejects drops, resizes and creates that collide with another timed event.
- **“This and following”** — the series-edit confirm now offers detach (this event) *and* split (this and following). COUNT and exdates are re-partitioned, weekly BYDAY lists re-anchor on weekday changes. New `onSeriesSplit` callback and exported `splitSeries` helper.
- **ICS import/export** — `parseICS` / `toICS` round-trip iCalendar documents including recurrence, exdates, all-day values, escaping and line folding; `serializeRRule` exported.
- **Keyboard editing & a11y** — Alt+↑/↓ moves a focused event by the snap step, Alt+←/→ by a day, Alt+Shift+↑/↓ resizes; popovers trap focus and restore it on close; changes are announced via an aria-live region.
- **Locales** — built-in UI strings for de, fr, es, pt, ja, ko, ru and it (10 languages total).
