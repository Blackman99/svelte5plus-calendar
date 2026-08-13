<script lang="ts">
	import Prism from 'prismjs';
	import 'prismjs/components/prism-typescript.js';
	import 'prism-svelte';

	interface Props {
		code: string;
		lang?: 'svelte' | 'typescript' | 'bash';
		standalone?: boolean;
	}
	const { code, lang = 'svelte', standalone = false }: Props = $props();

	const html = $derived.by(() => {
		const trimmed = code.trim();
		if (lang === 'bash') {
			return trimmed
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.split('\n')
				.map((line) =>
					line.startsWith('npm') || line.startsWith('pnpm') || line.startsWith('yarn')
						? `<span class="token function">${line}</span>`
						: line
				)
				.join('\n');
		}
		const grammar = lang === 'typescript' ? Prism.languages.typescript : Prism.languages.svelte;
		return Prism.highlight(trimmed, grammar, lang);
	});

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(code.trim());
		copied = true;
		setTimeout(() => (copied = false), 1400);
	}
</script>

<div class="codeblock" class:standalone-code={standalone}>
	<button type="button" class="copy-btn" onclick={copy}>{copied ? '✓' : 'copy'}</button>
	<pre><code>{@html html}</code></pre>
</div>
