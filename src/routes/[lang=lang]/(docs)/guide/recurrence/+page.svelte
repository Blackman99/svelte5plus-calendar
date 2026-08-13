<script lang="ts">
	import type { Lang } from '$docs/nav.js';
	import { page } from '$app/state';
	import CodeBlock from '$docs/CodeBlock.svelte';
	import Example from '$docs/Example.svelte';
	import RecurrenceDemo from '$docs/examples/RecurrenceDemo.svelte';
	import recurrenceRaw from '$docs/examples/RecurrenceDemo.svelte?raw';
	import { T } from '$docs/nav.js';

	const lang = $derived(page.params.lang as Lang);
	const t = $derived(T(lang));
	const locale = $derived(lang === 'zh' ? 'zh-CN' : 'en');

	const objForm = `// String form (RFC 5545 RRULE subset)…
recurrence: 'FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=10'

// …or the equivalent object form
recurrence: {
  freq: 'weekly',      // 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: 1,         // every N periods
  byDay: [1, 3, 5],    // 0 = Sunday … 6 = Saturday
  count: 10            // or: until: new Date(2027, 0, 1)
}

// Cancel individual occurrences by date:
exdates: [new Date(2026, 7, 19)]`;
</script>

<svelte:head>
	<title>{t('Recurring Events — svelte5plus-calendar', '重复事件 — svelte5plus-calendar')}</title>
</svelte:head>

<h1>{t('Recurring Events', '重复事件')}</h1>
<p class="lede">
	{t(
		'Repeat an event daily, weekly, monthly or yearly with a practical subset of the iCalendar RRULE grammar — as a string or a typed object. The event’s start acts as DTSTART; occurrences inherit its time and duration.',
		'通过 iCalendar RRULE 语法的实用子集，让事件按日、周、月、年重复——字符串或类型化对象均可。事件的 start 即 DTSTART，每次出现都继承其时间与时长。'
	)}
</p>

<CodeBlock standalone lang="typescript" code={objForm} />

<Example title={t('Five recurring patterns', '五种重复模式')} code={recurrenceRaw}>
	<RecurrenceDemo {locale} />
</Example>

<h2>{t('Supported rule parts', '支持的规则要素')}</h2>
<table>
	<thead><tr><th>RRULE</th><th>{t('Object form', '对象形式')}</th><th>{t('Meaning', '含义')}</th></tr></thead>
	<tbody>
		<tr><td><code>FREQ=DAILY|WEEKLY|MONTHLY|YEARLY</code></td><td><code>freq</code></td><td>{t('Base frequency (required).', '基础频率（必填）。')}</td></tr>
		<tr><td><code>INTERVAL=2</code></td><td><code>interval</code></td><td>{t('Every 2nd day/week/month/year.', '每隔 2 天/周/月/年。')}</td></tr>
		<tr><td><code>COUNT=10</code></td><td><code>count</code></td><td>{t('Stop after 10 occurrences, counted from the event start.', '共出现 10 次（从事件起始日起算）。')}</td></tr>
		<tr><td><code>UNTIL=20261231</code></td><td><code>until</code></td><td>{t('Last possible occurrence date (inclusive).', '最后一次可能出现的日期（含当天）。')}</td></tr>
		<tr><td><code>BYDAY=MO,WE,FR</code></td><td><code>byDay: [1,3,5]</code></td><td>{t('Weekly: which weekdays.', '每周重复时指定星期几。')}</td></tr>
		<tr><td><code>BYDAY=2TU</code> / <code>-1FR</code></td><td><code>byNthDay</code></td><td>{t('Monthly: the 2nd Tuesday / last Friday.', '每月的第 2 个周二 / 最后一个周五。')}</td></tr>
		<tr><td><code>BYMONTHDAY=1,15</code></td><td><code>byMonthDay</code></td><td>{t('Monthly: on these days of the month.', '每月的指定日期。')}</td></tr>
		<tr><td>—</td><td><code>exdates: Date[]</code></td><td>{t('Skip occurrences on these days (cancelled instances).', '跳过这些日期上的出现（已取消的实例）。')}</td></tr>
	</tbody>
</table>

<h2>{t('Behavior details', '行为细节')}</h2>
<ul>
	<li>{t('Occurrences keep the wall-clock time of the original event across DST changes.', '跨越夏令时切换时，每次出现保持原事件的“墙上时钟”时间。')}</li>
	<li>{t('Monthly rules skip months where the day doesn’t exist (Jan 31 → no Feb 31), matching Google Calendar.', '每月重复会跳过不存在该日期的月份（1 月 31 日 → 没有 2 月 31 日），与 Google 日历一致。')}</li>
	<li>{t('Yearly rules starting Feb 29 only fire in leap years.', '起始于 2 月 29 日的每年重复只在闰年出现。')}</li>
	<li>
		{t(
			'Recurring instances show a ↻ mark. Dragging or resizing one opens a confirm popover with “This event” (detaches the occurrence) and “This and following” (splits the series at that point) — like Google Calendar.',
			'重复实例带 ↻ 标记。拖动或调整某一次会弹出确认层，提供“仅此日程”（拆分该次为独立日程）与“此次及以后”（在该点拆分系列）两种选择——与 Google 日历一致。'
		)}
	</li>
	<li>
		{t(
			'The details popover offers “Delete this occurrence” (adds an exdate) and “Delete series”.',
			'详情弹层提供“删除仅此次”（添加 exdate）与“删除整个系列”两个操作。'
		)}
	</li>
	<li>{t('Expansion is windowed to the visible range and hard-capped at 1000 occurrences per event, so infinite rules are safe.', '展开仅针对可见范围，且每个事件硬上限 1000 次，可安全使用无限重复规则。')}</li>
</ul>

<div class="callout">
	<strong>{t('Editing a series', '编辑重复系列')}</strong> —
	{t(
		'both “this event” and “this and following” edits are built in: onSeriesDetach / onSeriesSplit report the results, COUNT and exdates are re-partitioned automatically, and weekly BYDAY lists re-anchor when the drag changes the weekday. The pure helpers detachOccurrence, excludeOccurrence and splitSeries are exported for data-layer use.',
		'“仅此日程”与“此次及以后”均已内置：onSeriesDetach / onSeriesSplit 回调上报结果，COUNT 与 exdates 自动重新分配，拖拽改变星期几时每周 BYDAY 列表会自动重锚。纯函数 detachOccurrence、excludeOccurrence、splitSeries 也已导出供数据层使用。'
	)}
</div>
