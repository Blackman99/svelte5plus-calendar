<script lang="ts">
	// A macOS-style pointer drawn at film scale. `kind` switches to the vertical-resize cursor.
	const { x, y, pressed = 0, kind = 'arrow', opacity = 1 }: { x: number; y: number; pressed?: number; kind?: 'arrow' | 'resize'; opacity?: number } = $props();
</script>

<div class="cursor" style="transform: translate({x}px, {y}px) scale({1 - 0.12 * pressed}); opacity:{opacity}">
	{#if kind === 'arrow'}
		<svg width="46" height="66" viewBox="0 0 23 33">
			<path d="M1.5 1.5v25.6l6.1-5.9 3.9 9.3 4.3-1.8-3.9-9.1h8.4z" fill="#111" stroke="#fff" stroke-width="2" stroke-linejoin="round" />
		</svg>
	{:else}
		<svg width="40" height="72" viewBox="0 0 20 36" style="transform: translate(-20px, -36px)">
			<path d="M10 1.5l7 8h-4.6v17h4.6l-7 8-7-8h4.6v-17H3z" fill="#111" stroke="#fff" stroke-width="2" stroke-linejoin="round" />
		</svg>
	{/if}
</div>

<style>
	.cursor {
		position: absolute;
		left: 0;
		top: 0;
		transform-origin: 0 0;
		filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.35));
		z-index: 50;
		pointer-events: none;
	}
</style>
