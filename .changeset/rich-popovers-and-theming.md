---
"svelte5plus-calendar": minor
---

Built-in event UX and ancestor-driven theming:

- **Event details popover** — clicking an event now opens a details popover (time, calendar, location, description, recurring badge, delete button) when no `onEventClick` handler is provided. Disable with `eventDetails={false}`.
- **Quick-create popover** — clicking or drag-selecting empty space (with `selectable`) opens a quick-create popover with title input and calendar picker when no `onSelect`/`onDateClick` handler is provided. Disable with `quickCreate={false}`.
- New callbacks: `onEventCreate(event)` and `onEventDelete(event)`.
- **Ancestor-driven theming** — when the `theme` prop is omitted, calendars now inherit `data-s5c-theme="dark"` from any ancestor element, so a whole app can switch themes with one attribute.
- Month view now scrolls internally instead of overflowing in height-constrained containers.
