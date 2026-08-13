<script lang="ts">
	import type { EventInstance } from '../types.js';
	import { colorVars, getCalendarContext } from '../context.js';
	import { dayKey, endOfDay, isSameDay, overlaps } from '../date.js';

	const ctx = getCalendarContext();

	const groups = $derived.by(() => {
		const out: Array<{ day: Date; items: EventInstance[] }> = [];
		for (const day of ctx.visibleDays) {
			const dayEnd = endOfDay(day);
			const items = ctx.instances.filter((i) => overlaps(i.start, i.end, day, dayEnd));
			if (items.length) out.push({ day, items });
		}
		return out;
	});

	function timeText(i: EventInstance, day: Date): string {
		if (i.allDay) return ctx.messages.allDay;
		const startsToday = isSameDay(i.start, day);
		const endsToday = isSameDay(i.end, day) || i.end.getTime() <= endOfDay(day).getTime();
		const s = startsToday ? ctx.fmt.time(i.start) : '⋯';
		const e = endsToday ? ctx.fmt.time(i.end) : '⋯';
		return `${s} – ${e}`;
	}

	function openDay(day: Date) {
		ctx.setDate(day);
		ctx.setView('day');
	}
</script>

<div class="s5c-agenda">
	{#each groups as { day, items } (dayKey(day))}
		<div class="s5c-agenda-day">
			<div
				class="s5c-agenda-date"
				class:s5c-is-today={isSameDay(day, ctx.now())}
				role="button"
				tabindex="0"
				onclick={() => openDay(day)}
				onkeydown={(e) => e.key === 'Enter' && openDay(day)}
			>
				<div class="s5c-agenda-daynum">{day.getDate()}</div>
				<div class="s5c-agenda-wd">{ctx.fmt.agendaDay(day)}</div>
			</div>
			<div class="s5c-agenda-items">
				{#each items as instance (instance.key)}
					<button
						type="button"
						class="s5c-agenda-item"
						onclick={(e) => ctx.clickEvent(instance, e)}
					>
						<span class="s5c-dot" style={colorVars(instance.color)}></span>
						<span class="s5c-ev-time">{timeText(instance, day)}</span>
						<span class="s5c-ev-title">
							{#if instance.isRecurring}<span class="s5c-recur-mark">↻</span>{/if}
							{instance.event.title}
						</span>
						{#if instance.event.location}
							<span class="s5c-agenda-loc">📍 {instance.event.location}</span>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	{:else}
		<div class="s5c-agenda-empty">{ctx.messages.noEvents}</div>
	{/each}
</div>
