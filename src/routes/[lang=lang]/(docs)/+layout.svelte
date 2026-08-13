<script lang="ts">
	import type { Lang } from '../../../docs/nav.js';
	import { page } from '$app/state';
	import { docSequence, guideNav, T, withBase } from '../../../docs/nav.js';

	const { children } = $props();

	const lang = $derived(page.params.lang as Lang);
	const t = $derived(T(lang));
	const path = $derived(page.url.pathname);

	const seq = $derived(docSequence(lang));
	const idx = $derived(seq.findIndex((s) => path === s.href));
	const prev = $derived(idx > 0 ? seq[idx - 1] : null);
	const next = $derived(idx >= 0 && idx < seq.length - 1 ? seq[idx + 1] : null);
</script>

<div class="docs-shell">
	<nav class="sidebar" aria-label={t('Documentation', '文档')}>
		<h4>{t('Guide', '指南')}</h4>
		{#each guideNav as item (item.slug)}
			{@const href = withBase(`/${lang}/guide/${item.slug}/`)}
			<a {href} class:active={path === href}>{lang === 'en' ? item.en : item.zh}</a>
		{/each}
		<h4>{t('Reference', '参考')}</h4>
		<a href={withBase(`/${lang}/api/`)} class:active={path === withBase(`/${lang}/api/`)}>
			{t('API Reference', 'API 参考')}
		</a>
	</nav>
	<main class="doc-content">
		{@render children()}
		<nav class="doc-footer-nav">
			{#if prev}
				<a href={prev.href}>
					<small>← {t('Previous', '上一篇')}</small>
					{prev.title}
				</a>
			{/if}
			{#if next}
				<a class="next" href={next.href}>
					<small>{t('Next', '下一篇')} →</small>
					{next.title}
				</a>
			{/if}
		</nav>
	</main>
</div>
