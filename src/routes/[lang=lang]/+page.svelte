<script lang="ts">
	import { page } from '$app/state';
	import { T, REPO_URL, withBase, type Lang } from '../../docs/nav.js';
	import FullDemo from '../../docs/examples/FullDemo.svelte';

	const lang = $derived(page.params.lang as Lang);
	const t = $derived(T(lang));
	const today = new Date().getDate();

	let copied = $state(false);
	async function copyInstall() {
		await navigator.clipboard.writeText('npm install svelte5plus-calendar');
		copied = true;
		setTimeout(() => (copied = false), 1400);
	}

	type Feature = { en: [string, string]; zh: [string, string] };
	const features: Feature[] = [
		{ en: ['Month view', 'Google-style grid with spanning multi-day bars.'], zh: ['月视图', 'Google 风格网格，跨天事件以长条横跨渲染。'] },
		{ en: ['Week & day views', 'Time grid with overlap-aware event packing.'], zh: ['周 / 日视图', '时间网格，重叠事件自动分列排布。'] },
		{ en: ['Year view', 'Twelve mini months with event density dots.'], zh: ['年视图', '12 个迷你月历，带事件密度圆点。'] },
		{ en: ['Agenda view', 'A clean rolling list of upcoming events.'], zh: ['议程视图', '滚动式日程列表，一目了然。'] },
		{ en: ['Drag & drop', 'Move events across days and time slots.'], zh: ['拖拽移动', '在日期与时间格之间自由拖动事件。'] },
		{ en: ['Resize', 'Drag the bottom edge to change duration.'], zh: ['拖拽调整时长', '拖动事件底边即可改变时长。'] },
		{ en: ['Drag to create', 'Built-in quick-create popover on selection.'], zh: ['框选新建', '内置快速新建弹层，框选即建。'] },
		{ en: ['Recurring events', 'RRULE subset: daily/weekly/monthly/yearly.'], zh: ['重复事件', '支持 RRULE 子集：按日/周/月/年重复。'] },
		{ en: ['All-day & multi-day', 'Dedicated all-day lane, week-spanning bars.'], zh: ['全天与跨天', '独立全天栏，跨周长条无缝衔接。'] },
		{ en: ['Multiple calendars', 'Sources with colors, visibility toggles.'], zh: ['多日历源', '分组着色，可独立显示 / 隐藏。'] },
		{ en: ['“+N more” popover', 'Overflow events collapse like Google Calendar.'], zh: ['“还有 N 项”弹层', '溢出事件自动折叠，点击查看全部。'] },
		{ en: ['Now indicator', 'A live red line marks the current minute.'], zh: ['当前时间线', '红色时间线实时标记此刻。'] },
		{ en: ['Business hours', 'Shade non-working days and hours.'], zh: ['营业时间', '非工作时段自动置灰显示。'] },
		{ en: ['Week numbers', 'Optional ISO-8601 week number gutter.'], zh: ['周数', '可选 ISO-8601 周数栏。'] },
		{ en: ['i18n via Intl', 'Any locale; English & Chinese built in.'], zh: ['Intl 国际化', '任意区域设置，内置中英文界面。'] },
		{ en: ['Dark mode & theming', 'Every color is a CSS variable.'], zh: ['暗色与主题', '所有颜色均为 CSS 变量，随意定制。'] },
		{ en: ['Custom rendering', 'Replace event content with your snippets.'], zh: ['自定义渲染', '用 Snippet 完全接管事件内容。'] },
		{ en: ['TypeScript, zero deps', 'Fully typed. No runtime dependencies.'], zh: ['TypeScript · 零依赖', '完整类型定义，无任何运行时依赖。'] }
	];
</script>

<svelte:head>
	<title>{t('svelte5plus-calendar — the calendar for Svelte 5', 'svelte5plus-calendar — Svelte 5 日历组件')}</title>
</svelte:head>

<section class="hero">
	<div class="hero-inner">
		<div class="hero-date" aria-hidden="true">{today}</div>
		<p class="hero-kicker">{t('Open source · Svelte 5 · MIT', '开源 · Svelte 5 · MIT 协议')}</p>
		<h1>
			{#if lang === 'en'}
				Every calendar view your app needs, in <em>one component</em>.
			{:else}
				一个组件，装下应用需要的<em>每一种日历</em>。
			{/if}
		</h1>
		<p class="tagline">
			{t(
				'Month, week, day, year and agenda views. Drag & drop, recurring events, multiple calendars, i18n and dark mode — inspired by Google, Apple and Outlook calendars, built on Svelte 5 runes, with zero dependencies.',
				'月、周、日、年、议程五种视图，拖拽编辑、重复事件、多日历源、国际化与暗色模式。功能对标 Google / Apple / Outlook 日历，基于 Svelte 5 runes 构建，零运行时依赖。'
			)}
		</p>
		<div class="hero-actions">
			<a class="btn btn-primary" href={withBase(`/${lang}/guide/getting-started/`)}>
				{t('Get started', '快速开始')} →
			</a>
			<a class="btn btn-ghost" href={REPO_URL} target="_blank" rel="noreferrer">GitHub</a>
			<button type="button" class="npm-line" onclick={copyInstall} title={t('Click to copy', '点击复制')}>
				<span class="dollar">$</span> npm install svelte5plus-calendar
				<span>{copied ? '✓' : '⧉'}</span>
			</button>
		</div>
	</div>
</section>

<section class="demo-stage">
	<div class="demo-frame">
		<div class="demo-frame-bar">
			<span class="dots"><i></i><i></i><i></i></span>
			<span>{t('Live demo — drag events, select ranges, switch views', '在线演示——拖动事件、框选时段、切换视图')}</span>
		</div>
		<div class="demo-frame-body">
			<FullDemo locale={lang === 'zh' ? 'zh-CN' : 'en'} />
		</div>
	</div>
</section>

<section class="features">
	<h2>{t('A month of features.', '整月的功能，一次装齐。')}</h2>
	<p class="sub">
		{t('Everything below ships in the box — presented, naturally, as a month grid.', '以下全部开箱即用——自然也要排成月历的样子。')}
	</p>
	<div class="feature-grid">
		<div class="feature-cell spacer" aria-hidden="true"></div>
		<div class="feature-cell spacer" aria-hidden="true"></div>
		{#each features as f, i (i)}
			<div class="feature-cell">
				<span class="daynum">{String(i + 1).padStart(2, '0')}</span>
				<h3>{lang === 'en' ? f.en[0] : f.zh[0]}</h3>
				<p>{lang === 'en' ? f.en[1] : f.zh[1]}</p>
			</div>
		{/each}
		<div class="feature-cell spacer" aria-hidden="true"></div>
	</div>
</section>
