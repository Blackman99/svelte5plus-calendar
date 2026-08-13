<script lang="ts">
	import type { CalendarSource } from 'svelte5plus-calendar';
	import { Calendar } from 'svelte5plus-calendar';
	import { sampleEvents } from './sample-events.js';

	const { locale = 'en' } = $props();

	// Sources group events into toggleable calendars, each with its own color.
	const sources = $state<CalendarSource[]>([
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
