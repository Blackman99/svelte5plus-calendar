<script lang="ts">
	// 8.0–17.5 · One continuous week canvas. The camera moves over a single real <Calendar>:
	// drag → drop → resize, the recurrence rule, the dark-mode wipe, ten languages, then (after a hard
	// cut that widens the visible hours) time zones.
	import type { CalendarEvent } from 'svelte5plus-calendar';
	import { onMount } from 'svelte';
	import Cal from '../Cal.svelte';
	import { measureHooks } from '../clock.svelte';
	import Cursor from '../Cursor.svelte';
	import { at, baseEvents, hero, HERO_COLOR, HERO_FROM, HERO_TITLE, HERO_TO } from '../data';
	import { FRONT_CAM } from '../layout';
	import { arrive, clamp, easeInCubic, easeInExpo, easeInOutCubic, easeOutCubic, lerp, prog } from '../motion';

	const { t, tf }: { t: number; tf: number } = $props();

	// ── card-local geometry of the week grid (measured: gutter 67, columns 220.15, 07:00 at y=196)
	const colX = (d: number) => 67 + 220.15 * d;
	const COL_W = 220.15;
	const minY = (m: number) => 196 + (m / 60 - 7) * 54; // 07–20 h, 45 px/h × 1.2 zoom
	// Hard cuts sit half a frame before a frame time, so no frame's motion-blur sub-frames straddle them.
	const T_CUT = 16 - 1 / 120; // hard cut to the time-zone framing (07–24 h, 34 px/h)
	const T_END = 17.5;
	const minY2 = (m: number) => 196 + (m / 60 - 7) * 40.8;

	// ── camera: card-local focus (fx, fy) shown at stage point (ax, ay) with scale s;
	// the 7th field marks a linear hold-push into that key.
	type K = [number, number, number, number, number, number, boolean?];
	const KEYS: K[] = [
		[8.0, 804, 456, FRONT_CAM.s, FRONT_CAM.cx, FRONT_CAM.cy],
		[8.45, 430, 470, 2.0, 960, 560],
		[9.62, 360, 452, 2.0, 960, 560],
		[10.55, 330, 430, 2.15, 960, 560],
		[10.75, 330, 430, 2.18, 960, 560, true],
		[11.15, 804, 456, 0.8, 1236, 600],
		[12.8, 804, 456, 0.84, 1205, 600, true],
		[13.1, 804, 456, 0.9, 960, 616],
		[13.75, 804, 456, 0.925, 960, 616, true],
		[14.05, 320, 67, 3.0, 960, 270],
		[T_CUT, 320, 67, 3.12, 960, 270, true],
		[T_CUT + 0.0001, 804, 456, 0.9, 960, 640],
		[T_END, 804, 456, 0.935, 960, 640, true]
	];
	const cam = $derived.by(() => {
		let i = KEYS.findIndex((k) => k[0] > t);
		if (i === -1)
			i = KEYS.length - 1;
		if (i === 0)
			i = 1;
		const a = KEYS[i - 1];
		const b = KEYS[i];
		const p = b[6] ? prog(t, a[0], b[0]) : easeInOutCubic(prog(t, a[0], b[0]));
		const s = a[3] * (b[3] / a[3]) ** p; // geometric, so zooms feel even
		return { fx: lerp(a[1], b[1], p), fy: lerp(a[2], b[2], p), s, ax: lerp(a[4], b[4], p), ay: lerp(a[5], b[5], p) };
	});
	const toStage = (x: number, y: number) => ({ x: cam.ax + (x - cam.fx) * cam.s, y: cam.ay + (y - cam.fy) * cam.s });
	const cardTransform = $derived(`translate(${cam.ax - cam.fx * cam.s}px, ${cam.ay - cam.fy * cam.s}px) scale(${cam.s})`);

	// ── recurrence timing (the rule is typed, then each occurrence is revealed on an eighth note)
	const RULE = `recurrence: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'`;
	const T_REC = 11.72;
	const REVEAL = [11.75, 12.0, 12.25, 12.5];

	// ── drag → drop → resize, timed to the beat
	const GRAB = { dx: 110, dy: 22 };
	const T_GRAB = 8.78;
	const T_DROP = 9.62;
	const T_RGRAB = 10.05;
	const T_RDROP = 10.55;
	function pointerAt(time: number) {
		const from = { x: colX(HERO_FROM.day) + GRAB.dx, y: minY(HERO_FROM.start) + GRAB.dy };
		const to = { x: colX(HERO_TO.day) + GRAB.dx, y: minY(HERO_TO.start) + GRAB.dy };
		const edge0 = { x: to.x + 4, y: minY(HERO_TO.start + 60) - 3 };
		const edge1 = { x: to.x + 4, y: minY(HERO_TO.end) - 3 };
		if (time < T_GRAB) {
			const p = easeOutCubic(prog(time, 8.32, T_GRAB - 0.04));
			return { x: lerp(from.x + 330, from.x, p), y: lerp(from.y + 260, from.y, p) };
		}
		if (time < T_DROP) {
			const p = easeInOutCubic(prog(time, T_GRAB + 0.04, T_DROP - 0.04));
			return { x: lerp(from.x, to.x, p), y: lerp(from.y, to.y, p) - 46 * Math.sin(Math.PI * p) };
		}
		if (time < T_RGRAB) {
			const p = easeInOutCubic(prog(time, T_DROP + 0.08, T_RGRAB - 0.04));
			return { x: lerp(to.x, edge0.x, p), y: lerp(to.y, edge0.y, p) };
		}
		const p = easeInOutCubic(prog(time, T_RGRAB + 0.04, T_RDROP - 0.04));
		const q = easeInCubic(prog(time, T_RDROP + 0.12, 11.0));
		return { x: lerp(edge0.x, edge1.x, p) + 300 * q, y: lerp(edge0.y, edge1.y, p) + 240 * q };
	}
	const pointer = $derived(pointerAt(t));
	const snap = (m: number) => Math.round(m / 15) * 15;
	/** The drag preview the real component would draw; snapped on the frame clock so snaps stay crisp. */
	const preview = $derived.by(() => {
		const pf = pointerAt(tf);
		if (tf >= T_GRAB && tf < T_DROP) {
			const day = clamp(Math.floor((pf.x - GRAB.dx + COL_W / 2 - 67) / COL_W), 0, 6);
			const start = snap(((pf.y - GRAB.dy - 196) / 54 + 7) * 60);
			return { day, start, end: start + 60 };
		}
		if (tf >= T_RGRAB && tf < T_RDROP)
			return { day: HERO_TO.day, start: HERO_TO.start, end: Math.max(HERO_TO.start + 15, snap(((pf.y + 3 - 196) / 54 + 7) * 60)) };
		return null;
	});
	const heroEvent = $derived.by((): CalendarEvent => {
		if (tf < T_DROP)
			return hero(HERO_FROM.day, HERO_FROM.start, HERO_FROM.end);
		if (tf < T_RDROP)
			return hero(HERO_TO.day, HERO_TO.start, HERO_TO.start + 60);
		if (tf < T_REC)
			return hero(HERO_TO.day, HERO_TO.start, HERO_TO.end);
		// The rule is real; occurrences are revealed in order by releasing them from `exdates`.
		const shown = REVEAL.filter((r) => tf >= r).length;
		return hero(HERO_TO.day, HERO_TO.start, HERO_TO.end, {
			recurrence: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
			exdates: [1, 2, 3, 4].slice(shown).map((d) => at(d))
		});
	});
	const events = $derived([...baseEvents, heroEvent]);
	const typed = $derived(Math.round(clamp((tf - 11.2) / 0.48) * RULE.length));

	// ── dark mode, languages, time zones
	const wipeX = $derived(lerp(1640, -40, easeInOutCubic(prog(t, 12.9, 13.35))));
	const dark = $derived(t >= 12.85 && t < T_CUT);
	const LANGS: [number, string, string][] = [
		[0, 'en', 'English'],
		[14.3, 'zh-CN', '简体中文'],
		[14.6, 'ja', '日本語'],
		[14.9, 'de', 'Deutsch'],
		[15.2, 'ko', '한국어'],
		[15.5, 'ru', 'Русский']
	];
	const NAMES = ['English', '简体中文', 'Deutsch', 'Français', 'Español', 'Português', '日本語', '한국어', 'Русский', 'Italiano'];
	const lang = $derived(tf < T_CUT ? LANGS.filter((l) => tf >= l[0]).at(-1)! : LANGS[0]);
	/** Real IANA zones one hour apart (mid-October 2026 offsets), so the +5 h shift is shown in true steps. */
	const ZONES: [number, string][] = [
		[0, 'America/New_York'],
		[16.45, 'America/Halifax'],
		[16.57, 'America/Noronha'],
		[16.69, 'Atlantic/Cape_Verde'],
		[16.81, 'Africa/Abidjan'],
		[16.93, 'Europe/London']
	];
	const zone = $derived(ZONES.filter((z) => tf >= z[0]).at(-1)![1]);
	const tzMode = $derived(t >= T_CUT);
	/** Languages: the grid folds away below the header strip. */
	const strip = $derived(easeInOutCubic(prog(t, 13.75, 14.05)));
	const clip = $derived(tzMode ? 'none' : `inset(0 0 ${778 * strip}px 0 round 14px)`);

	// ── measured overlays: the real component's own drag classes
	let cardsEl: HTMLDivElement | undefined = $state();
	let previewEl: HTMLDivElement | null = null;
	const fmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });
	const label = (m: number) => fmt.format(at(0, 0, m));
	onMount(() => {
		const measure = () => {
			const light = cardsEl?.querySelector('.card');
			if (!light)
				return;
			const heroEl = light.querySelector<HTMLElement>(`.s5c-block[aria-label="${HERO_TITLE}"]`);
			heroEl?.classList.toggle('s5c-dragging', !!preview);
			if (preview) {
				const col = light.querySelectorAll('.s5c-tg-col')[preview.day];
				if (!previewEl) {
					previewEl = document.createElement('div');
					previewEl.className = 's5c-block s5c-preview';
					previewEl.innerHTML = '<span class="s5c-ev-title"></span><span class="s5c-ev-time"></span>';
				}
				if (previewEl.parentElement !== col)
					col?.appendChild(previewEl);
				const top = ((preview.start - 420) / 60) * 45;
				const h = ((preview.end - preview.start) / 60) * 45;
				previewEl.style.cssText = `--s5c-event-color:${HERO_COLOR}; top:${top}px; height:${h}px; left:0; width:calc(100% - 3px)`;
				previewEl.children[0].textContent = HERO_TITLE;
				previewEl.children[1].textContent = `${label(preview.start)} – ${label(preview.end)}`;
			}
			else {
				previewEl?.remove();
			}
		};
		measureHooks.add(measure);
		return () => {
			measureHooks.delete(measure);
			previewEl?.remove();
		};
	});

	const words = $derived([
		{ w: 'Drag.', p: arrive(t, T_GRAB - 0.02, T_GRAB + 0.25) },
		{ w: 'Drop.', p: arrive(t, T_DROP - 0.02, T_DROP + 0.25) },
		{ w: 'Resize.', p: arrive(t, T_RGRAB - 0.02, T_RGRAB + 0.25) }
	]);
	const wordsOut = $derived(easeInExpo(prog(t, 10.62, 10.82)));
	const cursorStage = $derived(toStage(pointer.x, pointer.y));
	const pressed = $derived(
		Math.max(
			Math.sin(Math.PI * prog(t, T_GRAB - 0.08, T_GRAB + 0.08)) * 0.4,
			t >= T_GRAB && t < T_DROP ? 1 : 0,
			t >= T_RGRAB && t < T_RDROP ? 1 : 0
		)
	);
	const pings = $derived(
		REVEAL.map((r, i) => {
			const p = prog(t, r, r + 0.45);
			const a = toStage(colX(i + 1), minY(HERO_TO.start));
			return { x: a.x, y: a.y, w: COL_W * cam.s, h: (90 / 60) * 54 * cam.s, p, on: tf >= r && t < r + 0.45 };
		})
	);
</script>

<div class="cards" bind:this={cardsEl}>
	<div class="slot" style="transform:{cardTransform}; clip-path:{clip}">
		<Cal
			view="week"
			{events}
			locale={lang[1]}
			timeZone={tzMode ? zone : undefined}
			hours={tzMode ? [7, 24, 34] : [7, 20, 45]}
		/>
	</div>
	{#if dark}
		<div class="slot" style="transform:{cardTransform}; clip-path: inset(0 0 {778 * strip}px {Math.max(0, wipeX)}px round 14px)">
			<Cal view="week" {events} locale={lang[1]} theme="dark" />
		</div>
	{/if}
</div>

<!-- the amber wipe bar: the logo's pill, stood on end -->
{#if t > 12.85 && t < 13.4}
	{@const top = toStage(wipeX, -30)}
	{@const bot = toStage(wipeX, 942)}
	<div class="wipe" style="left:{top.x - 11}px; top:{top.y}px; height:{bot.y - top.y}px; opacity:{1 - prog(t, 13.24, 13.36)}"></div>
{/if}

<!-- Drag. Drop. Resize. — over the empty Monday afternoon -->
{#if t > 8.7 && t < 10.85}
	<div class="words" style="opacity:{1 - wordsOut}; transform: translateX({-wordsOut * 120}px)">
		{#each words as w (w.w)}
			<div class="word" style="opacity:{w.p}; transform: translateX({(w.p - 1) * 80}px)">{w.w}</div>
		{/each}
	</div>
{/if}
{#if t > 8.3 && t < 11.0}
	<Cursor x={cursorStage.x} y={cursorStage.y} {pressed} kind={t >= T_RGRAB - 0.1 && t < T_RDROP + 0.1 ? 'resize' : 'arrow'} />
{/if}

<!-- recurrence -->
{#if t > 10.85 && t < 12.98}
	{@const a = arrive(t, 11.14, 11.3)}
	{@const h = arrive(t, 11.12, 11.4)}
	{@const out = easeInExpo(prog(t, 12.72, 12.95))}
	<div class="head" style="opacity:{h * (1 - out)}; transform: translateY({(1 - h) * 30 - out * 60}px)">Recurring events.</div>
	<div class="rule" style="opacity:{a * (1 - out)}; transform: translateY({(1 - a) * 80 + out * 120}px)">
		<span class="r">{RULE.slice(0, typed)}</span><span class="caret" style="opacity:{typed < RULE.length || Math.floor(tf * 4) % 2 ? 1 : 0}"></span>
	</div>
	{#each pings as g, i (i)}
		{#if g.on}
			<div class="ping" style="left:{g.x}px; top:{g.y}px; width:{g.w}px; height:{g.h}px; opacity:{1 - g.p}; transform: scale({1 + 0.18 * easeOutCubic(g.p)})"></div>
		{/if}
	{/each}
{/if}

<!-- dark mode -->
{#if t > 13.1 && t < 13.76}
	{@const a = arrive(t, 13.15, 13.42)}
	{@const out = easeInExpo(prog(t, 13.56, 13.74))}
	<div class="head" style="opacity:{a * (1 - out)}; transform: translateY({(1 - a) * 30 - out * 60}px)">Dark mode.</div>
{/if}

<!-- languages -->
{#if t > 14.0 && t < T_CUT}
	{@const a = arrive(t, 14.02, 14.3)}
	<div class="langs" style="opacity:{a}; transform: translateY({(1 - a) * 40}px)">
		<div class="big">10 languages</div>
		<div class="names">
			{#each NAMES as n (n)}
				<span class:on={n === lang[2]}>{n}</span>
			{/each}
		</div>
	</div>
{/if}

<!-- time zones -->
{#if tzMode}
	{@const a = arrive(t, T_CUT, T_CUT + 0.3)}
	<div class="head" style="opacity:{a}; transform: translateY({(1 - a) * 30}px)">Any time zone.</div>
	<div class="tzchip" style="opacity:{a}">timeZone=<span>"{zone}"</span></div>
	{#if t >= 16.45}
		{@const g = 1 - prog(t, 17.1, 17.5)}
		{#each [0, 1, 2, 3, 4] as d (d)}
			{@const p0 = toStage(colX(d), minY2(HERO_TO.start))}
			{@const p1 = toStage(colX(d), minY2(HERO_TO.end))}
			<div class="ghost" style="left:{p0.x}px; top:{p0.y}px; width:{COL_W * cam.s - 4}px; height:{p1.y - p0.y}px; opacity:{g}"></div>
		{/each}
		{#if tf >= 16.93}
			{@const lb = toStage(colX(5) + 10, minY2(HERO_TO.start + 150))}
			<div class="delta" style="left:{lb.x}px; top:{lb.y}px; opacity:{arrive(t, 16.93, 17.1) * g}">+5 h</div>
		{/if}
	{/if}
{/if}

<style>
	.cards {
		position: absolute;
		inset: 0;
	}
	.slot {
		position: absolute;
		left: 0;
		top: 0;
		width: 1608px;
		height: 912px;
		transform-origin: 0 0;
	}
	.slot :global(.card) {
		position: relative;
	}
	.wipe {
		position: absolute;
		width: 22px;
		border-radius: 11px;
		background: var(--amber);
		box-shadow: 0 0 40px 8px rgba(255, 181, 46, 0.45);
	}
	.words {
		position: absolute;
		left: 92px;
		top: 560px;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 20px;
	}
	.word {
		padding: 10px 34px 18px;
		border-radius: 26px;
		background: var(--blue);
		color: #fff;
		font-size: 116px;
		font-weight: 800;
		letter-spacing: -0.05em;
		line-height: 1;
		box-shadow: 0 24px 60px -20px rgba(3, 16, 63, 0.6);
	}
	.head {
		position: absolute;
		left: 96px;
		top: 66px;
		font-size: 100px;
		font-weight: 800;
		letter-spacing: -0.05em;
		color: #fff;
		line-height: 1;
		white-space: nowrap;
	}
	.rule {
		position: absolute;
		left: 72px;
		top: 880px;
		padding: 22px 40px;
		border-radius: 22px;
		background: #0b1640;
		box-shadow: 0 30px 70px -20px rgba(3, 16, 63, 0.7);
		font-family: var(--mono);
		font-size: 44px;
		line-height: 1.2;
		white-space: pre;
	}
	.rule .r {
		color: var(--amber);
		font-weight: 600;
	}
	.caret {
		display: inline-block;
		width: 4px;
		height: 50px;
		margin-left: 4px;
		vertical-align: -10px;
		background: var(--amber);
	}
	.ping {
		position: absolute;
		border: 4px solid var(--amber);
		border-radius: 10px;
		transform-origin: 50% 50%;
	}
	.langs {
		position: absolute;
		left: 96px;
		top: 560px;
		color: #fff;
	}
	.big {
		font-size: 168px;
		font-weight: 800;
		letter-spacing: -0.055em;
		line-height: 1;
	}
	.names {
		display: flex;
		flex-wrap: wrap;
		gap: 16px 18px;
		margin-top: 44px;
		max-width: 1700px;
	}
	.names span {
		padding: 10px 26px;
		border-radius: 999px;
		border: 2px solid rgba(255, 255, 255, 0.35);
		font-size: 40px;
		font-weight: 650;
		color: rgba(255, 255, 255, 0.75);
	}
	.names .on {
		background: var(--amber);
		border-color: var(--amber);
		color: var(--ink);
	}
	.tzchip {
		position: absolute;
		right: 96px;
		top: 80px;
		padding: 16px 30px;
		border-radius: 999px;
		background: rgba(11, 22, 64, 0.55);
		border: 2px solid rgba(255, 255, 255, 0.3);
		font-family: var(--mono);
		font-size: 40px;
		color: #dbe3ff;
	}
	.tzchip span {
		color: var(--amber);
		font-weight: 600;
	}
	.ghost {
		position: absolute;
		border: 3px dashed var(--amber);
		border-radius: 8px;
	}
	.delta {
		position: absolute;
		padding: 6px 18px;
		border-radius: 999px;
		background: var(--amber);
		color: var(--ink);
		font-size: 40px;
		font-weight: 800;
		transform: translate(0, -50%);
	}
</style>
