<script lang="ts">
	import { Calendar, MiniCalendar, type CalendarView } from '$lib';
	import { sampleEvents, sampleSources } from './sample-events.js';

	let { locale = 'en' }: { locale?: string } = $props();

	// Seeded once per mount (the docs remount this demo when the locale changes).
	// svelte-ignore state_referenced_locally
	const zh = locale.toLowerCase().startsWith('zh');
	// svelte-ignore state_referenced_locally
	let events = $state(sampleEvents(locale));
	// svelte-ignore state_referenced_locally
	let sources = $state(sampleSources(locale));
	let date = $state(new Date());
	let view = $state<CalendarView>('week');
	let mini = $state<Date | null>(null);

	const swatch: Record<string, string> = { blue: '#1a73e8', green: '#188038', orange: '#ea8600' };
</script>

<div class="full-demo">
	<aside>
		<MiniCalendar bind:value={mini} {locale} {events} onSelect={(d) => (date = d)} />
		<div class="side-block">
			<h5>{zh ? '我的日历' : 'My calendars'}</h5>
			{#each sources as source (source.id)}
				<label>
					<input type="checkbox" bind:checked={source.visible} />
					<i style="background: {swatch[String(source.color)] ?? source.color}"></i>
					{source.name}
				</label>
			{/each}
		</div>
		<p class="side-hint">
			{zh
				? '点击日程查看详情，框选空白时段快速新建——无需任何回调代码。'
				: 'Click an event for details, drag across empty slots to quick-create — no callback code needed.'}
		</p>
	</aside>
	<!-- No onEventClick / onSelect handlers: the built-in
	     details & quick-create popovers take over. -->
	<Calendar
		bind:events
		bind:date
		bind:view
		{sources}
		{locale}
		editable
		selectable
		weekNumbers
		scrollToHour={8}
		businessHours
	/>
</div>

<style>
	.full-demo {
		display: flex;
		flex: 1;
		min-height: 0;
	}
	aside {
		width: 280px;
		flex: none;
		padding: 16px;
		border-right: 1px solid var(--line, #dde1e6);
		overflow-y: auto;
	}
	.full-demo > :global(.s5c) {
		flex: 1;
		min-width: 0;
	}
	aside :global(.s5c-mini) {
		border: none;
		width: 100%;
		padding: 0;
		background: transparent;
	}
	.side-block {
		margin-top: 20px;
		font-size: 13.5px;
	}
	.side-block h5 {
		margin: 0 0 8px;
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--ink-faint, #8b8e96);
	}
	.side-block label {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 3px 0;
		cursor: pointer;
		color: var(--ink, inherit);
	}
	.side-block i {
		width: 10px;
		height: 10px;
		border-radius: 3px;
	}
	.side-hint {
		margin-top: 20px;
		font-size: 12.5px;
		line-height: 1.55;
		color: var(--ink-faint, #8b8e96);
	}
	@media (max-width: 760px) {
		aside {
			display: none;
		}
	}
</style>
