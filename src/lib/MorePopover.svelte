<script lang="ts">
	import type { EventInstance } from './types.js';
	import { getCalendarContext } from './context.js';
	import EventItem from './EventItem.svelte';

	interface Props {
		day: Date;
		instances: EventInstance[];
		/** Anchor rectangle (viewport coordinates) the popover opens near. */
		anchor: DOMRect;
		onclose: () => void;
	}
	let { day, instances, anchor, onclose }: Props = $props();

	const ctx = getCalendarContext();

	let el = $state<HTMLDivElement>();
	let pos = $state({ left: 0, top: 0 });

	$effect(() => {
		if (!el) return;
		const { innerWidth, innerHeight } = window;
		const w = el.offsetWidth;
		const h = el.offsetHeight;
		let left = anchor.left + anchor.width / 2 - w / 2;
		let top = anchor.top - 4;
		left = Math.max(8, Math.min(left, innerWidth - w - 8));
		top = Math.max(8, Math.min(top, innerHeight - h - 8));
		pos = { left, top };
	});

	function onWindowPointerDown(e: PointerEvent) {
		if (el && !el.contains(e.target as Node)) onclose();
	}
	function onWindowKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
	}
</script>

<svelte:window onpointerdown={onWindowPointerDown} onkeydown={onWindowKeydown} />

<div
	class="s5c-popover"
	bind:this={el}
	style="left:{pos.left}px; top:{pos.top}px;"
	role="dialog"
	aria-label={ctx.fmt.dayTitle(day)}
>
	<div class="s5c-popover-head">
		<span class="s5c-popover-date">{ctx.fmt.agendaDay(day)}</span>
		<button type="button" class="s5c-popover-close" aria-label="Close" onclick={onclose}>
			✕
		</button>
	</div>
	{#each instances as instance (instance.key)}
		<EventItem {instance} />
	{:else}
		<div class="s5c-agenda-empty">{ctx.messages.noEvents}</div>
	{/each}
</div>
