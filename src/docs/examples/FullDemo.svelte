<script lang="ts">
	import { Calendar, MiniCalendar, type CalendarView, type RangeSelection } from '$lib';
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
	let theme = $state<'light' | 'dark'>('light');
	let mini = $state<Date | null>(null);

	const swatch: Record<string, string> = { blue: '#1a73e8', green: '#188038', orange: '#ea8600' };

	function onSelect(sel: RangeSelection) {
		const title = prompt(zh ? '新日程标题：' : 'Event title?', zh ? '新日程' : 'New event');
		if (!title) return;
		events = [
			...events,
			{
				id: crypto.randomUUID(),
				title,
				start: sel.start,
				end: sel.end,
				allDay: sel.allDay,
				calendarId: 'personal'
			}
		];
	}
</script>

<div class="full-demo" class:dark={theme === 'dark'}>
	<aside>
		<MiniCalendar
			bind:value={mini}
			{locale}
			{events}
			{theme}
			onSelect={(d) => (date = d)}
		/>
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
		<div class="side-block">
			<label>
				<input
					type="checkbox"
					checked={theme === 'dark'}
					onchange={() => (theme = theme === 'dark' ? 'light' : 'dark')}
				/>
				{zh ? '暗色模式' : 'Dark mode'}
			</label>
		</div>
	</aside>
	<Calendar
		bind:events
		bind:date
		bind:view
		{sources}
		{locale}
		{theme}
		editable
		selectable
		weekNumbers
		scrollToHour={8}
		businessHours
		{onSelect}
		onEventClick={(i) =>
			alert(
				`${i.event.title}\n${i.start.toLocaleString(locale)} – ${i.end.toLocaleString(locale)}` +
					(i.event.location ? `\n📍 ${i.event.location}` : '')
			)}
	/>
</div>

<style>
	.full-demo {
		display: flex;
		flex: 1;
		min-height: 0;
	}
	.full-demo.dark {
		background: #1b1d21;
	}
	aside {
		width: 280px;
		flex: none;
		padding: 16px;
		border-right: 1px solid #dde1e6;
		overflow-y: auto;
	}
	.full-demo.dark aside {
		border-color: #34373d;
	}
	.full-demo > :global(.s5c) {
		flex: 1;
		min-width: 0;
	}
	aside :global(.s5c-mini) {
		border: none;
		width: 100%;
		padding: 0;
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
		color: #8b8e96;
	}
	.side-block label {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 3px 0;
		cursor: pointer;
		color: inherit;
	}
	.full-demo.dark .side-block label {
		color: #e5e7ea;
	}
	.side-block i {
		width: 10px;
		height: 10px;
		border-radius: 3px;
		background: #1a73e8;
	}
	@media (max-width: 760px) {
		aside {
			display: none;
		}
	}
</style>
