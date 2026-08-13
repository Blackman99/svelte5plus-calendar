<script lang="ts">
	import { Calendar } from '$lib';
	import { sampleEvents, sampleSources } from './sample-events.js';

	let { locale = 'en' } = $props();

	const events = $derived(sampleEvents(locale));
</script>

<Calendar
	{events}
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
/>
