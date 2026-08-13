<script lang="ts">
	import { Calendar } from 'svelte5plus-calendar';
	import { sampleEvents, sampleSources } from './sample-events.js';

	const { locale = 'en' } = $props();

	let timeZone = $state<string | undefined>('America/New_York');

	// Event Dates stay real instants — only the display shifts.
	// svelte-ignore state_referenced_locally
	let events = $state(sampleEvents(locale));
</script>

<div class="demo-controls">
	<label>
		timeZone
		<select bind:value={timeZone}>
			<option value={undefined}>local</option>
			{#each ['UTC', 'America/New_York', 'Europe/Berlin', 'Asia/Shanghai', 'Asia/Kolkata', 'Australia/Sydney'] as tz (tz)}
				<option value={tz}>{tz}</option>
			{/each}
		</select>
	</label>
</div>

<Calendar bind:events {locale} {timeZone} view="week" sources={sampleSources(locale)} scrollToHour={6} editable selectable />
