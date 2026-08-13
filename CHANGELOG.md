# svelte5plus-calendar

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
