/**
 * Turns raw {@link CalendarEvent}s into concrete {@link EventInstance}s for a
 * visible range: expands recurrences, resolves colors, filters hidden sources.
 */
import type { CalendarEvent, CalendarSource, EventInstance } from './types.js';
import { endOfDay, overlaps, startOfDay } from './date.js';
import { expandRecurrence } from './recurrence.js';

export const PALETTE = [
	'graphite',
	'red',
	'orange',
	'yellow',
	'green',
	'teal',
	'blue',
	'indigo',
	'purple',
	'pink'
] as const;

export function isPaletteColor(c: string): boolean {
	return (PALETTE as readonly string[]).includes(c);
}

function resolveColor(event: CalendarEvent, source?: CalendarSource): string {
	return event.color ?? source?.color ?? 'blue';
}

/** For all-day events, snap the interval to day boundaries (end exclusive). */
function allDayBounds(event: { start: Date; end: Date }): { start: Date; end: Date } {
	const start = startOfDay(event.start);
	// An all-day event ending exactly at midnight keeps that as its exclusive end.
	const end
		= event.end.getTime() <= start.getTime()
			? endOfDay(event.start)
			: event.end.getTime() === startOfDay(event.end).getTime()
				? event.end
				: endOfDay(event.end);
	return { start, end };
}

export function expandEvents(
	events: CalendarEvent[],
	rangeStart: Date,
	rangeEnd: Date,
	sources?: CalendarSource[]
): EventInstance[] {
	const sourceById = new Map((sources ?? []).map((s) => [s.id, s]));
	const out: EventInstance[] = [];

	for (const event of events) {
		const source = event.calendarId ? sourceById.get(event.calendarId) : undefined;
		if (source && source.visible === false) continue;

		const allDay = event.allDay ?? false;
		const color = resolveColor(event, source);
		const base = allDay ? allDayBounds(event) : { start: event.start, end: event.end };
		const durationMs = Math.max(base.end.getTime() - base.start.getTime(), 1);

		if (event.recurrence) {
			const starts = expandRecurrence(
				base.start,
				durationMs,
				event.recurrence,
				rangeStart,
				rangeEnd,
				event.exdates
			);
			for (const start of starts) {
				const end = new Date(start.getTime() + durationMs);
				out.push({
					key: `${event.id}::${start.getTime()}`,
					event,
					start,
					end,
					allDay,
					isRecurring: true,
					color
				});
			}
		}
		else if (overlaps(base.start, base.end, rangeStart, rangeEnd)) {
			out.push({
				key: event.id,
				event,
				start: base.start,
				end: base.end,
				allDay,
				isRecurring: false,
				color
			});
		}
	}

	out.sort(
		(a, b) =>
			a.start.getTime() - b.start.getTime()
			|| b.end.getTime() - a.end.getTime()
			|| a.event.title.localeCompare(b.event.title)
	);
	return out;
}

/** True when an instance should render as a bar in month cells / the all-day lane. */
export function isAllDayLike(i: EventInstance): boolean {
	return i.allDay || i.end.getTime() - i.start.getTime() >= 86_400_000;
}
