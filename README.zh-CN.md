<p align="center">
  <img src="https://raw.githubusercontent.com/Blackman99/svelte5plus-calendar/main/static/favicon.svg" width="84" alt="svelte5plus-calendar logo" />
</p>

# svelte5plus-calendar

[English](https://github.com/Blackman99/svelte5plus-calendar/blob/main/README.md) | **简体中文**

<p>
  <a href="https://www.npmjs.com/package/svelte5plus-calendar"><img src="https://img.shields.io/npm/v/svelte5plus-calendar?color=0f3cd9" alt="npm version" /></a>
  <a href="https://github.com/Blackman99/svelte5plus-calendar/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/svelte5plus-calendar?color=0f3cd9" alt="license" /></a>
  <a href="https://github.com/Blackman99/svelte5plus-calendar/actions/workflows/deploy.yml"><img src="https://github.com/Blackman99/svelte5plus-calendar/actions/workflows/deploy.yml/badge.svg" alt="CI" /></a>
</p>

为 **Svelte 5** 打造的全功能零依赖日历组件——月、周、日、年、议程五种视图，拖拽编辑、重复事件、多日历源、国际化与暗色模式。功能对标 Google 日历、Apple 日历与 Outlook。

> 📖 **带在线示例的完整文档：** https://blackman99.github.io/svelte5plus-calendar/zh/

## 功能特性

- 🗓 **六种视图** —— 月视图（跨天长条 + “还有 N 项”弹层）、周/日时间网格、年概览、议程列表，以及面向预约场景的**资源视图**（按会议室/人员分列）
- ✋ **拖拽交互** —— 跨日期/时间格移动事件、横向拖动全天条、拖底边调整时长、空白处拖选新建；触屏长按拖拽、轻扫滚动
- 💬 **内置弹层** —— 点击日程弹出详情（含删除），点击/框选空白弹出快速新建——零配置可用，提供回调即可完全接管
- 🔁 **重复事件** —— 实用的 RRULE 子集（`FREQ`、`INTERVAL`、`COUNT`、`UNTIL`、`BYDAY` 含 `2TU`/`-1FR`、`BYMONTHDAY`），支持字符串或类型化对象，以及 `exdates` 排除日期；内置“仅此日程”与“此次及以后”编辑，以及单次/整系列删除
- 🎨 **主题定制** —— 明/暗/跟随系统；所有颜色、圆角、字体均为 CSS 自定义属性；10 色事件调色板自动适配暗色模式
- 🌍 **国际化与时区** —— 基于 `Intl` 支持任意 BCP-47 区域设置（无需语言包）；内置 10 种语言界面文案；周首日与时制跟随区域设置；`timeZone` 属性可按任意 IANA 时区渲染，编辑自动换算
- 📚 **多日历源** —— 分组统一配色、独立显示/隐藏、按源和按事件控制编辑权限
- ⏰ **时间网格细节** —— 当前时间指示线、营业时间阴影、可配置小时范围/网格密度/吸附步长、ISO 周数、全天事件栏
- 🧩 **自定义渲染** —— 用 Svelte 5 snippet 替换事件内容；隐藏内置工具栏，通过可绑定的 `date`/`view` 自建导航
- 🧮 **无头能力** —— 重叠分列、周行分段布局算法与重复展开、日期工具均以纯函数导出
- ♿ **可访问性** —— 月视图键盘导航、时间网格 Alt+方向键键盘编辑、弹层焦点圈闭、aria-live 变更播报
- 🔒 **约束能力** —— `validRange` 日期窗口与 `eventOverlap={false}` 防重复预订
- 📤 **ICS 导入/导出** —— `parseICS` / `toICS` 往返 iCalendar 文件，含重复规则
- 🪶 **零运行时依赖**，TypeScript 优先

## 安装

```bash
npm install svelte5plus-calendar
```

需要 Svelte 5。样式随组件自动引入。

## 快速开始

```svelte
<script lang="ts">
  import { Calendar, type CalendarEvent } from 'svelte5plus-calendar';

  let events = $state<CalendarEvent[]>([
    {
      id: '1',
      title: '项目启动会',
      start: new Date(2026, 7, 13, 10, 0),
      end: new Date(2026, 7, 13, 11, 0),
      color: 'teal'
    },
    {
      id: '2',
      title: '技术大会',
      start: new Date(2026, 7, 17),
      end: new Date(2026, 7, 20),
      allDay: true
    },
    {
      id: '3',
      title: '每日站会',
      start: new Date(2026, 7, 10, 9, 30),
      end: new Date(2026, 7, 10, 9, 45),
      recurrence: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'
    }
  ]);
</script>

<!-- 日历会撑满父元素——给外层容器一个高度 -->
<div style="height: 640px">
  <Calendar bind:events view="week" locale="zh-CN" editable selectable />
</div>
```

## 常用配方

**处理拖拽编辑（支持回滚）：**

```svelte
<Calendar
  bind:events
  editable
  onEventChange={async ({ event, start, end, revert }) => {
    try {
      await api.update(event.id, { start, end });
    } catch {
      revert(); // 保存失败时弹回原位
    }
  }}
/>
```

**拖选新建日程：**

```svelte
<Calendar
  bind:events
  selectable
  onSelect={({ start, end, allDay }) => {
    events = [...events, { id: crypto.randomUUID(), title: '新日程', start, end, allDay }];
  }}
/>
```

**多日历源与显示开关：**

```svelte
<script lang="ts">
  let sources = $state([
    { id: 'work', name: '工作', color: 'blue', visible: true },
    { id: 'personal', name: '个人', color: 'green', visible: true }
  ]);
</script>

<Calendar {events} {sources} locale="zh-CN" />
```

**暗色模式与品牌定制：**

```svelte
<Calendar {events} theme="dark" locale="zh-CN" />

<style>
  :global(.s5c) {
    --s5c-accent: #e4572e;
    --s5c-event-radius: 8px;
  }
</style>
```

## API 速览

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `events` | `CalendarEvent[]` | `[]` | 可绑定——编辑结果写回 |
| `date` | `Date` | 今天 | 可绑定——聚焦日期 |
| `view` | `'day' \| 'week' \| 'month' \| 'year' \| 'agenda'` | `'month'` | 可绑定 |
| `sources` | `CalendarSource[]` | `[]` | 日历分组 |
| `locale` | `string` | `'en'` | BCP-47 标签 |
| `editable` / `selectable` | `boolean` | `false` | 交互开关 |
| `theme` | `'light' \| 'dark' \| 'auto'` | 继承祖先 `data-s5c-theme`，否则亮色 | 配色方案 |
| `firstDayOfWeek` | `0–6` | 由 locale 推断 | 0 = 周日 |
| `dayStartHour` / `dayEndHour` | `number` | `0` / `24` | 可见小时范围 |
| `slotDuration` / `snapDuration` | 分钟 | `30` / `15` | 网格密度与吸附 |
| `businessHours` | `boolean \| { days, startHour, endHour }` | `null` | 营业时间阴影 |
| `dayMaxEvents` | `number` | `4` | 月格折叠阈值 |
| `weekNumbers` / `weekends` / `fixedWeeks` / `nowIndicator` / `hour12` / `agendaDays` / `views` / `header` / `messages` | — | — | 详见文档 |

**回调：** `onEventClick(instance, e)` · `onDateClick(date, allDay)` · `onSelect({start, end, allDay})` · `onEventChange({event, oldStart, oldEnd, start, end, revert})` · `onEventCreate(event)` · `onEventDelete(event, occurrence?)` · `onSeriesDetach({series, detached, occurrence})` · `onSeriesSplit({truncated, created, occurrence})` · `onViewChange(view)` · `onDateChange(date)` · `onRangeChange(start, end)`

**内置弹层：** 开启 `editable` 或 `selectable` 且不提供回调时，点击日程弹出详情弹层、点击/框选空白弹出快速新建弹层。提供 `onEventClick` / `onSelect` / `onDateClick` 即接管对应交互；也可用 `eventDetails={false}` / `quickCreate={false}` 关闭。

**祖先驱动主题：** 省略 `theme` 属性，在任意祖先元素（如 `<html>`）上设置 `data-s5c-theme="dark"`，即可统一切换页面上所有日历的主题。

**Snippet：** `eventContent(instance)` · `toolbarEnd()`

**其他导出：** `MiniCalendar`（独立迷你月历）、`parseRRule`、`expandRecurrence`、`expandEvents`、`layoutDay`、`layoutWeekRow`、日期工具函数及全部 TypeScript 类型。

完整参考请见文档站的 **API 参考** 页面。

## 参与贡献

欢迎贡献！克隆仓库后运行 `npm install && npm run dev` 即可启动带在线示例的文档站。项目结构、测试方式与发布流程详见 [CONTRIBUTING.md](https://github.com/Blackman99/svelte5plus-calendar/blob/main/CONTRIBUTING.md)。

## 协议

[MIT](https://github.com/Blackman99/svelte5plus-calendar/blob/main/LICENSE)
