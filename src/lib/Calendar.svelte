<script lang="ts">
	import type { Snippet } from 'svelte';
	import type {
		BusinessHours,
		CalendarEvent,
		CalendarSource,
		CalendarView,
		EventChangeInfo,
		EventInstance,
		RangeSelection,
		Weekday
	} from './types.js';
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
	import { expandEvents } from './instances.js';
	import { formatters, localeFirstDay, messagesForLocale, type CalendarMessages } from './i18n.js';
	import { setCalendarContext, type CalendarContext } from './context.js';
	import Toolbar from './Toolbar.svelte';
	import MonthView from './views/MonthView.svelte';
	import TimeGrid from './views/TimeGrid.svelte';
	import YearView from './views/YearView.svelte';
	import AgendaView from './views/AgendaView.svelte';
	import EventDetails from './EventDetails.svelte';
	import QuickCreate from './QuickCreate.svelte';

	interface Props {
		/** Event list. Bindable — the calendar updates it after drag/resize edits. */
		events?: CalendarEvent[];
		/** The focused date. Bindable. */
		date?: Date;
		/** Current view. Bindable. */
		view?: CalendarView;
		/** Event sources/groups (colors, visibility). */
		sources?: CalendarSource[];
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
		 * Built-in quick-create popover when clicking/drag-selecting empty space
		 * (requires `selectable`; skipped when `onSelect`/`onDateClick` are provided).
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
		/** Fires after the built-in details popover (or `deleteEvent`) removes an event. */
		onEventDelete?: (event: CalendarEvent) => void;
		onViewChange?: (view: CalendarView) => void;
		onDateChange?: (date: Date) => void;
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
		onViewChange,
		onDateChange,
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
	const instances = $derived(expandEvents(events, rangeStart, rangeEnd, sources));

	const title = $derived.by(() => {
		switch (view) {
			case 'month':
				return fm.monthTitle(date);
			case 'week':
				return fm.range(rangeStart, addDays(rangeEnd, -1));
			case 'day':
				return fm.dayTitle(date);
			case 'year':
				return fm.yearTitle(date);
			case 'agenda':
				return fm.range(rangeStart, addDays(rangeEnd, -1));
		}
	});

	function setDate(d: Date) {
		date = d;
		onDateChange?.(d);
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
		setDate(new Date());
	}

	const sourceById = $derived(new Map(sources.map((s) => [s.id, s])));

	function canEdit(instance: EventInstance): boolean {
		if (!editable || instance.isRecurring) return false;
		if (instance.event.editable !== undefined) return instance.event.editable;
		const source = instance.event.calendarId
			? sourceById.get(instance.event.calendarId)
			: undefined;
		return source?.editable ?? true;
	}

	function applyTimes(instance: EventInstance, start: Date, end: Date, allDay?: boolean) {
		const target = events.find((ev) => ev.id === instance.event.id);
		if (!target) return;
		const oldStart = target.start;
		const oldEnd = target.end;
		const oldAllDay = target.allDay ?? false;
		const nextAllDay = allDay ?? oldAllDay;
		if (
			oldStart.getTime() === start.getTime() &&
			oldEnd.getTime() === end.getTime() &&
			oldAllDay === nextAllDay
		) {
			return;
		}
		const updated: CalendarEvent = { ...target, start, end, allDay: nextAllDay };
		events = events.map((ev) => (ev === target ? updated : ev));
		onEventChange?.({
			event: updated,
			oldStart,
			oldEnd,
			start,
			end,
			allDay: nextAllDay,
			revert: () => {
				events = events.map((ev) =>
					ev.id === updated.id ? { ...ev, start: oldStart, end: oldEnd, allDay: oldAllDay } : ev
				);
			}
		});
	}

	// ---- built-in popovers (details on event click, quick-create on selection) ----
	let detailsPopover = $state<{ instance: EventInstance; anchor: DOMRect } | null>(null);
	let quickPopover = $state<{ sel: RangeSelection; anchor: DOMRect } | null>(null);

	function createEvent(data: Omit<CalendarEvent, 'id'> & { id?: string }) {
		const event: CalendarEvent = { id: data.id ?? crypto.randomUUID(), ...data };
		events = [...events, event];
		onEventCreate?.(event);
	}

	function deleteEvent(instance: EventInstance) {
		const target = events.find((ev) => ev.id === instance.event.id);
		if (!target) return;
		events = events.filter((ev) => ev !== target);
		onEventDelete?.(target);
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
		if (onDateClick) {
			onDateClick(d, allDay);
			return;
		}
		if (!selectable || !quickCreate || !anchor) return;
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
	{:else if view === 'year'}
		<YearView />
	{:else if view === 'agenda'}
		<AgendaView />
	{/if}
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
</div>
