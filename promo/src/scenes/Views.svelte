<script lang="ts">
	// 3.25–8.4 · The real month view materialises on the code card's surface, then becomes the front slot
	// of a ring of all six live views. One step per beat; the ring ends on Week, which the camera dives into.
	import type { CalendarView } from 'svelte5plus-calendar';
	import { onMount } from 'svelte';
	import Cal from '../Cal.svelte';
	import { measureHooks } from '../clock.svelte';
	import { at, baseEvents, hero, HERO_FROM, resourceEvents } from '../data';
	import { CARD_H, CARD_W, codeMorph, FRONT_CAM, MONTH_CAM, MORPH } from '../layout';
	import { arrive, clamp, easeInCubic, easeInOutExpo, easeOutCubic, lerp, prog } from '../motion';

	const { t }: { t: number; tf: number } = $props();

	const events = [...baseEvents, hero(HERO_FROM.day, HERO_FROM.start, HERO_FROM.end)];
	const SLOTS: { view: CalendarView; label: string; date?: Date }[] = [
		{ view: 'month', label: 'Month' },
		{ view: 'day', label: 'Day', date: at(3) },
		{ view: 'year', label: 'Year' },
		{ view: 'agenda', label: 'Agenda' },
		{ view: 'resources', label: 'Resources' },
		{ view: 'week', label: 'Week' }
	];
	const WEEK = 5;
	const STEP = 60;

	// One step per beat; a slow drift between steps keeps the holds alive and returns to exactly 5.
	const STEPS = [5.5, 6.0, 6.5, 7.0, 7.5];
	const rot = $derived(
		STEPS.reduce((a, s) => a + easeInOutExpo(prog(t, s - 0.12, s + 0.22)), 0)
		+ 0.05 * (prog(t, 5.05, 7.3) - prog(t, 7.3, 7.7))
	);
	const reveal = $derived(easeOutCubic(prog(t, 4.55, 5.0)));
	const exit = $derived(easeInCubic(prog(t, 8.0, 8.4)));

	const R = (CARD_W * FRONT_CAM.s / 2) / Math.tan(Math.PI / 6);
	// the month card pushes in place while it builds (no vertical move under the title row)
	const monthS = $derived(lerp(MONTH_CAM.s, FRONT_CAM.s, prog(t, MORPH[1], 5.0)));
	function cardTransform(i: number) {
		const s = i === 0 ? monthS : FRONT_CAM.s;
		let rel = ((i - rot) % 6 + 6) % 6;
		if (rel > 3)
			rel -= 6;
		const r = R * lerp(2.6, 1, reveal) * (1 + 1.4 * exit);
		return `translate3d(${FRONT_CAM.cx - CARD_W / 2}px, ${FRONT_CAM.cy - CARD_H / 2}px, 0) translateZ(${-r}px) rotateY(${rel * STEP}deg) translateZ(${r}px) scale(${s})`;
	}
	const relOf = (i: number) => {
		const rel = Math.abs(((i - rot) % 6 + 6) % 6);
		return Math.min(rel, 6 - rel);
	};
	function cardOpacity(i: number) {
		if (i === WEEK && t >= 8.0)
			return 0; // the week canvas takes over from exactly this pixel position
		const rel = relOf(i);
		return (i === 0 ? 1 : reveal) * (rel < 0.5 ? 1 : 1 - exit) * clamp(1.6 - rel * 0.55);
	}
	/** The month card is clipped to the code card's morphing rect (card-local px) until it is full size. */
	const monthClip = $derived.by(() => {
		if (t >= MORPH[1])
			return 'none';
		const m = codeMorph(t);
		const x0 = FRONT_CAM.cx - (CARD_W / 2) * monthS;
		const y0 = FRONT_CAM.cy - (CARD_H / 2) * monthS;
		const l = (m.x - x0) / monthS;
		const tp = (m.y - y0) / monthS;
		return `inset(${tp}px ${CARD_W - l - m.w / monthS}px ${CARD_H - tp - m.h / monthS}px ${l}px round ${m.r / monthS}px)`;
	});

	// Materialising reveal, staged on the real component's DOM: grid cross-fades in under the fading code.
	let ringEl: HTMLDivElement | undefined = $state();
	const tb = $derived(arrive(t, 3.32, 3.6));
	const grid = $derived(easeOutCubic(prog(t, 3.3, 3.55)));
	const heroIn = $derived(arrive(t, 4.3, 4.55));

	const tabEls: HTMLSpanElement[] = $state([]);
	let pill = $state({ x: 0, w: 0 });
	let ring = $state({ x: 0, y: 0, w: 0, h: 0 });
	const active = $derived(Math.round(rot));
	const labelsIn = $derived(arrive(t, 4.6, 5.0));
	const labelsOut = $derived(easeInCubic(prog(t, 7.72, 7.92)));

	onMount(() => {
		const measure = () => {
			if (t < 3.2 || t > 8.5)
				return;
			const card = ringEl?.querySelector('.slot .card');
			if (card) {
				card.querySelectorAll<HTMLElement>('.s5c-month-week').forEach((row, k) => {
					row.style.setProperty('--row-n', String(easeOutCubic(prog(t, 3.36 + k * 0.04, 3.6 + k * 0.04))));
					row.style.setProperty('--row-e', String(easeOutCubic(prog(t, 3.5 + k * 0.1, 3.85 + k * 0.1))));
				});
				const h = card.querySelector('[aria-label^="Release sync"]')?.getBoundingClientRect();
				if (h)
					ring = { x: h.left - 8, y: h.top - 7, w: h.width + 16, h: h.height + 14 };
			}
			const a = Math.floor(clamp(rot, 0, 5));
			const b = Math.min(5, a + 1);
			const ra = tabEls[a]?.getBoundingClientRect();
			const rb = tabEls[b]?.getBoundingClientRect();
			if (ra && rb) {
				const p = clamp(rot - a);
				pill = { x: lerp(ra.left, rb.left, p), w: lerp(ra.width, rb.width, p) };
			}
		};
		measureHooks.add(measure);
		return () => measureHooks.delete(measure);
	});
</script>

<div class="ring" bind:this={ringEl}>
	{#each SLOTS as slot, i (slot.view)}
		{#if i === 0 || t > 4.5}
			<div
				class="slot"
				style="transform:{cardTransform(i)}; opacity:{cardOpacity(i)}; filter: brightness({1 - 0.32 * clamp(relOf(i))}); clip-path:{i === 0 ? monthClip : 'none'}"
			>
				<Cal
					view={slot.view}
					events={slot.view === 'resources' ? resourceEvents : events}
					date={slot.date}
					class={i === 0 && t < 4.5 ? 'mat' : ''}
					style={i === 0 ? `--tb:${tb}; --grid:${grid}; --hero:${heroIn}` : ''}
				/>
			</div>
		{/if}
	{/each}
</div>

{#if t > 4.25 && t < 5.2}
	{@const o = heroIn * (1 - prog(t, 4.85, 5.1))}
	<div class="sel" style="left:{ring.x}px; top:{ring.y}px; width:{ring.w}px; height:{ring.h}px; opacity:{o}; transform: scale({lerp(1.35, 1, heroIn)})"></div>
{/if}

{#if t > 4.55 && t < 7.95}
	{@const o = labelsIn * (1 - labelsOut)}
	{@const y = (1 - labelsIn) * 30 - labelsOut * 40}
	<div class="title" style="opacity:{o}; transform: translateY({y}px)">Six views.</div>
	<div class="tabs" style="opacity:{o}; transform: translateY({y}px)">
		{#each SLOTS as slot, i (slot.view)}
			<span bind:this={tabEls[i]} class:on={i === active}>{slot.label}</span>
		{/each}
	</div>
	<div class="pill" style="left:{pill.x}px; width:{pill.w}px; opacity:{o}; transform: translateY({y}px)"></div>
{/if}

<style>
	.ring {
		position: absolute;
		inset: 0;
		perspective: 2600px;
		perspective-origin: 960px 616px;
		transform-style: preserve-3d;
	}
	.slot {
		position: absolute;
		left: 0;
		top: 0;
		width: 1608px;
		height: 912px;
		transform-origin: 804px 456px;
		backface-visibility: hidden;
	}
	.slot :global(.card) {
		position: relative;
	}
	/* staged reveal of the real month view */
	.slot :global(.mat .s5c-toolbar) {
		opacity: var(--tb);
		transform: translateY(calc((1 - var(--tb)) * -18px));
	}
	.slot :global(.mat .s5c-month) {
		opacity: var(--grid);
	}
	.slot :global(.mat .s5c-daynum) {
		opacity: var(--row-n, 0);
	}
	.slot :global(.mat .s5c-month-events) {
		opacity: var(--row-e, 0);
		transform: translateY(calc((1 - var(--row-e, 0)) * 16px));
	}
	.slot :global(.mat [aria-label^='Release sync']) {
		opacity: var(--hero);
	}
	.sel {
		position: absolute;
		border: 4px solid var(--amber);
		border-radius: 12px;
		box-shadow: 0 0 0 6px rgba(255, 181, 46, 0.25);
		transform-origin: 50% 50%;
	}
	.title {
		position: absolute;
		left: 96px;
		top: 62px;
		font-size: 100px;
		font-weight: 800;
		letter-spacing: -0.05em;
		color: #fff;
		line-height: 1;
	}
	.tabs {
		position: absolute;
		left: 640px;
		top: 92px;
		display: flex;
		gap: 44px;
		font-size: 46px;
		font-weight: 650;
		letter-spacing: -0.02em;
		color: rgba(255, 255, 255, 0.5);
		line-height: 1;
	}
	.tabs .on {
		color: #fff;
	}
	.pill {
		position: absolute;
		top: 150px;
		height: 12px;
		border-radius: 6px;
		background: var(--amber);
	}
</style>
