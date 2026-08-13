<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Anchor rectangle (viewport coordinates) the popover opens near. */
		anchor: DOMRect;
		onclose: () => void;
		label?: string;
		children: Snippet;
	}
	let { anchor, onclose, label, children }: Props = $props();

	let el = $state<HTMLDivElement>();
	let pos = $state({ left: -9999, top: -9999 });

	$effect(() => {
		if (!el) return;
		const { innerWidth, innerHeight } = window;
		const w = el.offsetWidth;
		const h = el.offsetHeight;
		let left = anchor.left + anchor.width / 2 - w / 2;
		// Below the anchor by default; flip above when it would overflow.
		let top = anchor.bottom + 6;
		if (top + h > innerHeight - 8) top = anchor.top - h - 6;
		left = Math.max(8, Math.min(left, innerWidth - w - 8));
		top = Math.max(8, Math.min(top, innerHeight - h - 8));
		pos = { left, top };
	});

	function onWindowPointerDown(e: PointerEvent) {
		if (el && !el.contains(e.target as Node)) onclose();
	}
	function onWindowKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
	}
</script>

<svelte:window onpointerdown={onWindowPointerDown} onkeydown={onWindowKeydown} />

<div
	class="s5c-popover"
	bind:this={el}
	style="left:{pos.left}px; top:{pos.top}px;"
	role="dialog"
	aria-label={label}
>
	{@render children()}
</div>
