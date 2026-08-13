<script lang="ts">
	import { Calendar } from 'svelte5plus-calendar';
	import { sampleEvents, sampleSources } from './sample-events.js';

	const { locale = 'en' } = $props();

	// Seeded once per mount (the docs remount this demo when the locale changes).
	// svelte-ignore state_referenced_locally
	let events = $state(sampleEvents(locale));
</script>

<Calendar
	bind:events
	{locale}
	view="week"
	sources={sampleSources(locale)}
	dayStartHour={6}
	dayEndHour={22}
	slotDuration={30}
	snapDuration={15}
	hourHeight={56}
	scrollToHour={8}
	weekNumbers
	businessHours={{ days: [1, 2, 3, 4, 5], startHour: 9, endHour: 18 }}
	nowIndicator
	views={['day', 'week']}
	editable
	selectable
/>
