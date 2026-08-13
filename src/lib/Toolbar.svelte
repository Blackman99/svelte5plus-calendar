<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { CalendarView } from './types.js';
	import { getCalendarContext } from './context.js';

	interface Props {
		title: string;
		views: CalendarView[];
		toolbarEnd?: Snippet;
	}
	let { title, views, toolbarEnd }: Props = $props();

	const ctx = getCalendarContext();
</script>

<div class="s5c-toolbar">
	<button type="button" class="s5c-btn" onclick={() => ctx.goToday()}>
		{ctx.messages.today}
	</button>
	<span class="s5c-nav-group">
		<button
			type="button"
			class="s5c-btn s5c-btn-icon"
			aria-label={ctx.messages.previous}
			onclick={() => ctx.navigate(-1)}
		>
			‹
		</button>
		<button
			type="button"
			class="s5c-btn s5c-btn-icon"
			aria-label={ctx.messages.next}
			onclick={() => ctx.navigate(1)}
		>
			›
		</button>
	</span>
	<h2 class="s5c-toolbar-title" aria-live="polite">{title}</h2>
	<span class="s5c-toolbar-spacer"></span>
	{#if toolbarEnd}
		{@render toolbarEnd()}
	{/if}
	{#if views.length > 1}
		<div class="s5c-view-switch" role="tablist" aria-label="View">
			{#each views as v (v)}
				<button
					type="button"
					class="s5c-btn"
					class:s5c-active={ctx.view === v}
					role="tab"
					aria-selected={ctx.view === v}
					onclick={() => ctx.setView(v)}
				>
					{ctx.messages[v]}
				</button>
			{/each}
		</div>
	{/if}
</div>
