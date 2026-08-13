<script lang="ts">
	import { addDays, Calendar, startOfWeek } from 'svelte5plus-calendar';
	import { sampleEvents } from './sample-events.js';

	const { locale = 'en' } = $props();

	// Only this week is bookable, and bookings may not overlap.
	const weekStart = startOfWeek(new Date(), 1);
	const validRange = { start: weekStart, end: addDays(weekStart, 6) };

	// svelte-ignore state_referenced_locally
	let events = $state(sampleEvents(locale));
</script>

<Calendar
	bind:events
	{locale}
	view="month"
	{validRange}
	eventOverlap={false}
	editable
	selectable
/>
