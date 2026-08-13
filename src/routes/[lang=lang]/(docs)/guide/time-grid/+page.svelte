<script lang="ts">
	import type { Lang } from '$docs/nav.js';
	import { page } from '$app/state';
	import Example from '$docs/Example.svelte';
	import ConstraintsDemo from '$docs/examples/ConstraintsDemo.svelte';
	import constraintsRaw from '$docs/examples/ConstraintsDemo.svelte?raw';
	import TimeGridDemo from '$docs/examples/TimeGridDemo.svelte';
	import timeGridRaw from '$docs/examples/TimeGridDemo.svelte?raw';
	import { T } from '$docs/nav.js';

	const lang = $derived(page.params.lang as Lang);
	const t = $derived(T(lang));
	const locale = $derived(lang === 'zh' ? 'zh-CN' : 'en');
</script>

<svelte:head>
	<title>{t('Time Grid Options — svelte5plus-calendar', '时间网格 — svelte5plus-calendar')}</title>
</svelte:head>

<h1>{t('Time Grid Options', '时间网格')}</h1>
<p class="lede">
	{t(
		'The week and day views share a configurable time grid: visible hours, slot density, snapping, business hours and the live now-indicator.',
		'周视图与日视图共享同一套可配置的时间网格：可见小时范围、网格密度、拖拽吸附、营业时间与实时时间线。'
	)}
</p>

<Example title={t('6:00–22:00, business hours, week numbers', '6:00–22:00，营业时间，周数')} code={timeGridRaw}>
	<TimeGridDemo {locale} />
</Example>

<h2>{t('Options', '选项')}</h2>
<table>
	<thead><tr><th>{t('Prop', '属性')}</th><th>{t('Default', '默认值')}</th><th>{t('Effect', '作用')}</th></tr></thead>
	<tbody>
		<tr><td><code>dayStartHour</code> / <code>dayEndHour</code></td><td><code>0</code> / <code>24</code></td><td>{t('Crop the visible hour range. Events outside are clipped.', '裁剪可见小时范围，范围外的事件被截断显示。')}</td></tr>
		<tr><td><code>slotDuration</code></td><td><code>30</code></td><td>{t('Minutes between minor grid lines.', '次级网格线的分钟间隔。')}</td></tr>
		<tr><td><code>snapDuration</code></td><td><code>15</code></td><td>{t('Snapping step for dragging, resizing and selecting.', '拖动、调整、框选时的吸附步长。')}</td></tr>
		<tr><td><code>hourHeight</code></td><td><code>48</code></td><td>{t('Pixel height of one hour — the zoom level.', '每小时的像素高度，相当于缩放级别。')}</td></tr>
		<tr><td><code>scrollToHour</code></td><td><code>7</code></td><td>{t('Hour scrolled into view when the grid opens.', '打开视图时自动滚动到的小时。')}</td></tr>
		<tr><td><code>businessHours</code></td><td><code>null</code></td><td>{t('true = Mon–Fri 9–17, or { days, startHour, endHour }. Non-working time is shaded.', 'true 表示周一至五 9–17，或传 { days, startHour, endHour }。非工作时段置灰。')}</td></tr>
		<tr><td><code>nowIndicator</code></td><td><code>true</code></td><td>{t('The red current-time line on today’s column, updated every 30 s.', '今日列上的红色当前时间线，每 30 秒刷新。')}</td></tr>
		<tr><td><code>weekNumbers</code></td><td><code>false</code></td><td>{t('ISO week number in the gutter.', '在侧栏显示 ISO 周数。')}</td></tr>
		<tr><td><code>hour12</code></td><td>{t('locale', '跟随 locale')}</td><td>{t('Force 12/24-hour labels.', '强制 12/24 小时制。')}</td></tr>
	</tbody>
</table>

<h2>{t('Overlapping events', '重叠事件')}</h2>
<p>
	{t(
		'Overlapping events are packed into columns per collision cluster — the same algorithm family used by Google and Apple calendars. Freed columns are reused, so a long event and two short consecutive ones only need two columns.',
		'重叠事件按“碰撞簇”打包分列——与 Google、Apple 日历同族的算法。释放的列会被复用：一个长事件加两个前后相接的短事件只占两列。'
	)}
</p>

<h2>{t('Constraints', '约束')}</h2>
<p>
	{t(
		'validRange limits navigation and interaction to a date window (days outside are dimmed and inert, navigation clamps). eventOverlap={false} rejects drops, resizes and quick-creates that would collide with another timed event — ideal for bookings.',
		'validRange 把导航与交互限制在一个日期窗口内（窗口外的日期置灰且不可交互，翻页自动钳制）。eventOverlap={false} 会拒绝与其他事件时间冲突的拖放、调整和快速新建——预约场景的利器。'
	)}
</p>
<Example title={t('This week only, no double-booking', '仅限本周，禁止时间冲突')} code={constraintsRaw}>
	<ConstraintsDemo {locale} />
</Example>

<h2>{t('Keyboard editing', '键盘编辑')}</h2>
<p>
	{t(
		'Focus an event block (Tab) and use Alt+↑/↓ to move it by one snap step, Alt+←/→ to move it a day, and Alt+Shift+↑/↓ to resize. Changes are announced to screen readers via a live region.',
		'用 Tab 聚焦事件块后：Alt+↑/↓ 按吸附步长移动，Alt+←/→ 移动一天，Alt+Shift+↑/↓ 调整时长。所有变更都会通过 aria-live 区域向屏幕阅读器播报。'
	)}
</p>

<h2>{t('All-day lane', '全天事件栏')}</h2>
<p>
	{t(
		'All-day and multi-day events render in a dedicated lane above the grid, with bars spanning the exact days they cover and arrows when they continue beyond the visible week.',
		'全天与跨天事件渲染在网格上方的独立栏中，长条精确覆盖所跨日期；超出可见范围时切平边角以示延续。'
	)}
</p>
