/**
 * Pure helpers for editing recurring series ("this event" and
 * "this and following" style edits).
 */
import type { CalendarEvent, RecurrenceRule, Weekday } from './types.js';
import { expandRecurrence, normalizeRule } from './recurrence.js';

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

/**
 * Splits a recurring series at an occurrence (“this and following”):
 * the original series is truncated to end before the occurrence, and a new
 * series starts at the changed times with the same (re-anchored) rule.
 *
 * `truncated` is `null` when the occurrence is the first of the series —
 * replace the original with `created` in that case.
 */
export function splitSeries(
	event: CalendarEvent,
	occurrenceStart: Date,
	changes: { start: Date; end: Date; allDay?: boolean },
	createdId?: string
): { truncated: CalendarEvent | null; created: CalendarEvent } {
	const rule = normalizeRule(event.recurrence!);
	const durationMs = Math.max(event.end.getTime() - event.start.getTime(), 1);
	// COUNT applies to rule generation, before EXDATEs — count without them.
	const before = expandRecurrence(event.start, durationMs, rule, event.start, occurrenceStart).filter(
		(d) => d.getTime() < occurrenceStart.getTime()
	);

	// Re-anchor weekly BYDAY lists when the drag changed the weekday.
	const dayDelta = ((changes.start.getDay() - occurrenceStart.getDay()) % 7 + 7) % 7;
	const shiftDay = (d: Weekday): Weekday => (((d + dayDelta) % 7) as Weekday);
	const createdRule: RecurrenceRule = {
		...rule,
		...(rule.byDay && dayDelta ? { byDay: rule.byDay.map(shiftDay) } : {}),
		...(rule.byNthDay && dayDelta
			? { byNthDay: { ...rule.byNthDay, day: shiftDay(rule.byNthDay.day) } }
			: {}),
		...(rule.count ? { count: Math.max(rule.count - before.length, 1) } : {})
	};

	const created: CalendarEvent = {
		...event,
		id: createdId ?? `${event.id}::from-${occurrenceStart.getTime()}`,
		start: changes.start,
		end: changes.end,
		allDay: changes.allDay ?? event.allDay,
		recurrence: createdRule,
		exdates: event.exdates?.filter((d) => d.getTime() >= occurrenceStart.getTime())
	};

	if (before.length === 0) return { truncated: null, created };

	const truncated: CalendarEvent = {
		...event,
		recurrence: {
			...rule,
			until: new Date(occurrenceStart.getTime() - 1),
			...(rule.count ? { count: before.length } : {})
		},
		exdates: event.exdates?.filter((d) => d.getTime() < occurrenceStart.getTime())
	};
	return { truncated, created };
}
