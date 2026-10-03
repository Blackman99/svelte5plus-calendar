<script lang="ts">
	// 17.5–19.5 · "0 runtime dependencies." — then the zero's counter becomes a portal onto the logo.
	import { arrive, easeInExpo, easeOutExpo, lerp, prog } from '../motion';

	const { t }: { t: number; tf: number } = $props();

	const C = { x: 450, y: 540 }; // centre of the zero
	const LOGO = { x: 960, y: 260 }; // centre of the end card's logo tile (End.svelte)
	const punch = $derived(easeOutExpo(prog(t, 17.5, 17.85)));
	const portal = $derived(easeInExpo(prog(t, 19, 19.5)));
	const s = $derived(lerp(1, 13, portal));
	// the hole slides onto the logo as it opens, so the logo comes straight out of the zero
	const ox = $derived(lerp(C.x, LOGO.x, portal));
	const oy = $derived(lerp(C.y, LOGO.y, portal));
	const l1 = $derived(arrive(t, 17.58, 17.92));
	const l2 = $derived(arrive(t, 17.7, 18.04));
	const c1 = $derived(arrive(t, 18.05, 18.35));
	const c2 = $derived(arrive(t, 18.2, 18.5));
	const drift = $derived(1 + 0.015 * prog(t, 17.8, 19));
	const ring = $derived(lerp(1.25, 1, punch));
</script>

<div class="zero" style="transform: translate({ox}px, {oy}px) scale({s * drift}) translate({-C.x}px, {-C.y}px)">
	<svg class="paper" width="1920" height="1080" viewBox="0 0 1920 1080" overflow="visible">
		<!-- white field with the zero's counter cut out: the end card shows through it -->
		<path
			fill-rule="evenodd"
			fill="#f5f7ff"
			d="M-6000-6000H8000V8000H-6000Z M{C.x - 118} {C.y} a118 214 0 1 0 236 0 a118 214 0 1 0 -236 0Z"
		/>
		<g transform="translate({C.x} {C.y}) scale({ring}) translate({-C.x} {-C.y})">
			<path
				fill-rule="evenodd"
				fill="var(--blue)"
				d="M{C.x - 236} {C.y} a236 330 0 1 0 472 0 a236 330 0 1 0 -472 0Z M{C.x - 118} {C.y} a118 214 0 1 0 236 0 a118 214 0 1 0 -236 0Z"
			/>
		</g>
		<!-- the counter stays paper until the portal opens -->
		<ellipse cx={C.x} cy={C.y} rx="119" ry="215" fill="#f5f7ff" opacity={1 - prog(t, 19.0, 19.08)} />
	</svg>
	<div class="copy">
		<div class="line" style="opacity:{l1}; transform: translateX({(1 - l1) * 160}px)">runtime</div>
		<div class="line" style="opacity:{l2}; transform: translateX({(1 - l2) * 160}px)">dependencies.</div>
		<div class="chips">
			<span style="opacity:{c1}; transform: translateY({(1 - c1) * 30}px)">TypeScript</span>
			<span class="amber" style="opacity:{c2}; transform: translateY({(1 - c2) * 30}px)">MIT</span>
		</div>
	</div>
</div>

<style>
	.zero {
		position: absolute;
		inset: 0;
		transform-origin: 0 0;
	}
	.paper {
		position: absolute;
		left: 0;
		top: 0;
	}
	.copy {
		position: absolute;
		left: 760px;
		top: 262px;
		color: var(--ink);
	}
	.line {
		font-size: 150px;
		font-weight: 800;
		letter-spacing: -0.055em;
		line-height: 1;
	}
	.chips {
		display: flex;
		gap: 22px;
		margin-top: 54px;
	}
	.chips span {
		padding: 14px 36px;
		border-radius: 999px;
		background: var(--blue);
		color: #fff;
		font-size: 56px;
		font-weight: 700;
		letter-spacing: -0.02em;
	}
	.chips .amber {
		background: var(--amber);
		color: var(--ink);
	}
</style>
