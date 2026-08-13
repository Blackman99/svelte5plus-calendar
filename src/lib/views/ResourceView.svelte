<script lang="ts">
	import type { EventInstance } from '../types.js';
	import { getCalendarContext, colorVars } from '../context.js';
	import { layoutDay, type TimedPlacement } from '../layout.js';
	import { isAllDayLike } from '../instances.js';
	import {
		floorToStep,
		isSameDay,
		minutesOfDay,
		roundToStep,
		withMinutesOfDay
	} from '../date.js';

	const ctx = getCalendarContext();

	const day = $derived(ctx.visibleDays[0]);
	const cols = $derived(ctx.resources);
	const n = $derived(Math.max(cols.length, 1));
	const startMin = $derived(ctx.dayStartHour * 60);
	const endMin = $derived(ctx.dayEndHour * 60);
	const totalH = $derived(((endMin - startMin) / 60) * ctx.hourHeight);
	const minToY = (min: number) => ((min - startMin) / 60) * ctx.hourHeight;

	const headerCols = $derived(`56px repeat(${n}, minmax(0,1fr))`);
	const bodyCols = $derived(`repeat(${n}, minmax(0,1fr))`);

	/** Timed instances of the day, laid out per resource column. */
	const byResource = $derived(
		cols.map((resource) => {
			const timed = ctx.instances.filter(
				(i) => !isAllDayLike(i) && i.event.resourceId === resource.id
			);
			return layoutDay(timed, day).filter((p) => p.endMin > startMin && p.startMin < endMin);
		})
	);

	const hours = $derived.by(() => {
		const out: number[] = [];
		for (let h = Math.ceil(ctx.dayStartHour); h <= Math.floor(ctx.dayEndHour); h++) out.push(h);
		return out;
	});

	function nonBusiness(): Array<[number, number]> {
		const bh = ctx.businessHours;
		if (!bh) return [];
		const workDays = bh.days ?? [1, 2, 3, 4, 5];
		if (!workDays.includes(day.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6)) return [[startMin, endMin]];
		const s = (bh.startHour ?? 9) * 60;
		const e = (bh.endHour ?? 17) * 60;
		const out: Array<[number, number]> = [];
		if (s > startMin) out.push([startMin, Math.min(s, endMin)]);
		if (e < endMin) out.push([Math.max(e, startMin), endMin]);
		return out;
	}

	let nowTick = $state(ctx.now());
	$effect(() => {
		if (!ctx.nowIndicator) return;
		const t = setInterval(() => (nowTick = ctx.now()), 30_000);
		return () => clearInterval(t);
	});

	let scrollEl = $state<HTMLDivElement>();
	let bodyEl = $state<HTMLDivElement>();
	$effect(() => {
		if (scrollEl) scrollEl.scrollTop = Math.max(0, minToY(ctx.scrollToHour * 60));
	});

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

	// ---- pointer interactions (same long-press pattern as TimeGrid) ----------
	interface DragBase {
		activated: boolean;
		startX: number;
		startY: number;
	}
	type DragData =
		| { kind: 'create'; colIdx: number; anchorMin: number; headMin: number; moved: boolean }
		| {
				kind: 'move';
				instance: EventInstance;
				grabOffsetMin: number;
				headColIdx: number;
				headMin: number;
				moved: boolean;
		  }
		| { kind: 'resize'; instance: EventInstance; colIdx: number; headMin: number; moved: boolean };
	type Drag = DragBase & DragData;
	let drag = $state<Drag | null>(null);

	const LONG_PRESS_MS = 300;
	const TOUCH_SLOP_PX = 10;
	let pressTimer: ReturnType<typeof setTimeout> | null = null;
	const preventTouchScroll = (e: TouchEvent) => e.preventDefault();

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
					window.addEventListener('touchmove', preventTouchScroll, { passive: false });
					navigator.vibrate?.(10);
				}
			}, LONG_PRESS_MS);
		}
	}

	function cancelDrag() {
		if (pressTimer) clearTimeout(pressTimer);
		pressTimer = null;
		window.removeEventListener('touchmove', preventTouchScroll);
		drag = null;
	}
	$effect(() => () => cancelDrag());

	function pointToColIdx(x: number): number {
		if (!bodyEl) return 0;
		const rect = bodyEl.getBoundingClientRect();
		return Math.max(0, Math.min(n - 1, Math.floor(((x - rect.left) / rect.width) * n)));
	}
	function pointToMin(y: number): number {
		if (!bodyEl) return startMin;
		const rect = bodyEl.getBoundingClientRect();
		return Math.max(startMin, Math.min(endMin, startMin + ((y - rect.top) / ctx.hourHeight) * 60));
	}
	function suppressNextClick() {
		const handler = (e: MouseEvent) => e.stopPropagation();
		window.addEventListener('click', handler, { capture: true });
		setTimeout(() => window.removeEventListener('click', handler, { capture: true }), 0);
	}

	function onColPointerDown(colIdx: number) {
		return (e: PointerEvent) => {
			if (e.button !== 0) return;
			if (!ctx.selectable && !(ctx.editable && ctx.quickCreate)) return;
			const min = floorToStep(pointToMin(e.clientY), ctx.snapDuration);
			beginDrag(e, {
				kind: 'create',
				colIdx,
				anchorMin: min,
				headMin: min + ctx.snapDuration,
				moved: false
			});
		};
	}

	function onBlockPointerDown(p: TimedPlacement, colIdx: number) {
		return (e: PointerEvent) => {
			e.stopPropagation();
			if (e.button !== 0 || !ctx.canEdit(p.instance)) return;
			beginDrag(e, {
				kind: 'move',
				instance: p.instance,
				grabOffsetMin: pointToMin(e.clientY) - minutesOfDay(p.instance.start),
				headColIdx: colIdx,
				headMin: pointToMin(e.clientY),
				moved: false
			});
		};
	}

	function onResizePointerDown(p: TimedPlacement, colIdx: number) {
		return (e: PointerEvent) => {
			e.stopPropagation();
			if (e.button !== 0 || !ctx.canEdit(p.instance)) return;
			beginDrag(e, { kind: 'resize', instance: p.instance, colIdx, headMin: p.endMin, moved: false });
		};
	}

	function onPointerMove(e: PointerEvent) {
		if (!drag) return;
		if (!drag.activated) {
			if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > TOUCH_SLOP_PX) cancelDrag();
			return;
		}
		if (drag.kind === 'create') {
			drag = {
				...drag,
				headMin: roundToStep(pointToMin(e.clientY), ctx.snapDuration),
				colIdx: pointToColIdx(e.clientX),
				moved: true
			};
		} else if (drag.kind === 'move') {
			drag = {
				...drag,
				headColIdx: pointToColIdx(e.clientX),
				headMin: pointToMin(e.clientY),
				moved: true
			};
		} else {
			drag = { ...drag, headMin: roundToStep(pointToMin(e.clientY), ctx.snapDuration), moved: true };
		}
	}

	const dragResult = $derived.by(() => {
		if (!drag) return null;
		if (drag.kind === 'create') {
			const lo = Math.min(drag.anchorMin, drag.headMin);
			const hi = Math.max(drag.anchorMin, drag.headMin, lo + ctx.snapDuration);
			return {
				colIdx: drag.colIdx,
				start: withMinutesOfDay(day, lo),
				end: withMinutesOfDay(day, hi),
				startMin: lo,
				endMin: hi,
				color: null as string | null
			};
		}
		if (drag.kind === 'move') {
			const newStartMin = roundToStep(drag.headMin - drag.grabOffsetMin, ctx.snapDuration);
			const start = withMinutesOfDay(day, newStartMin);
			const durMs = drag.instance.end.getTime() - drag.instance.start.getTime();
			return {
				colIdx: drag.headColIdx,
				start,
				end: new Date(start.getTime() + durMs),
				startMin: newStartMin,
				endMin: Math.min(newStartMin + durMs / 60_000, endMin),
				color: drag.instance.color
			};
		}
		const effStart = minutesOfDay(drag.instance.start);
		const newEndMin = Math.max(drag.headMin, effStart + ctx.snapDuration);
		return {
			colIdx: drag.colIdx,
			start: drag.instance.start,
			end: withMinutesOfDay(day, newEndMin),
			startMin: effStart,
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
			if (d.kind === 'create') {
				ctx.clickDate(withMinutesOfDay(day, d.anchorMin), false, anchor);
			}
			return;
		}
		if (!d.moved || !result) {
			if (d.kind === 'create' && result) {
				// Plain click: quick-create pre-assigned to the clicked resource.
				ctx.select(
					{ start: result.start, end: result.end, allDay: false, resourceId: cols[d.kind === 'create' ? d.colIdx : 0]?.id },
					anchor
				);
			}
			return;
		}
		suppressNextClick();
		if (d.kind === 'create') {
			ctx.select(
				{ start: result.start, end: result.end, allDay: false, resourceId: cols[result.colIdx]?.id },
				anchor
			);
		} else if (d.kind === 'move') {
			ctx.applyTimes(
				d.instance,
				result.start,
				result.end,
				false,
				anchor,
				cols[result.colIdx]?.id
			);
		} else {
			ctx.applyTimes(d.instance, result.start, result.end, false, anchor);
		}
	}

	function onPointerCancel() {
		cancelDrag();
	}

	const draggingKey = $derived(
		drag && drag.moved && (drag.kind === 'move' || drag.kind === 'resize')
			? drag.instance.key
			: null
	);
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
		<div class="s5c-tg-gutter"></div>
		{#each cols as resource (resource.id)}
			<div class="s5c-tg-head-day s5c-resource-head" style={colorVars(resource.color ?? 'blue')}>
				<span class="s5c-dot"></span>
				<span class="s5c-resource-name">{resource.name}</span>
			</div>
		{:else}
			<div class="s5c-tg-head-day"></div>
		{/each}
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

			{#each cols as resource, colIdx (resource.id)}
				<div
					class="s5c-tg-col"
					class:s5c-is-today={isSameDay(day, nowTick)}
					onpointerdown={onColPointerDown(colIdx)}
					role="presentation"
				>
					{#each nonBusiness() as [s, e] (s)}
						<div
							class="s5c-non-business-block"
							style="top:{minToY(s)}px; height:{minToY(e) - minToY(s)}px"
						></div>
					{/each}

					{#each byResource[colIdx] as p (p.instance.key)}
						{@const top = minToY(Math.max(p.startMin, startMin))}
						{@const height = Math.max(minToY(Math.min(p.endMin, endMin)) - top, 18)}
						{@const width = 100 / p.cols}
						<button
							type="button"
							class="s5c-block"
							class:s5c-dragging={draggingKey === p.instance.key}
							style="{colorVars(p.instance.color)} top:{top}px; height:{height}px; left:{p.col *
								width}%; width:calc({width}% - 3px); z-index:{5 + p.col}"
							aria-label={p.instance.event.title}
							onpointerdown={onBlockPointerDown(p, colIdx)}
							onclick={(e) => {
								e.stopPropagation();
								ctx.clickEvent(p.instance, e);
							}}
						>
							{#if ctx.eventContent}
								{@render ctx.eventContent(p.instance)}
							{:else}
								<span class="s5c-ev-title">{p.instance.event.title}</span>
								{#if height > 30}
									<span class="s5c-ev-time">
										{ctx.fmt.time(p.instance.start)} – {ctx.fmt.time(p.instance.end)}
									</span>
								{/if}
							{/if}
							{#if ctx.canEdit(p.instance)}
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<span
									class="s5c-resize-handle"
									aria-hidden="true"
									onpointerdown={onResizePointerDown(p, colIdx)}
								></span>
							{/if}
						</button>
					{/each}

					{#if dragResult && dragResult.colIdx === colIdx && drag?.moved}
						{#if drag.kind === 'create'}
							<div
								class="s5c-select-preview"
								style="top:{minToY(dragResult.startMin)}px; height:{minToY(dragResult.endMin) -
									minToY(dragResult.startMin)}px"
							>
								{ctx.fmt.time(dragResult.start)} – {ctx.fmt.time(dragResult.end)}
							</div>
						{:else}
							<div
								class="s5c-block s5c-preview"
								style="{colorVars(dragResult.color ?? 'blue')} top:{minToY(
									Math.max(dragResult.startMin, startMin)
								)}px; height:{Math.max(
									minToY(Math.min(dragResult.endMin, endMin)) -
										minToY(Math.max(dragResult.startMin, startMin)),
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

					{#if ctx.nowIndicator && isSameDay(day, nowTick) && minutesOfDay(nowTick) >= startMin && minutesOfDay(nowTick) <= endMin}
						<div class="s5c-now-line" style="top:{minToY(minutesOfDay(nowTick))}px"></div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>
