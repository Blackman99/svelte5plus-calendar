<script lang="ts">
	import { page } from '$app/state';
	import { T, type Lang } from '$docs/nav.js';
	import Example from '$docs/Example.svelte';
	import CodeBlock from '$docs/CodeBlock.svelte';
	import EventsDemo from '$docs/examples/EventsDemo.svelte';
	import eventsRaw from '$docs/examples/EventsDemo.svelte?raw';

	const lang = $derived(page.params.lang as Lang);
	const t = $derived(T(lang));
	const locale = $derived(lang === 'zh' ? 'zh-CN' : 'en');

	const eventShape = `const event: CalendarEvent = {
  id: 'evt-42',                          // unique & stable
  title: 'Quarterly planning',
  start: new Date(2026, 7, 13, 9, 30),   // inclusive
  end: new Date(2026, 7, 13, 11, 0),     // exclusive
  allDay: false,
  color: 'purple',                       // palette name or any CSS color
  calendarId: 'work',                    // groups it under a source
  location: 'Room 3',
  description: 'Bring the roadmap.',
  meta: { anything: 'you like' }         // carried through untouched
};`;
</script>

<svelte:head>
	<title>{t('Events & Calendars — svelte5plus-calendar', '事件与日历 — svelte5plus-calendar')}</title>
</svelte:head>

<h1>{t('Events & Calendars', '事件与日历')}</h1>
<p class="lede">
	{t(
		'Events are plain objects. Calendars (sources) group them, give them shared colors, and let users toggle whole groups on and off — like the calendar list in Google Calendar.',
		'事件就是普通对象。日历源（sources）负责给事件分组、统一配色，并支持整组显示/隐藏——就像 Google 日历左侧的日历列表。'
	)}
</p>

<h2>{t('The event object', '事件对象')}</h2>
<CodeBlock standalone lang="typescript" code={eventShape} />
<table>
	<thead><tr><th>{t('Field', '字段')}</th><th>{t('Notes', '说明')}</th></tr></thead>
	<tbody>
		<tr><td><code>id</code></td><td>{t('Required. Used to write drag & drop edits back to your array.', '必填。拖拽编辑会按 id 写回你的数组。')}</td></tr>
		<tr><td><code>start</code> / <code>end</code></td><td>{t('Plain Date objects in local time; end is exclusive. Events crossing midnight simply span days.', '本地时间的 Date 对象；end 为开区间。跨越午夜的事件会自然跨天渲染。')}</td></tr>
		<tr><td><code>allDay</code></td><td>{t('Renders in the all-day lane / as a month bar; times are ignored and the range snaps to whole days.', '渲染到全天栏或月视图长条；忽略具体时间，范围对齐到整天。')}</td></tr>
		<tr><td><code>color</code></td><td>{t('One of 10 palette names (graphite, red, orange, yellow, green, teal, blue, indigo, purple, pink) or any CSS color like #7c3aed.', '10 个调色板名称之一（graphite、red、orange、yellow、green、teal、blue、indigo、purple、pink），或任意 CSS 颜色如 #7c3aed。')}</td></tr>
		<tr><td><code>calendarId</code></td><td>{t('Links the event to a source; the event inherits the source color unless it sets its own.', '关联到某个日历源；未自行设置颜色时继承源的颜色。')}</td></tr>
		<tr><td><code>editable</code></td><td>{t('Per-event override of drag & drop permission.', '按事件覆盖是否允许拖拽编辑。')}</td></tr>
		<tr><td><code>recurrence</code> / <code>exdates</code></td><td>{t('See Recurring Events.', '见「重复事件」章节。')}</td></tr>
	</tbody>
</table>

<h2>{t('Calendar sources', '日历源')}</h2>
<p>
	{t(
		'Pass an array of sources and reference them from events via calendarId. Toggling a source’s visible flag hides all of its events at once:',
		'传入 sources 数组，事件通过 calendarId 关联。切换某个源的 visible 即可一次性隐藏该组全部事件：'
	)}
</p>
<Example title={t('Toggle whole calendars', '按日历分组显示/隐藏')} code={eventsRaw}>
	<EventsDemo {locale} />
</Example>

<div class="callout">
	<strong>{t('Color resolution', '颜色优先级')}</strong> —
	{t(
		'event.color → source.color → the accent color. Palette names adapt automatically between light and dark themes.',
		'event.color → source.color → 主题强调色。调色板颜色会在明暗主题间自动适配。'
	)}
</div>
