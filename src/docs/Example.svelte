<script lang="ts">
	import type { Snippet } from 'svelte';
	import CodeBlock from './CodeBlock.svelte';

	interface Props {
		title: string;
		code: string;
		/** Give the preview a fixed height (calendar views need one). */
		tall?: boolean;
		/** Open the code panel by default. */
		open?: boolean;
		codeLabel?: string;
		children: Snippet;
	}
	let { title, code, tall = true, open = false, codeLabel = '</> Code', children }: Props = $props();

	// svelte-ignore state_referenced_locally — `open` is an initial value by design
	let showCode = $state(open);

	// The demos import from '$lib'; readers should see the published package name.
	const displayCode = $derived(code.replaceAll("'$lib'", "'svelte5plus-calendar'"));
</script>

<figure class="example">
	<div class="example-head">
		<span class="example-title">{title}</span>
		<span class="example-spacer"></span>
		<button type="button" class="example-btn" class:on={showCode} onclick={() => (showCode = !showCode)}>
			{codeLabel}
		</button>
	</div>
	<div class="example-preview" class:tall>
		{@render children()}
	</div>
	{#if showCode}
		<CodeBlock code={displayCode} />
	{/if}
</figure>
