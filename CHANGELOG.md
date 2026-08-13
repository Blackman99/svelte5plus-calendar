# svelte5plus-calendar

## 0.5.2

### Patch Changes

- db889c3: Fix the stylesheet being tree-shaken away for consumers on rolldown-based bundlers (Vite 8+): the side-effect CSS import now lives inside `Calendar.svelte` and `MiniCalendar.svelte` (whose module imports always survive) instead of only the `index.ts` re-export barrel. Calendars rendered by such bundlers were previously unstyled.

## 0.5.1

### Patch Changes

- c765b38: Fix `MiniCalendar` stretching to fill fixed-height parents: the shared `.s5c` base style sets `height: 100%`, which made the mini calendar consume its container's full height (pushing sibling content into overflow). It now sizes to its content.

## 0.5.0

### Minor Changes

- b561a09: Resources view, display time zones, constraints, ICS, series splitting, keyboard editing, and 8 new locales:
  
  - **Resources view** — `view="resources"` renders one day split into columns per `resources` entry (rooms, people). Events link via `event.resourceId`; dragging sideways reassigns the resource (`onEventChange` gains `resourceId`/`oldResourceId`), and quick-create pre-assigns the clicked column.
  - **Display time zone** — the `timeZone` prop renders the whole calendar in any IANA zone. Event `Date`s stay real instants; drags, quick-create and popovers are interpreted in the zone and converted back automatically. `toZoned`/`fromZoned` exported.
  - **Constraints** — `validRange` limits navigation/interaction to a date window (outside days dimmed and inert); `eventOverlap={false}` rejects drops, resizes and creates that collide with another timed event.
  - **“This and following”** — the series-edit confirm now offers detach (this event) *and* split (this and following). COUNT and exdates are re-partitioned, weekly BYDAY lists re-anchor on weekday changes. New `onSeriesSplit` callback and exported `splitSeries` helper.
  - **ICS import/export** — `parseICS` / `toICS` round-trip iCalendar documents including recurrence, exdates, all-day values, escaping and line folding; `serializeRRule` exported.
  - **Keyboard editing & a11y** — Alt+↑/↓ moves a focused event by the snap step, Alt+←/→ by a day, Alt+Shift+↑/↓ resizes; popovers trap focus and restore it on close; changes are announced via an aria-live region.
  - **Locales** — built-in UI strings for de, fr, es, pt, ja, ko, ru and it (10 languages total).

## 0.4.0

### Minor Changes

- 26cc5ba: Touch support, recurring-series editing, range notifications, and all-day drag:
  
  - **Touch devices** — long-press (~300 ms, with haptic tick) to drag, resize or select; plain swipes scroll as usual; `pointercancel` is handled so interrupted drags no longer leave stale state.
  - **Recurring event editing** — instances of a series can now be dragged/resized: a confirm popover detaches that occurrence into a standalone event (the series gains an exdate). The details popover offers “Delete this occurrence” and “Delete series”. New `onSeriesDetach({ series, detached, occurrence })` callback; `onEventDelete` gains an optional `occurrence` argument. Pure helpers `detachOccurrence` / `excludeOccurrence` are exported.
  - **`onRangeChange(start, end)`** — fires whenever the visible date range changes (including mount), the natural hook for fetching events from a server.
  - **All-day lane drag** — all-day bars in week/day views can be dragged to another day.

## 0.3.1

### Patch Changes

- aa123a8: Documentation polish: user-focused README (maintainer/release instructions moved to CONTRIBUTING.md), working logo and links on the npm page, docs-site URL and badges, corrected `theme` default in the API overview.

## 0.3.0

### Minor Changes

- 27c8f96: Quick-create now also activates on `editable` calendars: clicking or drag-selecting empty space opens the built-in quick-create popover when the calendar is `selectable` **or** `editable` (previously `selectable` only). Calendars with neither flag remain read-only. Opt out with `quickCreate={false}`.

## 0.2.1

### Patch Changes

- 9ea9262: Fix week/day and month view column misalignment when classic (space-consuming) scrollbars are active: the header and all-day rows are now compensated by the measured scrollbar width, keeping them aligned with the scrollable grid body.

## 0.2.0

### Minor Changes

- 5cb9f1c: Built-in event UX and ancestor-driven theming:
  
  - **Event details popover** — clicking an event now opens a details popover (time, calendar, location, description, recurring badge, delete button) when no `onEventClick` handler is provided. Disable with `eventDetails={false}`.
  - **Quick-create popover** — clicking or drag-selecting empty space (with `selectable`) opens a quick-create popover with title input and calendar picker when no `onSelect`/`onDateClick` handler is provided. Disable with `quickCreate={false}`.
  - New callbacks: `onEventCreate(event)` and `onEventDelete(event)`.
  - **Ancestor-driven theming** — when the `theme` prop is omitted, calendars now inherit `data-s5c-theme="dark"` from any ancestor element, so a whole app can switch themes with one attribute.
  - Month view now scrolls internally instead of overflowing in height-constrained containers.
