<script lang="ts">
	import type { EventInstance } from './types.js';
	import { getCalendarContext } from './context.js';
	import EventItem from './EventItem.svelte';
	import Popover from './Popover.svelte';

	interface Props {
		day: Date;
		instances: EventInstance[];
		/** Anchor rectangle (viewport coordinates) the popover opens near. */
		anchor: DOMRect;
		onclose: () => void;
	}
	const { day, instances, anchor, onclose }: Props = $props();

	const ctx = getCalendarContext();
</script>

<Popover {anchor} {onclose} label={ctx.fmt.dayTitle(day)}>
	<div class="s5c-popover-head">
		<span class="s5c-popover-date">{ctx.fmt.agendaDay(day)}</span>
		<button type="button" class="s5c-popover-close" aria-label={ctx.messages.close} onclick={onclose}>
			✕
		</button>
	</div>
	{#each instances as instance (instance.key)}
		<EventItem {instance} />
	{:else}
		<div class="s5c-agenda-empty">{ctx.messages.noEvents}</div>
	{/each}
</Popover>
