<script lang="ts">
	// 0.0–3.7 · Hook → wall of problems → two lines of code. The code card's surface becomes the month
	// card (Views.svelte clips the real calendar to the same morphing rect), so there is no blank frame.
	import { codeMorph, MORPH } from '../layout';
	import { arrive, clamp, easeInCubic, easeInExpo, easeOutCubic, lerp, prog, rand } from '../motion';

	const { t, tf }: { t: number; tf: number } = $props();

	// ── 1 · headline (frame 0 is finished; it leaves before any chip reaches it)
	const push = $derived(1 + 0.05 * prog(t, 0, 1.0));
	const exitH = $derived(easeInExpo(prog(t, 0.68, 0.98)));

	// ── 2 · wall of problems (all real things the library handles)
	const WORDS = [
		'drag & drop',
		'recurring events',
		'time zones',
		'DST',
		'resize',
		'overlap layout',
		'dark mode',
		'i18n',
		'keyboard a11y',
		'ICS import',
		'all-day events',
		'week numbers',
		'touch drag',
		'business hours',
		'RRULE',
		'agenda view',
		'year view',
		'resources',
		'now indicator',
		'multi-day bars',
		'+N more',
		'snapping',
		'focus trap',
		'screen readers',
		'locales',
		'exdates',
		'popovers',
		'edit series',
		'month grid',
		'validRange'
	];
	// Four lanes, one speed per lane (parallax), chips stacked with a gap: nothing overtakes, nothing collides.
	const LANES = 4;
	const SPEED = [1900, 2300, 1700, 2100];
	const laneY = [1110, 1250, 1160, 1330];
	const chips = WORDS.map((w, i) => {
		const lane = i % LANES;
		const size = Math.min(72, Math.floor(400 / (0.56 * w.length + 1.3)));
		const y0 = laneY[lane];
		laneY[lane] += size * 1.45 + 40 + rand(i * 5 + 3) * 50;
		return { w, amber: i % 9 === 4, size, x: 240 + lane * 480 + (rand(i * 3 + 2) - 0.5) * 70, y0, v: SPEED[lane] };
	});
	const CENTER = { x: 960, y: 640 };
	const suck = $derived(easeInCubic(prog(t, 1.38, 1.6)));
	const chipStyle = (c: (typeof chips)[number]) => {
		const y = c.y0 - c.v * Math.max(0, t - 0.74);
		const x = lerp(c.x, CENTER.x + (c.x - 960) * 0.25, suck);
		const yy = lerp(y, CENTER.y + (y - 640) * 0.1, suck);
		return `transform: translate(${x}px, ${yy}px) translate(-50%, -50%) scale(${lerp(1, 0.3, suck)}); font-size:${c.size}px; opacity:${1 - prog(t, 1.46, 1.6)}`;
	};

	// ── 3 · code card
	const cardIn = $derived(easeOutCubic(prog(t, 1.52, 1.8)));
	const LINE3 = '<Calendar bind:events editable />';
	const typed = $derived(Math.round(clamp((tf - 1.95) / 0.5) * LINE3.length));
	const card = $derived(codeMorph(t));
	const textPush = $derived(1 + 0.035 * prog(t, 1.9, MORPH[0]));
	const codeOut = $derived(prog(t, MORPH[0], MORPH[0] + 0.15));
	const kickerIn = $derived(arrive(t, 1.84, 2.12));
	const kickerOut = $derived(easeInExpo(prog(t, 3.12, 3.34)));
</script>

{#if t < 1.0}
	<div class="headline" style="transform: translateY({-950 * exitH}px) scale({push * (1 - 0.12 * exitH)}); opacity:{1 - exitH * 0.7}">
		<div>Building a</div>
		<div><span class="u">calendar<span class="pill"></span></span>?</div>
	</div>
{/if}

{#if t > 0.7 && t < 1.62}
	<div class="wall">
		{#each chips as c (c.w)}
			<div class="chip" class:amber={c.amber} style={chipStyle(c)}>{c.w}</div>
		{/each}
	</div>
{/if}

{#if t > 1.5 && t < MORPH[1]}
	<div class="kicker" style="opacity:{kickerIn * (1 - kickerOut)}; transform: translateY({(1 - kickerIn) * 40 - kickerOut * 260}px) scale({textPush})">
		One <b>Svelte 5</b> component.
	</div>
	<!-- the white surface hands over to the real month card (same rect) at the start of the morph -->
	<div
		class="code"
		class:handed={t >= MORPH[0]}
		style="left:{card.x}px; top:{card.y}px; width:{card.w}px; height:{card.h}px; border-radius:{card.r}px; opacity:{cardIn}; transform: scale({lerp(0.94, 1, cardIn)})"
	>
		<pre style="opacity:{prog(t, 1.62, 1.76) * (1 - codeOut)}; transform: scale({textPush * (1 - 0.06 * codeOut)})"><span class="k">import</span> {'{'} Calendar } <span class="k">from</span>
  <span class="s">'svelte5plus-calendar'</span>;
<span class="tag">{LINE3.slice(0, typed)}</span><span class="caret" style="opacity:{typed < LINE3.length || Math.floor(tf * 4) % 2 ? 1 : 0}"></span></pre>
	</div>
{/if}

<style>
	.headline {
		position: absolute;
		left: 100px;
		top: 222px;
		font-size: 300px;
		line-height: 0.92;
		font-weight: 800;
		letter-spacing: -0.058em;
		color: #fff;
		transform-origin: 0 50%;
	}
	.u {
		position: relative;
	}
	.pill {
		position: absolute;
		left: 12px;
		right: 8px;
		bottom: -22px;
		height: 36px;
		border-radius: 18px;
		background: var(--amber);
	}
	.wall {
		position: absolute;
		inset: 0;
	}
	.chip {
		position: absolute;
		left: 0;
		top: 0;
		padding: 0.2em 0.6em;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.14);
		border: 2px solid rgba(255, 255, 255, 0.38);
		color: #fff;
		font-weight: 650;
		letter-spacing: -0.02em;
		white-space: nowrap;
		transform-origin: 50% 50%;
	}
	.chip.amber {
		background: var(--amber);
		border-color: var(--amber);
		color: var(--ink);
	}
	.kicker {
		position: absolute;
		left: 0;
		right: 0;
		top: 268px;
		text-align: center;
		font-size: 92px;
		font-weight: 800;
		letter-spacing: -0.045em;
		color: #fff;
		line-height: 1;
	}
	.kicker b {
		color: var(--amber);
		font-weight: 800;
	}
	.code {
		position: absolute;
		background: #fff;
		box-shadow:
			0 40px 90px -20px rgba(3, 16, 63, 0.55),
			0 10px 30px -10px rgba(3, 16, 63, 0.35);
		overflow: hidden;
		transform-origin: 50% 50%;
	}
	.code.handed {
		background: transparent;
		box-shadow: none;
	}
	pre {
		margin: 0;
		padding: 74px 72px;
		font-family: var(--mono);
		font-size: 64px;
		line-height: 1.45;
		color: #24292f;
		white-space: pre;
		transform-origin: 0 0;
	}
	.k {
		color: #cf222e;
	}
	.s {
		color: #0a3069;
		font-weight: 700;
	}
	.tag {
		color: var(--blue);
		font-weight: 700;
	}
	.caret {
		display: inline-block;
		width: 5px;
		height: 72px;
		margin-left: 6px;
		vertical-align: -12px;
		background: var(--blue);
	}
</style>
