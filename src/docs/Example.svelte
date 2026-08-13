<script lang="ts">
	import type { Snippet } from 'svelte';
	import CodeBlock from './CodeBlock.svelte';
	import sampleEventsRaw from './examples/sample-events.ts?raw';

	interface ExampleFile {
		name: string;
		code: string;
		lang?: 'svelte' | 'typescript' | 'bash';
	}

	interface Props {
		title: string;
		code: string;
		/** Extra source files to show as tabs next to the main file. */
		files?: ExampleFile[];
		/** Give the preview a fixed height (calendar views need one). */
		tall?: boolean;
		/** Open the code panel by default. */
		open?: boolean;
		codeLabel?: string;
		children: Snippet;
	}
	let {
		title,
		code,
		files = [],
		tall = true,
		open = false,
		codeLabel = '</> Code',
		children
	}: Props = $props();

	// svelte-ignore state_referenced_locally — `open` is an initial value by design
	let showCode = $state(open);
	let activeTab = $state(0);

	// The demos import from '$lib'; readers should see the published package name.
	const clean = (source: string) => source.replaceAll("'$lib'", "'svelte5plus-calendar'");

	/**
	 * Every file involved in the demo, main file first. Helper modules the demo
	 * imports (currently `sample-events`) are appended automatically so readers
	 * always see the complete, runnable source.
	 */
	const allFiles = $derived.by<ExampleFile[]>(() => {
		const out: ExampleFile[] = [{ name: 'App.svelte', code: clean(code), lang: 'svelte' }];
		for (const f of files) out.push({ ...f, code: clean(f.code) });
		if (code.includes('./sample-events.js') && !files.some((f) => f.name.includes('sample-events'))) {
			out.push({ name: 'sample-events.ts', code: clean(sampleEventsRaw), lang: 'typescript' });
		}
		return out;
	});
	const active = $derived(allFiles[Math.min(activeTab, allFiles.length - 1)]);
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
		{#if allFiles.length > 1}
			<div class="file-tabs" role="tablist">
				{#each allFiles as file, i (file.name)}
					<button
						type="button"
						class="file-tab"
						class:active={i === activeTab}
						role="tab"
						aria-selected={i === activeTab}
						onclick={() => (activeTab = i)}
					>
						{file.name}
					</button>
				{/each}
			</div>
		{/if}
		<CodeBlock code={active.code} lang={active.lang ?? 'svelte'} />
	{/if}
</figure>
