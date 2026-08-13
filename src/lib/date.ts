/**
 * Zero-dependency date helpers. All functions operate in the local time zone
 * and never mutate their arguments.
 */
import type { Weekday } from './types.js';

export const MS_PER_MINUTE = 60_000;
export const MS_PER_DAY = 86_400_000;

/** Midnight of the given date. */
export function startOfDay(d: Date): Date {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Midnight of the next day. */
export function endOfDay(d: Date): Date {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
}

export function addDays(d: Date, n: number): Date {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, d.getHours(), d.getMinutes());
}

export function addMinutes(d: Date, n: number): Date {
	return new Date(d.getTime() + n * MS_PER_MINUTE);
}

/** Adds months, clamping the day-of-month (Jan 31 + 1 month → Feb 28/29). */
export function addMonths(d: Date, n: number): Date {
	const day = d.getDate();
	const target = new Date(d.getFullYear(), d.getMonth() + n, 1, d.getHours(), d.getMinutes());
	const daysInTarget = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
	target.setDate(Math.min(day, daysInTarget));
	return target;
}

export function addYears(d: Date, n: number): Date {
	return addMonths(d, n * 12);
}

export function startOfMonth(d: Date): Date {
	return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d: Date): Date {
	return new Date(d.getFullYear(), d.getMonth() + 1, 1);
}

export function daysInMonth(d: Date): number {
	return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

/** Midnight of the first day of the week containing `d`. */
export function startOfWeek(d: Date, firstDayOfWeek: Weekday = 0): Date {
	const day = startOfDay(d);
	const diff = (day.getDay() - firstDayOfWeek + 7) % 7;
	return addDays(day, -diff);
}

export function isSameDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear()
		&& a.getMonth() === b.getMonth()
		&& a.getDate() === b.getDate()
	);
}

export function isSameMonth(a: Date, b: Date): boolean {
	return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function isToday(d: Date): boolean {
	return isSameDay(d, new Date());
}

/** Whole calendar days from `a` to `b` (midnight-to-midnight, DST safe). */
export function daysBetween(a: Date, b: Date): number {
	const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
	const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
	return Math.round((utcB - utcA) / MS_PER_DAY);
}

/** Array of the midnights of each day in `[start, end)` — at least one day. */
export function eachDay(start: Date, end: Date): Date[] {
	const days: Date[] = [];
	let cur = startOfDay(start);
	const stop = end.getTime();
	while (cur.getTime() < stop || days.length === 0) {
		days.push(cur);
		cur = addDays(cur, 1);
	}
	return days;
}

/** ISO-8601 week number (weeks start Monday; week 1 contains the first Thursday). */
export function isoWeek(d: Date): number {
	const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
	const day = date.getUTCDay() || 7;
	date.setUTCDate(date.getUTCDate() + 4 - day);
	const yearStart = Date.UTC(date.getUTCFullYear(), 0, 1);
	return Math.ceil(((date.getTime() - yearStart) / MS_PER_DAY + 1) / 7);
}

/** Minutes since local midnight. */
export function minutesOfDay(d: Date): number {
	return d.getHours() * 60 + d.getMinutes();
}

/** New date on the same day with the given minutes since midnight. */
export function withMinutesOfDay(d: Date, minutes: number): Date {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, minutes);
}

/** Moves a date onto another calendar day, keeping its wall-clock time. */
export function moveToDay(d: Date, day: Date): Date {
	return new Date(day.getFullYear(), day.getMonth(), day.getDate(), d.getHours(), d.getMinutes());
}

/** Half-open interval overlap test: `[aStart, aEnd)` vs `[bStart, bEnd)`. */
export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
	return aStart.getTime() < bEnd.getTime() && bStart.getTime() < aEnd.getTime();
}

export function minDate(a: Date, b: Date): Date {
	return a.getTime() <= b.getTime() ? a : b;
}

export function maxDate(a: Date, b: Date): Date {
	return a.getTime() >= b.getTime() ? a : b;
}

export function clampDate(d: Date, min: Date, max: Date): Date {
	return maxDate(min, minDate(max, d));
}

/** Stable `YYYY-MM-DD` key for a day (local time). */
export function dayKey(d: Date): string {
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${d.getFullYear()}-${m}-${day}`;
}

/**
 * The 7-column grid of a month view: all midnights from the first day of the
 * week containing the 1st, to the end of the week containing the last day.
 * Returns weeks (each an array of 7 days). `fixedWeeks` pads to 6 rows.
 */
export function monthGrid(d: Date, firstDayOfWeek: Weekday = 0, fixedWeeks = false): Date[][] {
	const first = startOfWeek(startOfMonth(d), firstDayOfWeek);
	const weeks: Date[][] = [];
	let cursor = first;
	const monthEnd = endOfMonth(d);
	// eslint-disable-next-line no-unmodified-loop-condition -- `fixedWeeks` is a config flag; `weeks.length` advances
	while (cursor.getTime() < monthEnd.getTime() || (fixedWeeks && weeks.length < 6)) {
		const week: Date[] = [];
		for (let i = 0; i < 7; i++) {
			week.push(cursor);
			cursor = addDays(cursor, 1);
		}
		weeks.push(week);
		if (weeks.length >= 6) break;
	}
	return weeks;
}

/** Rounds a minute count to the nearest multiple of `step`. */
export function roundToStep(minutes: number, step: number): number {
	return Math.round(minutes / step) * step;
}

/** Floors a minute count to a multiple of `step`. */
export function floorToStep(minutes: number, step: number): number {
	return Math.floor(minutes / step) * step;
}
