import type { CalendarEvent, EventInstance, ValidRange } from './types.js';
import { startOfDay } from './date.js';
import { detachOccurrence, splitSeries } from './series.js';

interface EventConstraints {
	eventOverlap: boolean;
	validRange?: ValidRange | null;
}

interface EditEventTransaction {
	kind: 'edit';
	events: CalendarEvent[];
	instances: EventInstance[];
	constraints: EventConstraints;
	instance: EventInstance;
	toReal?: (date: Date) => Date;
	next: {
		start: Date;
		end: Date;
		allDay: boolean;
		resourceId?: string;
	};
}

interface EditSeriesTransaction {
	kind: 'edit-series';
	scope: 'following' | 'occurrence';
	events: CalendarEvent[];
	instances: EventInstance[];
	constraints: EventConstraints;
	pending: PendingSeriesEdit;
	id: string;
	toReal?: (date: Date) => Date;
}

interface CreateEventTransaction {
	kind: 'create';
	events: CalendarEvent[];
	instances: EventInstance[];
	constraints: EventConstraints;
	id: string;
	draft: Omit<CalendarEvent, 'id'>;
	toReal?: (date: Date) => Date;
}

export type EventTransaction
	= | CreateEventTransaction
		| EditEventTransaction
		| EditSeriesTransaction;

export interface CreatedEventTransaction {
	kind: 'created';
	events: CalendarEvent[];
	event: CalendarEvent;
}

export interface UpdatedEventTransaction {
	kind: 'updated';
	events: CalendarEvent[];
	event: CalendarEvent;
	previous: {
		start: Date;
		end: Date;
		allDay: boolean;
		resourceId?: string;
	};
}

export interface RejectedEventTransaction {
	kind: 'rejected';
	reason: 'missing-event' | 'outside-valid-range' | 'overlap';
}

export interface UnchangedEventTransaction {
	kind: 'unchanged';
}

export interface PendingSeriesEdit {
	instance: EventInstance;
	next: EditEventTransaction['next'];
}

export interface NeedsSeriesChoiceTransaction {
	kind: 'needs-series-choice';
	pending: PendingSeriesEdit;
}

export interface SeriesDetachedTransaction {
	kind: 'series-detached';
	events: CalendarEvent[];
	series: CalendarEvent;
	detached: CalendarEvent;
	occurrence: Date;
}

export interface SeriesSplitTransaction {
	kind: 'series-split';
	events: CalendarEvent[];
	truncated: CalendarEvent | null;
	created: CalendarEvent;
	occurrence: Date;
}

export type EventTransactionResult
	= | CreatedEventTransaction
		| NeedsSeriesChoiceTransaction
		| RejectedEventTransaction
		| SeriesDetachedTransaction
		| SeriesSplitTransaction
		| UnchangedEventTransaction
		| UpdatedEventTransaction;

function isOutsideValidRange(start: Date, end: Date, validRange?: ValidRange | null): boolean {
	if (!validRange) return false;
	const firstDay = startOfDay(start).getTime();
	const exclusiveEnd = end.getTime();
	const lastInstant = exclusiveEnd > start.getTime() ? exclusiveEnd - 1 : start.getTime();
	const lastDay = startOfDay(new Date(lastInstant)).getTime();
	return (
		(validRange.start && firstDay < startOfDay(validRange.start).getTime())
		|| (validRange.end && lastDay > startOfDay(validRange.end).getTime())
	) ?? false;
}

function hasTimedOverlap(
	instances: EventInstance[],
	range: { start: Date; end: Date; allDay: boolean; resourceId?: string },
	excludeKey?: string
): boolean {
	if (range.allDay) return false;
	return instances.some(
		(current) =>
			!current.allDay
			&& current.key !== excludeKey
			&& current.event.resourceId === range.resourceId
			&& current.start.getTime() < range.end.getTime()
			&& range.start.getTime() < current.end.getTime()
	);
}

export function transactEvent(transaction: EventTransaction): EventTransactionResult {
	if (transaction.kind === 'create') {
		if (
			isOutsideValidRange(
				transaction.draft.start,
				transaction.draft.end,
				transaction.constraints.validRange
			)
		) {
			return { kind: 'rejected', reason: 'outside-valid-range' };
		}
		if (
			!transaction.constraints.eventOverlap
			&& hasTimedOverlap(transaction.instances, {
				start: transaction.draft.start,
				end: transaction.draft.end,
				allDay: transaction.draft.allDay ?? false,
				resourceId: transaction.draft.resourceId
			})
		) {
			return { kind: 'rejected', reason: 'overlap' };
		}
		const toReal = transaction.toReal ?? ((date: Date) => date);
		const event: CalendarEvent = {
			...transaction.draft,
			id: transaction.id,
			start: toReal(transaction.draft.start),
			end: toReal(transaction.draft.end)
		};
		return { kind: 'created', events: [...transaction.events, event], event };
	}
	if (transaction.kind === 'edit-series') {
		const target = transaction.events.find(
			(event) => event.id === transaction.pending.instance.event.id
		);
		if (!target) return { kind: 'rejected', reason: 'missing-event' };
		const resourceId = transaction.pending.next.resourceId ?? target.resourceId;
		if (
			isOutsideValidRange(
				transaction.pending.next.start,
				transaction.pending.next.end,
				transaction.constraints.validRange
			)
		) {
			return { kind: 'rejected', reason: 'outside-valid-range' };
		}
		if (
			!transaction.constraints.eventOverlap
			&& hasTimedOverlap(
				transaction.instances,
				{ ...transaction.pending.next, resourceId },
				transaction.pending.instance.key
			)
		) {
			return { kind: 'rejected', reason: 'overlap' };
		}
		const toReal = transaction.toReal ?? ((date: Date) => date);
		const occurrence = toReal(transaction.pending.instance.start);
		if (transaction.scope === 'following') {
			const { truncated, created } = splitSeries(
				target,
				occurrence,
				{
					start: toReal(transaction.pending.next.start),
					end: toReal(transaction.pending.next.end),
					allDay: transaction.pending.next.allDay
				},
				transaction.id
			);
			if (transaction.pending.next.resourceId !== undefined) {
				created.resourceId = transaction.pending.next.resourceId;
			}
			return {
				kind: 'series-split',
				events: truncated
					? [...transaction.events.map((event) => event === target ? truncated : event), created]
					: transaction.events.map((event) => event === target ? created : event),
				truncated,
				created,
				occurrence
			};
		}
		const { series, detached } = detachOccurrence(
			target,
			occurrence,
			{
				start: toReal(transaction.pending.next.start),
				end: toReal(transaction.pending.next.end),
				allDay: transaction.pending.next.allDay
			},
			transaction.id
		);
		if (transaction.pending.next.resourceId !== undefined) {
			detached.resourceId = transaction.pending.next.resourceId;
		}
		return {
			kind: 'series-detached',
			events: [...transaction.events.map((event) => event === target ? series : event), detached],
			series,
			detached,
			occurrence
		};
	}
	const target = transaction.events.find((event) => event.id === transaction.instance.event.id);
	if (!target) return { kind: 'rejected', reason: 'missing-event' };
	const resourceId = transaction.next.resourceId ?? target.resourceId;
	const toReal = transaction.toReal ?? ((date: Date) => date);
	const start = toReal(transaction.next.start);
	const end = toReal(transaction.next.end);
	if (
		isOutsideValidRange(
			transaction.next.start,
			transaction.next.end,
			transaction.constraints.validRange
		)
	) {
		return { kind: 'rejected', reason: 'outside-valid-range' };
	}
	if (
		!transaction.constraints.eventOverlap
		&& hasTimedOverlap(
			transaction.instances,
			{ ...transaction.next, resourceId },
			transaction.instance.key
		)
	) {
		return { kind: 'rejected', reason: 'overlap' };
	}
	if (transaction.instance.isRecurring) {
		return {
			kind: 'needs-series-choice',
			pending: { instance: transaction.instance, next: transaction.next }
		};
	}
	if (
		target.start.getTime() === start.getTime()
		&& target.end.getTime() === end.getTime()
		&& (target.allDay ?? false) === transaction.next.allDay
		&& target.resourceId === resourceId
	) {
		return { kind: 'unchanged' };
	}
	const event: CalendarEvent = {
		...target,
		start,
		end,
		allDay: transaction.next.allDay,
		...(resourceId !== undefined ? { resourceId } : {})
	};

	return {
		kind: 'updated',
		event,
		events: transaction.events.map((current) => current === target ? event : current),
		previous: {
			start: target.start,
			end: target.end,
			allDay: target.allDay ?? false,
			resourceId: target.resourceId
		}
	};
}
