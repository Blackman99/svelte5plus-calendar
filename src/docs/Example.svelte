<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
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
		/** Show the code panel by default. */
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

	const isZh = $derived(page.params.lang === 'zh');

	// svelte-ignore state_referenced_locally — `open` is an initial value by design
	let mode = $state<'preview' | 'code'>(open ? 'code' : 'preview');
	let activeTab = $state(0);

	/**
	 * Every file involved in the demo, main file first. Helper modules the demo
	 * imports (currently `sample-events`) are appended automatically so readers
	 * always see the complete, runnable source. The demos import the library by
	 * its published name (aliased to src/lib locally), so the source is shown
	 * verbatim — copy-paste identical to real-world usage.
	 */
	const allFiles = $derived.by<ExampleFile[]>(() => {
		const out: ExampleFile[] = [{ name: 'App.svelte', code, lang: 'svelte' }];
		for (const f of files) out.push(f);
		if (code.includes('./sample-events.js') && !files.some((f) => f.name.includes('sample-events'))) {
			out.push({ name: 'sample-events.ts', code: sampleEventsRaw, lang: 'typescript' });
		}
		return out;
	});
	const active = $derived(allFiles[Math.min(activeTab, allFiles.length - 1)]);
</script>

<figure class="example">
	<div class="example-head">
		<span class="example-title">{title}</span>
		<span class="example-spacer"></span>
		<!-- Code swaps into the preview's spot, so the toggle and the content stay together. -->
		<div class="example-mode" role="tablist">
			<button
				type="button"
				class="example-btn"
				class:on={mode === 'preview'}
				role="tab"
				aria-selected={mode === 'preview'}
				onclick={() => (mode = 'preview')}
			>
				{isZh ? '预览' : 'Preview'}
			</button>
			<button
				type="button"
				class="example-btn"
				class:on={mode === 'code'}
				role="tab"
				aria-selected={mode === 'code'}
				onclick={() => (mode = 'code')}
			>
				{codeLabel}
			</button>
		</div>
	</div>
	<!-- Kept mounted while code is shown so the demo's state survives toggling. -->
	<div class="example-preview" class:tall class:is-hidden={mode === 'code'}>
		{@render children()}
	</div>
	{#if mode === 'code'}
		<div class="example-code-area" class:tall>
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
		</div>
	{/if}
</figure>
