<p align="center">
  <img src="./static/favicon.svg" width="84" alt="svelte5plus-calendar logo" />
</p>

# svelte5plus-calendar

[English](./README.md) | **简体中文**

为 **Svelte 5** 打造的全功能零依赖日历组件——月、周、日、年、议程五种视图，拖拽编辑、重复事件、多日历源、国际化与暗色模式。功能对标 Google 日历、Apple 日历与 Outlook。

> 📖 **带在线示例的完整文档：** 在本仓库运行 `npm run dev`，或访问托管文档站（中文 & English）。

## 功能特性

- 🗓 **五种视图** —— 月视图（跨天长条 + “还有 N 项”弹层）、周/日时间网格、年概览、议程列表
- ✋ **拖拽交互** —— 跨日期/时间格移动事件，拖动底边调整时长，在空白处拖选范围或新建日程
- 💬 **内置弹层** —— 点击日程弹出详情（含删除），点击/框选空白弹出快速新建——零配置可用，提供回调即可完全接管
- 🔁 **重复事件** —— 实用的 RRULE 子集（`FREQ`、`INTERVAL`、`COUNT`、`UNTIL`、`BYDAY` 含 `2TU`/`-1FR`、`BYMONTHDAY`），支持字符串或类型化对象，以及 `exdates` 排除日期
- 🎨 **主题定制** —— 明/暗/跟随系统；所有颜色、圆角、字体均为 CSS 自定义属性；10 色事件调色板自动适配暗色模式
- 🌍 **国际化** —— 基于 `Intl` API 支持任意 BCP-47 区域设置（无需语言包）；内置中英文界面文案；周首日与 12/24 小时制跟随区域设置
- 📚 **多日历源** —— 分组统一配色、独立显示/隐藏、按源和按事件控制编辑权限
- ⏰ **时间网格细节** —— 当前时间指示线、营业时间阴影、可配置小时范围/网格密度/吸附步长、ISO 周数、全天事件栏
- 🧩 **自定义渲染** —— 用 Svelte 5 snippet 替换事件内容；隐藏内置工具栏，通过可绑定的 `date`/`view` 自建导航
- 🧮 **无头能力** —— 重叠分列、周行分段布局算法与重复展开、日期工具均以纯函数导出
- ♿ **可访问性** —— 月视图网格键盘导航、ARIA 角色与标签、焦点管理
- 🪶 **零运行时依赖**，TypeScript 优先，约 19 kB min+gz

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
| `theme` | `'light' \| 'dark' \| 'auto'` | `'light'` | 配色方案 |
| `firstDayOfWeek` | `0–6` | 由 locale 推断 | 0 = 周日 |
| `dayStartHour` / `dayEndHour` | `number` | `0` / `24` | 可见小时范围 |
| `slotDuration` / `snapDuration` | 分钟 | `30` / `15` | 网格密度与吸附 |
| `businessHours` | `boolean \| { days, startHour, endHour }` | `null` | 营业时间阴影 |
| `dayMaxEvents` | `number` | `4` | 月格折叠阈值 |
| `weekNumbers` / `weekends` / `fixedWeeks` / `nowIndicator` / `hour12` / `agendaDays` / `views` / `header` / `messages` | — | — | 详见文档 |

**回调：** `onEventClick(instance, e)` · `onDateClick(date, allDay)` · `onSelect({start, end, allDay})` · `onEventChange({event, oldStart, oldEnd, start, end, revert})` · `onEventCreate(event)` · `onEventDelete(event)` · `onViewChange(view)` · `onDateChange(date)`

**内置弹层：** 开启 `editable` 或 `selectable` 且不提供回调时，点击日程弹出详情弹层、点击/框选空白弹出快速新建弹层。提供 `onEventClick` / `onSelect` / `onDateClick` 即接管对应交互；也可用 `eventDetails={false}` / `quickCreate={false}` 关闭。

**祖先驱动主题：** 省略 `theme` 属性，在任意祖先元素（如 `<html>`）上设置 `data-s5c-theme="dark"`，即可统一切换页面上所有日历的主题。

**Snippet：** `eventContent(instance)` · `toolbarEnd()`

**其他导出：** `MiniCalendar`（独立迷你月历）、`parseRRule`、`expandRecurrence`、`expandEvents`、`layoutDay`、`layoutWeekRow`、日期工具函数及全部 TypeScript 类型。

完整参考请见文档站的 **API 参考** 页面。

## 本地开发

```bash
npm install
npm run dev        # 启动带在线示例的文档站
npm test           # 单元测试（vitest）
npm run check      # svelte-check 类型检查
npm run build      # 构建文档站 + 打包组件库
```

## 版本发布

版本管理与 npm 发布通过 [changesets](https://github.com/changesets/changesets) 自动化：

1. 随代码变更运行 `npx changeset`，描述改动并选择版本级别（patch/minor/major），提交生成的文件。
2. 推送到 `main` 后，**Release** 工作流会自动创建/更新一个 "chore: version packages" PR。
3. 合并该 PR 即自动升级版本号、更新 `CHANGELOG.md` 并发布到 npm。

一次性配置：在仓库 Secrets 中添加 npm 自动化令牌 `NPM_TOKEN`。

## 协议

[MIT](./LICENSE)
