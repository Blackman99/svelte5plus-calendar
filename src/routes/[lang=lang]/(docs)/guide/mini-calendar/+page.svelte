<script lang="ts">
	import { page } from '$app/state';
	import { T, type Lang } from '$docs/nav.js';
	import Example from '$docs/Example.svelte';
	import MiniCalendarDemo from '$docs/examples/MiniCalendarDemo.svelte';
	import miniRaw from '$docs/examples/MiniCalendarDemo.svelte?raw';

	const lang = $derived(page.params.lang as Lang);
	const t = $derived(T(lang));
	const locale = $derived(lang === 'zh' ? 'zh-CN' : 'en');
</script>

<svelte:head>
	<title>{t('Mini Calendar — svelte5plus-calendar', '迷你月历 — svelte5plus-calendar')}</title>
</svelte:head>

<h1>{t('Mini Calendar', '迷你月历')}</h1>
<p class="lede">
	{t(
		'A compact standalone month picker — the little calendar in every sidebar. Use it as a date picker, or wire it to a full calendar’s date to build a two-pane layout.',
		'紧凑的独立月份选择器——就是每个侧边栏里的那个小月历。可用作日期选择器，或绑定到大日历的 date 组成双栏布局。'
	)}
</p>

<Example title={t('Standalone date picker with event dots', '独立日期选择器（带事件圆点）')} code={miniRaw} tall={false}>
	<MiniCalendarDemo {locale} />
</Example>

<h2>{t('Props', '属性')}</h2>
<table>
	<thead><tr><th>{t('Prop', '属性')}</th><th>{t('Type', '类型')}</th><th>{t('Notes', '说明')}</th></tr></thead>
	<tbody>
		<tr><td><code>bind:value</code></td><td><code>Date | null</code></td><td>{t('The selected day.', '选中的日期。')}</td></tr>
		<tr><td><code>bind:month</code></td><td><code>Date</code></td><td>{t('The month being displayed.', '当前显示的月份。')}</td></tr>
		<tr><td><code>events</code></td><td><code>CalendarEvent[]</code></td><td>{t('Days containing events get a dot.', '有事件的日期显示圆点。')}</td></tr>
		<tr><td><code>locale</code> / <code>firstDayOfWeek</code></td><td><code>string</code> / <code>Weekday</code></td><td>{t('Same semantics as the main calendar.', '语义与主日历一致。')}</td></tr>
		<tr><td><code>theme</code></td><td><code>'light' | 'dark' | 'auto'</code></td><td>{t('Color scheme.', '配色方案。')}</td></tr>
		<tr><td><code>onSelect</code></td><td><code>(date: Date) =&gt; void</code></td><td>{t('Fires on day click.', '点击日期时触发。')}</td></tr>
	</tbody>
</table>

<h2>{t('Pairing with the main calendar', '与主日历联动')}</h2>
<p>
	{t(
		'Point the mini calendar’s onSelect at the main calendar’s bound date — clicking a day jumps the big view there. The landing-page demo of this site is built exactly that way.',
		'把迷你月历的 onSelect 指向主日历绑定的 date——点击某天，大日历即跳转过去。本站首页的演示正是这样实现的。'
	)}
</p>
