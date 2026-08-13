<script lang="ts">
	import { Calendar, MiniCalendar } from '$lib';
	import { sampleEvents, sampleSources } from './sample-events.js';

	let { locale = 'en' } = $props();

	// svelte-ignore state_referenced_locally
	let events = $state(sampleEvents(locale));
	let date = $state(new Date());
	let month = $state(new Date());

	// Two-way link: picking a day in the mini calendar drives the day view,
	// and navigating the day view scrolls the mini calendar's month along.
	$effect(() => {
		month = date;
	});
</script>

<div class="duo">
	<MiniCalendar {locale} {events} value={date} bind:month onSelect={(d) => (date = d)} />
	<Calendar
		bind:events
		bind:date
		{locale}
		sources={sampleSources(locale)}
		view="day"
		views={['day']}
		scrollToHour={8}
		editable
		selectable
	/>
</div>

<style>
	.duo {
		display: flex;
		gap: 16px;
		flex: 1;
		min-height: 0;
		align-items: flex-start;
	}
	.duo > :global(.s5c:not(.s5c-mini)) {
		flex: 1;
		min-width: 0;
		height: 100%;
	}
	@media (max-width: 640px) {
		.duo {
			flex-direction: column;
			align-items: stretch;
		}
	}
</style>
