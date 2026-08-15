<script lang="ts">
	import { page } from '$app/state';
	import { tick } from 'svelte';

	interface Props {
		/** Heading of the widget, e.g. “On this page”. */
		label: string;
	}
	const { label }: Props = $props();

	interface Item {
		id: string;
		text: string;
		level: number;
		el: HTMLElement;
	}

	let items = $state<Item[]>([]);
	let activeIds = $state<string[]>([]);
	let listEl = $state<HTMLElement>();
	/** Position/size of the sliding highlight rail (px, relative to the list). */
	let rail = $state({ top: 0, height: 0, ready: false });
	let mobileOpen = $state(false);

	const path = $derived(page.url.pathname);

	/** Readable anchor ids; keeps CJK characters, falls back to an index. */
	function slugify(text: string, index: number): string {
		const base = text
			.trim()
			.toLowerCase()
			.replace(/[^\p{L}\p{N}\s-]/gu, '')
			.replace(/\s+/g, '-');
		return base || `section-${index}`;
	}

	/**
	 * A heading is active while its section — from the heading down to the next
	 * one — overlaps the reading band, so every section visible on screen is
	 * highlighted at once (the behaviour Nuxt's docs use).
	 */
	function computeActive() {
		if (!items.length) return;
		const bandTop = 72; // under the sticky header
		const bandBottom = window.innerHeight * 0.75;
		const tops = items.map((i) => i.el.getBoundingClientRect().top);
		const next: string[] = [];

		for (let i = 0; i < items.length; i++) {
			const start = tops[i];
			const end = i + 1 < items.length ? tops[i + 1] : Number.POSITIVE_INFINITY;
			if (start < bandBottom && end > bandTop) next.push(items[i].id);
		}

		// Above the first heading (or between bands): fall back to the nearest
		// heading at or above the band so something is always highlighted.
		if (!next.length) {
			let idx = 0;
			for (let i = 0; i < items.length; i++) {
				if (tops[i] <= bandTop) idx = i;
			}
			next.push(items[idx].id);
		}

		if (next.length !== activeIds.length || next.some((id, i) => id !== activeIds[i])) {
			activeIds = next;
		}
	}

	/** Moves the rail to span the active range; transitions handle the animation. */
	function positionRail() {
		if (!listEl || !activeIds.length) return;
		const nodes = activeIds
			.map((id) => listEl!.querySelector<HTMLElement>(`[data-toc="${CSS.escape(id)}"]`))
			.filter((n): n is HTMLElement => !!n);
		if (!nodes.length) return;
		const first = nodes[0];
		const last = nodes[nodes.length - 1];
		rail = {
			top: first.offsetTop,
			height: last.offsetTop + last.offsetHeight - first.offsetTop,
			ready: true
		};
	}

	// Collect headings on every navigation, then track scrolling.
	$effect(() => {
		void path;
		let frame = 0;
		let disposed = false;
		let ro: ResizeObserver | undefined;

		const onScroll = () => {
			if (frame) return;
			frame = requestAnimationFrame(() => {
				frame = 0;
				computeActive();
			});
		};

		(async () => {
			await tick();
			if (disposed) return;
			const content = document.querySelector('.doc-content');
			if (!content) return;

			const seen = new Map<string, number>();
			items = Array.from(content.querySelectorAll<HTMLElement>('h2, h3'))
				// Live demos carry their own headings (the calendar toolbar title
				// is an <h2>) — only prose headings belong in the outline.
				.filter((el) => !el.closest('.example, .s5c'))
				.map((el, i) => {
					const text = el.textContent?.trim() ?? '';
					let id = el.id || slugify(text, i);
					const n = (seen.get(id) ?? 0) + 1;
					seen.set(id, n);
					if (n > 1) id = `${id}-${n}`;
					el.id = id;
					return { id, text, level: el.tagName === 'H3' ? 3 : 2, el };
				});
			rail = { top: 0, height: 0, ready: false };
			mobileOpen = false;
			computeActive();

			window.addEventListener('scroll', onScroll, { passive: true });
			window.addEventListener('resize', onScroll);
			// Examples toggling between preview/code change section offsets.
			ro = new ResizeObserver(onScroll);
			ro.observe(content);
		})();

		return () => {
			disposed = true;
			if (frame) cancelAnimationFrame(frame);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
			ro?.disconnect();
		};
	});

	// Keep the rail glued to the active range (also after fonts/layout settle).
	$effect(() => {
		void activeIds;
		void items;
		positionRail();
	});

	function go(item: Item, e: MouseEvent) {
		e.preventDefault();
		item.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		history.replaceState(null, '', `#${encodeURIComponent(item.id)}`);
		mobileOpen = false;
	}
</script>

{#if items.length > 1}
	<aside class="toc" class:open={mobileOpen}>
		<button
			type="button"
			class="toc-title"
			aria-expanded={mobileOpen}
			onclick={() => (mobileOpen = !mobileOpen)}
		>
			{label}
			<svg class="toc-caret" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
				<path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
			</svg>
		</button>
		<nav class="toc-list" bind:this={listEl} aria-label={label}>
			<span class="toc-track"></span>
			<span
				class="toc-rail"
				class:ready={rail.ready}
				style="transform: translateY({rail.top}px); height: {rail.height}px"
			></span>
			{#each items as item (item.id)}
				<a
					class="toc-link"
					class:sub={item.level === 3}
					class:active={activeIds.includes(item.id)}
					data-toc={item.id}
					href="#{item.id}"
					onclick={(e) => go(item, e)}
				>
					{item.text}
				</a>
			{/each}
		</nav>
	</aside>
{/if}
