/**
 * Pure helpers for editing recurring series ("this event" style edits).
 */
import type { CalendarEvent } from './types.js';

/** Returns a copy of the series with one occurrence excluded (an EXDATE). */
export function excludeOccurrence(event: CalendarEvent, occurrenceStart: Date): CalendarEvent {
	return { ...event, exdates: [...(event.exdates ?? []), occurrenceStart] };
}

/**
 * Splits one occurrence out of a recurring series: the series gains an EXDATE
 * for the occurrence, and a standalone (non-recurring) copy is created with
 * the given times — the data shape of Google Calendar's “this event” edit.
 */
export function detachOccurrence(
	event: CalendarEvent,
	occurrenceStart: Date,
	changes: { start: Date; end: Date; allDay?: boolean },
	detachedId?: string
): { series: CalendarEvent; detached: CalendarEvent } {
	const series = excludeOccurrence(event, occurrenceStart);
	const { recurrence: _recurrence, exdates: _exdates, ...rest } = event;
	const detached: CalendarEvent = {
		...rest,
		id: detachedId ?? `${event.id}::${occurrenceStart.getTime()}`,
		start: changes.start,
		end: changes.end,
		allDay: changes.allDay ?? event.allDay
	};
	return { series, detached };
}
