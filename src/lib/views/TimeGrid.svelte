<script lang="ts">
	import type { TimedPlacement } from '../layout.js';
	import type { EventInstance } from '../types.js';
	import { colorVars, getCalendarContext } from '../context.js';
	import {
		addDays,
		dayKey,
		daysBetween,
		floorToStep,
		isoWeek,
		isSameDay,
		minutesOfDay,
		roundToStep,
		withMinutesOfDay
	} from '../date.js';
	import EventItem from '../EventItem.svelte';
	import { isAllDayLike } from '../instances.js';
	import { layoutDay, layoutWeekRow } from '../layout.js';

	const ctx = getCalendarContext();

	const days = $derived(ctx.visibleDays);
	const n = $derived(days.length);
	const startMin = $derived(ctx.dayStartHour * 60);
	const endMin = $derived(ctx.dayEndHour * 60);
	const totalH = $derived(((endMin - startMin) / 60) * ctx.hourHeight);
	const minToY = (min: number) => ((min - startMin) / 60) * ctx.hourHeight;

	const headerCols = $derived(`56px repeat(${n}, minmax(0,1fr))`);
	const bodyCols = $derived(`repeat(${n}, minmax(0,1fr))`);

	// ---- instances --------------------------------------------------------
	const allDayLike = $derived(ctx.instances.filter(isAllDayLike));
	const allDayLayout = $derived(layoutWeekRow(allDayLike, days, Infinity));
	const allDayLaneH = $derived(Math.max(allDayLayout.usedRows, 1) * 24 + 4);

	const timedByDay = $derived.by(() => {
		// Single pass: bucket each timed instance into the day column(s) it
		// overlaps (by day index) instead of re-filtering all instances per day.
		const buckets: EventInstance[][] = days.map(() => []);
		const firstDay = days[0];
		for (const i of ctx.instances) {
			if (isAllDayLike(i)) continue;
			const sIdx = Math.max(0, daysBetween(firstDay, i.start));
			const eIdx = Math.min(n - 1, daysBetween(firstDay, new Date(i.end.getTime() - 1)));
			if (sIdx > eIdx) continue;
			for (let d = sIdx; d <= eIdx; d++) buckets[d].push(i);
		}
		return buckets.map((timed, d) =>
			layoutDay(timed, days[d]).filter((p) => p.endMin > startMin && p.startMin < endMin)
		);
	});

	// ---- hour ruler --------------------------------------------------------
	const hours = $derived.by(() => {
		const out: number[] = [];
		for (let h = Math.ceil(ctx.dayStartHour); h <= Math.floor(ctx.dayEndHour); h++) out.push(h);
		return out;
	});
	const minorLines = $derived.by(() => {
		const out: number[] = [];
		if (ctx.slotDuration >= 60) return out;
		for (let m = startMin; m < endMin; m += ctx.slotDuration) {
			if (m % 60 !== 0) out.push(m);
		}
		return out;
	});

	// ---- business hours -----------------------------------------------------
	function nonBusiness(day: Date): Array<[number, number]> {
		const bh = ctx.businessHours;
		if (!bh) return [];
		const workDays = bh.days ?? [1, 2, 3, 4, 5];
		if (!workDays.includes(day.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6)) {
			return [[startMin, endMin]];
		}
		const s = (bh.startHour ?? 9) * 60;
		const e = (bh.endHour ?? 17) * 60;
		const out: Array<[number, number]> = [];
		if (s > startMin) out.push([startMin, Math.min(s, endMin)]);
		if (e < endMin) out.push([Math.max(e, startMin), endMin]);
		return out;
	}

	// ---- now indicator --------------------------------------------------------
	let now = $state(ctx.now());
	$effect(() => {
		now = ctx.now();
		if (!ctx.nowIndicator) return;
		const t = setInterval(() => (now = ctx.now()), 30_000);
		return () => clearInterval(t);
	});

	// ---- scroll to initial hour --------------------------------------------
	let scrollEl = $state<HTMLDivElement>();
	let bodyEl = $state<HTMLDivElement>();
	$effect(() => {
		if (scrollEl) {
			scrollEl.scrollTop = Math.max(0, minToY(ctx.scrollToHour * 60));
		}
	});

	// ---- scrollbar compensation ----------------------------------------------
	// With classic (space-consuming) scrollbars the body columns are narrower
	// than the header/all-day rows outside the scroll container. Pad those rows
	// with a transparent border matching the scrollbar width to keep columns
	// aligned. (Transparent border, not padding: the all-day events layer is
	// positioned against the padding box.)
	let scrollbarW = $state(0);
	$effect(() => {
		if (!scrollEl) return;
		const el = scrollEl;
		const measure = () => (scrollbarW = el.offsetWidth - el.clientWidth);
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(el);
		return () => ro.disconnect();
	});

	// ---- pointer interactions -------------------------------------------------
	// Mouse drags start immediately. Touch/pen drags start after a ~300 ms
	// long-press (`activated`); a swipe before activation cancels the drag so
	// native scrolling keeps working, and the browser's pointercancel is honored.
	interface DragBase {
		activated: boolean;
		startX: number;
		startY: number;
	}
	type DragData
		= | { kind: 'create'; dayIdx: number; anchorMin: number; headMin: number; moved: boolean }
			| {
				kind: 'move';
				instance: EventInstance;
				grabOffsetMin: number;
				headDayIdx: number;
				headMin: number;
				moved: boolean;
			}
			| { kind: 'resize'; instance: EventInstance; dayIdx: number; headMin: number; moved: boolean }
			| {
				kind: 'allday';
				instance: EventInstance;
				startDayIdx: number;
				headDayIdx: number;
				moved: boolean;
			};
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

	/** Starts a drag: immediately for mouse, after a long-press for touch/pen. */
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

	function pointToDayIdx(x: number): number {
		if (!bodyEl) return 0;
		const rect = bodyEl.getBoundingClientRect();
		return Math.max(0, Math.min(n - 1, Math.floor(((x - rect.left) / rect.width) * n)));
	}
	function pointToMin(y: number): number {
		if (!bodyEl) return startMin;
		const rect = bodyEl.getBoundingClientRect();
		const min = startMin + ((y - rect.top) / ctx.hourHeight) * 60;
		return Math.max(startMin, Math.min(endMin, min));
	}
	function suppressNextClick() {
		// Swallow the compat click that follows pointerup on the drag's target.
		// Removed on a timeout too: when the drag ends over a different element
		// no click fires at all, and the suppressor must not eat the next one.
		const handler = (e: MouseEvent) => e.stopPropagation();
		window.addEventListener('click', handler, { capture: true });
		setTimeout(() => window.removeEventListener('click', handler, { capture: true }), 0);
	}

	function onColPointerDown(dayIdx: number) {
		return (e: PointerEvent) => {
			if (e.button !== 0) return;
			if (!ctx.selectable && !(ctx.editable && ctx.quickCreate)) return;
			const min = floorToStep(pointToMin(e.clientY), ctx.snapDuration);
			beginDrag(e, {
				kind: 'create',
				dayIdx,
				anchorMin: min,
				headMin: min + ctx.snapDuration,
				moved: false
			});
		};
	}

	function onBlockPointerDown(p: TimedPlacement, dayIdx: number) {
		return (e: PointerEvent) => {
			e.stopPropagation();
			if (e.button !== 0 || !ctx.canEdit(p.instance)) return;
			const min = pointToMin(e.clientY);
			beginDrag(e, {
				kind: 'move',
				instance: p.instance,
				grabOffsetMin: min - minutesOfDay(p.instance.start),
				headDayIdx: dayIdx,
				headMin: min,
				moved: false
			});
		};
	}

	function onResizePointerDown(p: TimedPlacement, dayIdx: number) {
		return (e: PointerEvent) => {
			e.stopPropagation();
			if (e.button !== 0 || !ctx.canEdit(p.instance)) return;
			beginDrag(e, { kind: 'resize', instance: p.instance, dayIdx, headMin: p.endMin, moved: false });
		};
	}

	function onAllDayPointerDown(instance: EventInstance) {
		return (e: PointerEvent) => {
			e.stopPropagation();
			if (e.button !== 0 || !ctx.canEdit(instance)) return;
			const idx = pointToDayIdx(e.clientX);
			beginDrag(e, { kind: 'allday', instance, startDayIdx: idx, headDayIdx: idx, moved: false });
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
		if (drag.kind === 'allday') {
			const headDayIdx = pointToDayIdx(e.clientX);
			if (headDayIdx !== drag.headDayIdx || !drag.moved) {
				drag = { ...drag, headDayIdx, moved: true };
			}
			return;
		}
		if (drag.kind === 'create') {
			const min = roundToStep(pointToMin(e.clientY), ctx.snapDuration);
			const dayIdx = pointToDayIdx(e.clientX);
			if (min !== drag.headMin || dayIdx !== drag.dayIdx || !drag.moved) {
				drag = { ...drag, headMin: min, dayIdx, moved: true };
			}
		}
		else if (drag.kind === 'move') {
			drag = {
				...drag,
				headDayIdx: pointToDayIdx(e.clientX),
				headMin: pointToMin(e.clientY),
				moved: true
			};
		}
		else {
			drag = { ...drag, headMin: roundToStep(pointToMin(e.clientY), ctx.snapDuration), moved: true };
		}
	}

	/** Computed times for the in-flight drag (also drives the preview block). */
	const dragResult = $derived.by(() => {
		if (!drag || drag.kind === 'allday') return null;
		if (drag.kind === 'create') {
			const lo = Math.min(drag.anchorMin, drag.headMin);
			const hi = Math.max(drag.anchorMin, drag.headMin, lo + ctx.snapDuration);
			const day = days[drag.dayIdx];
			return {
				dayIdx: drag.dayIdx,
				start: withMinutesOfDay(day, lo),
				end: withMinutesOfDay(day, hi),
				startMin: lo,
				endMin: hi,
				color: null as string | null
			};
		}
		if (drag.kind === 'move') {
			const day = days[drag.headDayIdx];
			const newStartMin = roundToStep(drag.headMin - drag.grabOffsetMin, ctx.snapDuration);
			const start = withMinutesOfDay(day, newStartMin);
			const durMs = drag.instance.end.getTime() - drag.instance.start.getTime();
			const end = new Date(start.getTime() + durMs);
			return {
				dayIdx: drag.headDayIdx,
				start,
				end,
				startMin: newStartMin,
				endMin: Math.min(newStartMin + durMs / 60_000, endMin),
				color: drag.instance.color
			};
		}
		const day = days[drag.dayIdx];
		const startOfBlockMin = Math.max(
			minutesOfDay(drag.instance.start),
			isSameDay(drag.instance.start, day) ? 0 : startMin
		);
		const effStart = isSameDay(drag.instance.start, day)
			? minutesOfDay(drag.instance.start)
			: startMin;
		const newEndMin = Math.max(drag.headMin, effStart + ctx.snapDuration);
		return {
			dayIdx: drag.dayIdx,
			start: drag.instance.start,
			end: withMinutesOfDay(day, newEndMin),
			startMin: startOfBlockMin,
			endMin: newEndMin,
			color: drag.instance.color
		};
	});

	function onPointerUp(e: PointerEvent) {
		if (!drag) return;
		const d = drag;
		const result = dragResult;
		cancelDrag();
		const anchor = new DOMRect(e.clientX, e.clientY, 1, 1);
		if (!d.activated) {
			// A touch tap released before the long-press: treat it as a click.
			if (d.kind === 'create') {
				ctx.clickDate(withMinutesOfDay(days[d.dayIdx], d.anchorMin), false, anchor);
			}
			return;
		}
		if (d.kind === 'allday') {
			if (!d.moved) return; // plain click → EventItem's onclick handles it
			suppressNextClick();
			const delta = d.headDayIdx - d.startDayIdx;
			if (delta !== 0) {
				ctx.applyTimes(
					d.instance,
					addDays(d.instance.start, delta),
					addDays(d.instance.end, delta),
					true,
					anchor
				);
			}
			return;
		}
		if (!d.moved || !result) {
			if (d.kind === 'create' && result) {
				// Plain click on an empty slot.
				ctx.clickDate(result.start, false, anchor);
			}
			return;
		}
		suppressNextClick();
		if (d.kind === 'create') {
			ctx.select({ start: result.start, end: result.end, allDay: false }, anchor);
		}
		else {
			ctx.applyTimes(d.instance, result.start, result.end, d.instance.allDay, anchor);
		}
	}

	function onPointerCancel() {
		cancelDrag();
	}

	const draggingKey = $derived(
		drag
			&& drag.moved
			&& (drag.kind === 'move' || drag.kind === 'resize' || drag.kind === 'allday')
			? drag.instance.key
			: null
	);

	function headDayClick(day: Date) {
		return () => {
			ctx.setDate(day);
			ctx.setView('day');
		};
	}

	/**
	 * Keyboard editing on a focused event block:
	 * Alt+↑/↓ moves by the snap step, Alt+←/→ moves by a day,
	 * Alt+Shift+↑/↓ shrinks/grows the end time.
	 */
	function onBlockKeydown(p: TimedPlacement, dayIdx: number) {
		return (e: KeyboardEvent) => {
			if (!e.altKey || !ctx.canEdit(p.instance)) return;
			const { instance } = p;
			const anchor = (e.currentTarget as HTMLElement).getBoundingClientRect();
			const step = ctx.snapDuration * 60_000;
			let start = instance.start;
			let end = instance.end;
			if (e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
				end = new Date(end.getTime() + (e.key === 'ArrowDown' ? step : -step));
				if (end.getTime() - start.getTime() < step) return;
			}
			else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
				const delta = e.key === 'ArrowDown' ? step : -step;
				start = new Date(start.getTime() + delta);
				end = new Date(end.getTime() + delta);
			}
			else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
				const dayDelta = e.key === 'ArrowRight' ? 1 : -1;
				start = addDays(start, dayDelta);
				end = addDays(end, dayDelta);
				void dayIdx;
			}
			else {
				return;
			}
			e.preventDefault();
			ctx.applyTimes(instance, start, end, instance.allDay, anchor);
		};
	}
</script>

<svelte:window
	onpointermove={onPointerMove}
	onpointerup={onPointerUp}
	onpointercancel={onPointerCancel}
/>

<div class="s5c-timegrid">
	<div
		class="s5c-tg-header"
		style="grid-template-columns:{headerCols}; border-right:{scrollbarW}px solid transparent"
	>
		<div class="s5c-tg-gutter">
			{#if ctx.weekNumbers && n > 1}
				<div class="s5c-weekno" style="padding:8px 6px; text-align:right">
					{ctx.messages.weekNo(isoWeek(days[0]))}
				</div>
			{/if}
		</div>
		{#each days as day (dayKey(day))}
			<div class="s5c-tg-head-day" class:s5c-is-today={isSameDay(day, now)}>
				<div class="s5c-tg-head-weekday">{ctx.fmt.weekdayShort(day)}</div>
				{#if n > 1}
					<div
						class="s5c-tg-head-num"
						role="button"
						tabindex="0"
						onclick={headDayClick(day)}
						onkeydown={(e) => e.key === 'Enter' && headDayClick(day)()}
					>
						{day.getDate()}
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<div
		class="s5c-allday"
		style="grid-template-columns:{headerCols}; height:{allDayLaneH}px; border-right:{scrollbarW}px solid transparent"
	>
		<div class="s5c-allday-label">{ctx.messages.allDay}</div>
		{#each days as day, dayIdx (dayKey(day))}
			<div
				class="s5c-allday-cell"
				class:s5c-drag-over={drag?.kind === 'allday' && drag.moved && drag.headDayIdx === dayIdx}
				onclick={(e) =>
					ctx.clickDate(day, true, (e.currentTarget as HTMLElement).getBoundingClientRect())}
				role="button"
				tabindex="-1"
				onkeydown={() => {}}
			></div>
		{/each}
		<div class="s5c-allday-events" style="left:56px">
			{#each allDayLayout.segments as seg (seg.instance.key)}
				<div
					class="s5c-seg"
					class:s5c-dragging={draggingKey === seg.instance.key}
					style="top:{seg.row * 24}px; left:{(seg.startCol / n) * 100}%; width:{(seg.span / n)
						* 100}%"
				>
					<EventItem
						instance={seg.instance}
						kind="bar"
						continuesBefore={seg.continuesBefore}
						continuesAfter={seg.continuesAfter}
						onpointerdown={onAllDayPointerDown(seg.instance)}
					/>
				</div>
			{/each}
		</div>
	</div>

	<div class="s5c-tg-scroll" bind:this={scrollEl}>
		<div class="s5c-tg-times" style="height:{totalH}px">
			{#each hours as h (h)}
				{#if minToY(h * 60) > 6}
					<div class="s5c-tg-time-label" style="top:{minToY(h * 60)}px">
						{ctx.fmt.hour(new Date(2000, 0, 1, h % 24))}
					</div>
				{/if}
			{/each}
		</div>
		<div
			class="s5c-tg-body"
			bind:this={bodyEl}
			style="grid-template-columns:{bodyCols}; height:{totalH}px"
		>
			{#each hours as h (h)}
				{#if h * 60 > startMin && h * 60 < endMin}
					<div class="s5c-tg-hourline" style="top:{minToY(h * 60)}px"></div>
				{/if}
			{/each}
			{#each minorLines as m (m)}
				<div class="s5c-tg-halfline" style="top:{minToY(m)}px"></div>
			{/each}

			{#each days as day, dayIdx (dayKey(day))}
				<div
					class="s5c-tg-col"
					class:s5c-is-today={isSameDay(day, now)}
					data-s5c-col={dayIdx}
					onpointerdown={onColPointerDown(dayIdx)}
					role="presentation"
				>
					{#each nonBusiness(day) as [s, e] (s)}
						<div
							class="s5c-non-business-block"
							style="top:{minToY(s)}px; height:{minToY(e) - minToY(s)}px"
						></div>
					{/each}

					{#each timedByDay[dayIdx] as p (p.instance.key)}
						{@const top = minToY(Math.max(p.startMin, startMin))}
						{@const height = Math.max(
							minToY(Math.min(p.endMin, endMin)) - top,
							18
						)}
						{@const width = 100 / p.cols}
						<button
							type="button"
							class="s5c-block"
							class:s5c-dragging={draggingKey === p.instance.key}
							style="{colorVars(p.instance.color)} top:{top}px; height:{height}px; left:{p.col
								* width}%; width:calc({width}% - 3px); z-index:{5 + p.col}"
							aria-label={p.instance.event.title}
							aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown Alt+ArrowLeft Alt+ArrowRight"
							onpointerdown={onBlockPointerDown(p, dayIdx)}
							onkeydown={onBlockKeydown(p, dayIdx)}
							onclick={(e) => {
								e.stopPropagation();
								ctx.clickEvent(p.instance, e);
							}}
						>
							{#if ctx.eventContent}
								{@render ctx.eventContent(p.instance)}
							{:else}
								<span class="s5c-ev-title">
									{#if p.instance.isRecurring}<span class="s5c-recur-mark">↻</span>{/if}
									{p.instance.event.title}
								</span>
								{#if height > 30}
									<span class="s5c-ev-time">
										{ctx.fmt.time(p.instance.start)} – {ctx.fmt.time(p.instance.end)}
									</span>
								{/if}
							{/if}
							{#if ctx.canEdit(p.instance) && isSameDay(p.instance.end, day)}
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<span
									class="s5c-resize-handle"
									aria-hidden="true"
									onpointerdown={onResizePointerDown(p, dayIdx)}
								></span>
							{/if}
						</button>
					{/each}

					{#if dragResult && dragResult.dayIdx === dayIdx && drag?.moved}
						{#if drag.kind === 'create'}
							<div
								class="s5c-select-preview"
								style="top:{minToY(dragResult.startMin)}px; height:{minToY(dragResult.endMin)
									- minToY(dragResult.startMin)}px"
							>
								{ctx.fmt.time(dragResult.start)} – {ctx.fmt.time(dragResult.end)}
							</div>
						{:else}
							<div
								class="s5c-block s5c-preview"
								style="{colorVars(dragResult.color ?? 'blue')} top:{minToY(
									Math.max(dragResult.startMin, startMin)
								)}px; height:{Math.max(
									minToY(Math.min(dragResult.endMin, endMin))
										- minToY(Math.max(dragResult.startMin, startMin)),
									18
								)}px; left:0; width:calc(100% - 3px)"
							>
								<span class="s5c-ev-title">{drag.instance.event.title}</span>
								<span class="s5c-ev-time">
									{ctx.fmt.time(dragResult.start)} – {ctx.fmt.time(dragResult.end)}
								</span>
							</div>
						{/if}
					{/if}

					{#if ctx.nowIndicator && isSameDay(day, now) && minutesOfDay(now) >= startMin && minutesOfDay(now) <= endMin}
						<div class="s5c-now-line" style="top:{minToY(minutesOfDay(now))}px"></div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>
