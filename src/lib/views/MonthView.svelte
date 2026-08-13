<script lang="ts">
	import type { EventInstance } from '../types.js';
	import { getCalendarContext } from '../context.js';
	import { layoutWeekRow } from '../layout.js';
	import { isAllDayLike } from '../instances.js';
	import {
		addDays,
		dayKey,
		daysBetween,
		endOfDay,
		isSameDay,
		isSameMonth,
		isoWeek,
		maxDate,
		minDate,
		overlaps,
		startOfDay
	} from '../date.js';
	import EventItem from '../EventItem.svelte';
	import MorePopover from '../MorePopover.svelte';

	const ctx = getCalendarContext();

	const HEADER_H = 30; // px reserved for the day number
	const ROW_H = 22; // px per event row

	const cols = $derived(ctx.weekends ? 7 : 5);
	const weeks = $derived.by(() => {
		const out: Date[][] = [];
		for (let i = 0; i < ctx.visibleDays.length; i += cols) {
			out.push(ctx.visibleDays.slice(i, i + cols));
		}
		return out;
	});

	const weekLayouts = $derived(
		weeks.map((days) => {
			const weekStart = days[0];
			const weekEnd = endOfDay(days[days.length - 1]);
			const inWeek = ctx.instances.filter((i) => overlaps(i.start, i.end, weekStart, weekEnd));
			return layoutWeekRow(inWeek, days, ctx.dayMaxEvents);
		})
	);

	const gridCols = $derived(
		(ctx.weekNumbers ? '44px ' : '') + `repeat(${cols}, minmax(0, 1fr))`
	);
	const eventsInset = $derived(ctx.weekNumbers ? '44px' : '0px');

	// ---- "+N more" popover -------------------------------------------------
	let more = $state<{ day: Date; anchor: DOMRect } | null>(null);

	function openMore(day: Date, e: MouseEvent) {
		more = { day, anchor: (e.currentTarget as HTMLElement).getBoundingClientRect() };
	}
	const moreInstances = $derived.by(() => {
		if (!more) return [];
		const s = more.day;
		const e = endOfDay(more.day);
		return ctx.instances
			.filter((i) => overlaps(i.start, i.end, s, e))
			.sort((a, b) => Number(isAllDayLike(b)) - Number(isAllDayLike(a)));
	});

	// ---- drag: move event across days / drag-select a day range -------------
	// Mouse drags start immediately; touch drags require a ~300 ms long-press
	// so swipes keep scrolling the page (see TimeGrid for the same pattern).
	interface DragBase {
		activated: boolean;
		startX: number;
		startY: number;
	}
	type DragData =
		| { kind: 'event'; instance: EventInstance; moved: boolean; overDay: Date | null }
		| { kind: 'select'; anchor: Date; head: Date; moved: boolean };
	type Drag = DragBase & DragData;
	let drag = $state<Drag | null>(null);

	const LONG_PRESS_MS = 300;
	const TOUCH_SLOP_PX = 10;
	let pressTimer: ReturnType<typeof setTimeout> | null = null;

	const preventTouchScroll = (e: TouchEvent) => e.preventDefault();
	function blockTouchScroll() {
		window.addEventListener('touchmove', preventTouchScroll, { passive: false });
	}
	function unblockTouchScroll() {
		window.removeEventListener('touchmove', preventTouchScroll);
	}

	function beginDrag(e: PointerEvent, data: DragData) {
		const base: DragBase = {
			activated: e.pointerType === 'mouse' || e.pointerType === '',
			startX: e.clientX,
			startY: e.clientY
		};
		drag = { ...base, ...data };
		if (!base.activated) {
			pressTimer = setTimeout(() => {
				if (drag && !drag.activated) {
					drag = { ...drag, activated: true };
					blockTouchScroll();
					navigator.vibrate?.(10);
				}
			}, LONG_PRESS_MS);
		}
	}

	function cancelDrag() {
		if (pressTimer) clearTimeout(pressTimer);
		pressTimer = null;
		unblockTouchScroll();
		drag = null;
	}

	$effect(() => () => cancelDrag());

	let rootEl = $state<HTMLElement>();
	let bodyEl = $state<HTMLDivElement>();

	// Keep the weekday header aligned with the (scrollable) body when a classic
	// scrollbar consumes width — compensate with a transparent border.
	let scrollbarW = $state(0);
	$effect(() => {
		if (!bodyEl) return;
		const el = bodyEl;
		const measure = () => (scrollbarW = el.offsetWidth - el.clientWidth);
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(el);
		return () => ro.disconnect();
	});

	/**
	 * Geometric hit test over the day cells. (`document.elementFromPoint` would
	 * miss whenever the pointer is over an event bar in the overlay layer.)
	 */
	function dayFromPoint(x: number, y: number): Date | null {
		if (!rootEl) return null;
		for (const el of rootEl.querySelectorAll<HTMLElement>('[data-s5c-day]')) {
			const r = el.getBoundingClientRect();
			if (x >= r.left && x < r.right && y >= r.top && y < r.bottom) {
				const [yy, mm, dd] = el.dataset.s5cDay!.split('-').map(Number);
				return new Date(yy, mm - 1, dd);
			}
		}
		return null;
	}

	function suppressNextClick() {
		// Swallow the compat click that follows pointerup on the drag's target.
		// Removed on a timeout too: when the drag ends over a different element
		// no click fires at all, and the suppressor must not eat the next one.
		const handler = (e: MouseEvent) => e.stopPropagation();
		window.addEventListener('click', handler, { capture: true });
		setTimeout(() => window.removeEventListener('click', handler, { capture: true }), 0);
	}

	function onSegPointerDown(instance: EventInstance) {
		return (e: PointerEvent) => {
			e.stopPropagation();
			if (!ctx.canEdit(instance) || e.button !== 0) return;
			beginDrag(e, { kind: 'event', instance, moved: false, overDay: null });
		};
	}

	function onCellPointerDown(day: Date) {
		return (e: PointerEvent) => {
			if (e.button !== 0 || !ctx.isDayAllowed(day)) return;
			if (ctx.selectable || (ctx.editable && ctx.quickCreate)) {
				beginDrag(e, { kind: 'select', anchor: day, head: day, moved: false });
			}
		};
	}

	function onPointerMove(e: PointerEvent) {
		if (!drag) return;
		if (!drag.activated) {
			// Long-press pending: a real swipe means the user wants to scroll.
			if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > TOUCH_SLOP_PX) {
				cancelDrag();
			}
			return;
		}
		const day = dayFromPoint(e.clientX, e.clientY);
		if (!day) return;
		if (drag.kind === 'event') {
			if (!drag.overDay || !isSameDay(drag.overDay, day)) {
				drag = { ...drag, overDay: day, moved: true };
			}
		} else {
			if (!isSameDay(drag.head, day)) {
				drag = { ...drag, head: day, moved: true };
			}
		}
	}

	function onPointerUp() {
		if (!drag) return;
		const d = drag;
		cancelDrag();
		// A touch tap released before the long-press: the native click event
		// on the cell/event handles it.
		if (!d.activated) return;
		if (d.kind === 'event') {
			if (!d.moved || !d.overDay) return; // plain click → EventItem's onclick handles it
			suppressNextClick();
			const delta = daysBetween(startOfDay(d.instance.start), d.overDay);
			if (delta !== 0) {
				const overCell = rootEl?.querySelector(`[data-s5c-day="${dayKey(d.overDay)}"]`);
				ctx.applyTimes(
					d.instance,
					addDays(d.instance.start, delta),
					addDays(d.instance.end, delta),
					d.instance.allDay,
					overCell?.getBoundingClientRect()
				);
			}
		} else if (d.moved) {
			suppressNextClick();
			const start = minDate(d.anchor, d.head);
			const end = endOfDay(maxDate(d.anchor, d.head));
			const headCell = rootEl?.querySelector(`[data-s5c-day="${dayKey(d.head)}"]`);
			ctx.select({ start, end, allDay: true }, headCell?.getBoundingClientRect());
		}
	}

	function onPointerCancel() {
		cancelDrag();
	}

	function cellHighlighted(day: Date): boolean {
		if (!drag) return false;
		if (drag.kind === 'event') return !!drag.overDay && isSameDay(drag.overDay, day);
		const lo = minDate(drag.anchor, drag.head);
		const hi = maxDate(drag.anchor, drag.head);
		return day.getTime() >= lo.getTime() && day.getTime() <= hi.getTime();
	}

	// ---- keyboard navigation -------------------------------------------------
	let focusIdx = $state(-1);
	const today = $derived(ctx.now());
	const todayIdx = $derived(ctx.visibleDays.findIndex((d) => isSameDay(d, today)));
	const tabIdx = $derived(focusIdx >= 0 ? focusIdx : todayIdx >= 0 ? todayIdx : 0);

	function onCellKeydown(idx: number, day: Date) {
		return (e: KeyboardEvent) => {
			let next = -1;
			if (e.key === 'ArrowRight') next = idx + 1;
			else if (e.key === 'ArrowLeft') next = idx - 1;
			else if (e.key === 'ArrowDown') next = idx + cols;
			else if (e.key === 'ArrowUp') next = idx - cols;
			else if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				ctx.clickDate(day, true, (e.currentTarget as HTMLElement).getBoundingClientRect());
				return;
			} else return;
			e.preventDefault();
			if (next < 0 || next >= ctx.visibleDays.length) return;
			focusIdx = next;
			const el = document.querySelector<HTMLElement>(
				`[data-s5c-day="${dayKey(ctx.visibleDays[next])}"]`
			);
			el?.focus();
		};
	}

	function onDayNumClick(day: Date) {
		return (e: MouseEvent) => {
			e.stopPropagation();
			ctx.setDate(day);
			ctx.setView('day');
		};
	}
</script>

<svelte:window
	onpointermove={onPointerMove}
	onpointerup={onPointerUp}
	onpointercancel={onPointerCancel}
/>

<div class="s5c-month" bind:this={rootEl}>
	<div
		class="s5c-month-head"
		style="grid-template-columns:{gridCols}; border-right:{scrollbarW}px solid transparent"
	>
		{#if ctx.weekNumbers}
			<div class="s5c-month-head-cell"></div>
		{/if}
		{#each weeks[0] as day (dayKey(day))}
			<div class="s5c-month-head-cell">{ctx.fmt.weekdayShort(day)}</div>
		{/each}
	</div>
	<div
		class="s5c-month-body"
		bind:this={bodyEl}
		role="grid"
		aria-label={ctx.fmt.monthTitle(ctx.date)}
	>
		{#each weeks as days, w (dayKey(days[0]))}
			{@const layout = weekLayouts[w]}
			{@const visibleRows = Math.min(layout.usedRows, ctx.dayMaxEvents)}
			<div
				class="s5c-month-week"
				role="row"
				style="grid-template-columns:{gridCols}; min-height:{HEADER_H +
					Math.max(visibleRows, 2) * ROW_H +
					4}px"
			>
				{#if ctx.weekNumbers}
					<div class="s5c-month-cell s5c-weekno" style="padding-top:8px">
						{ctx.messages.weekNo(isoWeek(days[0]))}
					</div>
				{/if}
				{#each days as day, c (dayKey(day))}
					{@const idx = w * cols + c}
					<div
						class="s5c-month-cell"
						class:s5c-other-month={!isSameMonth(day, ctx.date)}
						class:s5c-is-today={isSameDay(day, today)}
						class:s5c-drag-over={cellHighlighted(day)}
						class:s5c-disabled={!ctx.isDayAllowed(day)}
						role="gridcell"
						aria-label={ctx.fmt.dayTitle(day)}
						tabindex={idx === tabIdx ? 0 : -1}
						data-s5c-day={dayKey(day)}
						onpointerdown={onCellPointerDown(day)}
						onclick={(e) =>
							ctx.clickDate(day, true, (e.currentTarget as HTMLElement).getBoundingClientRect())}
						onkeydown={onCellKeydown(idx, day)}
					>
						<span
							class="s5c-daynum"
							class:s5c-is-today={isSameDay(day, today)}
							role="button"
							tabindex="-1"
							onclick={onDayNumClick(day)}
							onkeydown={() => {}}
						>
							{day.getDate() === 1 ? `${ctx.fmt.monthShort(day)} ${day.getDate()}` : day.getDate()}
						</span>
					</div>
				{/each}
				<div class="s5c-month-events" style="left:{eventsInset}; top:{HEADER_H}px">
					{#each layout.segments as seg (seg.instance.key)}
						<div
							class="s5c-seg"
							class:s5c-dragging={drag?.kind === 'event' &&
								drag.instance.key === seg.instance.key &&
								drag.moved}
							style="top:{seg.row * ROW_H}px; left:{(seg.startCol / cols) * 100}%; width:{(seg.span /
								cols) *
								100}%"
						>
							<EventItem
								instance={seg.instance}
								continuesBefore={seg.continuesBefore}
								continuesAfter={seg.continuesAfter}
								onpointerdown={onSegPointerDown(seg.instance)}
							/>
						</div>
					{/each}
					{#each layout.hiddenCounts as hidden, c (c)}
						{#if hidden > 0}
							<button
								type="button"
								class="s5c-more-link"
								style="top:{(ctx.dayMaxEvents - 1) * ROW_H}px; left:{(c / cols) *
									100}%; width:{(1 / cols) * 100}%"
								onpointerdown={(e) => e.stopPropagation()}
								onclick={(e) => {
									e.stopPropagation();
									openMore(days[c], e);
								}}
							>
								{ctx.messages.more(hidden)}
							</button>
						{/if}
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

{#if more}
	<MorePopover
		day={more.day}
		instances={moreInstances}
		anchor={more.anchor}
		onclose={() => (more = null)}
	/>
{/if}
