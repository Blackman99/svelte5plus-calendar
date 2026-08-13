<script lang="ts">
	import { Calendar, type CalendarView } from 'svelte5plus-calendar';
	import { sampleEvents, sampleSources } from './sample-events.js';

	let { locale = 'en' } = $props();

	let view = $state<CalendarView>('week');
	// Seeded once per mount (the docs remount this demo when the locale changes).
	// svelte-ignore state_referenced_locally
	let events = $state(sampleEvents(locale));
</script>

<!-- `view` is bindable: the toolbar buttons and your own UI stay in sync -->
<Calendar
	bind:events
	bind:view
	{locale}
	sources={sampleSources(locale)}
	views={['day', 'week', 'month', 'year', 'agenda']}
	scrollToHour={8}
	editable
	selectable
/>
