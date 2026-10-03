<script lang="ts">
	// 18.9–22.5 · End card. The logo is already there when the zero's counter opens onto it; the install
	// command lands, and on the track's final downbeat (21.0 s) the amber pill flies home into the logo.
	import { arrive, easeInOutCubic, easeOutBack, lerp, prog } from '../motion';

	const { t }: { t: number; tf: number } = $props();

	const CELLS = [
		[10, 10, 0.4],
		[26, 10, 0.4],
		[42, 10, 0.4],
		[10, 26, 0.4],
		[26, 26, 1],
		[42, 26, 0.4],
		[42, 42, 0.4]
	];
	const LOGO = 300;
	const U = LOGO / 64;
	const T_HOME = 21.0;
	const word = $derived(arrive(t, 19.42, 19.8));
	const cmd = $derived(easeOutBack(prog(t, 19.6, 20.0), 1.4));
	const url = $derived(arrive(t, 19.85, 20.2));
	const push = $derived(1 + 0.04 * prog(t, 19.3, 22.5));

	// The pill flies in from the left edge along the logo's slot line — above the wordmark, so it never
	// crosses any text — and seats on the track's final downbeat.
	const pill = $derived.by(() => {
		const u = easeInOutCubic(prog(t, T_HOME - 0.5, T_HOME));
		const squash = Math.sin(Math.PI * prog(t, T_HOME, T_HOME + 0.2));
		const home = { x: 960 - LOGO / 2 + 24 * U, y: 110 + 48 * U };
		const w = 28 * U * (1 + 0.6 * Math.sin(Math.PI * u) + 0.14 * squash);
		const h = 12 * U * (1 - 0.14 * squash);
		const x = lerp(-260, home.x, u);
		return { x: x - w / 2, y: home.y - h / 2, w, h, on: t >= T_HOME - 0.5 };
	});
</script>

<div class="end" style="transform: scale({push})">
	<svg class="logo" width={LOGO} height={LOGO} viewBox="0 0 64 64">
		<rect width="64" height="64" rx="15" fill="#fff" />
		{#each CELLS as [x, y, o], i (i)}
			<rect {x} {y} width="12" height="12" rx="3.5" fill="#0f3cd9" opacity={o} />
		{/each}
		<!-- the empty slot the amber pill comes home to -->
		<rect x="10" y="42" width="28" height="12" rx="6" fill="#0f3cd9" opacity={0.1 * (1 - prog(t, T_HOME - 0.05, T_HOME))} />
	</svg>
	<div class="word" style="opacity:{word}; transform: translateY({(1 - word) * 30}px)">
		svelte5plus<span>·calendar</span>
	</div>
	<div class="cmd" style="opacity:{Math.min(1, cmd * 2)}; transform: scale({lerp(0.9, 1, cmd)})">
		<span class="dollar">$</span> npm i svelte5plus-calendar
	</div>
	<div class="url" style="opacity:{url}; transform: translateY({(1 - url) * 20}px)">blackman99.github.io/svelte5plus-calendar</div>
	{#if pill.on}
		<div class="pill" style="left:{pill.x}px; top:{pill.y}px; width:{pill.w}px; height:{pill.h}px; border-radius:{pill.h / 2}px"></div>
	{/if}
</div>

<style>
	.end {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		transform-origin: 960px 540px;
		color: #fff;
	}
	.logo {
		margin-top: 110px;
		flex: none;
		filter: drop-shadow(0 26px 40px rgba(3, 16, 63, 0.45));
		overflow: visible;
	}
	.word {
		margin-top: 44px;
		font-size: 132px;
		font-weight: 800;
		letter-spacing: -0.045em;
		line-height: 1;
	}
	.word span {
		color: var(--amber);
		font-style: italic;
	}
	.cmd {
		margin-top: 52px;
		padding: 36px 72px;
		border-radius: 32px;
		background: #fff;
		color: var(--ink);
		font-family: var(--mono);
		font-size: 84px;
		font-weight: 600;
		letter-spacing: -0.01em;
		line-height: 1.2;
		box-shadow: 0 30px 70px -20px rgba(3, 16, 63, 0.6);
	}
	.dollar {
		color: var(--blue);
		opacity: 0.55;
	}
	.url {
		margin-top: 58px;
		font-size: 58px;
		font-weight: 650;
		color: #fff;
		letter-spacing: -0.015em;
	}
	.pill {
		position: absolute;
		background: var(--amber);
		box-shadow: 0 8px 20px -6px rgba(3, 16, 63, 0.45);
	}
</style>
