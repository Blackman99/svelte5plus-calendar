<script lang="ts">
	import type { RangeSelection } from './types.js';
	import { colorVars, getCalendarContext } from './context.js';
	import { isSameDay } from './date.js';
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

	const timeText = $derived.by(() => {
		if (sel.allDay) {
			const lastDay = new Date(sel.end.getTime() - 1);
			return isSameDay(sel.start, lastDay)
				? ctx.fmt.dayTitle(sel.start)
				: ctx.fmt.range(sel.start, lastDay);
		}
		return `${ctx.fmt.dayTitle(sel.start)} · ${ctx.fmt.time(sel.start)} – ${ctx.fmt.time(sel.end)}`;
	});

	function save() {
		ctx.createEvent({
			title: title.trim() || ctx.messages.untitled,
			start: sel.start,
			end: sel.end,
			allDay: sel.allDay,
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
	<div class="s5c-detail-row">
		🕐 {sel.allDay ? `${ctx.messages.allDay} · ${timeText}` : timeText}
	</div>
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
		<button type="button" class="s5c-btn s5c-btn-accent" onclick={save}>
			{ctx.messages.add}
		</button>
	</div>
</Popover>
