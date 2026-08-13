// svelte5plus-calendar — a full-featured calendar component for Svelte 5.
import './theme.css';

export { default as Calendar } from './Calendar.svelte';
export {
	addDays,
	addMinutes,
	addMonths,
	addYears,
	dayKey,
	daysBetween,
	eachDay,
	endOfDay,
	endOfMonth,
	isoWeek,
	isSameDay,
	isSameMonth,
	isToday,
	monthGrid,
	startOfDay,
	startOfMonth,
	startOfWeek
} from './date.js';

export { type CalendarMessages, en, localeFirstDay, messagesForLocale, zhCN } from './i18n.js';

export { parseICS, toICS } from './ics.js';
export { expandEvents, PALETTE } from './instances.js';
export { layoutDay, layoutWeekRow } from './layout.js';
export type { TimedPlacement, WeekRowLayout, WeekSegment } from './layout.js';
export { default as MiniCalendar } from './MiniCalendar.svelte';
export { expandRecurrence, parseRRule, serializeRRule } from './recurrence.js';
export { detachOccurrence, excludeOccurrence, splitSeries } from './series.js';
export type {
	BusinessHours,
	CalendarEvent,
	CalendarSource,
	CalendarView,
	EventChangeInfo,
	EventInstance,
	PaletteColor,
	RangeSelection,
	RecurrenceFreq,
	RecurrenceRule,
	Resource,
	ValidRange,
	Weekday
} from './types.js';
export { fromZoned, toZoned } from './tz.js';
