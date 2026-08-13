<script lang="ts">
	import { Calendar, type CalendarEvent } from 'svelte5plus-calendar';

	let { locale = 'en' } = $props();

	const monday = (() => {
		const d = new Date();
		d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
		return d;
	})();
	const at = (offset: number, h: number, m = 0) =>
		new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + offset, h, m);

	let events = $state<CalendarEvent[]>([
		{
			id: 'standup',
			title: 'Standup — weekdays',
			start: at(0, 9),
			end: at(0, 9, 30),
			recurrence: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR', // RRULE string…
			color: 'blue'
		},
		{
			id: 'retro',
			title: 'Retro — every 2nd Friday',
			start: at(4, 16),
			end: at(4, 17),
			recurrence: { freq: 'weekly', interval: 2, byDay: [5] }, // …or an object
			color: 'purple'
		},
		{
			id: 'board',
			title: 'Board mtg — 1st of month',
			start: new Date(monday.getFullYear(), monday.getMonth(), 1, 11),
			end: new Date(monday.getFullYear(), monday.getMonth(), 1, 12),
			recurrence: 'FREQ=MONTHLY;BYMONTHDAY=1',
			color: 'red'
		},
		{
			id: 'payday',
			title: 'Payday — last Friday',
			start: new Date(monday.getFullYear(), monday.getMonth(), 25, 9),
			end: new Date(monday.getFullYear(), monday.getMonth(), 25, 9, 15),
			recurrence: 'FREQ=MONTHLY;BYDAY=-1FR',
			color: 'green'
		},
		{
			id: 'workshop',
			title: 'Workshop — 5×, skips one',
			start: at(2, 13),
			end: at(2, 15),
			recurrence: { freq: 'weekly', byDay: [3], count: 5 },
			exdates: [at(14, 13)], // the 3rd occurrence is cancelled
			color: 'orange'
		}
	]);
</script>

<Calendar bind:events {locale} view="month" />
