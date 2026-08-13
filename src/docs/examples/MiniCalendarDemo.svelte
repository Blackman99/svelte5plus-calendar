<script lang="ts">
	import { MiniCalendar } from '$lib';
	import { sampleEvents } from './sample-events.js';

	let { locale = 'en' } = $props();

	let value = $state<Date | null>(new Date());
	const events = $derived(sampleEvents(locale));
</script>

<div style="display:flex; gap:24px; align-items:flex-start; flex-wrap:wrap">
	<MiniCalendar bind:value {locale} {events} />
	<p style="font-size:14px">
		selected:
		<b>{value ? value.toLocaleDateString(locale) : '—'}</b>
	</p>
</div>
