<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { CalendarContext } from './context.js';
	import type { CalendarMessages } from './i18n.js';
	import type {
		BusinessHours,
		CalendarEvent,
		CalendarSource,
		CalendarView,
		EventChangeInfo,
		EventInstance,
		RangeSelection,
		Resource,
		ValidRange,
		Weekday
	} from './types.js';
	import { setCalendarContext } from './context.js';
	import {
		addDays,
		addMinutes,
		addMonths,
		addYears,
		endOfDay,
		monthGrid,
		startOfDay,
		startOfWeek
	} from './date.js';
	import EventDetails from './EventDetails.svelte';
	import { formatters, localeFirstDay, messagesForLocale } from './i18n.js';
	import { expandEvents } from './instances.js';
	import QuickCreate from './QuickCreate.svelte';
	import { normalizeRule } from './recurrence.js';
	import { detachOccurrence, excludeOccurrence, splitSeries } from './series.js';
	import SeriesConfirm from './SeriesConfirm.svelte';
	import Toolbar from './Toolbar.svelte';
	import { fromZoned, toZoned } from './tz.js';
	import AgendaView from './views/AgendaView.svelte';
	import MonthView from './views/MonthView.svelte';
	import ResourceView from './views/ResourceView.svelte';
	import TimeGrid from './views/TimeGrid.svelte';
	import YearView from './views/YearView.svelte';
	// Imported here (not only in index.ts): rolldown-based bundlers tree-shake
	// side-effect-only imports from re-export barrels, but imports inside a
	// component module that is actually instantiated always survive.
	import './theme.css';

	interface Props {
		/** Event list. Bindable — the calendar updates it after drag/resize edits. */
		events?: CalendarEvent[];
		/** The focused date. Bindable. */
		date?: Date;
		/** Current view. Bindable. */
		view?: CalendarView;
		/** Event sources/groups (colors, visibility). */
		sources?: CalendarSource[];
		/** Resources (people, rooms) shown as columns by the `resources` view. */
		resources?: Resource[];
		/**
		 * IANA time zone to display in (e.g. `"Asia/Shanghai"`). Event `Date`s
		 * stay real instants; the grid, popovers and edits are rendered and
		 * interpreted in this zone. Defaults to the runtime's local zone.
		 */
		timeZone?: string;
		/** Days outside this range are read-only and unreachable via navigation. */
		validRange?: ValidRange;
		/** When `false`, drops/creates overlapping another timed event are rejected. */
		eventOverlap?: boolean;
		/** BCP-47 locale tag, drives all labels and date formats. */
		locale?: string;
		/** Override built-in UI strings. */
		messages?: Partial<CalendarMessages>;
		/** 0 = Sunday … 6 = Saturday. Defaults to the locale's convention. */
		firstDayOfWeek?: Weekday;
		/** Show Saturday/Sunday columns. */
		weekends?: boolean;
		/** Show ISO week numbers (month & week views). */
		weekNumbers?: boolean;
		/** Always render 6 week rows in month view. */
		fixedWeeks?: boolean;
		/** Max event rows per month cell, incl. the “+N more” row. */
		dayMaxEvents?: number;
		/** Minor grid line interval in minutes (time grid). */
		slotDuration?: number;
		/** Drag/resize snapping in minutes. */
		snapDuration?: number;
		/** First visible hour (0–24). */
		dayStartHour?: number;
		/** Last visible hour (0–24). */
		dayEndHour?: number;
		/** Pixel height of one hour in the time grid. */
		hourHeight?: number;
		/** Hour scrolled into view when a time-grid view opens. */
		scrollToHour?: number;
		/** Shade non-working time. `true` = Mon–Fri 9–17. */
		businessHours?: BusinessHours | boolean | null;
		/** Allow dragging/resizing events. */
		editable?: boolean;
		/** Allow drag-selecting ranges (fires `onSelect`). */
		selectable?: boolean;
		/**
		 * Built-in quick-create popover when clicking/drag-selecting empty space.
		 * Active when the calendar is `selectable` or `editable`; skipped when
		 * `onSelect`/`onDateClick` are provided.
		 */
		quickCreate?: boolean;
		/**
		 * Built-in details popover when an event is clicked
		 * (skipped when `onEventClick` is provided).
		 */
		eventDetails?: boolean;
		/** Days shown by the agenda view. */
		agendaDays?: number;
		/** Show the current-time line. */
		nowIndicator?: boolean;
		/** Force 12/24-hour time display. Defaults to the locale's convention. */
		hour12?: boolean;
		/**
		 * Color scheme. `auto` follows `prefers-color-scheme`. When omitted, the
		 * calendar inherits from a `data-s5c-theme="dark"` attribute on any
		 * ancestor element (falling back to light).
		 */
		theme?: 'light' | 'dark' | 'auto';
		/** Which views the toolbar offers. */
		views?: CalendarView[];
		/** Render the built-in toolbar. */
		header?: boolean;
		onEventClick?: (instance: EventInstance, e: MouseEvent | KeyboardEvent) => void;
		onDateClick?: (date: Date, allDay: boolean) => void;
		onSelect?: (sel: RangeSelection) => void;
		onEventChange?: (info: EventChangeInfo) => void;
		/** Fires after the built-in quick-create popover (or `createEvent`) adds an event. */
		onEventCreate?: (event: CalendarEvent) => void;
		/**
		 * Fires after an event is removed. When only one occurrence of a series
		 * was deleted, `occurrence` is set and `event` is the updated series
		 * (with the new exdate).
		 */
		onEventDelete?: (event: CalendarEvent, occurrence?: Date) => void;
		/**
		 * Fires after a dragged/resized occurrence of a recurring series is
		 * detached into a standalone event (“this event” edit).
		 */
		onSeriesDetach?: (info: {
			series: CalendarEvent;
			detached: CalendarEvent;
			occurrence: Date;
		}) => void;
		/**
		 * Fires after a “this and following” edit: the original series was
		 * truncated (`null` when the occurrence was the first) and a new series
		 * was created from the occurrence onward.
		 */
		onSeriesSplit?: (info: {
			truncated: CalendarEvent | null;
			created: CalendarEvent;
			occurrence: Date;
		}) => void;
		onViewChange?: (view: CalendarView) => void;
		onDateChange?: (date: Date) => void;
		/** Fires when the visible date range changes — ideal for fetching events. */
		onRangeChange?: (start: Date, end: Date) => void;
		/** Custom renderer for event content. */
		eventContent?: Snippet<[EventInstance]>;
		/** Extra toolbar content (right side). */
		toolbarEnd?: Snippet;
		class?: string;
	}

	let {
		events = $bindable([]),
		date = $bindable(new Date()),
		view = $bindable('month'),
		sources = [],
		resources = [],
		timeZone,
		validRange,
		eventOverlap = true,
		locale = 'en',
		messages: messagesOverride,
		firstDayOfWeek,
		weekends = true,
		weekNumbers = false,
		fixedWeeks = false,
		dayMaxEvents = 4,
		slotDuration = 30,
		snapDuration = 15,
		dayStartHour = 0,
		dayEndHour = 24,
		hourHeight = 48,
		scrollToHour = 7,
		businessHours = null,
		editable = false,
		selectable = false,
		quickCreate = true,
		eventDetails = true,
		agendaDays = 30,
		nowIndicator = true,
		hour12,
		theme,
		views = ['day', 'week', 'month', 'year', 'agenda'],
		header = true,
		onEventClick,
		onDateClick,
		onSelect,
		onEventChange,
		onEventCreate,
		onEventDelete,
		onSeriesDetach,
		onSeriesSplit,
		onViewChange,
		onDateChange,
		onRangeChange,
		eventContent,
		toolbarEnd,
		class: className = ''
	}: Props = $props();

	const fdow = $derived(firstDayOfWeek ?? localeFirstDay(locale));
	const msgs = $derived(messagesForLocale(locale, messagesOverride));
	const fm = $derived(formatters(locale, hour12));
	const resolvedBusinessHours = $derived<BusinessHours | null>(
		businessHours === true ? {} : businessHours || null
	);

	const isVisibleDay = (d: Date) => weekends || (d.getDay() !== 0 && d.getDay() !== 6);

	// ---- display time zone ---------------------------------------------------
	/** Real instant → display wall-clock (identity without `timeZone`). */
	const toView = (d: Date) => (timeZone ? toZoned(d, timeZone) : d);
	/** Display wall-clock → real instant (identity without `timeZone`). */
	const toReal = (d: Date) => (timeZone ? fromZoned(d, timeZone) : d);

	/** Events with start/end/exdates/until shifted into the display zone. */
	const zonedEvents = $derived.by<CalendarEvent[]>(() => {
		if (!timeZone) return events;
		return events.map((ev) => {
			const shifted: CalendarEvent = {
				...ev,
				start: toView(ev.start),
				end: toView(ev.end),
				exdates: ev.exdates?.map(toView)
			};
			if (ev.recurrence) {
				const rule = normalizeRule(ev.recurrence);
				shifted.recurrence = rule.until ? { ...rule, until: toView(rule.until) } : rule;
			}
			return shifted;
		});
	});

	function now(): Date {
		return toView(new Date());
	}

	function isDayAllowed(day: Date): boolean {
		if (!validRange) return true;
		if (validRange.start && day.getTime() < startOfDay(validRange.start).getTime()) return false;
		if (validRange.end && day.getTime() > startOfDay(validRange.end).getTime()) return false;
		return true;
	}

	/** Clamps a focus date into `validRange`. */
	function clampDate(d: Date): Date {
		if (!validRange) return d;
		if (validRange.start && d.getTime() < validRange.start.getTime()) {
			return new Date(validRange.start);
		}
		if (validRange.end && d.getTime() > validRange.end.getTime()) {
			return new Date(validRange.end);
		}
		return d;
	}

	// ---- screen-reader announcements ----------------------------------------
	let announcement = $state('');
	function announce(text: string) {
		announcement = text;
	}

	/** All day-cells the current view shows (month: leading/trailing included). */
	const visibleDays = $derived.by<Date[]>(() => {
		switch (view) {
			case 'month':
				return monthGrid(date, fdow, fixedWeeks).flat().filter(isVisibleDay);
			case 'week': {
				const first = startOfWeek(date, fdow);
				return Array.from({ length: 7 }, (_, i) => addDays(first, i)).filter(isVisibleDay);
			}
			case 'day':
			case 'resources':
				return [startOfDay(date)];
			case 'year': {
				const first = new Date(date.getFullYear(), 0, 1);
				const last = new Date(date.getFullYear() + 1, 0, 1);
				const out: Date[] = [];
				for (let d = first; d < last; d = addDays(d, 1)) out.push(d);
				return out;
			}
			case 'agenda': {
				const first = startOfDay(date);
				return Array.from({ length: Math.max(1, agendaDays) }, (_, i) => addDays(first, i));
			}
		}
	});

	const rangeStart = $derived(visibleDays[0]);
	const rangeEnd = $derived(endOfDay(visibleDays[visibleDays.length - 1]));
	const instances = $derived(expandEvents(zonedEvents, rangeStart, rangeEnd, sources));

	// Notify when the visible range changes (initial mount included).
	let lastRange: { s: number; e: number } | null = null;
	$effect(() => {
		const s = rangeStart.getTime();
		const e = rangeEnd.getTime();
		if (lastRange && lastRange.s === s && lastRange.e === e) return;
		lastRange = { s, e };
		onRangeChange?.(toReal(new Date(s)), toReal(new Date(e)));
	});

	const title = $derived.by(() => {
		switch (view) {
			case 'month':
				return fm.monthTitle(date);
			case 'week':
				return fm.range(rangeStart, addDays(rangeEnd, -1));
			case 'day':
			case 'resources':
				return fm.dayTitle(date);
			case 'year':
				return fm.yearTitle(date);
			case 'agenda':
				return fm.range(rangeStart, addDays(rangeEnd, -1));
		}
	});

	function setDate(d: Date) {
		date = clampDate(d);
		onDateChange?.(date);
	}
	function setView(v: CalendarView) {
		if (v === view) return;
		view = v;
		onViewChange?.(v);
	}
	function navigate(dir: 1 | -1) {
		switch (view) {
			case 'month':
				setDate(addMonths(date, dir));
				break;
			case 'week':
				setDate(addDays(date, dir * 7));
				break;
			case 'day':
			case 'resources':
				setDate(addDays(date, dir));
				break;
			case 'year':
				setDate(addYears(date, dir));
				break;
			case 'agenda':
				setDate(addDays(date, dir * agendaDays));
				break;
		}
	}
	function goToday() {
		setDate(now());
	}

	const sourceById = $derived(new Map(sources.map((s) => [s.id, s])));

	function canEdit(instance: EventInstance): boolean {
		if (!editable) return false;
		if (instance.event.editable !== undefined) return instance.event.editable;
		const source = instance.event.calendarId
			? sourceById.get(instance.event.calendarId)
			: undefined;
		return source?.editable ?? true;
	}

	// ---- built-in popovers (details on event click, quick-create on selection) ----
	let detailsPopover = $state<{ instance: EventInstance; anchor: DOMRect } | null>(null);
	let quickPopover = $state<{ sel: RangeSelection; anchor: DOMRect } | null>(null);

	// Pending “edit recurring event” confirmation after a drag/resize.
	let seriesConfirm = $state<{
		instance: EventInstance;
		start: Date;
		end: Date;
		allDay: boolean;
		anchor: DOMRect;
		resourceId?: string;
	} | null>(null);

	function confirmSeriesDetach() {
		if (!seriesConfirm) return;
		const { instance, start, end, allDay, resourceId } = seriesConfirm;
		seriesConfirm = null;
		const target = events.find((ev) => ev.id === instance.event.id);
		if (!target) return;
		const { series, detached } = detachOccurrence(
			target,
			toReal(instance.start),
			{ start: toReal(start), end: toReal(end), allDay },
			crypto.randomUUID()
		);
		if (resourceId !== undefined) detached.resourceId = resourceId;
		events = [...events.map((ev) => (ev === target ? series : ev)), detached];
		onSeriesDetach?.({ series, detached, occurrence: toReal(instance.start) });
		announceChange(detached.title, start, allDay);
	}

	function confirmSeriesSplit() {
		if (!seriesConfirm) return;
		const { instance, start, end, allDay, resourceId } = seriesConfirm;
		seriesConfirm = null;
		const target = events.find((ev) => ev.id === instance.event.id);
		if (!target) return;
		const { truncated, created } = splitSeries(
			target,
			toReal(instance.start),
			{ start: toReal(start), end: toReal(end), allDay },
			crypto.randomUUID()
		);
		if (resourceId !== undefined) created.resourceId = resourceId;
		events = truncated
			? [...events.map((ev) => (ev === target ? truncated : ev)), created]
			: events.map((ev) => (ev === target ? created : ev));
		onSeriesSplit?.({ truncated, created, occurrence: toReal(instance.start) });
		announceChange(created.title, start, allDay);
	}

	/** True when a timed range would collide with another visible timed event. */
	function violatesOverlap(start: Date, end: Date, allDay: boolean, excludeId?: string): boolean {
		if (eventOverlap || allDay) return false;
		return instances.some(
			(i) =>
				!i.allDay
					&& i.event.id !== excludeId
					&& i.start.getTime() < end.getTime()
					&& start.getTime() < i.end.getTime()
		);
	}

	function announceChange(title: string, start: Date, allDay: boolean) {
		announce(`${title}: ${fm.dayTitle(start)}${allDay ? '' : ` ${fm.time(start)}`}`);
	}

	function applyTimes(
		instance: EventInstance,
		start: Date,
		end: Date,
		allDay?: boolean,
		anchor?: DOMRect,
		resourceId?: string
	) {
		if (!isDayAllowed(startOfDay(start))) return;
		if (violatesOverlap(start, end, allDay ?? instance.allDay, instance.event.id)) return;
		if (instance.isRecurring) {
			// Editing one occurrence needs a decision — confirm before applying.
			const fallback = new DOMRect(window.innerWidth / 2, window.innerHeight / 2, 1, 1);
			detailsPopover = null;
			quickPopover = null;
			seriesConfirm = {
				instance,
				start,
				end,
				allDay: allDay ?? instance.allDay,
				anchor: anchor ?? fallback,
				resourceId
			};
			return;
		}
		const target = events.find((ev) => ev.id === instance.event.id);
		if (!target) return;
		const oldStart = target.start;
		const oldEnd = target.end;
		const oldAllDay = target.allDay ?? false;
		const oldResourceId = target.resourceId;
		const nextAllDay = allDay ?? oldAllDay;
		const realStart = toReal(start);
		const realEnd = toReal(end);
		const nextResourceId = resourceId ?? oldResourceId;
		if (
			oldStart.getTime() === realStart.getTime()
			&& oldEnd.getTime() === realEnd.getTime()
			&& oldAllDay === nextAllDay
			&& oldResourceId === nextResourceId
		) {
			return;
		}
		const updated: CalendarEvent = {
			...target,
			start: realStart,
			end: realEnd,
			allDay: nextAllDay,
			...(nextResourceId !== undefined ? { resourceId: nextResourceId } : {})
		};
		events = events.map((ev) => (ev === target ? updated : ev));
		announceChange(updated.title, start, nextAllDay);
		onEventChange?.({
			event: updated,
			oldStart,
			oldEnd,
			start: realStart,
			end: realEnd,
			allDay: nextAllDay,
			...(resourceId !== undefined ? { resourceId: nextResourceId, oldResourceId } : {}),
			revert: () => {
				events = events.map((ev) =>
					ev.id === updated.id
						? { ...ev, start: oldStart, end: oldEnd, allDay: oldAllDay, resourceId: oldResourceId }
						: ev
				);
			}
		});
	}

	function createEvent(data: Omit<CalendarEvent, 'id'> & { id?: string }) {
		if (!isDayAllowed(startOfDay(data.start))) return;
		if (violatesOverlap(data.start, data.end, data.allDay ?? false)) return;
		const event: CalendarEvent = {
			id: data.id ?? crypto.randomUUID(),
			...data,
			start: toReal(data.start),
			end: toReal(data.end)
		};
		events = [...events, event];
		onEventCreate?.(event);
		announceChange(event.title, data.start, data.allDay ?? false);
	}

	function deleteEvent(instance: EventInstance) {
		const target = events.find((ev) => ev.id === instance.event.id);
		if (!target) return;
		events = events.filter((ev) => ev !== target);
		onEventDelete?.(target);
	}

	function deleteOccurrence(instance: EventInstance) {
		const target = events.find((ev) => ev.id === instance.event.id);
		if (!target) return;
		const occurrence = toReal(instance.start);
		const updated = excludeOccurrence(target, occurrence);
		events = events.map((ev) => (ev === target ? updated : ev));
		onEventDelete?.(updated, occurrence);
	}

	function handleEventClick(instance: EventInstance, e: MouseEvent | KeyboardEvent) {
		if (onEventClick) {
			onEventClick(instance, e);
			return;
		}
		if (!eventDetails) return;
		const anchor = (e.currentTarget as HTMLElement | null)?.getBoundingClientRect();
		if (anchor) {
			quickPopover = null;
			detailsPopover = { instance, anchor };
		}
	}

	function handleSelect(sel: RangeSelection, anchor?: DOMRect) {
		if (!isDayAllowed(startOfDay(sel.start))) return;
		if (onSelect) {
			onSelect(sel);
			return;
		}
		if (quickCreate && anchor) {
			detailsPopover = null;
			quickPopover = { sel, anchor };
		}
	}

	function handleDateClick(d: Date, allDay: boolean, anchor?: DOMRect) {
		if (!isDayAllowed(startOfDay(d))) return;
		if (onDateClick) {
			onDateClick(d, allDay);
			return;
		}
		// Quick-create is available on any calendar the user may write to.
		if (!(selectable || editable) || !quickCreate || !anchor) return;
		const sel: RangeSelection = allDay
			? { start: startOfDay(d), end: endOfDay(d), allDay: true }
			: { start: d, end: addMinutes(d, Math.max(slotDuration * 2, 30)), allDay: false };
		detailsPopover = null;
		quickPopover = { sel, anchor };
	}

	const ctx: CalendarContext = {
		get date() {
			return date;
		},
		get view() {
			return view;
		},
		get events() {
			return events;
		},
		get sources() {
			return sources;
		},
		get resources() {
			return resources;
		},
		get locale() {
			return locale;
		},
		get messages() {
			return msgs;
		},
		get fmt() {
			return fm;
		},
		get firstDayOfWeek() {
			return fdow;
		},
		get weekends() {
			return weekends;
		},
		get weekNumbers() {
			return weekNumbers;
		},
		get fixedWeeks() {
			return fixedWeeks;
		},
		get dayMaxEvents() {
			return dayMaxEvents;
		},
		get slotDuration() {
			return slotDuration;
		},
		get snapDuration() {
			return snapDuration;
		},
		get dayStartHour() {
			return dayStartHour;
		},
		get dayEndHour() {
			return dayEndHour;
		},
		get hourHeight() {
			return hourHeight;
		},
		get scrollToHour() {
			return scrollToHour;
		},
		get businessHours() {
			return resolvedBusinessHours;
		},
		get editable() {
			return editable;
		},
		get selectable() {
			return selectable;
		},
		get agendaDays() {
			return agendaDays;
		},
		get nowIndicator() {
			return nowIndicator;
		},
		get quickCreate() {
			return quickCreate;
		},
		get eventDetails() {
			return eventDetails;
		},
		get timeZone() {
			return timeZone;
		},
		get validRange() {
			return validRange ?? null;
		},
		get eventOverlap() {
			return eventOverlap;
		},
		now,
		isDayAllowed,
		announce,
		get visibleDays() {
			return visibleDays;
		},
		get instances() {
			return instances;
		},
		setDate,
		setView,
		navigate,
		goToday,
		canEdit,
		applyTimes,
		select: handleSelect,
		clickEvent: handleEventClick,
		clickDate: handleDateClick,
		createEvent,
		deleteEvent,
		deleteOccurrence,
		get onEventClick() {
			return onEventClick;
		},
		get onDateClick() {
			return onDateClick;
		},
		get onSelect() {
			return onSelect;
		},
		get onEventChange() {
			return onEventChange;
		},
		get eventContent() {
			return eventContent;
		}
	};
	setCalendarContext(ctx);
</script>

<div
	class="s5c {theme === 'dark'
		? 's5c-dark'
		: theme === 'auto'
		? 's5c-auto'
		: theme === 'light'
		? ''
		: 's5c-inherit'} {className}"
	role="application"
	aria-label="Calendar"
>
	{#if header}
		<Toolbar {title} {views} {toolbarEnd} />
	{/if}
	{#if view === 'month'}
		<MonthView />
	{:else if view === 'week' || view === 'day'}
		<TimeGrid />
	{:else if view === 'resources'}
		<ResourceView />
	{:else if view === 'year'}
		<YearView />
	{:else if view === 'agenda'}
		<AgendaView />
	{/if}
	<div class="s5c-sr-only" aria-live="polite">{announcement}</div>
	{#if detailsPopover}
		<EventDetails
			instance={detailsPopover.instance}
			anchor={detailsPopover.anchor}
			onclose={() => (detailsPopover = null)}
		/>
	{/if}
	{#if quickPopover}
		<QuickCreate
			sel={quickPopover.sel}
			anchor={quickPopover.anchor}
			onclose={() => (quickPopover = null)}
		/>
	{/if}
	{#if seriesConfirm}
		<SeriesConfirm
			anchor={seriesConfirm.anchor}
			onconfirm={confirmSeriesDetach}
			onsplit={confirmSeriesSplit}
			onclose={() => (seriesConfirm = null)}
		/>
	{/if}
</div>
