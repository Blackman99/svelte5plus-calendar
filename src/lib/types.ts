/**
 * Public types for svelte5plus-calendar.
 * All dates are plain JS `Date` objects interpreted in the user's local time zone.
 */

/** Built-in view names. `resources` shows one day split by {@link Resource} columns. */
export type CalendarView = 'day' | 'week' | 'month' | 'year' | 'agenda' | 'resources';

/** Named palette colors (mapped to CSS variables) — any CSS color string is also accepted. */
export type PaletteColor
	= | 'graphite'
		| 'red'
		| 'orange'
		| 'yellow'
		| 'green'
		| 'teal'
		| 'blue'
		| 'indigo'
		| 'purple'
		| 'pink';

/** Days of week, 0 = Sunday … 6 = Saturday (same as `Date#getDay`). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Recurrence frequency. */
export type RecurrenceFreq = 'daily' | 'weekly' | 'monthly' | 'yearly';

/**
 * Structured recurrence rule — a practical subset of RFC 5545 RRULE.
 * May also be given as an RRULE string, e.g. `"FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=10"`.
 */
export interface RecurrenceRule {
	freq: RecurrenceFreq;
	/** Every N periods (default 1). */
	interval?: number;
	/** Stop after N occurrences (inclusive of the first). */
	count?: number;
	/** Last possible occurrence start (inclusive). */
	until?: Date;
	/** For weekly rules: which weekdays. Defaults to the weekday of `start`. */
	byDay?: Weekday[];
	/** For monthly rules: days of month (1–31). Defaults to the day-of-month of `start`. */
	byMonthDay?: number[];
	/**
	 * For monthly rules: the Nth weekday, e.g. `{ ordinal: 2, day: 2 }` = 2nd Tuesday.
	 * `ordinal: -1` = last.
	 */
	byNthDay?: { ordinal: 1 | 2 | 3 | 4 | 5 | -1; day: Weekday };
}

/** A bookable resource (person, room, machine) for the resources view. */
export interface Resource {
	id: string;
	name: string;
	color?: PaletteColor | string;
}

/** Navigable/interactive date bounds. Days outside are read-only and unreachable. */
export interface ValidRange {
	/** First allowed day (inclusive, day precision). */
	start?: Date;
	/** Last allowed day (inclusive, day precision). */
	end?: Date;
}

/** A calendar (event source/group), e.g. “Work”, “Family”. */
export interface CalendarSource {
	id: string;
	name: string;
	color?: PaletteColor | string;
	/** Hidden sources keep their events but do not render them. Default `true`. */
	visible?: boolean;
	/** When `false`, events of this source cannot be dragged/resized. */
	editable?: boolean;
}

/** An event as provided by the application. */
export interface CalendarEvent {
	id: string;
	title: string;
	/** Inclusive start. */
	start: Date;
	/** Exclusive end. Must be ≥ start. */
	end: Date;
	/** All-day event: rendered in the all-day row / month cells, times ignored. */
	allDay?: boolean;
	/** Palette name or any CSS color. Falls back to its source color, then the accent color. */
	color?: PaletteColor | string;
	/** Id of the {@link CalendarSource} this event belongs to. */
	calendarId?: string;
	/** Recurrence rule (structured object or RRULE string). */
	recurrence?: RecurrenceRule | string;
	/** Dates (matching occurrence starts, day-precision) excluded from the recurrence. */
	exdates?: Date[];
	location?: string;
	description?: string;
	/** Overrides calendar/source editability for this event. */
	editable?: boolean;
	/** Id of the {@link Resource} this event occupies (resources view). */
	resourceId?: string;
	/** Arbitrary application data, carried through untouched. */
	meta?: Record<string, unknown>;
}

/**
 * One concrete occurrence of an event within the visible range.
 * Non-recurring events produce exactly one instance equal to the event itself.
 */
export interface EventInstance {
	/** `event.id` for plain events, `event.id::<startISO>` for recurring occurrences. */
	key: string;
	event: CalendarEvent;
	start: Date;
	end: Date;
	allDay: boolean;
	isRecurring: boolean;
	/** Resolved display color (palette name or CSS color). */
	color: string;
}

/** Payload passed to `onEventChange` after a drag/resize/drop edit. */
export interface EventChangeInfo {
	event: CalendarEvent;
	oldStart: Date;
	oldEnd: Date;
	start: Date;
	end: Date;
	allDay: boolean;
	/** Set when the drop moved the event to another resource column. */
	resourceId?: string;
	oldResourceId?: string;
	/** Restores the event to its previous times. */
	revert: () => void;
}

/** Payload passed to `onSelect` after a drag-selection of a time range or day range. */
export interface RangeSelection {
	start: Date;
	end: Date;
	allDay: boolean;
	/** Set when the selection was made inside a resource column. */
	resourceId?: string;
}

/** Business hours definition — used to shade working time in time-grid views. */
export interface BusinessHours {
	/** Days of week that are working days. Default Mon–Fri. */
	days?: Weekday[];
	/** Start hour (0–24, fractions allowed). Default 9. */
	startHour?: number;
	/** End hour (0–24, fractions allowed). Default 17. */
	endHour?: number;
}
