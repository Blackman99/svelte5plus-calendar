<script lang="ts">
	import { Calendar, type CalendarEvent, type RangeSelection } from 'svelte5plus-calendar';
	import { sampleEvents, sampleSources } from './sample-events.js';

	let { locale = 'en' } = $props();

	// Seeded once per mount (the docs remount this demo when the locale changes).
	// svelte-ignore state_referenced_locally
	let events = $state<CalendarEvent[]>(sampleEvents(locale));
	let log = $state<string[]>([]);
	const note = (msg: string) => (log = [msg, ...log].slice(0, 4));

	// Drag on empty space → create an event from the selected range.
	function onSelect(sel: RangeSelection) {
		const title = prompt('Event title?', 'New event');
		if (!title) return;
		events = [
			...events,
			{ id: crypto.randomUUID(), title, start: sel.start, end: sel.end, allDay: sel.allDay }
		];
		note(`created “${title}”`);
	}
</script>

<Calendar
	bind:events
	{locale}
	view="week"
	sources={sampleSources(locale)}
	editable
	selectable
	scrollToHour={8}
	{onSelect}
	onEventClick={(i) => note(`clicked “${i.event.title}”`)}
	onEventChange={(info) => note(`moved “${info.event.title}” → ${info.start.toLocaleString()}`)}
/>

<div class="demo-log">
	{#each log as line, i (i)}<div>{line}</div>{:else}<div>· drag events, resize them, or drag across empty slots ·</div>{/each}
</div>
