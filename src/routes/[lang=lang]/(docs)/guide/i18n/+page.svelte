<script lang="ts">
	import { page } from '$app/state';
	import { T, type Lang } from '$docs/nav.js';
	import Example from '$docs/Example.svelte';
	import CodeBlock from '$docs/CodeBlock.svelte';
	import I18nDemo from '$docs/examples/I18nDemo.svelte';
	import i18nRaw from '$docs/examples/I18nDemo.svelte?raw';
	import TimezoneDemo from '$docs/examples/TimezoneDemo.svelte';
	import timezoneRaw from '$docs/examples/TimezoneDemo.svelte?raw';

	const lang = $derived(page.params.lang as Lang);
	const t = $derived(T(lang));
	const locale = $derived(lang === 'zh' ? 'zh-CN' : 'en');

	const custom = `import type { CalendarMessages } from 'svelte5plus-calendar';

// Add a locale (or override single strings) via the messages prop:
const de: Partial<CalendarMessages> = {
  today: 'Heute',
  day: 'Tag',
  week: 'Woche',
  month: 'Monat',
  year: 'Jahr',
  agenda: 'Agenda',
  allDay: 'Ganztägig',
  more: (n) => \`+\${n} weitere\`,
  noEvents: 'Keine Termine'
};`;
</script>

<svelte:head>
	<title>{t('Internationalization — svelte5plus-calendar', '国际化 — svelte5plus-calendar')}</title>
</svelte:head>

<h1>{t('Internationalization', '国际化')}</h1>
<p class="lede">
	{t(
		'Pass any BCP-47 locale tag. Date and time formats come from the browser’s Intl API — no locale bundles to ship. UI strings are built in for English and Chinese, and trivially extensible for anything else.',
		'传入任意 BCP-47 区域标签即可。日期与时间格式全部来自浏览器的 Intl API——无需打包语言资源。界面文案内置中英文，其他语言可轻松扩展。'
	)}
</p>

<Example title={t('Locale, week start and clock', '区域、周首日与时制')} code={i18nRaw}>
	<I18nDemo />
</Example>

<h2>{t('What the locale controls', 'locale 控制什么')}</h2>
<ul>
	<li>{t('Month/day/weekday names, title formats and time labels (via Intl.DateTimeFormat).', '月份/日期/星期名称、标题格式与时间标签（通过 Intl.DateTimeFormat）。')}</li>
	<li>{t('The default first day of week (via Intl.Locale weekInfo, with a safe fallback) — override with firstDayOfWeek.', '默认周首日（通过 Intl.Locale weekInfo，含安全回退）——可用 firstDayOfWeek 覆盖。')}</li>
	<li>{t('12/24-hour clock — override with hour12.', '12/24 小时制——可用 hour12 覆盖。')}</li>
	<li>
		{t(
			'Built-in UI strings for 10 languages: en, zh, de, fr, es, pt, ja, ko, ru, it — anything else falls back to English (override via messages).',
			'内置 10 种语言的界面文案：en、zh、de、fr、es、pt、ja、ko、ru、it——其他语言回退到英文（可用 messages 覆盖）。'
		)}
	</li>
</ul>

<h2>{t('Custom UI strings', '自定义界面文案')}</h2>
<CodeBlock standalone lang="typescript" code={custom} />
<p>
	{t('Then pass them to the component:', '然后传给组件：')}
	<code>&lt;Calendar locale="de" messages={'{'}de{'}'} /&gt;</code>
</p>

<h2>{t('Display time zone', '显示时区')}</h2>
<p>
	{t(
		'Pass an IANA zone via the timeZone prop to render the whole calendar in that zone. Event Dates remain real instants — the grid, popovers, quick-create and drag edits are all displayed and interpreted in the target zone, and edited values are converted back automatically.',
		'通过 timeZone 属性传入 IANA 时区，整个日历即按该时区渲染。事件的 Date 依然是真实时刻——网格、弹层、快速新建与拖拽编辑都以目标时区显示和解释，编辑结果自动换算回真实时刻。'
	)}
</p>
<Example title={t('Same events, different zones', '同一批事件，不同时区')} code={timezoneRaw}>
	<TimezoneDemo {locale} />
</Example>
<div class="callout">
	<strong>{t('Recurrence caveat', '重复事件注意')}</strong> —
	{t(
		'recurring wall-clock times follow the display zone (a 9:30 standup stays at 9:30 in the zone you are viewing). Anchor-zone recurrence is on the roadmap.',
		'重复事件的“墙上时钟”跟随显示时区（9:30 的站会在你查看的时区里始终显示为 9:30）。锚定原时区的重复语义在路线图中。'
	)}
</div>
