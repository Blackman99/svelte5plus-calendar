<script lang="ts">
	import type { CalendarEvent, Weekday } from './types.js';
	import { addDays, addMonths, dayKey, isSameDay, isSameMonth, monthGrid, startOfDay } from './date.js';
	import { formatters, localeFirstDay } from './i18n.js';
	// See Calendar.svelte — keeps the stylesheet alive under rolldown bundlers.
	import './theme.css';

	interface Props {
		/** Selected date. Bindable. */
		value?: Date | null;
		/** Month shown initially (defaults to `value` or today). */
		month?: Date;
		locale?: string;
		firstDayOfWeek?: Weekday;
		/** Events to mark with a dot. */
		events?: CalendarEvent[];
		/** Color scheme. When omitted, inherits from an ancestor's `data-s5c-theme`. */
		theme?: 'light' | 'dark' | 'auto';
		onSelect?: (date: Date) => void;
		class?: string;
	}

	let {
		value = $bindable(null),
		month = $bindable(startOfDay(new Date())),
		locale = 'en',
		firstDayOfWeek,
		events = [],
		theme,
		onSelect,
		class: className = ''
	}: Props = $props();

	const themeClass = $derived(
		theme === 'dark' ? 's5c-dark' : theme === 'auto' ? 's5c-auto' : theme === 'light' ? '' : 's5c-inherit'
	);

	const fdow = $derived(firstDayOfWeek ?? localeFirstDay(locale));
	const fm = $derived(formatters(locale));
	const grid = $derived(monthGrid(month, fdow));

	const busyDays = $derived.by(() => {
		const keys = new Set<string>();
		for (const ev of events) {
			let d = startOfDay(ev.start);
			const stop = Math.max(ev.end.getTime(), d.getTime() + 1);
			while (d.getTime() < stop) {
				keys.add(dayKey(d));
				d = addDays(d, 1);
			}
		}
		return keys;
	});

	function pick(day: Date) {
		value = day;
		if (!isSameMonth(day, month)) month = day;
		onSelect?.(day);
	}
</script>

<div class="s5c-mini s5c {themeClass} {className}">
	<div class="s5c-mini-toolbar">
		<span class="s5c-mini-title">{fm.monthTitle(month)}</span>
		<span class="s5c-nav-group">
			<button
				type="button"
				class="s5c-btn s5c-btn-icon"
				aria-label="Previous month"
				onclick={() => (month = addMonths(month, -1))}
			>
				‹
			</button>
			<button
				type="button"
				class="s5c-btn s5c-btn-icon"
				aria-label="Next month"
				onclick={() => (month = addMonths(month, 1))}
			>
				›
			</button>
		</span>
	</div>
	<div class="s5c-mini-grid">
		{#each grid[0] as day (dayKey(day))}
			<div class="s5c-mini-head">{fm.weekdayNarrow(day)}</div>
		{/each}
		{#each grid as week (dayKey(week[0]))}
			{#each week as day (dayKey(day))}
				<button
					type="button"
					class="s5c-mini-day"
					class:s5c-other-month={!isSameMonth(day, month)}
					class:s5c-is-today={isSameDay(day, new Date())}
					class:s5c-selected={value != null && isSameDay(day, value)}
					aria-label={fm.dayTitle(day)}
					aria-pressed={value != null && isSameDay(day, value)}
					onclick={() => pick(day)}
				>
					{day.getDate()}
					{#if busyDays.has(dayKey(day))}
						<span class="s5c-event-dot"></span>
					{/if}
				</button>
			{/each}
		{/each}
	</div>
</div>
