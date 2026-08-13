<script lang="ts">
	import type { Lang } from '$docs/nav.js';
	import { page } from '$app/state';
	import Example from '$docs/Example.svelte';
	import ResourcesDemo from '$docs/examples/ResourcesDemo.svelte';
	import resourcesRaw from '$docs/examples/ResourcesDemo.svelte?raw';
	import { T } from '$docs/nav.js';

	const lang = $derived(page.params.lang as Lang);
	const t = $derived(T(lang));
	const locale = $derived(lang === 'zh' ? 'zh-CN' : 'en');
</script>

<svelte:head>
	<title>{t('Resources View — svelte5plus-calendar', '资源视图 — svelte5plus-calendar')}</title>
</svelte:head>

<h1>{t('Resources View', '资源视图')}</h1>
<p class="lede">
	{t(
		'A one-day time grid split into columns per resource — rooms, doctors, machines. The staple layout of booking and scheduling apps.',
		'把单日时间网格按资源分列——会议室、医生、设备。预约与排班应用的标准布局。'
	)}
</p>

<Example title={t('Room booking', '会议室预订')} code={resourcesRaw}>
	<ResourcesDemo {locale} />
</Example>

<h2>{t('Usage', '用法')}</h2>
<ul>
	<li>
		{t('Pass a resources array of { id, name, color? } and include "resources" in views.', '传入 { id, name, color? } 结构的 resources 数组，并把 "resources" 加入 views。')}
	</li>
	<li>
		{t('Link events to a column via event.resourceId; events without one are not shown in this view.', '事件通过 event.resourceId 关联到列；未关联的事件不会出现在该视图。')}
	</li>
	<li>
		{t('Dragging an event sideways moves it to another resource — onEventChange receives resourceId and oldResourceId.', '横向拖动事件即换资源——onEventChange 会携带 resourceId 与 oldResourceId。')}
	</li>
	<li>
		{t('Drag-selecting empty space quick-creates an event pre-assigned to that column (RangeSelection.resourceId).', '框选空白时段快速新建的事件自动归入该列（RangeSelection.resourceId）。')}
	</li>
	<li>
		{t('Navigation moves one day at a time; time-grid options (hours range, slots, business hours, now indicator) all apply.', '翻页步长为一天；时间网格的各项配置（小时范围、网格密度、营业时间、当前时间线）全部适用。')}
	</li>
</ul>

<div class="callout">
	<strong>{t('Tip', '提示')}</strong> —
	{t(
		'combine with eventOverlap={false} to prevent double-booking a room.',
		'搭配 eventOverlap={false} 可防止同一资源被重复预订。'
	)}
</div>
