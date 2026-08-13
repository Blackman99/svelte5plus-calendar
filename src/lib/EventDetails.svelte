<script lang="ts">
	import type { EventInstance } from './types.js';
	import { getCalendarContext, colorVars } from './context.js';
	import { isSameDay } from './date.js';
	import Popover from './Popover.svelte';

	interface Props {
		instance: EventInstance;
		anchor: DOMRect;
		onclose: () => void;
	}
	let { instance, anchor, onclose }: Props = $props();

	const ctx = getCalendarContext();

	const timeText = $derived.by(() => {
		const { start, end, allDay } = instance;
		if (allDay) {
			const lastDay = new Date(end.getTime() - 1);
			return isSameDay(start, lastDay)
				? ctx.fmt.dayTitle(start)
				: ctx.fmt.range(start, lastDay);
		}
		return isSameDay(start, end)
			? `${ctx.fmt.dayTitle(start)} · ${ctx.fmt.time(start)} – ${ctx.fmt.time(end)}`
			: `${ctx.fmt.dayTitle(start)} ${ctx.fmt.time(start)} – ${ctx.fmt.dayTitle(end)} ${ctx.fmt.time(end)}`;
	});

	const source = $derived(
		instance.event.calendarId
			? ctx.sources.find((s) => s.id === instance.event.calendarId)
			: undefined
	);
	const canDelete = $derived(ctx.canEdit(instance));
</script>

<Popover {anchor} {onclose} label={instance.event.title}>
	<div class="s5c-popover-head">
		<span class="s5c-detail-title" style={colorVars(instance.color)}>
			<span class="s5c-dot"></span>
			{instance.event.title || ctx.messages.untitled}
		</span>
		<button type="button" class="s5c-popover-close" aria-label={ctx.messages.close} onclick={onclose}>
			✕
		</button>
	</div>
	<div class="s5c-detail-row">🕐 {instance.allDay ? `${ctx.messages.allDay} · ${timeText}` : timeText}</div>
	{#if instance.isRecurring}
		<div class="s5c-detail-row">↻ {ctx.messages.recurringEvent}</div>
	{/if}
	{#if instance.event.location}
		<div class="s5c-detail-row">📍 {instance.event.location}</div>
	{/if}
	{#if source}
		<div class="s5c-detail-row" style={colorVars(source.color ?? 'blue')}>
			<span class="s5c-dot"></span>
			{source.name}
		</div>
	{/if}
	{#if instance.event.description}
		<div class="s5c-detail-row s5c-detail-desc">{instance.event.description}</div>
	{/if}
	{#if canDelete}
		<div class="s5c-popover-actions">
			{#if instance.isRecurring}
				<button
					type="button"
					class="s5c-btn s5c-btn-danger"
					onclick={() => {
						ctx.deleteOccurrence(instance);
						onclose();
					}}
				>
					{ctx.messages.deleteOccurrence}
				</button>
				<button
					type="button"
					class="s5c-btn s5c-btn-danger"
					onclick={() => {
						ctx.deleteEvent(instance);
						onclose();
					}}
				>
					{ctx.messages.deleteSeries}
				</button>
			{:else}
				<button
					type="button"
					class="s5c-btn s5c-btn-danger"
					onclick={() => {
						ctx.deleteEvent(instance);
						onclose();
					}}
				>
					{ctx.messages.delete}
				</button>
			{/if}
		</div>
	{/if}
</Popover>
