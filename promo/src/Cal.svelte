<script lang="ts">
	import type { CalendarEvent, CalendarView } from 'svelte5plus-calendar';
	import { Calendar } from 'svelte5plus-calendar';
	import { FOCUS_DATE, resources } from './data';

	interface Props {
		view: CalendarView;
		events: CalendarEvent[];
		locale?: string;
		theme?: 'light' | 'dark';
		accent?: string;
		timeZone?: string;
		/** Focused date (defaults to the film's Tue 13 Oct). */
		date?: Date;
		/** Visible hours and hour height: [dayStartHour, dayEndHour, hourHeight]. */
		hours?: [number, number, number];
		/** Extra classes on the card (used by scenes to stage the materialising reveal). */
		class?: string;
		style?: string;
	}
	const { view, events, locale = 'en', theme = 'light', accent, timeZone, date = FOCUS_DATE, hours = [7, 20, 45], class: cls = '', style = '' }: Props = $props();
</script>

<!-- One card = the real <Calendar>, laid out at 1340×760 and zoomed 1.2× (1608×912 on stage at scale 1). -->
<div class="card {cls}" class:dark={theme === 'dark'} style="{accent ? `--film-accent:${accent};` : ''}{style}">
	<div class="zoom" class:accent={!!accent}>
		<Calendar
			{view}
			{events}
			{locale}
			{theme}
			{timeZone}
			{resources}
			{date}
			firstDayOfWeek={1}
			dayStartHour={hours[0]}
			dayEndHour={hours[1]}
			hourHeight={hours[2]}
			dayMaxEvents={5}
			scrollToHour={7}
			agendaDays={14}
			editable
			selectable
			views={['month', 'week', 'day', 'year', 'agenda', 'resources']}
		/>
	</div>
</div>

<style>
	.card {
		position: absolute;
		left: 0;
		top: 0;
		width: 1608px;
		height: 912px;
		border-radius: 14px;
		overflow: hidden;
		background: #fff;
		box-shadow:
			0 40px 90px -20px rgba(3, 16, 63, 0.55),
			0 10px 30px -10px rgba(3, 16, 63, 0.35);
		transform-origin: 0 0;
	}
	.card.dark {
		background: #1b1d21;
	}
	.zoom {
		width: 1340px;
		height: 760px;
		zoom: 1.2;
	}
	.accent :global(.s5c) {
		--s5c-accent: var(--film-accent);
	}
	/* The film never shows a scrollbar: the grid is sized to fit 07:00–20:00 exactly. */
	.card :global(*) {
		scrollbar-width: none;
	}
</style>
