<script lang="ts">
	import { page } from '$app/state';
	import { T, type Lang } from '$docs/nav.js';

	const lang = $derived(page.params.lang as Lang);
	const t = $derived(T(lang));
</script>

<svelte:head>
	<title>{t('API Reference — svelte5plus-calendar', 'API 参考 — svelte5plus-calendar')}</title>
</svelte:head>

<h1>{t('API Reference', 'API 参考')}</h1>
<p class="lede">
	{t('Every prop, callback and exported type of the <Calendar> component.', '<Calendar> 组件的全部属性、回调与导出类型。')}
</p>

<h2>{t('Data props', '数据属性')}</h2>
<table>
	<thead><tr><th>{t('Prop', '属性')}</th><th>{t('Type', '类型')}</th><th>{t('Default', '默认值')}</th><th>{t('Description', '说明')}</th></tr></thead>
	<tbody>
		<tr><td><code>events</code> <i>bindable</i></td><td><code>CalendarEvent[]</code></td><td><code>[]</code></td><td>{t('The event list; edits are written back.', '事件列表；编辑结果会写回。')}</td></tr>
		<tr><td><code>date</code> <i>bindable</i></td><td><code>Date</code></td><td><code>new Date()</code></td><td>{t('Focused date.', '聚焦日期。')}</td></tr>
		<tr><td><code>view</code> <i>bindable</i></td><td><code>CalendarView</code></td><td><code>'month'</code></td><td>{t('Active view.', '当前视图。')}</td></tr>
		<tr><td><code>sources</code></td><td><code>CalendarSource[]</code></td><td><code>[]</code></td><td>{t('Calendar groups: color, visibility, editability.', '日历分组：颜色、可见性、可编辑性。')}</td></tr>
		<tr><td><code>resources</code></td><td><code>Resource[]</code></td><td><code>[]</code></td><td>{t('Columns of the resources view; events link via resourceId.', '资源视图的列；事件通过 resourceId 关联。')}</td></tr>
		<tr><td><code>timeZone</code></td><td><code>string</code></td><td>{t('local', '本地')}</td><td>{t('IANA display time zone; edits convert back to real instants.', 'IANA 显示时区；编辑结果自动换算回真实时刻。')}</td></tr>
		<tr><td><code>validRange</code></td><td><code>{'{ start?, end? }'}</code></td><td>—</td><td>{t('Days outside are read-only and unreachable.', '范围外的日期只读且不可导航。')}</td></tr>
		<tr><td><code>eventOverlap</code></td><td><code>boolean</code></td><td><code>true</code></td><td>{t('false rejects overlapping drops/creates (timed events).', 'false 时拒绝时间冲突的拖放/新建（定时事件）。')}</td></tr>
	</tbody>
</table>

<h2>{t('Display props', '显示属性')}</h2>
<table>
	<thead><tr><th>{t('Prop', '属性')}</th><th>{t('Type', '类型')}</th><th>{t('Default', '默认值')}</th><th>{t('Description', '说明')}</th></tr></thead>
	<tbody>
		<tr><td><code>locale</code></td><td><code>string</code></td><td><code>'en'</code></td><td>{t('BCP-47 tag; drives all formats & built-in strings.', 'BCP-47 标签；决定所有格式与内置文案。')}</td></tr>
		<tr><td><code>messages</code></td><td><code>Partial&lt;CalendarMessages&gt;</code></td><td>—</td><td>{t('Override UI strings.', '覆盖界面文案。')}</td></tr>
		<tr><td><code>firstDayOfWeek</code></td><td><code>0–6</code></td><td>{t('from locale', '由 locale 推断')}</td><td>{t('0 = Sunday.', '0 = 周日。')}</td></tr>
		<tr><td><code>weekends</code></td><td><code>boolean</code></td><td><code>true</code></td><td>{t('Show Sat/Sun columns.', '显示周六/周日列。')}</td></tr>
		<tr><td><code>weekNumbers</code></td><td><code>boolean</code></td><td><code>false</code></td><td>{t('ISO week numbers.', 'ISO 周数。')}</td></tr>
		<tr><td><code>fixedWeeks</code></td><td><code>boolean</code></td><td><code>false</code></td><td>{t('Month view always 6 rows.', '月视图恒定 6 行。')}</td></tr>
		<tr><td><code>dayMaxEvents</code></td><td><code>number</code></td><td><code>4</code></td><td>{t('Rows per month cell incl. “+N more”.', '月视图每格行数（含“还有 N 项”）。')}</td></tr>
		<tr><td><code>views</code></td><td><code>CalendarView[]</code></td><td>{t('all five', '全部五种')}</td><td>{t('Toolbar view buttons.', '工具栏视图按钮。')}</td></tr>
		<tr><td><code>header</code></td><td><code>boolean</code></td><td><code>true</code></td><td>{t('Render the built-in toolbar.', '渲染内置工具栏。')}</td></tr>
		<tr><td><code>theme</code></td><td><code>'light' | 'dark' | 'auto'</code></td><td><code>'light'</code></td><td>{t('Color scheme.', '配色方案。')}</td></tr>
		<tr><td><code>agendaDays</code></td><td><code>number</code></td><td><code>30</code></td><td>{t('Agenda window length.', '议程视图天数。')}</td></tr>
		<tr><td><code>hour12</code></td><td><code>boolean</code></td><td>{t('from locale', '由 locale 推断')}</td><td>{t('Clock format.', '时制。')}</td></tr>
		<tr><td><code>class</code></td><td><code>string</code></td><td>—</td><td>{t('Extra classes on the root.', '附加到根节点的类名。')}</td></tr>
	</tbody>
</table>

<h2>{t('Time-grid props', '时间网格属性')}</h2>
<table>
	<thead><tr><th>{t('Prop', '属性')}</th><th>{t('Type', '类型')}</th><th>{t('Default', '默认值')}</th></tr></thead>
	<tbody>
		<tr><td><code>dayStartHour</code> / <code>dayEndHour</code></td><td><code>number</code></td><td><code>0</code> / <code>24</code></td></tr>
		<tr><td><code>slotDuration</code> / <code>snapDuration</code></td><td><code>number</code> {t('(minutes)', '（分钟）')}</td><td><code>30</code> / <code>15</code></td></tr>
		<tr><td><code>hourHeight</code></td><td><code>number</code> (px)</td><td><code>48</code></td></tr>
		<tr><td><code>scrollToHour</code></td><td><code>number</code></td><td><code>7</code></td></tr>
		<tr><td><code>businessHours</code></td><td><code>boolean | BusinessHours</code></td><td><code>null</code></td></tr>
		<tr><td><code>nowIndicator</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
	</tbody>
</table>

<h2>{t('Interaction props & callbacks', '交互属性与回调')}</h2>
<table>
	<thead><tr><th>{t('Prop', '属性')}</th><th>{t('Type', '类型')}</th><th>{t('Description', '说明')}</th></tr></thead>
	<tbody>
		<tr><td><code>editable</code></td><td><code>boolean</code></td><td>{t('Enable drag & resize.', '启用拖动与调整。')}</td></tr>
		<tr><td><code>selectable</code></td><td><code>boolean</code></td><td>{t('Enable drag-selection.', '启用拖选。')}</td></tr>
		<tr><td><code>eventDetails</code></td><td><code>boolean</code> = <code>true</code></td><td>{t('Built-in details popover on event click (skipped when onEventClick is set).', '点击日程时的内置详情弹层（设置 onEventClick 时让位）。')}</td></tr>
		<tr><td><code>quickCreate</code></td><td><code>boolean</code> = <code>true</code></td><td>{t('Built-in quick-create popover on empty click/selection (needs selectable or editable; skipped when onSelect/onDateClick are set).', '点击/框选空白时的内置快速新建弹层（需 selectable 或 editable；设置 onSelect/onDateClick 时让位）。')}</td></tr>
		<tr><td><code>onEventClick</code></td><td><code>(instance, e) =&gt; void</code></td><td>{t('Event activated.', '事件被点击。')}</td></tr>
		<tr><td><code>onDateClick</code></td><td><code>(date, allDay) =&gt; void</code></td><td>{t('Empty cell / slot clicked.', '空白格被点击。')}</td></tr>
		<tr><td><code>onSelect</code></td><td><code>(sel: RangeSelection) =&gt; void</code></td><td>{t('Drag-selection finished.', '拖选完成。')}</td></tr>
		<tr><td><code>onEventChange</code></td><td><code>(info: EventChangeInfo) =&gt; void</code></td><td>{t('Drag/resize landed; info.revert() rolls back.', '拖拽落地；info.revert() 可回滚。')}</td></tr>
		<tr><td><code>onEventCreate</code></td><td><code>(event) =&gt; void</code></td><td>{t('Quick-create added an event to the bound array.', '快速新建向绑定数组添加了日程。')}</td></tr>
		<tr><td><code>onEventDelete</code></td><td><code>(event, occurrence?) =&gt; void</code></td><td>{t('An event was removed; occurrence set when one instance of a series was deleted.', '日程被删除；仅删系列中某一次时携带 occurrence。')}</td></tr>
		<tr><td><code>onSeriesDetach</code></td><td><code>({'{ series, detached, occurrence }'}) =&gt; void</code></td><td>{t('“This event”: an occurrence was split into a standalone event.', '“仅此日程”：某次被拆分为独立日程。')}</td></tr>
		<tr><td><code>onSeriesSplit</code></td><td><code>({'{ truncated, created, occurrence }'}) =&gt; void</code></td><td>{t('“This and following”: the series was split at an occurrence.', '“此次及以后”：系列在该次处被拆分。')}</td></tr>
		<tr><td><code>onRangeChange</code></td><td><code>(start, end) =&gt; void</code></td><td>{t('Visible range changed (incl. mount) — fetch events here.', '可见范围变化（含首次挂载）——适合按需拉取数据。')}</td></tr>
		<tr><td><code>onViewChange</code></td><td><code>(view) =&gt; void</code></td><td>{t('View switched.', '视图切换。')}</td></tr>
		<tr><td><code>onDateChange</code></td><td><code>(date) =&gt; void</code></td><td>{t('Focused date moved.', '聚焦日期变化。')}</td></tr>
		<tr><td><code>eventContent</code></td><td><code>Snippet&lt;[EventInstance]&gt;</code></td><td>{t('Custom event body.', '自定义事件内容。')}</td></tr>
		<tr><td><code>toolbarEnd</code></td><td><code>Snippet</code></td><td>{t('Extra toolbar content.', '工具栏附加内容。')}</td></tr>
	</tbody>
</table>

<h2>{t('Exported types', '导出类型')}</h2>
<p>
	<code>CalendarEvent</code> · <code>CalendarSource</code> · <code>CalendarView</code> ·
	<code>EventInstance</code> · <code>EventChangeInfo</code> · <code>RangeSelection</code> ·
	<code>RecurrenceRule</code> · <code>BusinessHours</code> · <code>CalendarMessages</code> ·
	<code>PaletteColor</code> · <code>Weekday</code>
</p>

<h2>{t('Exported utilities', '导出工具函数')}</h2>
<table>
	<thead><tr><th>{t('Export', '导出')}</th><th>{t('Description', '说明')}</th></tr></thead>
	<tbody>
		<tr><td><code>MiniCalendar</code></td><td>{t('Standalone month picker component.', '独立迷你月历组件。')}</td></tr>
		<tr><td><code>parseRRule / expandRecurrence</code></td><td>{t('Recurrence parsing & expansion.', '重复规则解析与展开。')}</td></tr>
		<tr><td><code>detachOccurrence / excludeOccurrence / splitSeries</code></td><td>{t('Pure series-edit helpers (“this event” / “this and following”).', '系列编辑纯函数（“仅此日程”/“此次及以后”）。')}</td></tr>
		<tr><td><code>parseICS / toICS</code></td><td>{t('iCalendar (.ics) import & export.', 'iCalendar（.ics）导入与导出。')}</td></tr>
		<tr><td><code>serializeRRule</code></td><td>{t('RecurrenceRule → RRULE string.', 'RecurrenceRule → RRULE 字符串。')}</td></tr>
		<tr><td><code>toZoned / fromZoned</code></td><td>{t('Display-time-zone conversion helpers.', '显示时区换算辅助函数。')}</td></tr>
		<tr><td><code>expandEvents</code></td><td>{t('Events → concrete instances for a range.', '事件 → 区间内的具体实例。')}</td></tr>
		<tr><td><code>layoutDay / layoutWeekRow</code></td><td>{t('The pure layout algorithms.', '纯函数布局算法。')}</td></tr>
		<tr><td><code>en / zhCN / messagesForLocale / localeFirstDay</code></td><td>{t('i18n helpers.', '国际化辅助。')}</td></tr>
		<tr><td><code>addDays, startOfWeek, monthGrid, …</code></td><td>{t('Zero-dependency date helpers.', '零依赖日期工具。')}</td></tr>
	</tbody>
</table>
