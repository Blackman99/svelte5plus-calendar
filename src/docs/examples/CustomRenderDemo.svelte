<script lang="ts">
	import { Calendar } from 'svelte5plus-calendar';
	import { sampleEvents, sampleSources } from './sample-events.js';

	const { locale = 'en' } = $props();

	const events = $derived(sampleEvents(locale));
	const emoji: Record<string, string> = {
		work: '💼',
		personal: '🌿',
		family: '🏠'
	};
</script>

<!-- `eventContent` is a Svelte snippet that replaces the default event body -->
<Calendar {events} {locale} view="week" sources={sampleSources(locale)} scrollToHour={8}>
	{#snippet eventContent(instance)}
		<span style="display:flex; gap:4px; align-items:center; overflow:hidden">
			<span>{emoji[instance.event.calendarId ?? ''] ?? '📌'}</span>
			<b style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis">
				{instance.event.title}
			</b>
		</span>
	{/snippet}
</Calendar>
