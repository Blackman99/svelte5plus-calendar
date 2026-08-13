<script lang="ts">
	import { Calendar, type Weekday } from '$lib';
	import { sampleEvents } from './sample-events.js';

	let locale = $state('zh-CN');
	let firstDayOfWeek = $state<Weekday | undefined>(undefined);
	let hour12 = $state<boolean | undefined>(undefined);

	// Labels, weekday names, titles and time formats all follow the locale.
	const events = $derived(sampleEvents(locale));
</script>

<div class="demo-controls">
	<label>
		locale
		<select bind:value={locale}>
			{#each ['en', 'zh-CN', 'de', 'fr', 'ja', 'es', 'pt-BR', 'ru'] as l (l)}
				<option value={l}>{l}</option>
			{/each}
		</select>
	</label>
	<label>
		first day
		<select bind:value={firstDayOfWeek}>
			<option value={undefined}>auto (locale)</option>
			<option value={0}>Sunday</option>
			<option value={1}>Monday</option>
			<option value={6}>Saturday</option>
		</select>
	</label>
	<label>
		clock
		<select bind:value={hour12}>
			<option value={undefined}>auto (locale)</option>
			<option value={false}>24 h</option>
			<option value={true}>12 h</option>
		</select>
	</label>
</div>

<Calendar {events} {locale} {firstDayOfWeek} {hour12} view="week" scrollToHour={8} />
