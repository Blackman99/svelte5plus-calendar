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

	// ---- focus management ------------------------------------------------------
	// Move focus into the popover on open, cycle Tab within it, restore on close.
	const focusablesIn = (root: HTMLElement) =>
		Array.from(
			root.querySelectorAll<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			)
		);

	$effect(() => {
		if (!el) return;
		const previous = document.activeElement as HTMLElement | null;
		// Autofocusing inputs (quick-create) win over the default focus target.
		if (!el.contains(document.activeElement)) {
			focusablesIn(el)[0]?.focus();
		}
		return () => previous?.focus?.();
	});

	function onPopoverKeydown(e: KeyboardEvent) {
		if (e.key !== 'Tab' || !el) return;
		const items = focusablesIn(el);
		if (!items.length) return;
		const first = items[0];
		const last = items[items.length - 1];
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}
</script>

<svelte:window onpointerdown={onWindowPointerDown} onkeydown={onWindowKeydown} />

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="s5c-popover"
	bind:this={el}
	style="left:{pos.left}px; top:{pos.top}px;"
	role="dialog"
	aria-label={label}
	tabindex="-1"
	onkeydown={onPopoverKeydown}
>
	{@render children()}
</div>
