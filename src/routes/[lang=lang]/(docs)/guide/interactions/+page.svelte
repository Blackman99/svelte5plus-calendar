<script lang="ts">
	import { page } from '$app/state';
	import { T, type Lang } from '$docs/nav.js';
	import Example from '$docs/Example.svelte';
	import CodeBlock from '$docs/CodeBlock.svelte';
	import InteractionsDemo from '$docs/examples/InteractionsDemo.svelte';
	import interactionsRaw from '$docs/examples/InteractionsDemo.svelte?raw';

	const lang = $derived(page.params.lang as Lang);
	const t = $derived(T(lang));
	const locale = $derived(lang === 'zh' ? 'zh-CN' : 'en');
</script>

<svelte:head>
	<title>{t('Drag, Drop & Selection — svelte5plus-calendar', '拖拽与选择 — svelte5plus-calendar')}</title>
</svelte:head>

<h1>{t('Drag, Drop & Selection', '拖拽与选择')}</h1>
<p class="lede">
	{t(
		'Two flags unlock the interactive behaviors: editable lets users move and resize events, selectable lets them drag across empty space to pick a range.',
		'两个开关解锁全部交互：editable 允许用户移动和调整事件，selectable 允许在空白处拖选时间范围。'
	)}
</p>

<Example title={t('Editable + selectable week', '可编辑、可框选的周视图')} code={interactionsRaw}>
	<InteractionsDemo {locale} />
</Example>

<h2>{t('What users can do', '用户可以做什么')}</h2>
<ul>
	<li>{t('Drag an event block to another time or day (week/day views).', '把事件块拖到其他时间或日期（周/日视图）。')}</li>
	<li>{t('Drag an event pill to another day (month view).', '把事件条拖到其他日期（月视图）。')}</li>
	<li>{t('Drag the bottom edge of a block to resize it.', '拖动事件块底边调整时长。')}</li>
	<li>{t('Drag across empty slots to select a time range (fires onSelect).', '在空白时间格上拖选一个范围（触发 onSelect）。')}</li>
	<li>{t('Drag across month cells to select a day range.', '在月视图单元格上拖选一个日期范围。')}</li>
	<li>{t('Click an empty slot or day (fires onDateClick).', '点击空白时间格或日期（触发 onDateClick）。')}</li>
</ul>

<h2>{t('Callbacks', '回调')}</h2>
<table>
	<thead><tr><th>{t('Callback', '回调')}</th><th>{t('Fires when', '触发时机')}</th><th>{t('Payload', '参数')}</th></tr></thead>
	<tbody>
		<tr>
			<td><code>onEventClick</code></td>
			<td>{t('an event is clicked or activated by keyboard', '事件被点击或通过键盘激活')}</td>
			<td><code>(instance, mouseOrKeyboardEvent)</code></td>
		</tr>
		<tr>
			<td><code>onDateClick</code></td>
			<td>{t('an empty slot / day cell is clicked', '空白时间格 / 日期格被点击')}</td>
			<td><code>(date, allDay)</code></td>
		</tr>
		<tr>
			<td><code>onSelect</code></td>
			<td>{t('a drag-selection finishes', '拖选结束')}</td>
			<td><code>{'{ start, end, allDay }'}</code></td>
		</tr>
		<tr>
			<td><code>onEventChange</code></td>
			<td>{t('a drag or resize lands', '拖动或调整完成落地')}</td>
			<td><code>{'{ event, oldStart, oldEnd, start, end, revert }'}</code></td>
		</tr>
		<tr>
			<td><code>onViewChange</code> / <code>onDateChange</code></td>
			<td>{t('the view / focused date changes', '视图 / 聚焦日期变化')}</td>
			<td><code>(view)</code> / <code>(date)</code></td>
		</tr>
	</tbody>
</table>

<h2>{t('Persisting to a server, with rollback', '保存到服务器并支持回滚')}</h2>
<p>
	{t(
		'The calendar applies the change optimistically, then calls onEventChange. If your API call fails, call revert() to snap the event back:',
		'日历会先乐观地应用变更，再调用 onEventChange。如果 API 保存失败，调用 revert() 即可把事件弹回原位：'
	)}
</p>
<CodeBlock
	standalone
	lang="typescript"
	code={`async function onEventChange({ event, start, end, revert }) {
  try {
    await api.updateEvent(event.id, { start, end });
  } catch {
    revert(); // restore the previous times
  }
}`}
/>

<h2>{t('Permission rules', '权限规则')}</h2>
<ul>
	<li>{t('editable on the calendar is the master switch.', '组件上的 editable 是总开关。')}</li>
	<li>{t('source.editable = false locks all events of that calendar.', 'source.editable = false 会锁定该日历源下的全部事件。')}</li>
	<li>{t('event.editable overrides both, per event.', 'event.editable 可按事件覆盖以上两者。')}</li>
	<li>
		{t(
			'Instances of recurring events are never draggable — a recurring series has no single “time” to move. Change the series’ start/recurrence in your data instead.',
			'重复事件的实例不可拖动——一个重复系列没有单一的“时间”可供移动，请直接在数据中修改系列的 start / recurrence。'
		)}
	</li>
</ul>
