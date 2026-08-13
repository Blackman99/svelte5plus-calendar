<script lang="ts">
	import { Calendar } from 'svelte5plus-calendar';
	import { sampleEvents, sampleSources } from './sample-events.js';

	let { locale = 'en' } = $props();

	// Seeded once per mount (the docs remount this demo when the locale changes).
	// svelte-ignore state_referenced_locally
	let events = $state(sampleEvents(locale));
</script>

<!--
  No callbacks at all:
  · click an event        → built-in details popover (with Delete)
  · click / drag empty    → built-in quick-create popover
  Provide onEventClick / onSelect to replace them with your own UI,
  or opt out entirely with eventDetails={false} / quickCreate={false}.
-->
<Calendar
	bind:events
	{locale}
	view="week"
	sources={sampleSources(locale)}
	editable
	selectable
	scrollToHour={8}
	onEventCreate={(ev) => console.log('created', ev)}
	onEventDelete={(ev) => console.log('deleted', ev)}
/>
