<script lang="ts">
	import type { RangeSelection } from './types.js';
	import { untrack } from 'svelte';
	import { colorVars, getCalendarContext } from './context.js';
	import {
		addDays,
		applyDateInputValue,
		applyTimeInputValue,
		endOfDay,
		isSameDay,
		startOfDay,
		toDateInputValue,
		toTimeInputValue
	} from './date.js';
	import Popover from './Popover.svelte';

	interface Props {
		sel: RangeSelection;
		anchor: DOMRect;
		onclose: () => void;
	}
	const { sel, anchor, onclose }: Props = $props();

	const ctx = getCalendarContext();

	let title = $state('');
	const visibleSources = $derived(ctx.sources.filter((s) => s.visible !== false));
	let calendarId = $state<string | undefined>(undefined);
	const selectedSource = $derived(
		visibleSources.find((s) => s.id === (calendarId ?? visibleSources[0]?.id))
	);

	// ---- editable range ----------------------------------------------------
	// Bound to the native date/time inputs (24-hour / ISO values); the derived
	// `start`/`end` rebuild the view-zone `Date`s without snapping to any step,
	// so arbitrary minute values (9:07) survive.
	const s0 = untrack(() => sel.start);
	const e0 = untrack(() => sel.end);
	const ad0 = untrack(() => sel.allDay);
	let allDay = $state(ad0);
	let startDateStr = $state(toDateInputValue(s0));
	let startTimeStr = $state(toTimeInputValue(s0));
	let endDateStr = $state(
		ad0
			? toDateInputValue(new Date(e0.getTime() - 1))
			: toDateInputValue(e0)
	);
	let endTimeStr = $state(toTimeInputValue(e0));
	/** Last timed range, restored when all-day is switched back off. */
	let timedSnapshot = $state<{ start: Date; end: Date } | null>(null);

	const start = $derived.by(() => {
		const d = applyDateInputValue(s0, startDateStr) ?? s0;
		if (allDay) return startOfDay(d);
		return applyTimeInputValue(d, startTimeStr) ?? d;
	});
	const end = $derived.by(() => {
		const d = applyDateInputValue(e0, endDateStr) ?? e0;
		// All-day end is exclusive: the field shows the last inclusive day,
		// the stored value is the next midnight.
		if (allDay) return addDays(startOfDay(d), 1);
		return applyTimeInputValue(d, endTimeStr) ?? d;
	});
	const valid = $derived(
		allDay
			? endDateStr >= startDateStr // ISO strings compare lexicographically
			: end.getTime() > start.getTime()
	);

	function setStartTime(value: string) {
		const next = applyTimeInputValue(start, value);
		if (!next) return;
		if (!allDay) timedSnapshot = { start, end };
		startTimeStr = toTimeInputValue(next);
	}

	function setEndTime(value: string) {
		const next = applyTimeInputValue(end, value);
		if (!next) return;
		if (!allDay) timedSnapshot = { start, end };
		endTimeStr = toTimeInputValue(next);
		if (!allDay && isSameDay(start, next) && next.getTime() <= start.getTime()) {
			// End earlier-or-equal than start on the same day: roll to the next
			// day (cross-midnight event), e.g. 22:00 – 03:00.
			endDateStr = toDateInputValue(addDays(next, 1));
		}
	}

	function setStartDate(value: string) {
		const next = applyDateInputValue(start, value);
		if (!next) return;
		if (!allDay) timedSnapshot = { start, end };
		startDateStr = toDateInputValue(next);
	}

	function setEndDate(value: string) {
		const next = applyDateInputValue(end, value);
		if (!next) return;
		if (!allDay) timedSnapshot = { start, end };
		endDateStr = toDateInputValue(next);
	}

	function setAllDay(value: boolean) {
		if (value === allDay) return;
		if (value) {
			// Capture the timed range before `allDay` flips the `end` derivation
			// into "next midnight" semantics.
			timedSnapshot = { start, end };
			startDateStr = toDateInputValue(startOfDay(start));
			endDateStr = toDateInputValue(new Date(endOfDay(end).getTime() - 1));
			// Keep the wall-clock times so switching back restores them.
			startTimeStr = toTimeInputValue(start);
			endTimeStr = toTimeInputValue(end);
			allDay = true;
		}
		else {
			const snap = timedSnapshot;
			if (snap) {
				startDateStr = toDateInputValue(snap.start);
				startTimeStr = toTimeInputValue(snap.start);
				endDateStr = toDateInputValue(snap.end);
				endTimeStr = toTimeInputValue(snap.end);
			}
			else {
				// First timed entry from an all-day selection: default 9–17.
				startTimeStr = '09:00';
				endTimeStr = '17:00';
			}
			allDay = false;
		}
	}

	function save() {
		if (!valid) return;
		ctx.createEvent({
			title: title.trim() || ctx.messages.untitled,
			start,
			end,
			allDay,
			calendarId: selectedSource?.id,
			...(sel.resourceId !== undefined ? { resourceId: sel.resourceId } : {})
		});
		onclose();
	}

	function autofocus(node: HTMLInputElement) {
		// Focus after the popover has been positioned.
		requestAnimationFrame(() => node.focus());
	}
</script>

<Popover {anchor} {onclose} label={ctx.messages.newEvent}>
	<div class="s5c-popover-head">
		<span class="s5c-detail-title">{ctx.messages.newEvent}</span>
		<button type="button" class="s5c-popover-close" aria-label={ctx.messages.close} onclick={onclose}>
			✕
		</button>
	</div>
	<input
		class="s5c-input"
		type="text"
		placeholder={ctx.messages.titlePlaceholder}
		bind:value={title}
		use:autofocus
		onkeydown={(e) => e.key === 'Enter' && save()}
	/>
	<label class="s5c-all-day-toggle">
		<input type="checkbox" checked={allDay} onchange={(e) => setAllDay(e.currentTarget.checked)} />
		<span>{ctx.messages.allDay}</span>
	</label>
	{#if allDay}
		<div class="s5c-range-row">
			<span class="s5c-range-label">{ctx.messages.starts}</span>
			<input
				class="s5c-input s5c-input-date"
				type="date"
				value={startDateStr}
				oninput={(e) => setStartDate(e.currentTarget.value)}
			/>
		</div>
		<div class="s5c-range-row">
			<span class="s5c-range-label">{ctx.messages.ends}</span>
			<input
				class="s5c-input s5c-input-date"
				type="date"
				value={endDateStr}
				oninput={(e) => setEndDate(e.currentTarget.value)}
			/>
		</div>
	{:else}
		<div class="s5c-range-row">
			<span class="s5c-range-label">{ctx.messages.starts}</span>
			<input
				class="s5c-input s5c-input-date"
				type="date"
				value={startDateStr}
				oninput={(e) => setStartDate(e.currentTarget.value)}
			/>
			<input
				class="s5c-input s5c-input-time"
				type="time"
				value={startTimeStr}
				oninput={(e) => setStartTime(e.currentTarget.value)}
			/>
		</div>
		<div class="s5c-range-row">
			<span class="s5c-range-label">{ctx.messages.ends}</span>
			<input
				class="s5c-input s5c-input-date"
				type="date"
				value={endDateStr}
				oninput={(e) => setEndDate(e.currentTarget.value)}
			/>
			<input
				class="s5c-input s5c-input-time"
				type="time"
				value={endTimeStr}
				oninput={(e) => setEndTime(e.currentTarget.value)}
			/>
		</div>
	{/if}
	{#if visibleSources.length > 0}
		<div class="s5c-detail-row" style={colorVars(selectedSource?.color ?? 'blue')}>
			<span class="s5c-dot"></span>
			<select
				class="s5c-input s5c-select"
				value={selectedSource?.id}
				onchange={(e) => (calendarId = e.currentTarget.value)}
			>
				{#each visibleSources as source (source.id)}
					<option value={source.id}>{source.name}</option>
				{/each}
			</select>
		</div>
	{/if}
	<div class="s5c-popover-actions">
		<button type="button" class="s5c-btn s5c-btn-accent" disabled={!valid} onclick={save}>
			{ctx.messages.add}
		</button>
	</div>
</Popover>
