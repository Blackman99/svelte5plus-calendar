import type { CalendarEvent, RecurrenceRule } from './types.js';
import { describe, expect, it } from 'vitest';
import { dayKey } from './date.js';
import { expandRecurrence } from './recurrence.js';
import { detachOccurrence, excludeOccurrence, splitSeries } from './series.js';

const series: CalendarEvent = {
	id: 'standup',
	title: 'Standup',
	start: new Date(2026, 7, 3, 9, 30),
	end: new Date(2026, 7, 3, 9, 45),
	recurrence: 'FREQ=WEEKLY;BYDAY=MO,WE,FR',
	calendarId: 'work',
	location: 'Room 3',
	exdates: [new Date(2026, 7, 5)]
};

describe('excludeOccurrence', () => {
	it('appends an exdate without mutating the original', () => {
		const occurrence = new Date(2026, 7, 10, 9, 30);
		const updated = excludeOccurrence(series, occurrence);
		expect(updated.exdates).toHaveLength(2);
		expect(updated.exdates![1]).toBe(occurrence);
		expect(series.exdates).toHaveLength(1);
	});

	it('creates the exdates array when absent', () => {
		const { exdates: _x, ...noExdates } = series;
		const updated = excludeOccurrence(noExdates, new Date(2026, 7, 10));
		expect(updated.exdates).toHaveLength(1);
	});
});

describe('detachOccurrence', () => {
	const occurrence = new Date(2026, 7, 10, 9, 30);
	const changes = { start: new Date(2026, 7, 10, 14, 0), end: new Date(2026, 7, 10, 14, 15) };

	it('excludes the occurrence from the series and creates a standalone copy', () => {
		const { series: updated, detached } = detachOccurrence(series, occurrence, changes);
		expect(updated.exdates).toHaveLength(2);
		expect(updated.recurrence).toBe(series.recurrence);
		expect(detached.recurrence).toBeUndefined();
		expect(detached.exdates).toBeUndefined();
		expect(detached.start).toBe(changes.start);
		expect(detached.end).toBe(changes.end);
	});

	it('inherits the series properties and derives a stable id', () => {
		const { detached } = detachOccurrence(series, occurrence, changes);
		expect(detached.calendarId).toBe('work');
		expect(detached.location).toBe('Room 3');
		expect(detached.id).toBe(`standup::${occurrence.getTime()}`);
	});

	it('accepts an explicit id and allDay override', () => {
		const { detached } = detachOccurrence(series, occurrence, { ...changes, allDay: true }, 'x1');
		expect(detached.id).toBe('x1');
		expect(detached.allDay).toBe(true);
	});
});

describe('splitSeries ("this and following")', () => {
	const occurrence = new Date(2026, 7, 12, 9, 30); // Wed of week 2
	const changes = { start: new Date(2026, 7, 12, 14, 0), end: new Date(2026, 7, 12, 14, 15) };

	it('truncates the original before the occurrence and starts a new series', () => {
		const { truncated, created } = splitSeries(series, occurrence, changes);
		expect(truncated).not.toBeNull();
		const tRule = truncated!.recurrence as RecurrenceRule;
		expect(tRule.until!.getTime()).toBe(occurrence.getTime() - 1);
		expect(created.start).toBe(changes.start);
		// Old series still yields the occurrences before the split point only.
		const days = expandRecurrence(
			truncated!.start,
			900000,
			tRule,
			new Date(2026, 7, 1),
			new Date(2026, 8, 1)
		).map(dayKey);
		expect(days).toEqual(['2026-08-03', '2026-08-05', '2026-08-07', '2026-08-10']);
	});

	it('keeps the weekly byDay phase when only the time changed', () => {
		const { created } = splitSeries(series, occurrence, changes);
		expect((created.recurrence as RecurrenceRule).byDay).toEqual([1, 3, 5]);
	});

	it('shifts weekly byDay when the drag changed the weekday', () => {
		const moved = { start: new Date(2026, 7, 13, 9, 30), end: new Date(2026, 7, 13, 9, 45) }; // Wed→Thu
		const { created } = splitSeries(series, occurrence, moved);
		expect((created.recurrence as RecurrenceRule).byDay).toEqual([2, 4, 6]);
	});

	it('adjusts COUNT by the number of generated occurrences before the split', () => {
		const counted: CalendarEvent = {
			...series,
			exdates: undefined,
			recurrence: { freq: 'weekly', byDay: [1, 3, 5], count: 10 }
		};
		const { truncated, created } = splitSeries(counted, occurrence, changes);
		expect((truncated!.recurrence as RecurrenceRule).count).toBe(4); // Mon3, Wed5, Fri7, Mon10
		expect((created.recurrence as RecurrenceRule).count).toBe(6);
	});

	it('returns truncated=null when splitting at the first occurrence', () => {
		const first = new Date(2026, 7, 3, 9, 30);
		const { truncated, created } = splitSeries(series, first, changes);
		expect(truncated).toBeNull();
		expect(created.start).toBe(changes.start);
	});

	it('partitions exdates between the two series', () => {
		const withEx: CalendarEvent = {
			...series,
			exdates: [new Date(2026, 7, 5), new Date(2026, 7, 17)]
		};
		const { truncated, created } = splitSeries(withEx, occurrence, changes);
		expect(truncated!.exdates!.map(dayKey)).toEqual(['2026-08-05']);
		expect(created.exdates!.map(dayKey)).toEqual(['2026-08-17']);
	});
});
