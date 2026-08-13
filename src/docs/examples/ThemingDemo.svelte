<script lang="ts">
	import { Calendar } from 'svelte5plus-calendar';
	import { sampleEvents, sampleSources } from './sample-events.js';

	let { locale = 'en' } = $props();

	const events = $derived(sampleEvents(locale));
	let theme = $state<'light' | 'dark'>('dark');
	let brand = $state(false);
</script>

<div class="demo-controls">
	<label><input type="radio" bind:group={theme} value="light" /> light</label>
	<label><input type="radio" bind:group={theme} value="dark" /> dark</label>
	<label><input type="checkbox" bind:checked={brand} /> custom brand variables</label>
</div>

<!-- Every color, radius and font is a CSS variable — override them anywhere. -->
<div class="wrap" class:brand style="display:flex; flex:1; min-height:0">
	<Calendar {events} {locale} {theme} view="week" sources={sampleSources(locale)} scrollToHour={8} />
</div>

<style>
	.wrap :global(.s5c) {
		flex: 1;
	}
	.brand :global(.s5c) {
		--s5c-accent: #e4572e;
		--s5c-today-num-bg: #e4572e;
		--s5c-now-color: #e4572e;
		--s5c-event-radius: 10px;
		--s5c-radius: 10px;
		--s5c-font: 'Georgia', serif;
	}
</style>
