import { describe, expect, it } from 'vitest';
import { expandRecurrence, parseRRule } from './recurrence.js';
import { dayKey } from './date.js';

const HOUR = 3_600_000;

function expand(
	start: Date,
	rule: Parameters<typeof expandRecurrence>[2],
	rangeStart: Date,
	rangeEnd: Date,
	exdates?: Date[]
) {
	return expandRecurrence(start, HOUR, rule, rangeStart, rangeEnd, exdates).map(dayKey);
}

describe('parseRRule', () => {
	it('parses freq, interval, count, until', () => {
		expect(parseRRule('FREQ=DAILY;INTERVAL=2;COUNT=5')).toEqual({
			freq: 'daily',
			interval: 2,
			count: 5
		});
		const r = parseRRule('RRULE:FREQ=WEEKLY;UNTIL=20260901');
		expect(r.freq).toBe('weekly');
		expect(dayKey(r.until!)).toBe('2026-09-01');
	});

	it('parses BYDAY lists and ordinal BYDAY', () => {
		expect(parseRRule('FREQ=WEEKLY;BYDAY=MO,WE,FR').byDay).toEqual([1, 3, 5]);
		expect(parseRRule('FREQ=MONTHLY;BYDAY=2TU').byNthDay).toEqual({ ordinal: 2, day: 2 });
		expect(parseRRule('FREQ=MONTHLY;BYDAY=-1FR').byNthDay).toEqual({ ordinal: -1, day: 5 });
	});

	it('parses BYMONTHDAY and rejects unknown FREQ', () => {
		expect(parseRRule('FREQ=MONTHLY;BYMONTHDAY=1,15').byMonthDay).toEqual([1, 15]);
		expect(() => parseRRule('FREQ=HOURLY')).toThrow();
	});
});

describe('expandRecurrence', () => {
	const start = new Date(2026, 7, 3, 9, 0); // Mon Aug 3 2026, 09:00
	const rangeStart = new Date(2026, 7, 1);
	const rangeEnd = new Date(2026, 8, 1);

	it('daily with interval', () => {
		const days = expand(start, 'FREQ=DAILY;INTERVAL=3', rangeStart, new Date(2026, 7, 13));
		expect(days).toEqual(['2026-08-03', '2026-08-06', '2026-08-09', '2026-08-12']);
	});

	it('daily with COUNT stops after N occurrences', () => {
		const days = expand(start, { freq: 'daily', count: 4 }, rangeStart, rangeEnd);
		expect(days).toEqual(['2026-08-03', '2026-08-04', '2026-08-05', '2026-08-06']);
	});

	it('COUNT counts from DTSTART even when the range starts later', () => {
		const days = expand(start, { freq: 'daily', count: 4 }, new Date(2026, 7, 5), rangeEnd);
		expect(days).toEqual(['2026-08-05', '2026-08-06']);
	});

	it('daily with UNTIL', () => {
		const days = expand(
			start,
			{ freq: 'daily', until: new Date(2026, 7, 6, 23, 59) },
			rangeStart,
			rangeEnd
		);
		expect(days).toEqual(['2026-08-03', '2026-08-04', '2026-08-05', '2026-08-06']);
	});

	it('weekly on multiple weekdays', () => {
		const days = expand(start, 'FREQ=WEEKLY;BYDAY=MO,WE,FR', rangeStart, new Date(2026, 7, 15));
		expect(days).toEqual([
			'2026-08-03',
			'2026-08-05',
			'2026-08-07',
			'2026-08-10',
			'2026-08-12',
			'2026-08-14'
		]);
	});

	it('weekly with interval 2 keeps the DTSTART week phase', () => {
		const days = expand(start, 'FREQ=WEEKLY;INTERVAL=2', rangeStart, rangeEnd);
		expect(days).toEqual(['2026-08-03', '2026-08-17', '2026-08-31']);
	});

	it('monthly on the same day of month, skipping short months', () => {
		const jan31 = new Date(2026, 0, 31, 12, 0);
		const days = expand(jan31, { freq: 'monthly' }, new Date(2026, 0, 1), new Date(2026, 5, 1));
		expect(days).toEqual(['2026-01-31', '2026-03-31', '2026-05-31']); // no Feb/Apr 31
	});

	it('monthly on the 2nd Tuesday', () => {
		const first = new Date(2026, 7, 11, 9); // 2nd Tue of Aug 2026
		const days = expand(first, 'FREQ=MONTHLY;BYDAY=2TU', rangeStart, new Date(2026, 10, 1));
		expect(days).toEqual(['2026-08-11', '2026-09-08', '2026-10-13']);
	});

	it('monthly on the last Friday', () => {
		const first = new Date(2026, 7, 28, 9); // last Fri of Aug 2026
		const days = expand(first, 'FREQ=MONTHLY;BYDAY=-1FR', rangeStart, new Date(2026, 10, 1));
		expect(days).toEqual(['2026-08-28', '2026-09-25', '2026-10-30']);
	});

	it('yearly, skipping Feb 29 in non-leap years', () => {
		const leap = new Date(2024, 1, 29, 10);
		const days = expand(leap, { freq: 'yearly' }, new Date(2024, 0, 1), new Date(2029, 0, 1));
		expect(days).toEqual(['2024-02-29', '2028-02-29']);
	});

	it('honours exdates', () => {
		const days = expand(start, { freq: 'daily', count: 5 }, rangeStart, rangeEnd, [
			new Date(2026, 7, 4),
			new Date(2026, 7, 6)
		]);
		expect(days).toEqual(['2026-08-03', '2026-08-05', '2026-08-07']);
	});

	it('includes occurrences that started before the range but overlap it', () => {
		const evening = new Date(2026, 7, 3, 23, 30);
		const occurrences = expandRecurrence(
			evening,
			2 * HOUR, // 23:30 – 01:30
			{ freq: 'daily', count: 1 },
			new Date(2026, 7, 4),
			new Date(2026, 7, 5)
		);
		expect(occurrences.map(dayKey)).toEqual(['2026-08-03']);
	});

	it('preserves the wall-clock start time on every occurrence', () => {
		const occurrences = expandRecurrence(
			start,
			HOUR,
			'FREQ=WEEKLY',
			rangeStart,
			rangeEnd
		);
		for (const occ of occurrences) {
			expect(occ.getHours()).toBe(9);
			expect(occ.getMinutes()).toBe(0);
		}
	});
});
