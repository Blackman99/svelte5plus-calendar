<script lang="ts">
	import type { EventInstance } from './types.js';
	import { colorVars, getCalendarContext } from './context.js';
	import { isAllDayLike } from './instances.js';

	interface Props {
		instance: EventInstance;
		/** Force bar (solid) or dotline (dot + time + title) rendering. */
		kind?: 'auto' | 'bar' | 'dotline';
		continuesBefore?: boolean;
		continuesAfter?: boolean;
		/** Show the start time on dotline items. */
		showTime?: boolean;
		onpointerdown?: (e: PointerEvent) => void;
	}
	const {
		instance,
		kind = 'auto',
		continuesBefore = false,
		continuesAfter = false,
		showTime = true,
		onpointerdown
	}: Props = $props();

	const ctx = getCalendarContext();
	const asBar = $derived(kind === 'bar' || (kind === 'auto' && isAllDayLike(instance)));
	const label = $derived(
		`${instance.event.title}, ${
			instance.allDay
				? ctx.messages.allDay
				: `${ctx.fmt.time(instance.start)} – ${ctx.fmt.time(instance.end)}`
		}`
	);
</script>

<button
	type="button"
	class={asBar ? 's5c-bar' : 's5c-dotline'}
	class:s5c-continues-before={continuesBefore}
	class:s5c-continues-after={continuesAfter}
	style={colorVars(instance.color)}
	aria-label={label}
	title={label}
	{onpointerdown}
	onclick={(e) => {
		e.stopPropagation();
		ctx.clickEvent(instance, e);
	}}
>
	{#if ctx.eventContent}
		{@render ctx.eventContent(instance)}
	{:else}
		{#if !asBar}
			<span class="s5c-dot" style={colorVars(instance.color)}></span>
			{#if showTime}
				<span class="s5c-ev-time">{ctx.fmt.time(instance.start)}</span>
			{/if}
		{/if}
		{#if instance.isRecurring}
			<span class="s5c-recur-mark" aria-hidden="true">↻</span>
		{/if}
		<span class="s5c-ev-title">{instance.event.title}</span>
	{/if}
</button>
