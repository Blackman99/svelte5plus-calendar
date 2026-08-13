<script lang="ts">
	// Explicit side-effect import: Vite 8 (rolldown) tree-shakes the CSS import
	// inside $lib/index.ts despite `sideEffects: ["**/*.css"]`.
	import '$lib/theme.css';
	import '../../docs/docs.css';
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { T, REPO_URL, withBase, type Lang } from '../../docs/nav.js';

	let { children } = $props();

	const lang = $derived(page.params.lang as Lang);
	const t = $derived(T(lang));
	const otherPath = $derived((target: Lang) => {
		const rel = page.url.pathname.slice(base.length);
		return base + rel.replace(/^\/(en|zh)/, `/${target}`);
	});
	const inGuide = $derived(page.url.pathname.includes('/guide/'));
	const inApi = $derived(page.url.pathname.includes('/api'));

	$effect(() => {
		document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
	});
</script>

<svelte:head>
	<meta
		name="description"
		content={t(
			'A full-featured, zero-dependency calendar component for Svelte 5 — month, week, day, year and agenda views, drag & drop, recurring events, i18n and dark mode.',
			'为 Svelte 5 打造的全功能零依赖日历组件——月/周/日/年/议程视图、拖拽编辑、重复事件、国际化与暗色模式。'
		)}
	/>
</svelte:head>

<header class="site-header">
	<a class="brand" href={withBase(`/${lang}/`)}>
		<svg class="logo" viewBox="0 0 26 26" aria-hidden="true">
			<rect x="1" y="1" width="7" height="7" rx="2" fill="none" stroke="currentColor" stroke-width="1.6" />
			<rect x="9.5" y="1" width="7" height="7" rx="2" fill="none" stroke="currentColor" stroke-width="1.6" />
			<rect x="18" y="1" width="7" height="7" rx="2" fill="none" stroke="currentColor" stroke-width="1.6" />
			<rect x="1" y="9.5" width="7" height="7" rx="2" fill="none" stroke="currentColor" stroke-width="1.6" />
			<rect x="9.5" y="9.5" width="7" height="7" rx="2" fill="#0f3cd9" stroke="none" />
			<rect x="18" y="9.5" width="7" height="7" rx="2" fill="none" stroke="currentColor" stroke-width="1.6" />
			<rect x="1" y="18" width="7" height="7" rx="2" fill="none" stroke="currentColor" stroke-width="1.6" />
			<rect x="9.5" y="18" width="7" height="7" rx="2" fill="none" stroke="currentColor" stroke-width="1.6" />
			<rect x="18" y="18" width="7" height="7" rx="2" fill="none" stroke="currentColor" stroke-width="1.6" />
		</svg>
		svelte5plus<em>·calendar</em>
	</a>
	<nav class="header-nav">
		<a href={withBase(`/${lang}/guide/getting-started/`)} class:active={inGuide}>
			{t('Guide', '指南')}
		</a>
		<a href={withBase(`/${lang}/api/`)} class:active={inApi}>{t('API', 'API 参考')}</a>
	</nav>
	<span class="header-spacer"></span>
	<nav class="lang-toggle" aria-label="Language">
		<a href={otherPath('en')} class:active={lang === 'en'}>EN</a>
		<a href={otherPath('zh')} class:active={lang === 'zh'}>中文</a>
	</nav>
	<a class="gh-link" href={REPO_URL} target="_blank" rel="noreferrer">
		<svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
			<path
				d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
			/>
		</svg>
		GitHub
	</a>
</header>

{#key lang}
	{@render children()}
{/key}

<footer class="site-footer">
	svelte5plus-calendar ·
	{t('MIT licensed, free forever.', 'MIT 协议，永久免费。')}
	· <a href={REPO_URL}>GitHub</a>
	· {t('Built with', '基于')} Svelte 5
</footer>
