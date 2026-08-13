import { describe, expect, it } from 'vitest';
import { parseICS, toICS } from './ics.js';
import { dayKey } from './date.js';
import type { CalendarEvent, RecurrenceRule } from './types.js';

const events: CalendarEvent[] = [
	{
		id: 'e1',
		title: 'Standup; daily, kind of',
		start: new Date(2026, 7, 3, 9, 30),
		end: new Date(2026, 7, 3, 9, 45),
		recurrence: 'FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=10',
		exdates: [new Date(2026, 7, 5, 9, 30)],
		location: 'Room 3',
		description: 'Line one\nLine two'
	},
	{
		id: 'e2',
		title: 'Conference',
		start: new Date(2026, 7, 17),
		end: new Date(2026, 7, 20),
		allDay: true
	}
];

describe('toICS / parseICS round trip', () => {
	const ics = toICS(events);

	it('emits a valid VCALENDAR wrapper', () => {
		expect(ics.startsWith('BEGIN:VCALENDAR')).toBe(true);
		expect(ics).toContain('END:VCALENDAR');
		expect(ics).toContain('BEGIN:VEVENT');
	});

	it('round-trips timed events with recurrence, exdates and escaping', () => {
		const [e1] = parseICS(ics);
		expect(e1.id).toBe('e1');
		expect(e1.title).toBe('Standup; daily, kind of');
		expect(e1.start.getTime()).toBe(events[0].start.getTime());
		expect(e1.end.getTime()).toBe(events[0].end.getTime());
		const rule = e1.recurrence as RecurrenceRule;
		expect(rule.freq).toBe('weekly');
		expect(rule.byDay).toEqual([1, 3, 5]);
		expect(rule.count).toBe(10);
		expect(e1.exdates!.map(dayKey)).toEqual(['2026-08-05']);
		expect(e1.location).toBe('Room 3');
		expect(e1.description).toBe('Line one\nLine two');
	});

	it('round-trips all-day events with DATE values', () => {
		const [, e2] = parseICS(ics);
		expect(e2.allDay).toBe(true);
		expect(dayKey(e2.start)).toBe('2026-08-17');
		expect(dayKey(e2.end)).toBe('2026-08-20');
	});

	it('parses UTC datetimes and folded lines', () => {
		const external = [
			'BEGIN:VCALENDAR',
			'VERSION:2.0',
			'BEGIN:VEVENT',
			'UID:x',
			'DTSTART:20260813T060000Z',
			'SUMMARY:A very long summary that will definitely exceed the seventy-f',
			' our octet line folding limit of the iCalendar spec',
			'END:VEVENT',
			'END:VCALENDAR'
		].join('\r\n');
		const [ev] = parseICS(external);
		expect(ev.start.getTime()).toBe(Date.UTC(2026, 7, 13, 6, 0, 0));
		expect(ev.title).toContain('seventy-four octet line folding');
		expect(ev.end.getTime() - ev.start.getTime()).toBe(3_600_000); // default 1h
	});

	it('skips events without DTSTART and tolerates unknown rules', () => {
		const weird = [
			'BEGIN:VCALENDAR',
			'BEGIN:VEVENT',
			'SUMMARY:No start',
			'END:VEVENT',
			'BEGIN:VEVENT',
			'DTSTART:20260813T060000',
			'SUMMARY:Hourly thing',
			'RRULE:FREQ=HOURLY',
			'END:VEVENT',
			'END:VCALENDAR'
		].join('\n');
		const parsed = parseICS(weird);
		expect(parsed).toHaveLength(1);
		expect(parsed[0].recurrence).toBeUndefined();
	});
});
