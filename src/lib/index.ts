// svelte5plus-calendar — a full-featured calendar component for Svelte 5.
import './theme.css';

export { default as Calendar } from './Calendar.svelte';
export { default as MiniCalendar } from './MiniCalendar.svelte';

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
	Weekday
} from './types.js';

export { en, zhCN, messagesForLocale, localeFirstDay, type CalendarMessages } from './i18n.js';
export { expandRecurrence, parseRRule } from './recurrence.js';
export { excludeOccurrence, detachOccurrence } from './series.js';
export { expandEvents, PALETTE } from './instances.js';
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
	isSameDay,
	isSameMonth,
	isToday,
	isoWeek,
	monthGrid,
	startOfDay,
	startOfMonth,
	startOfWeek
} from './date.js';
export { layoutDay, layoutWeekRow } from './layout.js';
export type { TimedPlacement, WeekRowLayout, WeekSegment } from './layout.js';
