<script lang="ts">
	import { page } from '$app/state';
	import { T, type Lang } from '$docs/nav.js';
	import Example from '$docs/Example.svelte';
	import CodeBlock from '$docs/CodeBlock.svelte';
	import I18nDemo from '$docs/examples/I18nDemo.svelte';
	import i18nRaw from '$docs/examples/I18nDemo.svelte?raw';

	const lang = $derived(page.params.lang as Lang);
	const t = $derived(T(lang));

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
	<li>{t('Built-in UI strings when the locale is en or zh.', '当 locale 为 en 或 zh 时自动套用内置界面文案。')}</li>
</ul>

<h2>{t('Custom UI strings', '自定义界面文案')}</h2>
<CodeBlock standalone lang="typescript" code={custom} />
<p>
	{t('Then pass them to the component:', '然后传给组件：')}
	<code>&lt;Calendar locale="de" messages={'{'}de{'}'} /&gt;</code>
</p>

<div class="callout">
	<strong>{t('Time zones', '时区')}</strong> —
	{t(
		'the calendar renders plain Date objects in the user’s local time zone, the same model as most calendar UIs. Convert on the data layer if you store UTC.',
		'日历按用户本地时区渲染普通 Date 对象，与多数日历 UI 的模型一致。若你的数据以 UTC 存储，请在数据层完成转换。'
	)}
</div>
