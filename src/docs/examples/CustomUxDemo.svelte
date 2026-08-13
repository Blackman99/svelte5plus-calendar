<script lang="ts">
	import {
		Calendar,
		type EventInstance,
		type RangeSelection
	} from 'svelte5plus-calendar';
	import { sampleEvents, sampleSources } from './sample-events.js';

	let { locale = 'en' } = $props();
	// svelte-ignore state_referenced_locally
	const zh = locale.toLowerCase().startsWith('zh');
	// svelte-ignore state_referenced_locally
	let events = $state(sampleEvents(locale));
	// svelte-ignore state_referenced_locally
	const sources = sampleSources(locale);

	// Providing onSelect/onEventClick suppresses the built-in popovers —
	// these two pieces of state drive our own dialog and drawer instead.
	let draft = $state<(RangeSelection & { title: string; calendarId: string }) | null>(null);
	let selected = $state<EventInstance | null>(null);

	// svelte-ignore state_referenced_locally
	const fmt = new Intl.DateTimeFormat(locale, {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit'
	});

	function save() {
		if (!draft) return;
		events = [
			...events,
			{
				id: crypto.randomUUID(),
				title: draft.title.trim() || (zh ? '（无标题）' : '(untitled)'),
				start: draft.start,
				end: draft.end,
				allDay: draft.allDay,
				calendarId: draft.calendarId
			}
		];
		draft = null;
	}

	function remove() {
		if (!selected) return;
		events = events.filter((ev) => ev.id !== selected!.event.id);
		selected = null;
	}
</script>

<div class="stage">
	<Calendar
		bind:events
		{locale}
		{sources}
		view="week"
		scrollToHour={8}
		editable
		selectable
		onSelect={(sel) => (draft = { ...sel, title: '', calendarId: 'work' })}
		onEventClick={(instance) => (selected = instance)}
	/>

	{#if draft}
		<div class="dim" role="presentation" onclick={() => (draft = null)}></div>
		<form class="dialog" onsubmit={(e) => (e.preventDefault(), save())}>
			<h4>{zh ? '新建日程' : 'New event'}</h4>
			<!-- svelte-ignore a11y_autofocus -->
			<input autofocus placeholder={zh ? '做点什么？' : 'What are you planning?'} bind:value={draft.title} />
			<p>🕐 {fmt.format(draft.start)} – {fmt.format(draft.end)}</p>
			<select bind:value={draft.calendarId}>
				{#each sources as s (s.id)}<option value={s.id}>{s.name}</option>{/each}
			</select>
			<footer>
				<button type="button" onclick={() => (draft = null)}>{zh ? '取消' : 'Cancel'}</button>
				<button type="submit" class="primary">{zh ? '保存' : 'Save'}</button>
			</footer>
		</form>
	{/if}

	{#if selected}
		<aside class="drawer">
			<header>
				<h4>{selected.event.title}</h4>
				<button onclick={() => (selected = null)}>✕</button>
			</header>
			<p>🕐 {fmt.format(selected.start)} – {fmt.format(selected.end)}</p>
			{#if selected.event.location}<p>📍 {selected.event.location}</p>{/if}
			<p>🗂 {sources.find((s) => s.id === selected!.event.calendarId)?.name ?? '—'}</p>
			{#if !selected.isRecurring}
				<button class="danger" onclick={remove}>{zh ? '删除' : 'Delete'}</button>
			{/if}
		</aside>
	{/if}
</div>

<style>
	.stage {
		position: relative;
		display: flex;
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}
	.stage > :global(.s5c) {
		flex: 1;
		min-width: 0;
	}
	.dim {
		position: absolute;
		inset: 0;
		background: rgba(10, 12, 18, 0.45);
		z-index: 40;
	}
	.dialog {
		position: absolute;
		z-index: 41;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 320px;
		background: var(--paper-raised, #fff);
		border: 1px solid var(--line-strong, #ccc);
		border-radius: 14px;
		padding: 18px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		box-shadow: 0 24px 60px -24px rgba(0, 0, 0, 0.45);
	}
	.dialog h4, .drawer h4 { margin: 0; font-size: 15px; }
	.dialog p, .drawer p { margin: 0; font-size: 13px; color: var(--ink-soft, #555); }
	.dialog input, .dialog select {
		font: inherit;
		padding: 7px 10px;
		border: 1px solid var(--line-strong, #ccc);
		border-radius: 8px;
		background: transparent;
		color: inherit;
	}
	.dialog footer { display: flex; justify-content: flex-end; gap: 8px; }
	button {
		font: inherit;
		font-size: 13px;
		padding: 6px 14px;
		border-radius: 8px;
		border: 1px solid var(--line-strong, #ccc);
		background: transparent;
		color: inherit;
		cursor: pointer;
	}
	button.primary { background: var(--accent, #0f3cd9); border-color: transparent; color: #fff; }
	button.danger { color: #d93025; border-color: #d9302566; align-self: flex-start; }
	.drawer {
		position: absolute;
		z-index: 41;
		top: 0;
		right: 0;
		bottom: 0;
		width: 260px;
		background: var(--paper-raised, #fff);
		border-left: 1px solid var(--line-strong, #ccc);
		padding: 18px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		box-shadow: -16px 0 40px -24px rgba(0, 0, 0, 0.35);
	}
	.drawer header { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
	.drawer header button { border: none; padding: 4px 8px; }
</style>
