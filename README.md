<p align="center">
  <img src="./static/favicon.svg" width="84" alt="svelte5plus-calendar logo" />
</p>

# svelte5plus-calendar

**English** | [简体中文](./README.zh-CN.md)

A full-featured, zero-dependency calendar component for **Svelte 5** — month, week, day, year and agenda views, drag & drop editing, recurring events, multiple calendars, i18n and dark mode. Feature-set inspired by Google Calendar, Apple Calendar and Outlook.

> 📖 **Documentation with live examples:** run `npm run dev` in this repo, or visit the hosted docs (English & 中文).

## Features

- 🗓 **Five views** — month (with spanning multi-day bars and `+N more` popovers), week & day time grids, year overview, agenda list
- ✋ **Drag & drop** — move events across days/slots, resize by dragging the bottom edge, drag empty space to select a range or create events
- 💬 **Built-in popovers** — click an event for a details popover (with delete), click/drag empty space for a quick-create popover — zero config, and any callback you provide takes over
- 🔁 **Recurring events** — practical RRULE subset (`FREQ`, `INTERVAL`, `COUNT`, `UNTIL`, `BYDAY` incl. `2TU`/`-1FR`, `BYMONTHDAY`) as strings or typed objects, plus `exdates`
- 🎨 **Theming** — light/dark/auto; every color, radius and font is a CSS custom property; 10-color event palette that adapts to dark mode
- 🌍 **i18n** — any BCP-47 locale via the `Intl` API (no locale bundles); English & Chinese UI strings built in; locale-aware first day of week and 12/24-hour clock
- 📚 **Multiple calendars** — sources with shared colors, visibility toggles, per-source and per-event edit permissions
- ⏰ **Time-grid niceties** — current-time indicator, business hours shading, configurable hours range/slot size/snapping, ISO week numbers, all-day lane
- 🧩 **Custom rendering** — replace event content with Svelte 5 snippets; hide the toolbar and bring your own via bindable `date`/`view`
- 🧮 **Headless exports** — the overlap-packing and week-segment layout algorithms, recurrence expansion and date utils are exported as pure functions
- ♿ **Accessible** — keyboard navigation on the month grid, ARIA roles and labels, focus management
- 🪶 **Zero runtime dependencies**, TypeScript-first, ~19 kB min+gz

## Installation

```bash
npm install svelte5plus-calendar
```

Requires Svelte 5. Styles are imported automatically.

## Quick start

```svelte
<script lang="ts">
  import { Calendar, type CalendarEvent } from 'svelte5plus-calendar';

  let events = $state<CalendarEvent[]>([
    {
      id: '1',
      title: 'Kickoff meeting',
      start: new Date(2026, 7, 13, 10, 0),
      end: new Date(2026, 7, 13, 11, 0),
      color: 'teal'
    },
    {
      id: '2',
      title: 'Conference',
      start: new Date(2026, 7, 17),
      end: new Date(2026, 7, 20),
      allDay: true
    },
    {
      id: '3',
      title: 'Standup',
      start: new Date(2026, 7, 10, 9, 30),
      end: new Date(2026, 7, 10, 9, 45),
      recurrence: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'
    }
  ]);
</script>

<!-- The calendar fills its parent — give the wrapper a height -->
<div style="height: 640px">
  <Calendar bind:events view="week" locale="en" editable selectable />
</div>
```

## Common recipes

**Handle edits (with rollback):**

```svelte
<Calendar
  bind:events
  editable
  onEventChange={async ({ event, start, end, revert }) => {
    try {
      await api.update(event.id, { start, end });
    } catch {
      revert();
    }
  }}
/>
```

**Create events by drag-selection:**

```svelte
<Calendar
  bind:events
  selectable
  onSelect={({ start, end, allDay }) => {
    events = [...events, { id: crypto.randomUUID(), title: 'New event', start, end, allDay }];
  }}
/>
```

**Multiple calendars with toggles:**

```svelte
<script lang="ts">
  let sources = $state([
    { id: 'work', name: 'Work', color: 'blue', visible: true },
    { id: 'personal', name: 'Personal', color: 'green', visible: true }
  ]);
</script>

<Calendar {events} {sources} />
```

**Chinese UI:**

```svelte
<Calendar {events} locale="zh-CN" />
```

**Dark mode & branding:**

```svelte
<Calendar {events} theme="dark" />

<style>
  :global(.s5c) {
    --s5c-accent: #e4572e;
    --s5c-event-radius: 8px;
  }
</style>
```

## API overview

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `events` | `CalendarEvent[]` | `[]` | bindable — edits write back |
| `date` | `Date` | today | bindable — focused date |
| `view` | `'day' \| 'week' \| 'month' \| 'year' \| 'agenda'` | `'month'` | bindable |
| `sources` | `CalendarSource[]` | `[]` | calendar groups |
| `locale` | `string` | `'en'` | BCP-47 tag |
| `editable` / `selectable` | `boolean` | `false` | interactions |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'light'` | |
| `firstDayOfWeek` | `0–6` | from locale | 0 = Sunday |
| `dayStartHour` / `dayEndHour` | `number` | `0` / `24` | visible hours |
| `slotDuration` / `snapDuration` | minutes | `30` / `15` | grid & snapping |
| `businessHours` | `boolean \| { days, startHour, endHour }` | `null` | shading |
| `dayMaxEvents` | `number` | `4` | month-cell rows before `+N more` |
| `weekNumbers` / `weekends` / `fixedWeeks` / `nowIndicator` / `hour12` / `agendaDays` / `views` / `header` / `messages` | — | — | see docs |

**Callbacks:** `onEventClick(instance, e)` · `onDateClick(date, allDay)` · `onSelect({start, end, allDay})` · `onEventChange({event, oldStart, oldEnd, start, end, revert})` · `onEventCreate(event)` · `onEventDelete(event)` · `onViewChange(view)` · `onDateChange(date)`

**Built-in popovers:** with `editable` or `selectable` and no callbacks, clicking an event opens a details popover and clicking/drag-selecting empty space opens a quick-create popover. Providing `onEventClick` / `onSelect` / `onDateClick` replaces them; `eventDetails={false}` / `quickCreate={false}` disables them.

**Theming from an ancestor:** omit the `theme` prop and set `data-s5c-theme="dark"` on any ancestor (e.g. `<html>`) to switch every calendar at once.

**Snippets:** `eventContent(instance)` · `toolbarEnd()`

**Also exported:** `MiniCalendar` (standalone month picker), `parseRRule`, `expandRecurrence`, `expandEvents`, `layoutDay`, `layoutWeekRow`, date utilities, and all TypeScript types.

Full reference: see the **API Reference** page in the docs site.

## Development

```bash
npm install
npm run dev        # docs site with live examples
npm test           # unit tests (vitest)
npm run check      # svelte-check
npm run build      # build docs + package the library
```

## Releasing

Versioning and npm publishing are automated with [changesets](https://github.com/changesets/changesets):

1. With your change, run `npx changeset` and describe it (patch/minor/major) — commit the generated file.
2. On push to `main`, the **Release** workflow opens/updates a "chore: version packages" PR.
3. Merging that PR bumps the version, updates `CHANGELOG.md`, and publishes to npm.

One-time setup: add an npm automation token as the `NPM_TOKEN` repository secret.

## License

[MIT](./LICENSE)
