<script lang="ts">
	import { clock } from './clock.svelte';
	import End from './scenes/End.svelte';
	import Hook from './scenes/Hook.svelte';
	import Views from './scenes/Views.svelte';
	import Week from './scenes/Week.svelte';
	import Zero from './scenes/Zero.svelte';

	const t = $derived(clock.t);
	// hard cut to the zero, half a frame before 17.5 s so no frame's sub-frames straddle it
	const ZERO_CUT = 17.5 - 1 / 120;
	const tf = $derived(clock.tf);
</script>

<div class="stage">
	<div class="grid" style="background-position: {-14 * t}px {-22 * t}px"></div>
	<div class="glow"></div>
	{#if t >= 3.25 && t < 8.5}
		<Views {t} {tf} />
	{/if}
	<!-- above Views: the code text fades on top while the month view builds beneath it -->
	{#if t < 3.75}
		<Hook {t} {tf} />
	{/if}
	{#if t >= 8 && t < ZERO_CUT}
		<Week {t} {tf} />
	{/if}
	{#if t >= 18.9}
		<End {t} {tf} />
	{/if}
	{#if t >= ZERO_CUT && t < 19.55}
		<Zero {t} {tf} />
	{/if}
</div>

<style>
	.stage {
		position: relative;
		width: 1920px;
		height: 1080px;
		overflow: hidden;
		background: linear-gradient(135deg, var(--blue-deep), var(--blue) 55%, var(--blue-bright));
		font-family: var(--display);
		color: #fff;
	}
	.grid {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px);
		background-size: 66px 66px;
	}
	.glow {
		position: absolute;
		inset: 0;
		background: radial-gradient(1400px 900px at 82% 0%, rgba(255, 255, 255, 0.18), transparent 60%);
	}
</style>
