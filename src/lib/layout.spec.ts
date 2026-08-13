import type { CalendarEvent, EventInstance } from './types.js';
import { describe, expect, it } from 'vitest';
import { addDays } from './date.js';
import { expandEvents } from './instances.js';
import { layoutDay, layoutWeekRow } from './layout.js';

let seq = 0;
function inst(start: Date, end: Date, allDay = false, title = `e${++seq}`): EventInstance {
	return {
		key: title,
		event: { id: title, title, start, end, allDay },
		start,
		end,
		allDay,
		isRecurring: false,
		color: 'blue'
	};
}

const day = new Date(2026, 7, 13);
const at = (h: number, m = 0) => new Date(2026, 7, 13, h, m);

describe('layoutDay (time-grid column packing)', () => {
	it('non-overlapping events all get full width', () => {
		const placements = layoutDay([inst(at(9), at(10)), inst(at(10), at(11))], day);
		expect(placements.every((p) => p.cols === 1 && p.col === 0)).toBe(true);
	});

	it('two overlapping events split into two columns', () => {
		const placements = layoutDay([inst(at(9), at(11)), inst(at(10), at(12))], day);
		expect(placements.map((p) => p.cols)).toEqual([2, 2]);
		expect(new Set(placements.map((p) => p.col))).toEqual(new Set([0, 1]));
	});

	it('chain overlap forms one cluster; reuses freed columns', () => {
		// A 9-11, B 9-10, C 10-11 → A|B then C fits under B in column 1
		const [a, b, c] = [inst(at(9), at(11), false, 'A'), inst(at(9), at(10), false, 'B'), inst(at(10), at(11), false, 'C')];
		const placements = layoutDay([a, b, c], day);
		const byTitle = Object.fromEntries(placements.map((p) => [p.instance.event.title, p]));
		expect(byTitle.A.cols).toBe(2);
		expect(byTitle.C.col).toBe(byTitle.B.col);
	});

	it('separate clusters do not share column counts', () => {
		const placements = layoutDay(
			[inst(at(9), at(10)), inst(at(9, 30), at(10)), inst(at(14), at(15))],
			day
		);
		const solo = placements.find((p) => p.instance.start.getHours() === 14)!;
		expect(solo.cols).toBe(1);
	});

	it('clips events that cross midnight to the day', () => {
		const late = inst(new Date(2026, 7, 12, 22), at(2)); // 22:00 → 02:00 next day
		const placements = layoutDay([late], day);
		expect(placements[0].startMin).toBe(0);
		expect(placements[0].endMin).toBe(120);
	});
});

describe('layoutWeekRow (month/all-day segments)', () => {
	const week = Array.from({ length: 7 }, (_, i) => addDays(new Date(2026, 7, 9), i)); // Sun–Sat

	it('places a multi-day event as one spanning segment', () => {
		const multi = inst(new Date(2026, 7, 10), new Date(2026, 7, 13), true); // Mon–Wed
		const { segments } = layoutWeekRow([multi], week);
		expect(segments).toHaveLength(1);
		expect(segments[0].startCol).toBe(1);
		expect(segments[0].span).toBe(3);
	});

	it('marks continuation across week boundaries', () => {
		const long = inst(new Date(2026, 7, 5), new Date(2026, 7, 20), true);
		const { segments } = layoutWeekRow([long], week);
		expect(segments[0].startCol).toBe(0);
		expect(segments[0].span).toBe(7);
		expect(segments[0].continuesBefore).toBe(true);
		expect(segments[0].continuesAfter).toBe(true);
	});

	it('longer events get lower row numbers', () => {
		const long = inst(new Date(2026, 7, 9), new Date(2026, 7, 12), true, 'long');
		const short = inst(new Date(2026, 7, 9, 9), new Date(2026, 7, 9, 10), false, 'short');
		const { segments } = layoutWeekRow([short, long], week);
		const byTitle = Object.fromEntries(segments.map((s) => [s.instance.event.title, s]));
		expect(byTitle.long.row).toBe(0);
		expect(byTitle.short.row).toBe(1);
	});

	it('stacks non-overlapping events on the same row', () => {
		const a = inst(new Date(2026, 7, 9, 9), new Date(2026, 7, 9, 10), false, 'a');
		const b = inst(new Date(2026, 7, 10, 9), new Date(2026, 7, 10, 10), false, 'b');
		const { segments } = layoutWeekRow([a, b], week);
		expect(segments.every((s) => s.row === 0)).toBe(true);
	});

	it('hides overflow rows and counts them per day', () => {
		const evs = Array.from({ length: 5 }, (_, i) =>
			inst(new Date(2026, 7, 10, 9 + i), new Date(2026, 7, 10, 10 + i), false, `t${i}`));
		const { segments, hiddenCounts, usedRows } = layoutWeekRow(evs, week, 3);
		expect(usedRows).toBe(5);
		// maxRows 3 → 2 visible event rows + "+N more" row
		expect(segments).toHaveLength(2);
		expect(hiddenCounts[1]).toBe(3);
		expect(hiddenCounts[0]).toBe(0);
	});

	it('a hidden spanning bar counts on every day it covers', () => {
		const bar = inst(new Date(2026, 7, 9), new Date(2026, 7, 16), true, 'bar');
		const fillers = Array.from({ length: 4 }, (_, i) =>
			inst(new Date(2026, 7, 10, 9 + i), new Date(2026, 7, 10, 10 + i), false, `f${i}`));
		// bar gets row 0 (longest); fillers rows 1-4 on Monday; maxRows 2 → only bar visible
		const { segments, hiddenCounts } = layoutWeekRow([bar, ...fillers], week, 2);
		expect(segments.map((s) => s.instance.event.title)).toEqual(['bar']);
		expect(hiddenCounts[1]).toBe(4);
	});
});

describe('expandEvents', () => {
	it('filters events of hidden sources and resolves colors', () => {
		const events: CalendarEvent[] = [
			{
				id: '1',
				title: 'visible',
				start: new Date(2026, 7, 13, 9),
				end: new Date(2026, 7, 13, 10),
				calendarId: 'work'
			},
			{
				id: '2',
				title: 'hidden',
				start: new Date(2026, 7, 13, 9),
				end: new Date(2026, 7, 13, 10),
				calendarId: 'home'
			}
		];
		const instances = expandEvents(events, new Date(2026, 7, 1), new Date(2026, 8, 1), [
			{ id: 'work', name: 'Work', color: 'teal' },
			{ id: 'home', name: 'Home', visible: false }
		]);
		expect(instances).toHaveLength(1);
		expect(instances[0].color).toBe('teal');
	});

	it('expands recurring events into keyed instances', () => {
		const events: CalendarEvent[] = [
			{
				id: 'r',
				title: 'standup',
				start: new Date(2026, 7, 3, 9),
				end: new Date(2026, 7, 3, 9, 15),
				recurrence: 'FREQ=WEEKLY;BYDAY=MO,WE,FR'
			}
		];
		const instances = expandEvents(events, new Date(2026, 7, 3), new Date(2026, 7, 8));
		expect(instances).toHaveLength(3);
		expect(new Set(instances.map((i) => i.key)).size).toBe(3);
		expect(instances.every((i) => i.isRecurring)).toBe(true);
	});

	it('snaps all-day events to day bounds', () => {
		const instances = expandEvents(
			[
				{
					id: 'a',
					title: 'trip',
					start: new Date(2026, 7, 13, 14, 30),
					end: new Date(2026, 7, 15, 9, 0),
					allDay: true
				}
			],
			new Date(2026, 7, 1),
			new Date(2026, 8, 1)
		);
		expect(instances[0].start.getTime()).toBe(new Date(2026, 7, 13).getTime());
		expect(instances[0].end.getTime()).toBe(new Date(2026, 7, 16).getTime());
	});
});
