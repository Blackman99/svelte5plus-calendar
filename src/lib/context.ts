/**
 * The shared context object that `Calendar.svelte` provides to its view
 * components. Reactive fields are exposed as getters backed by `$state`.
 */
import { getContext, setContext } from 'svelte';
import type {
	BusinessHours,
	CalendarEvent,
	CalendarSource,
	CalendarView,
	EventChangeInfo,
	EventInstance,
	RangeSelection,
	Weekday
} from './types.js';
import type { CalendarMessages, Formatters } from './i18n.js';

export interface CalendarContext {
	// --- reactive state ---
	readonly date: Date;
	readonly view: CalendarView;
	readonly events: CalendarEvent[];
	readonly sources: CalendarSource[];

	// --- resolved options ---
	readonly locale: string;
	readonly messages: CalendarMessages;
	readonly fmt: Formatters;
	readonly firstDayOfWeek: Weekday;
	readonly weekends: boolean;
	readonly weekNumbers: boolean;
	readonly fixedWeeks: boolean;
	readonly dayMaxEvents: number;
	readonly slotDuration: number;
	readonly snapDuration: number;
	readonly dayStartHour: number;
	readonly dayEndHour: number;
	readonly hourHeight: number;
	readonly scrollToHour: number;
	readonly businessHours: BusinessHours | null;
	readonly editable: boolean;
	readonly selectable: boolean;
	readonly agendaDays: number;
	readonly nowIndicator: boolean;
	/** Built-in quick-create popover enabled. */
	readonly quickCreate: boolean;
	/** Built-in event-details popover enabled. */
	readonly eventDetails: boolean;

	// --- derived for the current view ---
	/** Days visible in the current view (for month: includes leading/trailing). */
	readonly visibleDays: Date[];
	/** Expanded instances intersecting the visible range. */
	readonly instances: EventInstance[];

	// --- navigation ---
	setDate(d: Date): void;
	setView(v: CalendarView): void;
	navigate(dir: 1 | -1): void;
	goToday(): void;

	// --- interactions ---
	canEdit(instance: EventInstance): boolean;
	/**
	 * Applies new times to an event and notifies `onEventChange` (with revert).
	 * For recurring instances this opens the series-edit confirm popover near
	 * `anchor` and, on confirm, detaches the occurrence into a standalone event.
	 */
	applyTimes(instance: EventInstance, start: Date, end: Date, allDay?: boolean, anchor?: DOMRect): void;
	/**
	 * A range was drag-selected. Calls `onSelect` when provided, otherwise opens
	 * the built-in quick-create popover near `anchor`.
	 */
	select(sel: RangeSelection, anchor?: DOMRect): void;
	/**
	 * An event was activated. Calls `onEventClick` when provided, otherwise
	 * opens the built-in details popover.
	 */
	clickEvent(instance: EventInstance, e: MouseEvent | KeyboardEvent): void;
	/**
	 * An empty cell/slot was clicked. Calls `onDateClick` when provided;
	 * otherwise (when `selectable`) opens the quick-create popover.
	 */
	clickDate(date: Date, allDay: boolean, anchor?: DOMRect): void;
	/** Adds a new event to the bound `events` array and fires `onEventCreate`. */
	createEvent(data: Omit<CalendarEvent, 'id'> & { id?: string }): void;
	/** Removes an event from the bound `events` array and fires `onEventDelete`. */
	deleteEvent(instance: EventInstance): void;
	/** Excludes a single occurrence of a recurring series (adds an exdate). */
	deleteOccurrence(instance: EventInstance): void;

	// --- optional user callbacks (read-only views may check presence) ---
	readonly onEventClick?: (instance: EventInstance, e: MouseEvent | KeyboardEvent) => void;
	readonly onDateClick?: (date: Date, allDay: boolean) => void;
	readonly onSelect?: (sel: RangeSelection) => void;
	readonly onEventChange?: (info: EventChangeInfo) => void;

	/** Optional custom event renderer (Svelte snippet). */
	readonly eventContent?: import('svelte').Snippet<[EventInstance]>;
}

const KEY = Symbol('s5c-calendar');

export function setCalendarContext(ctx: CalendarContext): void {
	setContext(KEY, ctx);
}

export function getCalendarContext(): CalendarContext {
	const ctx = getContext<CalendarContext>(KEY);
	if (!ctx) throw new Error('Calendar components must be used inside <Calendar>.');
	return ctx;
}

/** CSS style props for an instance's color (palette name → var, else raw). */
export function colorVars(color: string): string {
	const named = /^[a-z]+$/.test(color);
	const value = named ? `var(--s5c-${color}, var(--s5c-blue))` : color;
	return `--s5c-event-color:${value};`;
}
