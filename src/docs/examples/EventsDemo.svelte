<script lang="ts">
	import { Calendar, type CalendarSource } from '$lib';
	import { sampleEvents } from './sample-events.js';

	let { locale = 'en' } = $props();

	// Sources group events into toggleable calendars, each with its own color.
	let sources = $state<CalendarSource[]>([
		{ id: 'work', name: 'Work', color: 'blue', visible: true },
		{ id: 'personal', name: 'Personal', color: 'green', visible: true },
		{ id: 'family', name: 'Family', color: 'orange', visible: true }
	]);
	const events = $derived(sampleEvents(locale));
</script>

<div class="demo-controls">
	{#each sources as source (source.id)}
		<label>
			<input type="checkbox" bind:checked={source.visible} />
			{source.name}
		</label>
	{/each}
</div>

<Calendar {events} {sources} {locale} view="month" />
