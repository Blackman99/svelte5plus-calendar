<script lang="ts">
	import type { Lang } from '$docs/nav.js';
	import { page } from '$app/state';
	import CodeBlock from '$docs/CodeBlock.svelte';
	import Example from '$docs/Example.svelte';
	import HelloCalendar from '$docs/examples/HelloCalendar.svelte';
	import helloRaw from '$docs/examples/HelloCalendar.svelte?raw';
	import { T, withBase } from '$docs/nav.js';

	const lang = $derived(page.params.lang as Lang);
	const t = $derived(T(lang));
	const locale = $derived(lang === 'zh' ? 'zh-CN' : 'en');

	const usage = `<script lang="ts">
  import { Calendar, type CalendarEvent } from 'svelte5plus-calendar';

  let events = $state<CalendarEvent[]>([
    {
      id: '1',
      title: 'Kickoff meeting',
      start: new Date(2026, 7, 13, 10, 0),
      end: new Date(2026, 7, 13, 11, 0)
    }
  ]);
<\/script>

<!-- The calendar fills its parent — give the wrapper a height. -->
<div style="height: 640px">
  <Calendar bind:events view="month" locale="en" />
</div>`;
</script>

<svelte:head>
	<title>{t('Getting Started — svelte5plus-calendar', '快速开始 — svelte5plus-calendar')}</title>
</svelte:head>

<h1>{t('Getting Started', '快速开始')}</h1>
<p class="lede">
	{t(
		'svelte5plus-calendar is a full-featured calendar component built on Svelte 5 runes — no runtime dependencies, TypeScript-first, and themeable down to the last pixel.',
		'svelte5plus-calendar 是基于 Svelte 5 runes 构建的全功能日历组件——零运行时依赖、TypeScript 优先、每个像素都可以定制主题。'
	)}
</p>

<h2>{t('Installation', '安装')}</h2>
<CodeBlock standalone lang="bash" code="npm install svelte5plus-calendar" />
<p>
	{t('Requires Svelte 5. The stylesheet is imported automatically with the component.', '需要 Svelte 5。样式表随组件自动引入，无需单独导入 CSS。')}
</p>

<h2>{t('Your first calendar', '第一个日历')}</h2>
<CodeBlock standalone lang="svelte" code={usage} />
<div class="callout">
	<strong>{t('Sizing', '尺寸')}</strong> —
	{t(
		'the calendar stretches to fill its parent element, so the wrapper needs an explicit height (or a flex/grid track).',
		'日历会撑满父元素，因此外层容器需要一个明确的高度（或处于 flex / grid 布局中）。'
	)}
</div>

<h2>{t('Live example', '在线示例')}</h2>
<p>
	{t(
		'Here it is running — click the Code button to see the exact source of this demo:',
		'下面是真实渲染效果——点击 Code 按钮查看该示例的完整源码：'
	)}
</p>
<Example title={t('Hello, calendar', '你好，日历')} code={helloRaw}>
	<HelloCalendar {locale} />
</Example>

<h2>{t('The three bindable props', '三个可双向绑定的属性')}</h2>
<p>
	{t(
		'Almost everything you do with the calendar flows through three bindable props:',
		'日历的绝大多数用法都围绕三个可 bind 的属性展开：'
	)}
</p>
<table>
	<thead><tr><th>{t('Prop', '属性')}</th><th>{t('Type', '类型')}</th><th>{t('Purpose', '用途')}</th></tr></thead>
	<tbody>
		<tr>
			<td><code>bind:events</code></td>
			<td><code>CalendarEvent[]</code></td>
			<td>{t('Your data. Drag & drop edits write back into this array.', '你的数据。拖拽编辑的结果会写回该数组。')}</td>
		</tr>
		<tr>
			<td><code>bind:date</code></td>
			<td><code>Date</code></td>
			<td>{t('The focused date — navigation buttons update it.', '当前聚焦日期——工具栏的导航按钮会更新它。')}</td>
		</tr>
		<tr>
			<td><code>bind:view</code></td>
			<td><code>'day' | 'week' | 'month' | 'year' | 'agenda'</code></td>
			<td>{t('The active view — switch it from your own UI at any time.', '当前视图——也可以随时从你自己的 UI 中切换。')}</td>
		</tr>
	</tbody>
</table>

<h2>{t('Where to next', '接下来')}</h2>
<ul>
	<li><a href={withBase(`/${lang}/guide/views/`)}>{t('Tour the five views', '了解五种视图')}</a></li>
	<li><a href={withBase(`/${lang}/guide/events/`)}>{t('Model events, colors and calendars', '事件、颜色与多日历')}</a></li>
	<li><a href={withBase(`/${lang}/guide/interactions/`)}>{t('Enable drag & drop editing', '开启拖拽编辑')}</a></li>
	<li><a href={withBase(`/${lang}/api/`)}>{t('Read the full API reference', '查阅完整 API 参考')}</a></li>
</ul>
