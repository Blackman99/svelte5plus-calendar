<script lang="ts">
	import { Calendar, type CalendarEvent } from 'svelte5plus-calendar';

	let { locale = 'en' } = $props();

	const day = (offset: number, h: number, m = 0) => {
		const d = new Date();
		return new Date(d.getFullYear(), d.getMonth(), d.getDate() + offset, h, m);
	};

	let events = $state<CalendarEvent[]>([
		{ id: '1', title: 'Coffee with Ada', start: day(0, 10, 0), end: day(0, 11, 0), color: 'teal' },
		{ id: '2', title: 'Ship the release', start: day(1, 14, 0), end: day(1, 16, 0) },
		{ id: '3', title: 'Team offsite', start: day(3, 0, 0), end: day(5, 0, 0), allDay: true, color: 'purple' }
	]);
</script>

<!-- editable + selectable: drag events around, click/drag empty space to create -->
<Calendar bind:events {locale} view="month" editable selectable />
