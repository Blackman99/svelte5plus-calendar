import { describe, expect, it } from 'vitest';
import {
	addDays,
	addMonths,
	applyDateInputValue,
	applyTimeInputValue,
	dayKey,
	daysBetween,
	eachDay,
	endOfDay,
	isoWeek,
	isSameDay,
	minutesOfDay,
	monthGrid,
	moveToDay,
	overlaps,
	roundToStep,
	startOfDay,
	startOfWeek,
	toDateInputValue,
	toTimeInputValue,
	withMinutesOfDay
} from './date.js';

describe('date utils', () => {
	it('startOfDay / endOfDay', () => {
		const d = new Date(2026, 7, 13, 15, 30);
		expect(startOfDay(d).getHours()).toBe(0);
		expect(endOfDay(d).getTime()).toBe(new Date(2026, 7, 14).getTime());
	});

	it('addDays crosses month and year boundaries', () => {
		expect(dayKey(addDays(new Date(2026, 11, 31), 1))).toBe('2027-01-01');
		expect(dayKey(addDays(new Date(2026, 0, 1), -1))).toBe('2025-12-31');
	});

	it('addMonths clamps the day of month', () => {
		expect(dayKey(addMonths(new Date(2026, 0, 31), 1))).toBe('2026-02-28');
		expect(dayKey(addMonths(new Date(2024, 0, 31), 1))).toBe('2024-02-29'); // leap year
		expect(dayKey(addMonths(new Date(2026, 2, 31), 1))).toBe('2026-04-30');
	});

	it('startOfWeek honours the first day of week', () => {
		const thu = new Date(2026, 7, 13); // Thursday
		expect(dayKey(startOfWeek(thu, 0))).toBe('2026-08-09'); // Sunday
		expect(dayKey(startOfWeek(thu, 1))).toBe('2026-08-10'); // Monday
		const mon = new Date(2026, 7, 10);
		expect(dayKey(startOfWeek(mon, 1))).toBe('2026-08-10'); // already Monday
	});

	it('daysBetween is midnight-based', () => {
		expect(daysBetween(new Date(2026, 7, 13, 23), new Date(2026, 7, 14, 1))).toBe(1);
		expect(daysBetween(new Date(2026, 7, 14), new Date(2026, 7, 13))).toBe(-1);
	});

	it('eachDay yields every midnight in the half-open interval', () => {
		const days = eachDay(new Date(2026, 7, 13, 10), new Date(2026, 7, 16));
		expect(days.map(dayKey)).toEqual(['2026-08-13', '2026-08-14', '2026-08-15']);
	});

	it('isoWeek matches known values', () => {
		expect(isoWeek(new Date(2026, 0, 1))).toBe(1); // Thu 2026-01-01
		expect(isoWeek(new Date(2025, 11, 29))).toBe(1); // Mon of week containing 2026-01-01
		expect(isoWeek(new Date(2026, 7, 13))).toBe(33);
		expect(isoWeek(new Date(2021, 0, 1))).toBe(53); // 2021-01-01 was ISO week 53 of 2020
	});

	it('monthGrid covers the whole month in full weeks', () => {
		const weeks = monthGrid(new Date(2026, 7, 1), 0); // Aug 2026, Sunday start
		expect(weeks.length).toBe(6); // Aug 2026 spans 6 Sunday-start weeks
		expect(dayKey(weeks[0][0])).toBe('2026-07-26');
		expect(dayKey(weeks[5][6])).toBe('2026-09-05');
		const feb2026 = monthGrid(new Date(2026, 1, 1), 0); // Feb 2026 starts Sunday, 28 days
		expect(feb2026.length).toBe(4);
		const fixed = monthGrid(new Date(2026, 1, 1), 0, true);
		expect(fixed.length).toBe(6);
	});

	it('minute helpers', () => {
		const d = new Date(2026, 7, 13, 9, 45);
		expect(minutesOfDay(d)).toBe(585);
		expect(withMinutesOfDay(d, 60).getHours()).toBe(1);
		expect(roundToStep(52, 15)).toBe(45);
		expect(roundToStep(53, 15)).toBe(60);
	});

	it('moveToDay keeps wall-clock time', () => {
		const moved = moveToDay(new Date(2026, 7, 13, 9, 30), new Date(2026, 8, 1));
		expect(moved.getHours()).toBe(9);
		expect(dayKey(moved)).toBe('2026-09-01');
	});

	it('overlaps uses half-open intervals', () => {
		const a = new Date(2026, 7, 13, 9);
		const b = new Date(2026, 7, 13, 10);
		const c = new Date(2026, 7, 13, 11);
		expect(overlaps(a, b, b, c)).toBe(false); // touching, no overlap
		expect(overlaps(a, c, b, c)).toBe(true);
	});

	it('isSameDay', () => {
		expect(isSameDay(new Date(2026, 7, 13, 0), new Date(2026, 7, 13, 23, 59))).toBe(true);
		expect(isSameDay(new Date(2026, 7, 13), new Date(2026, 7, 14))).toBe(false);
	});

	it('toTimeInputValue is 24-hour and zero-padded', () => {
		expect(toTimeInputValue(new Date(2026, 7, 13, 9, 7))).toBe('09:07');
		expect(toTimeInputValue(new Date(2026, 7, 13, 0, 0))).toBe('00:00');
		expect(toTimeInputValue(new Date(2026, 7, 13, 23, 45))).toBe('23:45');
	});

	it('toDateInputValue is local and zero-padded', () => {
		expect(toDateInputValue(new Date(2026, 7, 3))).toBe('2026-08-03');
		expect(toDateInputValue(new Date(2026, 0, 13))).toBe('2026-01-13');
	});

	it('applyTimeInputValue applies onto the date, keeping it', () => {
		const d = new Date(2026, 7, 13, 14, 0);
		const out = applyTimeInputValue(d, '09:07');
		expect(out).toEqual(new Date(2026, 7, 13, 9, 7));
		expect(applyTimeInputValue(d, 'bad')).toBeNull();
		expect(applyTimeInputValue(d, '24:00')).toBeNull();
	});

	it('applyDateInputValue applies onto the wall-clock, keeping it', () => {
		const d = new Date(2026, 7, 13, 9, 30);
		const out = applyDateInputValue(d, '2026-01-02');
		expect(out).toEqual(new Date(2026, 0, 2, 9, 30));
		expect(applyDateInputValue(d, '2026-13-01')).toBeNull();
		expect(applyDateInputValue(d, '2026-08-32')).toBeNull();
	});

	it('input value conversions round-trip', () => {
		const d = new Date(2026, 7, 13, 9, 7);
		expect(applyTimeInputValue(d, toTimeInputValue(d))).toEqual(d);
		expect(applyDateInputValue(d, toDateInputValue(d))).toEqual(d);
	});
});
