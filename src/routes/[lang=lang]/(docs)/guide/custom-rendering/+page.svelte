<script lang="ts">
	import { page } from '$app/state';
	import { T, type Lang } from '$docs/nav.js';
	import Example from '$docs/Example.svelte';
	import CodeBlock from '$docs/CodeBlock.svelte';
	import CustomRenderDemo from '$docs/examples/CustomRenderDemo.svelte';
	import customRaw from '$docs/examples/CustomRenderDemo.svelte?raw';
	import CustomUxDemo from '$docs/examples/CustomUxDemo.svelte';
	import customUxRaw from '$docs/examples/CustomUxDemo.svelte?raw';

	const lang = $derived(page.params.lang as Lang);
	const t = $derived(T(lang));
	const locale = $derived(lang === 'zh' ? 'zh-CN' : 'en');

	const headless = `<script lang="ts">
  import { Calendar, type CalendarView } from 'svelte5plus-calendar';
  let view = $state<CalendarView>('week');
  let date = $state(new Date());
<\/script>

<!-- Bring your own toolbar: hide the built-in one and drive the bindables -->
<nav>
  <button onclick={() => (date = new Date())}>Today</button>
  <select bind:value={view}>
    <option value="week">Week</option>
    <option value="month">Month</option>
  </select>
</nav>

<Calendar bind:view bind:date header={false} events={[]} />`;
</script>

<svelte:head>
	<title>{t('Custom Rendering — svelte5plus-calendar', '自定义渲染 — svelte5plus-calendar')}</title>
</svelte:head>

<h1>{t('Custom Rendering', '自定义渲染')}</h1>
<p class="lede">
	{t(
		'Svelte 5 snippets let you take over what the calendar draws — event content, extra toolbar controls, or the whole toolbar.',
		'借助 Svelte 5 的 snippet，你可以接管日历的渲染——事件内容、附加工具栏控件，甚至整个工具栏。'
	)}
</p>

<h2>{t('The eventContent snippet', 'eventContent snippet')}</h2>
<p>
	{t(
		'Declare an eventContent snippet inside <Calendar> and it replaces the default body of every event pill and block. It receives the EventInstance — event data plus the resolved occurrence times and color:',
		'在 <Calendar> 内声明 eventContent snippet，即可替换所有事件条与事件块的默认内容。它接收 EventInstance——包含事件数据、该次出现的具体时间与解析后的颜色：'
	)}
</p>
<Example title={t('Emoji per calendar', '按日历源加表情前缀')} code={customRaw}>
	<CustomRenderDemo {locale} />
</Example>

<h2>{t('Custom create & details UI', '自定义新建与详情 UI')}</h2>
<p>
	{t(
		'The built-in popovers are defaults, not a cage: the moment you provide onSelect / onDateClick the quick-create popover steps aside, and onEventClick replaces the details popover. From there any UI works — a modal, a drawer, a routed page. This demo swaps them for a centered create dialog and a details side drawer:',
		'内置弹层只是默认行为，不是束缚：一旦提供 onSelect / onDateClick，快速新建弹层就会让位；提供 onEventClick 则替换详情弹层。之后任何 UI 都可以——模态框、抽屉、独立路由页。下面的示例把它们换成了居中的新建对话框和右侧详情抽屉：'
	)}
</p>
<Example title={t('Your own dialog & drawer', '自己的对话框与抽屉')} code={customUxRaw}>
	<CustomUxDemo {locale} />
</Example>
<div class="callout">
	<strong>{t('Styling the built-ins', '只想换皮肤？')}</strong> —
	{t(
		'if the default popovers just need a different look, restyle them with CSS variables and the .s5c-popover class instead of replacing them.',
		'如果只是想调整默认弹层的外观，用 CSS 变量和 .s5c-popover 类名换肤即可，无需整体替换。'
	)}
</div>

<h2>{t('Extra toolbar content', '附加工具栏内容')}</h2>
<p>
	{t(
		'The toolbarEnd snippet renders on the right side of the built-in toolbar — a natural home for filters or a “new event” button.',
		'toolbarEnd snippet 渲染在内置工具栏右侧——适合放筛选器或“新建日程”按钮。'
	)}
</p>

<h2>{t('Going headless', '无头模式')}</h2>
<CodeBlock standalone lang="svelte" code={headless} />
<p>
	{t(
		'All layout algorithms (time-grid packing, week-row segmentation, recurrence expansion) are also exported as pure functions — you can build an entirely custom UI on top of them.',
		'所有布局算法（时间网格分列、周行分段、重复展开）同时以纯函数导出——你完全可以基于它们构建全新的自定义 UI。'
	)}
</p>
