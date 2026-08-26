import type { CalendarEvent, EventInstance } from './types.js';
import { describe, expect, it } from 'vitest';
import { transactEvent } from './eventTransaction.js';

function instance(event: CalendarEvent): EventInstance {
	return {
		key: event.id,
		event,
		start: event.start,
		end: event.end,
		allDay: event.allDay ?? false,
		isRecurring: false,
		color: 'blue'
	};
}

describe('transactEvent', () => {
	it('allows overlapping timed events when they belong to different resources', () => {
		const moving: CalendarEvent = {
			id: 'moving',
			title: 'Room A booking',
			start: new Date(2026, 7, 26, 9),
			end: new Date(2026, 7, 26, 10),
			resourceId: 'room-a'
		};
		const occupied: CalendarEvent = {
			id: 'occupied',
			title: 'Room B booking',
			start: new Date(2026, 7, 26, 10),
			end: new Date(2026, 7, 26, 11),
			resourceId: 'room-b'
		};

		const result = transactEvent({
			kind: 'edit',
			events: [moving, occupied],
			instances: [instance(moving), instance(occupied)],
			constraints: { eventOverlap: false },
			instance: instance(moving),
			next: {
				start: new Date(2026, 7, 26, 10, 30),
				end: new Date(2026, 7, 26, 11, 30),
				allDay: false
			}
		});

		expect(result.kind).toBe('updated');
	});

	it('rejects overlapping timed events when they belong to the same resource', () => {
		const moving: CalendarEvent = {
			id: 'moving',
			title: 'First booking',
			start: new Date(2026, 7, 26, 9),
			end: new Date(2026, 7, 26, 10),
			resourceId: 'room-a'
		};
		const occupied: CalendarEvent = {
			id: 'occupied',
			title: 'Second booking',
			start: new Date(2026, 7, 26, 10),
			end: new Date(2026, 7, 26, 11),
			resourceId: 'room-a'
		};

		const result = transactEvent({
			kind: 'edit',
			events: [moving, occupied],
			instances: [instance(moving), instance(occupied)],
			constraints: { eventOverlap: false },
			instance: instance(moving),
			next: {
				start: new Date(2026, 7, 26, 10, 30),
				end: new Date(2026, 7, 26, 11, 30),
				allDay: false
			}
		});

		expect(result).toEqual({ kind: 'rejected', reason: 'overlap' });
	});

	it('rejects a recurring occurrence that overlaps another occurrence in its series', () => {
		const series: CalendarEvent = {
			id: 'series',
			title: 'Standup',
			start: new Date(2026, 7, 24, 9),
			end: new Date(2026, 7, 24, 9, 30),
			recurrence: 'FREQ=DAILY',
			resourceId: 'room-a'
		};
		const moving: EventInstance = {
			...instance(series),
			key: 'series::moving',
			start: new Date(2026, 7, 26, 9),
			end: new Date(2026, 7, 26, 9, 30),
			isRecurring: true
		};
		const occupied: EventInstance = {
			...instance(series),
			key: 'series::occupied',
			start: new Date(2026, 7, 26, 10),
			end: new Date(2026, 7, 26, 10, 30),
			isRecurring: true
		};

		const result = transactEvent({
			kind: 'edit',
			events: [series],
			instances: [moving, occupied],
			constraints: { eventOverlap: false },
			instance: moving,
			next: {
				start: new Date(2026, 7, 26, 10, 15),
				end: new Date(2026, 7, 26, 10, 45),
				allDay: false
			}
		});

		expect(result).toEqual({ kind: 'rejected', reason: 'overlap' });
	});

	it('converts edited display times and reports the previous event values', () => {
		const original: CalendarEvent = {
			id: 'event',
			title: 'Zoned meeting',
			start: new Date('2026-08-26T01:00:00.000Z'),
			end: new Date('2026-08-26T02:00:00.000Z')
		};
		const viewStart = new Date('2026-08-26T18:00:00.000Z');
		const viewEnd = new Date('2026-08-26T19:00:00.000Z');

		const result = transactEvent({
			kind: 'edit',
			events: [original],
			instances: [instance(original)],
			constraints: { eventOverlap: true },
			instance: instance(original),
			next: { start: viewStart, end: viewEnd, allDay: false },
			toReal: (date) => new Date(date.getTime() - 8 * 60 * 60 * 1000)
		});

		expect(result.kind).toBe('updated');
		if (result.kind !== 'updated') return;
		expect(result.event.start).toEqual(new Date('2026-08-26T10:00:00.000Z'));
		expect(result.event.end).toEqual(new Date('2026-08-26T11:00:00.000Z'));
		expect(result.previous).toEqual({
			start: original.start,
			end: original.end,
			allDay: false,
			resourceId: undefined
		});
	});

	it('returns unchanged when the converted values match the stored event', () => {
		const original: CalendarEvent = {
			id: 'event',
			title: 'No-op edit',
			start: new Date(2026, 7, 26, 9),
			end: new Date(2026, 7, 26, 10)
		};

		const result = transactEvent({
			kind: 'edit',
			events: [original],
			instances: [instance(original)],
			constraints: { eventOverlap: true },
			instance: instance(original),
			next: { start: original.start, end: original.end, allDay: false }
		});

		expect(result).toEqual({ kind: 'unchanged' });
	});

	it('rejects an edit whose exclusive end crosses outside validRange', () => {
		const original: CalendarEvent = {
			id: 'event',
			title: 'Late meeting',
			start: new Date(2026, 7, 26, 20),
			end: new Date(2026, 7, 26, 21)
		};

		const result = transactEvent({
			kind: 'edit',
			events: [original],
			instances: [instance(original)],
			constraints: {
				eventOverlap: true,
				validRange: {
					start: new Date(2026, 7, 26),
					end: new Date(2026, 7, 26)
				}
			},
			instance: instance(original),
			next: {
				start: new Date(2026, 7, 26, 23),
				end: new Date(2026, 7, 27, 1),
				allDay: false
			}
		});

		expect(result).toEqual({ kind: 'rejected', reason: 'outside-valid-range' });
	});

	it('rejects safely when the edited event is no longer in the bound array', () => {
		const removed: CalendarEvent = {
			id: 'removed',
			title: 'Removed elsewhere',
			start: new Date(2026, 7, 26, 9),
			end: new Date(2026, 7, 26, 10)
		};

		const result = transactEvent({
			kind: 'edit',
			events: [],
			instances: [instance(removed)],
			constraints: { eventOverlap: true },
			instance: instance(removed),
			next: {
				start: new Date(2026, 7, 26, 11),
				end: new Date(2026, 7, 26, 12),
				allDay: false
			}
		});

		expect(result).toEqual({ kind: 'rejected', reason: 'missing-event' });
	});

	it('requires a series choice before editing a recurring occurrence', () => {
		const series: CalendarEvent = {
			id: 'series',
			title: 'Standup',
			start: new Date(2026, 7, 24, 9),
			end: new Date(2026, 7, 24, 9, 30),
			recurrence: 'FREQ=DAILY'
		};
		const occurrence: EventInstance = {
			...instance(series),
			key: 'series::occurrence',
			start: new Date(2026, 7, 26, 9),
			end: new Date(2026, 7, 26, 9, 30),
			isRecurring: true
		};
		const next = {
			start: new Date(2026, 7, 26, 10),
			end: new Date(2026, 7, 26, 10, 30),
			allDay: false
		};

		const result = transactEvent({
			kind: 'edit',
			events: [series],
			instances: [occurrence],
			constraints: { eventOverlap: true },
			instance: occurrence,
			next
		});

		expect(result).toEqual({
			kind: 'needs-series-choice',
			pending: { instance: occurrence, next }
		});
	});

	it('revalidates constraints when a recurring edit is confirmed', () => {
		const series: CalendarEvent = {
			id: 'series',
			title: 'Standup',
			start: new Date(2026, 7, 24, 9),
			end: new Date(2026, 7, 24, 9, 30),
			recurrence: 'FREQ=DAILY',
			resourceId: 'room-a'
		};
		const occurrence: EventInstance = {
			...instance(series),
			key: 'series::occurrence',
			start: new Date(2026, 7, 26, 9),
			end: new Date(2026, 7, 26, 9, 30),
			isRecurring: true
		};
		const occupied: CalendarEvent = {
			id: 'occupied',
			title: 'New booking',
			start: new Date(2026, 7, 26, 10),
			end: new Date(2026, 7, 26, 11),
			resourceId: 'room-a'
		};

		const result = transactEvent({
			kind: 'edit-series',
			scope: 'occurrence',
			events: [series, occupied],
			instances: [occurrence, instance(occupied)],
			constraints: { eventOverlap: false },
			pending: {
				instance: occurrence,
				next: {
					start: new Date(2026, 7, 26, 10, 30),
					end: new Date(2026, 7, 26, 11, 30),
					allDay: false
				}
			},
			id: 'detached'
		});

		expect(result).toEqual({ kind: 'rejected', reason: 'overlap' });
	});

	it('detaches one recurring occurrence after the occurrence scope is chosen', () => {
		const series: CalendarEvent = {
			id: 'series',
			title: 'Standup',
			start: new Date(2026, 7, 24, 9),
			end: new Date(2026, 7, 24, 9, 30),
			recurrence: 'FREQ=DAILY',
			resourceId: 'room-a'
		};
		const occurrence: EventInstance = {
			...instance(series),
			key: 'series::occurrence',
			start: new Date(2026, 7, 26, 9),
			end: new Date(2026, 7, 26, 9, 30),
			isRecurring: true
		};

		const result = transactEvent({
			kind: 'edit-series',
			scope: 'occurrence',
			events: [series],
			instances: [occurrence],
			constraints: { eventOverlap: true },
			pending: {
				instance: occurrence,
				next: {
					start: new Date(2026, 7, 26, 10),
					end: new Date(2026, 7, 26, 10, 30),
					allDay: false,
					resourceId: 'room-b'
				}
			},
			id: 'detached'
		});

		expect(result.kind).toBe('series-detached');
		if (result.kind !== 'series-detached') return;
		expect(result.occurrence).toEqual(occurrence.start);
		expect(result.series.exdates).toEqual([occurrence.start]);
		expect(result.detached).toMatchObject({
			id: 'detached',
			start: new Date(2026, 7, 26, 10),
			end: new Date(2026, 7, 26, 10, 30),
			resourceId: 'room-b'
		});
		expect(result.detached.recurrence).toBeUndefined();
		expect(result.events).toEqual([result.series, result.detached]);
	});

	it('splits a recurring series after the following scope is chosen', () => {
		const series: CalendarEvent = {
			id: 'series',
			title: 'Standup',
			start: new Date(2026, 7, 24, 9),
			end: new Date(2026, 7, 24, 9, 30),
			recurrence: 'FREQ=DAILY'
		};
		const occurrence: EventInstance = {
			...instance(series),
			key: 'series::occurrence',
			start: new Date(2026, 7, 26, 9),
			end: new Date(2026, 7, 26, 9, 30),
			isRecurring: true
		};

		const result = transactEvent({
			kind: 'edit-series',
			scope: 'following',
			events: [series],
			instances: [occurrence],
			constraints: { eventOverlap: true },
			pending: {
				instance: occurrence,
				next: {
					start: new Date(2026, 7, 26, 10),
					end: new Date(2026, 7, 26, 10, 30),
					allDay: false,
					resourceId: 'room-b'
				}
			},
			id: 'following'
		});

		expect(result.kind).toBe('series-split');
		if (result.kind !== 'series-split') return;
		expect(result.occurrence).toEqual(occurrence.start);
		expect(result.truncated).not.toBeNull();
		expect(result.created).toMatchObject({
			id: 'following',
			start: new Date(2026, 7, 26, 10),
			end: new Date(2026, 7, 26, 10, 30),
			resourceId: 'room-b'
		});
		expect(result.events).toEqual([result.truncated, result.created]);
	});

	it('creates an overlapping timed event when it belongs to a different resource', () => {
		const occupied: CalendarEvent = {
			id: 'occupied',
			title: 'Occupied',
			start: new Date(2026, 7, 26, 10),
			end: new Date(2026, 7, 26, 11),
			resourceId: 'room-a'
		};
		const result = transactEvent({
			kind: 'create',
			events: [occupied],
			instances: [instance(occupied)],
			constraints: { eventOverlap: false },
			id: 'created',
			draft: {
				title: 'Other room',
				start: new Date(2026, 7, 26, 10, 30),
				end: new Date(2026, 7, 26, 11, 30),
				resourceId: 'room-b'
			}
		});

		expect(result.kind).toBe('created');
		if (result.kind !== 'created') return;
		expect(result.event).toMatchObject({ id: 'created', resourceId: 'room-b' });
		expect(result.events).toEqual([occupied, result.event]);
	});

	it('rejects creation when a timed event overlaps in the same resource', () => {
		const occupied: CalendarEvent = {
			id: 'occupied',
			title: 'Occupied',
			start: new Date(2026, 7, 26, 10),
			end: new Date(2026, 7, 26, 11),
			resourceId: 'room-a'
		};
		const result = transactEvent({
			kind: 'create',
			events: [occupied],
			instances: [instance(occupied)],
			constraints: { eventOverlap: false },
			id: 'created',
			draft: {
				title: 'Conflict',
				start: new Date(2026, 7, 26, 10, 30),
				end: new Date(2026, 7, 26, 11, 30),
				resourceId: 'room-a'
			}
		});

		expect(result).toEqual({ kind: 'rejected', reason: 'overlap' });
	});

	it('rejects creation when its exclusive end crosses outside validRange', () => {
		const result = transactEvent({
			kind: 'create',
			events: [],
			instances: [],
			constraints: {
				eventOverlap: true,
				validRange: {
					start: new Date(2026, 7, 24),
					end: new Date(2026, 7, 26)
				}
			},
			id: 'created',
			draft: {
				title: 'Crosses boundary',
				start: new Date(2026, 7, 26, 23),
				end: new Date(2026, 7, 27, 1)
			}
		});

		expect(result).toEqual({ kind: 'rejected', reason: 'outside-valid-range' });
	});

	it('stores created display times after converting them to real instants', () => {
		const start = new Date(2026, 7, 26, 9);
		const end = new Date(2026, 7, 26, 10);
		const result = transactEvent({
			kind: 'create',
			events: [],
			instances: [],
			constraints: { eventOverlap: true },
			id: 'created',
			draft: { title: 'Converted', start, end },
			toReal: (date) => new Date(date.getTime() - 8 * 60 * 60_000)
		});

		expect(result.kind).toBe('created');
		if (result.kind !== 'created') return;
		expect(result.event.start).toEqual(new Date(2026, 7, 26, 1));
		expect(result.event.end).toEqual(new Date(2026, 7, 26, 2));
	});
});
