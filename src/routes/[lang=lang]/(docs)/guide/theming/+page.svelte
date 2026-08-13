<script lang="ts">
	import type { Lang } from '$docs/nav.js';
	import { page } from '$app/state';
	import CodeBlock from '$docs/CodeBlock.svelte';
	import Example from '$docs/Example.svelte';
	import ThemingDemo from '$docs/examples/ThemingDemo.svelte';
	import themingRaw from '$docs/examples/ThemingDemo.svelte?raw';
	import { T } from '$docs/nav.js';

	const lang = $derived(page.params.lang as Lang);
	const t = $derived(T(lang));
	const locale = $derived(lang === 'zh' ? 'zh-CN' : 'en');

	const override = `/* Rebrand the calendar from plain CSS — no build step required. */
.my-app .s5c {
  --s5c-accent: #e4572e;          /* buttons, today, selection            */
  --s5c-today-num-bg: #e4572e;    /* the round "today" badge              */
  --s5c-now-color: #e4572e;       /* current-time line                    */
  --s5c-font: 'Inter', sans-serif;
  --s5c-radius: 12px;             /* toolbar buttons, popovers            */
  --s5c-event-radius: 8px;        /* event pills & blocks                 */
  --s5c-border: #e2e2e2;
  --s5c-bg-subtle: #fafafa;
}`;
</script>

<svelte:head>
	<title>{t('Theming & Dark Mode — svelte5plus-calendar', '主题与暗色模式 — svelte5plus-calendar')}</title>
</svelte:head>

<h1>{t('Theming & Dark Mode', '主题与暗色模式')}</h1>
<p class="lede">
	{t(
		'Every color, radius and font in the calendar is a CSS custom property on the .s5c root — restyle it from plain CSS without touching the component.',
		'日历中的每个颜色、圆角和字体都是 .s5c 根节点上的 CSS 自定义属性——纯 CSS 即可换肤，无需改动组件。'
	)}
</p>

<h2>{t('Built-in themes', '内置主题')}</h2>
<ul>
	<li><code>theme="light"</code> — {t('the default.', '默认。')}</li>
	<li><code>theme="dark"</code> — {t('a tuned dark palette (lighter event hues for contrast).', '精调的暗色调色板（事件颜色提亮以保证对比度）。')}</li>
	<li><code>theme="auto"</code> — {t('follows the OS prefers-color-scheme.', '跟随操作系统的 prefers-color-scheme。')}</li>
</ul>

<Example title={t('Dark mode & brand variables', '暗色模式与品牌变量')} code={themingRaw}>
	<ThemingDemo {locale} />
</Example>

<h2>{t('Overriding variables', '覆盖变量')}</h2>
<CodeBlock standalone lang="typescript" code={override} />

<h2>{t('Key variables', '关键变量')}</h2>
<table>
	<thead><tr><th>{t('Variable', '变量')}</th><th>{t('Controls', '控制')}</th></tr></thead>
	<tbody>
		<tr><td><code>--s5c-accent</code></td><td>{t('Primary accent: active view button, today, selection tint.', '主强调色：激活的视图按钮、今天、框选高亮。')}</td></tr>
		<tr><td><code>--s5c-bg / --s5c-bg-subtle / --s5c-bg-hover</code></td><td>{t('Surfaces and hover states.', '背景与悬停态。')}</td></tr>
		<tr><td><code>--s5c-border / --s5c-border-strong</code></td><td>{t('Grid lines and control borders.', '网格线与控件边框。')}</td></tr>
		<tr><td><code>--s5c-text / --s5c-text-muted / --s5c-text-faint</code></td><td>{t('Text hierarchy.', '文字层级。')}</td></tr>
		<tr><td><code>--s5c-today-bg / --s5c-today-num-bg</code></td><td>{t('Today column tint and the round date badge.', '今日列底色与圆形日期徽标。')}</td></tr>
		<tr><td><code>--s5c-now-color</code></td><td>{t('The current-time line.', '当前时间线。')}</td></tr>
		<tr><td><code>--s5c-red … --s5c-pink</code></td><td>{t('The 10 palette colors used by events.', '事件使用的 10 个调色板颜色。')}</td></tr>
		<tr><td><code>--s5c-font / --s5c-font-size</code></td><td>{t('Typography.', '字体排印。')}</td></tr>
		<tr><td><code>--s5c-radius / --s5c-event-radius</code></td><td>{t('Corner radii for chrome and events.', '组件与事件的圆角。')}</td></tr>
	</tbody>
</table>

<div class="callout">
	<strong>{t('Scoping', '作用域')}</strong> —
	{t(
		'set variables on any ancestor (or on .s5c itself via the class prop) to theme calendars per-section, per-page or per-tenant.',
		'把变量设置在任意祖先元素上（或通过 class 属性作用到 .s5c 本身），即可按区块、页面甚至租户维度定制主题。'
	)}
</div>
