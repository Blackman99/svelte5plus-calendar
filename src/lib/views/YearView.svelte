<script lang="ts">
	import { getCalendarContext } from '../context.js';
	import { addDays, dayKey, isSameDay, isSameMonth, monthGrid, startOfDay } from '../date.js';

	const ctx = getCalendarContext();

	const year = $derived(ctx.date.getFullYear());
	const months = $derived(Array.from({ length: 12 }, (_, m) => new Date(year, m, 1)));

	/** Day-keys that have at least one event (for the density dots). */
	const busyDays = $derived.by(() => {
		const keys = new Set<string>();
		for (const i of ctx.instances) {
			let d = startOfDay(i.start);
			const stop = Math.max(i.end.getTime(), d.getTime() + 1);
			while (d.getTime() < stop) {
				keys.add(dayKey(d));
				d = addDays(d, 1);
			}
		}
		return keys;
	});

	const weekdayHeaders = $derived.by(() => {
		const base = monthGrid(months[0], ctx.firstDayOfWeek)[0];
		return base.map((d) => ctx.fmt.weekdayNarrow(d));
	});

	function pick(day: Date) {
		ctx.setDate(day);
		// Navigation only — bypass the quick-create default of ctx.clickDate.
		ctx.onDateClick?.(day, true);
		ctx.setView('day');
	}
</script>

<div class="s5c-year">
	{#each months as month (month.getMonth())}
		<div class="s5c-year-month">
			<div class="s5c-year-month-name">{ctx.fmt.monthShort(month)}</div>
			<div class="s5c-mini-grid">
				{#each weekdayHeaders as wd, i (i)}
					<div class="s5c-mini-head">{wd}</div>
				{/each}
				{#each monthGrid(month, ctx.firstDayOfWeek) as week (dayKey(week[0]))}
					{#each week as day (dayKey(day))}
						<button
							type="button"
							class="s5c-mini-day"
							class:s5c-other-month={!isSameMonth(day, month)}
							class:s5c-is-today={isSameDay(day, new Date())}
							aria-label={ctx.fmt.dayTitle(day)}
							onclick={() => pick(day)}
						>
							{day.getDate()}
							{#if busyDays.has(dayKey(day)) && isSameMonth(day, month)}
								<span class="s5c-event-dot"></span>
							{/if}
						</button>
					{/each}
				{/each}
			</div>
		</div>
	{/each}
</div>
