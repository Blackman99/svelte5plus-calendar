<script lang="ts">
	import { Calendar, type CalendarView } from '$lib';
	import { sampleEvents, sampleSources } from './sample-events.js';

	let { locale = 'en' } = $props();

	let view = $state<CalendarView>('week');
	const events = $derived(sampleEvents(locale));
</script>

<!-- `view` is bindable: the toolbar buttons and your own UI stay in sync -->
<Calendar
	{events}
	bind:view
	{locale}
	sources={sampleSources(locale)}
	views={['day', 'week', 'month', 'year', 'agenda']}
	scrollToHour={8}
/>
