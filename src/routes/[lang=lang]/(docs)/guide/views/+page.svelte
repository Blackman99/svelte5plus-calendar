<script lang="ts">
	import type { Lang } from '$docs/nav.js';
	import { page } from '$app/state';
	import Example from '$docs/Example.svelte';
	import ViewsDemo from '$docs/examples/ViewsDemo.svelte';
	import viewsRaw from '$docs/examples/ViewsDemo.svelte?raw';
	import { T } from '$docs/nav.js';

	const lang = $derived(page.params.lang as Lang);
	const t = $derived(T(lang));
	const locale = $derived(lang === 'zh' ? 'zh-CN' : 'en');
</script>

<svelte:head>
	<title>{t('Views — svelte5plus-calendar', '视图 — svelte5plus-calendar')}</title>
</svelte:head>

<h1>{t('Views', '视图')}</h1>
<p class="lede">
	{t(
		'Five built-in views cover the layouts used by Google Calendar, Apple Calendar and Outlook: month, week, day, year and agenda.',
		'五种内置视图覆盖了 Google / Apple / Outlook 日历的常用布局：月、周、日、年、议程。'
	)}
</p>

<Example title={t('All five views — use the toolbar to switch', '五种视图——用工具栏切换')} code={viewsRaw}>
	<ViewsDemo {locale} />
</Example>

<h2>{t('What each view does', '每种视图的行为')}</h2>
<table>
	<thead><tr><th>{t('View', '视图')}</th><th>{t('Layout', '布局')}</th><th>{t('Navigation step', '翻页步长')}</th></tr></thead>
	<tbody>
		<tr>
			<td><code>month</code></td>
			<td>{t('Day grid with spanning multi-day bars and “+N more” overflow.', '日期网格，跨天事件渲染为长条，溢出折叠为“还有 N 项”。')}</td>
			<td>{t('1 month', '1 个月')}</td>
		</tr>
		<tr>
			<td><code>week</code></td>
			<td>{t('Time grid, 7 columns, with an all-day lane on top.', '时间网格，7 列，顶部带全天事件栏。')}</td>
			<td>{t('7 days', '7 天')}</td>
		</tr>
		<tr>
			<td><code>day</code></td>
			<td>{t('Time grid, single column.', '时间网格，单列。')}</td>
			<td>{t('1 day', '1 天')}</td>
		</tr>
		<tr>
			<td><code>year</code></td>
			<td>{t('Twelve mini months; days with events get a dot; clicking a day opens it in the day view.', '12 个迷你月历；有日程的日期显示圆点；点击某天跳转到日视图。')}</td>
			<td>{t('1 year', '1 年')}</td>
		</tr>
		<tr>
			<td><code>agenda</code></td>
			<td>{t('Rolling list of upcoming events grouped by day.', '按天分组的滚动日程列表。')}</td>
			<td><code>agendaDays</code> {t('(default 30)', '（默认 30 天）')}</td>
		</tr>
	</tbody>
</table>

<h2>{t('Configuring views', '视图配置')}</h2>
<ul>
	<li>
		<code>views</code> — {t('which buttons the toolbar offers, e.g.', '工具栏提供哪些视图按钮，例如')}
		<code>views={'{'}['week', 'month']}</code>
	</li>
	<li>
		<code>weekends={'{'}false}</code> — {t('hide Saturday and Sunday in month & week views.', '在月视图和周视图中隐藏周六、周日。')}
	</li>
	<li>
		<code>fixedWeeks</code> — {t('always render 6 rows in the month view so the height never jumps.', '月视图恒定渲染 6 行，高度不随月份跳动。')}
	</li>
	<li>
		<code>dayMaxEvents</code> — {t('max event rows per month cell before events collapse into “+N more” (default 4).', '月视图每格最多显示的事件行数，超出折叠为“还有 N 项”（默认 4）。')}
	</li>
	<li>
		<code>agendaDays</code> — {t('the window length of the agenda view.', '议程视图显示的天数窗口。')}
	</li>
	<li>
		<code>weekNumbers</code> — {t('show ISO-8601 week numbers in month & week views.', '在月视图和周视图中显示 ISO-8601 周数。')}
	</li>
</ul>

<h2>{t('Navigation from your own UI', '在你自己的 UI 中导航')}</h2>
<p>
	{t(
		'The built-in toolbar is optional. Set header={false} and drive the calendar with the bindable date and view props — everything stays in sync.',
		'内置工具栏是可选的。设置 header={false} 后，用可绑定的 date 和 view 属性驱动日历——两侧状态始终同步。'
	)}
</p>
