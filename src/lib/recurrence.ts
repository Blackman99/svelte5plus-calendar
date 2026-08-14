/**
 * Recurring-event expansion for a practical subset of RFC 5545 RRULE:
 * FREQ (DAILY/WEEKLY/MONTHLY/YEARLY), INTERVAL, COUNT, UNTIL,
 * BYDAY (weekly, and monthly ordinal forms like `2TU` / `-1FR`), BYMONTHDAY.
 */
import type { RecurrenceFreq, RecurrenceRule, Weekday } from './types.js';
import { addDays, addMonths, daysBetween, daysInMonth, isSameDay, MS_PER_DAY, overlaps, startOfDay } from './date.js';

const DAY_CODES: Record<string, Weekday> = {
	SU: 0,
	MO: 1,
	TU: 2,
	WE: 3,
	TH: 4,
	FR: 5,
	SA: 6
};

/** Parses an RRULE string (with or without a leading `RRULE:`) into a {@link RecurrenceRule}. */
export function parseRRule(input: string): RecurrenceRule {
	const text = input.replace(/^RRULE:/i, '').trim();
	const parts: Record<string, string> = {};
	for (const pair of text.split(';')) {
		if (!pair) continue;
		const [k, v] = pair.split('=');
		if (k && v) parts[k.toUpperCase()] = v.toUpperCase();
	}
	const freqMap: Record<string, RecurrenceFreq> = {
		DAILY: 'daily',
		WEEKLY: 'weekly',
		MONTHLY: 'monthly',
		YEARLY: 'yearly'
	};
	const freq = freqMap[parts.FREQ ?? ''];
	if (!freq) throw new Error(`Unsupported RRULE FREQ in "${input}"`);

	const rule: RecurrenceRule = { freq };
	if (parts.INTERVAL) rule.interval = Math.max(1, parseInt(parts.INTERVAL, 10) || 1);
	if (parts.COUNT) rule.count = Math.max(1, parseInt(parts.COUNT, 10) || 1);
	if (parts.UNTIL) {
		// Accept YYYYMMDD or YYYYMMDDTHHMMSS(Z) — interpreted as a local-day bound.
		const m = parts.UNTIL.match(/^(\d{4})(\d{2})(\d{2})/);
		if (m) rule.until = new Date(+m[1], +m[2] - 1, +m[3], 23, 59, 59);
	}
	if (parts.BYDAY) {
		const tokens = parts.BYDAY.split(',');
		const ordinal = tokens.length === 1 && /^-?\d/.test(tokens[0]);
		if (ordinal) {
			const m = tokens[0].match(/^(-?\d)([A-Z]{2})$/);
			if (m && DAY_CODES[m[2]] !== undefined) {
				const ord = parseInt(m[1], 10);
				if (ord === -1 || (ord >= 1 && ord <= 5)) {
					rule.byNthDay = { ordinal: ord as 1 | 2 | 3 | 4 | 5 | -1, day: DAY_CODES[m[2]] };
				}
			}
		}
		else {
			const days = tokens
				.map((t) => DAY_CODES[t.replace(/^-?\d+/, '')])
				.filter((d): d is Weekday => d !== undefined);
			if (days.length) rule.byDay = days;
		}
	}
	if (parts.BYMONTHDAY) {
		const days = parts.BYMONTHDAY.split(',')
			.map((s) => parseInt(s, 10))
			.filter((n) => n >= 1 && n <= 31);
		if (days.length) rule.byMonthDay = days;
	}
	return rule;
}

export function normalizeRule(rule: RecurrenceRule | string): RecurrenceRule {
	return typeof rule === 'string' ? parseRRule(rule) : rule;
}

const DAY_NAMES: string[] = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

/** Serializes a {@link RecurrenceRule} back into an RRULE string (RFC 5545 subset). */
export function serializeRRule(rule: RecurrenceRule | string): string {
	const r = normalizeRule(rule);
	const parts = [`FREQ=${r.freq.toUpperCase()}`];
	if (r.interval && r.interval > 1) parts.push(`INTERVAL=${r.interval}`);
	if (r.count) parts.push(`COUNT=${r.count}`);
	if (r.until) {
		const u = r.until;
		const pad = (n: number) => String(n).padStart(2, '0');
		parts.push(`UNTIL=${u.getFullYear()}${pad(u.getMonth() + 1)}${pad(u.getDate())}`);
	}
	if (r.byNthDay) parts.push(`BYDAY=${r.byNthDay.ordinal}${DAY_NAMES[r.byNthDay.day]}`);
	else if (r.byDay?.length) parts.push(`BYDAY=${r.byDay.map((d) => DAY_NAMES[d]).join(',')}`);
	if (r.byMonthDay?.length) parts.push(`BYMONTHDAY=${r.byMonthDay.join(',')}`);
	return parts.join(';');
}

/** Date of the Nth weekday of a month, or `null` when it does not exist (e.g. 5th Friday). */
function nthWeekdayOfMonth(year: number, month: number, ordinal: number, day: Weekday): Date | null {
	if (ordinal === -1) {
		const last = new Date(year, month + 1, 0);
		const diff = (last.getDay() - day + 7) % 7;
		return new Date(year, month, last.getDate() - diff);
	}
	const first = new Date(year, month, 1);
	const offset = (day - first.getDay() + 7) % 7;
	const date = 1 + offset + (ordinal - 1) * 7;
	if (date > daysInMonth(first)) return null;
	return new Date(year, month, date);
}

/** Hard cap on generated occurrences per event per expansion, as a safety valve. */
const MAX_OCCURRENCES = 1000;

/**
 * Expands a recurrence into concrete occurrence start dates that intersect
 * `[rangeStart, rangeEnd)`. `start` is the first occurrence (DTSTART) and its
 * wall-clock time is preserved on every occurrence. `durationMs` is used only
 * to decide range intersection for occurrences that begin before the range.
 */
export function expandRecurrence(
	start: Date,
	durationMs: number,
	rule: RecurrenceRule | string,
	rangeStart: Date,
	rangeEnd: Date,
	exdates?: Date[]
): Date[] {
	const r = normalizeRule(rule);
	const interval = Math.max(1, r.interval ?? 1);
	const results: Date[] = [];
	const hardEnd = r.until ? Math.min(r.until.getTime(), rangeEnd.getTime()) : rangeEnd.getTime();
	let produced = 0; // counts occurrences from DTSTART, needed for COUNT

	const excluded = (d: Date) => exdates?.some((x) => isSameDay(x, d)) ?? false;

	const push = (occ: Date): boolean => {
		// Returns false when expansion should stop entirely.
		if (r.until && occ.getTime() > r.until.getTime()) return false;
		produced += 1;
		if (r.count && produced > r.count) return false;
		if (
			occ.getTime() < hardEnd
			&& overlaps(occ, new Date(occ.getTime() + Math.max(durationMs, 1)), rangeStart, rangeEnd)
			&& !excluded(occ)
		) {
			results.push(occ);
		}
		return results.length < MAX_OCCURRENCES && occ.getTime() < rangeEnd.getTime();
	};

	// Fast-forward past occurrences that end before the visible range. This is
	// what keeps a "every day since 2000" series from iterating ~10k times per
	// render. Only done when COUNT is absent: COUNT must count occurrences from
	// DTSTART, and such series are bounded (≤ MAX_OCCURRENCES) so they stay
	// cheap. Jumps are conservative (rounded down, with margin) and `push`
	// still filters, so no occurrence is ever skipped.
	const durationDays = Math.ceil(durationMs / MS_PER_DAY);
	const fastForward = !r.count;

	if (r.freq === 'daily') {
		let i = 0;
		if (fastForward) {
			const firstRelevantDay = daysBetween(start, rangeStart) - durationDays;
			i = Math.max(0, Math.floor(firstRelevantDay / interval) - 1) * interval;
		}
		for (; ; i += interval) {
			const occ = addDays(start, i);
			if (!push(occ)) break;
		}
	}
	else if (r.freq === 'weekly') {
		const byDay = r.byDay && r.byDay.length ? [...r.byDay] : [start.getDay() as Weekday];
		// Iterate week by week from the week of DTSTART; within a week, emit in chronological order.
		const weekAnchor = startOfDay(start);
		// Days of this week that match, ordered from the anchor's weekday forward.
		const offsets = byDay
			.map((d) => (d - start.getDay() + 7) % 7)
			.sort((a, b) => a - b);
		let w = 0;
		if (fastForward) {
			const firstRelevantDay = daysBetween(weekAnchor, rangeStart) - durationDays;
			const firstRelevantWeek = Math.floor(firstRelevantDay / 7);
			w = Math.max(0, Math.floor(firstRelevantWeek / interval) - 1) * interval;
		}
		outer: for (; ; w += interval) {
			const base = addDays(weekAnchor, w * 7);
			for (const off of offsets) {
				const occ = addDays(start, w * 7 + off);
				if (occ.getTime() < start.getTime()) continue;
				if (!push(occ)) break outer;
			}
			if (base.getTime() > hardEnd + 7 * MS_PER_DAY) break;
		}
	}
	else if (r.freq === 'monthly') {
		let m = 0;
		if (fastForward) {
			const monthsBetween = (rangeStart.getFullYear() - start.getFullYear()) * 12
				+ (rangeStart.getMonth() - start.getMonth());
			const firstRelevantMonth = monthsBetween - Math.ceil(durationDays / 28);
			m = Math.max(0, Math.floor(firstRelevantMonth / interval) - 1) * interval;
		}
		outer: for (; ; m += interval) {
			const anchor = addMonths(start, m);
			const year = anchor.getFullYear();
			const month = anchor.getMonth();
			let occDates: Date[] = [];
			if (r.byNthDay) {
				const d = nthWeekdayOfMonth(year, month, r.byNthDay.ordinal, r.byNthDay.day);
				if (d) occDates = [d];
			}
			else if (r.byMonthDay && r.byMonthDay.length) {
				occDates = r.byMonthDay
					.filter((day) => day <= daysInMonth(anchor))
					.map((day) => new Date(year, month, day))
					.sort((a, b) => a.getTime() - b.getTime());
			}
			else {
				// Same day-of-month as DTSTART; skip months where it does not exist.
				if (start.getDate() <= daysInMonth(anchor)) {
					occDates = [new Date(year, month, start.getDate())];
				}
			}
			for (const d of occDates) {
				const occ = new Date(
					d.getFullYear(),
					d.getMonth(),
					d.getDate(),
					start.getHours(),
					start.getMinutes()
				);
				if (occ.getTime() < start.getTime()) continue;
				if (!push(occ)) break outer;
			}
			if (new Date(year, month, 1).getTime() > hardEnd) break;
		}
	}
	else {
		// yearly
		let y = 0;
		if (fastForward) {
			const yearsBetween = rangeStart.getFullYear() - start.getFullYear();
			const firstRelevantYear = yearsBetween - Math.ceil(durationDays / 365);
			y = Math.max(0, Math.floor(firstRelevantYear / interval) - 1) * interval;
		}
		for (; ; y += interval) {
			const occ = addMonths(start, y * 12);
			// Skip Feb-29 in non-leap years rather than clamping.
			if (occ.getDate() !== start.getDate()) continue;
			if (!push(occ)) break;
			if (occ.getTime() > hardEnd) break;
		}
	}

	return results;
}
