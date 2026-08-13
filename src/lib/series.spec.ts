import { describe, expect, it } from 'vitest';
import { detachOccurrence, excludeOccurrence } from './series.js';
import type { CalendarEvent } from './types.js';

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
