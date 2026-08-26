# 主流日历库能力对标（2026-08-26）

## 结论先行

`svelte5plus-calendar` 已经覆盖了多数个人/团队日历的显性功能，而且有几个值得保留的差异点：原生 Svelte 5、零运行时依赖、年/议程视图、免费资源列、ICS，以及内置“本次 / 本次及以后”的重复事件编辑。它当前更明显的短板不是再增加一个普通视图，而是把已有功能深化成可靠的应用基础设施：时间语义、数据加载、约束模型、资源调度深度、完整无障碍契约和更广的自定义界面。

优先建议：

1. **先把日期时间模型做成稳定契约。** FullCalendar 和 Schedule-X 都明确区分本地、UTC、命名时区或 Temporal 类型；EventCalendar 也明确限定只支持本地、UTC、固定偏移。当前项目对外仍以 `Date` 为主，应明确 instant / floating time / all-day 的语义，覆盖 DST 跳变、重复小时、序列化和编辑回写。
2. **补齐异步数据源和可撤销的约束管线。** 主流库普遍提供可见区间加载、loading/error、refetch，以及拖放前置校验。当前 `events` 数组 + `validRange` + `eventOverlap` 适合本地组件，但不足以直接承载生产排班、远程数据和权限校验。
3. **资源能力向“调度”深化，而不是只增加列。** 免费 EventCalendar 已有资源周视图、横向 timeline、层级资源；FullCalendar / Schedule-X 更把虚拟化、懒加载、资源分组和调度助手作为付费价值。当前单日资源列要成为真正竞争点，至少应补资源周、层级/多资源关联和大数据性能边界。
4. **把无障碍从若干交互提升为可测试的产品契约。** FullCalendar 有专门的 WAI-ARIA 文档；Schedule-X 的源码和测试覆盖事件键盘激活、月/周导航、ARIA live 等。当前项目已有月网格键盘、Alt+方向键编辑和焦点陷阱，是好基础，但还需要跨视图的键盘地图、非拖拽编辑替代、焦点恢复、RTL 和自动化测试。
5. **扩大 Svelte 原生自定义面，而不是暴露 DOM 钩子。** Schedule-X 的 Svelte adapter 可替换事件、日期、小时轴、header、modal 等多个组件；EventCalendar 用 Svelte snippets 覆盖事件、日期格、资源标签、more/no-events 等位置。当前 `eventContent` 与 `toolbarEnd` 可扩为少量稳定、类型化的 snippets。
6. **重复事件要继续做“编辑语义”优势，同时明确 RFC 边界。** FullCalendar 借 `rrule` 支持 `EXDATE`/`EXRULE`；Schedule-X 明确声明只是 iCalendar 的部分实现且某些规则不可拖拽。当前项目的系列拆分/删除比多数轻量库更完整，但应公布支持矩阵并逐步增加 `WKST`、`RDATE`、`EXRULE`、更多 `BY*` 组合及跨 DST 测试。
7. **不要为了对标而照搬大型插件架构。** FullCalendar 的成熟插件生态很强，但 Schedule-X 已把拖放、缩放和资源视图移入付费包；`svelte5plus-calendar` 的“单包、MIT、免费交互”本身有市场价值。更合适的演进是稳定核心 seam 与可选入口，而不是立即拆成大量包。

## 研究范围与口径

对标对象：

- [FullCalendar](https://fullcalendar.io/docs)：跨框架市场基准，功能与商业边界最成熟。
- [TOAST UI Calendar](https://github.com/nhn/tui.calendar)：高知名度、全功能但维护节奏偏慢的 MIT 日历。
- [Schedule-X](https://schedule-x.dev/docs/calendar/getting-started)：现代、响应式、插件化，且有官方 Svelte adapter。
- [EventCalendar (`@event-calendar/core`)](https://github.com/vkurko/calendar)：本次选择的最接近 Svelte 实现。其当前官方包直接提供 Svelte 5 `Calendar` 组件、Svelte snippets、资源视图和 MIT 交互插件，因而比仅有通用 JS 包或旧 Svelte wrapper 的项目更适合作直接技术参照。[官方 Svelte 5 用法](https://github.com/vkurko/calendar/blob/master/packages/core/README.md#svelte-5-component)

只使用官方文档、官方仓库与 npm 元数据。矩阵中的“未文档化”表示在官方公开 API、插件列表和事件模型中没有找到承诺，不等同于证明内部绝无相关代码。本研究没有运行这些库的交互 demo 或做性能基准。

图例：✅ 内置且免费；🧩 官方免费插件/adapter；💰 官方付费能力；⚠️ 部分、手工或无完整契约；— 官方未文档化。

## 能力矩阵

| 维度 | FullCalendar 7 | TOAST UI Calendar 2 | Schedule-X 4 | EventCalendar 5 |
| --- | --- | --- | --- | --- |
| 常规视图 | ✅ day/month、time grid、list、multi-month、custom view；[视图索引](https://fullcalendar.io/docs) | ✅ month/week/day，可配 2/3 周；[官方 README](https://github.com/nhn/tui.calendar#-features) | ✅ day、week、month grid、month/week agenda、list，内置响应式切换；[views](https://schedule-x.dev/docs/calendar/views) | 🧩 day grid day/week/month、time grid day/week、list day/week/month/year；[view](https://github.com/vkurko/calendar/blob/master/packages/core/README.md#view) |
| 资源 / 时间线 | 💰 vertical resource、resource timeline、资源数据 API、分组和虚拟化；[Premium](https://fullcalendar.io/docs/premium) | — 官方视图只有 month/week/day | 💰 资源周列视图与独立 resource scheduler；后者含无限滚动、懒加载、调度助手；[resource scheduler](https://schedule-x.dev/docs/calendar/resource-scheduler) | 🧩 免费 ResourceTimeGrid day/week 与 ResourceTimeline day/week/month/year，支持层级资源；[插件列表](https://github.com/vkurko/calendar/blob/master/packages/core/README.md#javascript-module) |
| 重复事件 | ✅ 简单 daily/weekly；🧩 `@fullcalendar/rrule` 支持 RRULE、EXDATE、EXRULE；[RRule plugin](https://fullcalendar.io/docs/rrule-plugin) | ⚠️ 事件有 `recurrenceRule` 字符串，但官方只把它定义为数据/详情弹窗内容，未文档化展开引擎；[EventObject](https://github.com/nhn/tui.calendar/blob/main/docs/en/apis/event-object.md) | 🧩 免费 recurrence 插件，明确为 iCalendar 部分实现；某些 monthly/yearly `BYDAY` 可显示但不可拖放编辑；[recurrence](https://schedule-x.dev/docs/calendar/plugins/recurrence) | — 官方插件列表和 Event object 未定义重复规则或展开能力；[Event object](https://github.com/vkurko/calendar/blob/master/packages/core/README.md#event-object) |
| 时区 | ✅ local、UTC、IANA 命名时区；v7 提供 Temporal 互操作；[timeZone](https://fullcalendar.io/docs/timeZone) | ✅ `TZDate`、主/附加时区列、IANA 名称与自定义 offset calculator；[timezone](https://github.com/nhn/tui.calendar/blob/main/docs/en/apis/options.md#timezone) | ✅ 使用 Temporal `PlainDate` / `ZonedDateTime`，配置 IANA `timezone`；[configuration](https://schedule-x.dev/docs/calendar/configuration) | ⚠️ 明确支持 local、UTC 和固定 `±HH:MM`，不支持 IANA 命名区；[timeZone](https://github.com/vkurko/calendar/blob/master/packages/core/README.md#timezone) |
| 拖放 / 缩放 | 🧩 标准 interaction 能力，含事件/资源间、外部和跨日历拖放、touch long-press；[dragging](https://fullcalendar.io/docs/event-dragging-resizing) | ✅ 内置鼠标拖放与缩放，`beforeUpdateEvent` 由应用提交变更；[事件文档](https://github.com/nhn/tui.calendar/blob/main/docs/en/apis/calendar.md#beforeupdateevent) | 💰 v4 的 drag-and-drop 与 resize 均需有效付费许可；[drag](https://schedule-x.dev/docs/calendar/plugins/drag-and-drop)、[resize](https://schedule-x.dev/docs/calendar/plugins/resize) | 🧩 MIT `Interaction` 插件提供拖放、缩放、选择和触摸长按；[editable](https://github.com/vkurko/calendar/blob/master/packages/core/README.md#editable) |
| 约束 / 校验 | ✅ `validRange`、overlap、business/event constraint、`eventAllow`、select constraint、resource constraint；[控制项](https://fullcalendar.io/docs/event-dragging-resizing) | ⚠️ 全局/事件只读，可选择不提交 `beforeUpdateEvent`；未文档化 overlap、允许区间或资源约束 | ✅ `minDate`/`maxDate`、time-grid overlap；💰 交互支持同步/异步 `onBeforeEventUpdate` 回退；[configuration](https://schedule-x.dev/docs/calendar/configuration) | ✅ `validRange` 与函数式 drag/resize/select constraints；⚠️ `slotEventOverlap` 是视觉布局选项；[constraints](https://github.com/vkurko/calendar/blob/master/packages/core/README.md#dragconstraint) |
| 无障碍 | ✅ 官方声明采用 WAI-ARIA，交互元素可 Tab 聚焦，并可配置 event focus、heading 和 hints；[accessibility](https://fullcalendar.io/docs/accessibility) | ⚠️ 源码有 grid/dialog roles 和少量 ARIA，但无官方无障碍契约或完整键盘说明；[time grid source](https://github.com/nhn/tui.calendar/tree/main/apps/calendar/src/components/timeGrid) | ✅/⚠️ 源码与自动化测试覆盖事件键盘激活、月/周导航、ARIA labels/live；但没有独立公开的合规声明；[week a11y tests](https://github.com/schedule-x/schedule-x/tree/main/packages/calendar/src/views/week/components/__test__) | ⚠️ day header 有 aria-label，clickable event 使用 button role、Tab、Enter/Space；没有完整跨视图契约；[a11y helper](https://github.com/vkurko/calendar/blob/master/packages/core/src/lib/a11y.js) |
| 国际化 / RTL | ✅ locale bundles、动态 locale、方向、first day、可翻译 ARIA hints；[locale](https://fullcalendar.io/docs/locale) | ⚠️ 手工传 week/month `dayNames` 和 templates；无 locale bundle / RTL 契约；[options](https://github.com/nhn/tui.calendar/blob/main/docs/en/apis/options.md) | ✅ 30+ locale、`mergeLocales` 覆盖，并从 HTML `dir` 自动支持 LTR/RTL；[language](https://schedule-x.dev/docs/calendar/language) | ⚠️ 日期时间走原生 `Intl` locale；按钮文本需 `buttonText` 手工覆盖，未文档化 RTL；[locale](https://github.com/vkurko/calendar/blob/master/packages/core/README.md#locale) |
| 自定义渲染 | ✅ 大量 class/content/mount hooks；connector 可返回框架节点；[content injection](https://fullcalendar.io/docs/content-injection) | ✅ templates 可返回字符串或 Preact VNode，覆盖事件、格子、popup、时区等；[template](https://github.com/nhn/tui.calendar/blob/main/docs/en/apis/template.md) | ✅ React/Vue/Svelte adapters 可动态替换大量组件；Svelte 覆盖事件、日期、小时轴、header、modal、资源事件等；[Svelte slots](https://schedule-x.dev/docs/frameworks/svelte#slots--custom-components) | ✅ content callbacks；Svelte snippets 覆盖 event、day cell、resource label、more、no-events、week number 等；[content snippets](https://github.com/vkurko/calendar/blob/master/packages/core/README.md#content-snippets) |
| 插件 / 付费边界 | 核心与普通视图 MIT；资源 timeline/vertical resource/print optimization 是 Premium，商业生产需许可；[Premium terms](https://fullcalendar.io/docs/premium) | 全部 MIT，未形成官方插件市场；[LICENSE](https://github.com/nhn/tui.calendar/blob/main/LICENSE) | 核心、recurrence、modal、services 等 MIT；拖放、缩放、资源、interactive modal/sidebar/drag-create 等收费；[premium](https://schedule-x.dev/premium) | 全部 MIT；视图与 Interaction 随 `@event-calendar/core` 提供，无付费层；[LICENSE](https://github.com/vkurko/calendar/blob/master/LICENSE) |
| SSR / 框架集成 | 官方 React、Preact、Vue、Angular、Web Component；无官方 Svelte connector，也未文档化 SSR HTML 输出；[框架索引](https://fullcalendar.io/docs) | Plain JS + 官方 React/Vue wrappers；核心明确提供 `renderToString()`；[SSR](https://github.com/nhn/tui.calendar/blob/main/docs/en/apis/calendar.md#rendertostring) | 官方 React/Vue/Angular/Svelte/Preact adapters；Svelte 文档推荐在 `onMount` 创建实例，属于 client-init 路径，未声明 SSR 输出；[Svelte](https://schedule-x.dev/docs/frameworks/svelte) | 直接提供 Svelte 5 component，组件销毁自动清理；另有 JS API/standalone bundle；未文档化 SSR 保证；[Svelte 5](https://github.com/vkurko/calendar/blob/master/packages/core/README.md#svelte-5-component) |
| 远程数据 / 生命周期 | ✅ function/JSON/Google/ICS event sources、lazy fetch、loading、refetch；[event sources](https://fullcalendar.io/docs) | ⚠️ 以应用调用 `createEvents`/`updateEvent` 为主，无范围数据源抽象 | ✅ `onRangeUpdate`、`fetchEvents`、events service；[configuration callbacks](https://schedule-x.dev/docs/calendar/configuration) | ✅ URL/function event sources、lazy fetch、loading、refetch；资源也可 URL/function；[eventSources](https://github.com/vkurko/calendar/blob/master/packages/core/README.md#eventsources) |

## 免费与付费边界的产品含义

- **FullCalendar** 把普通日历、重复规则 connector、拖放和丰富 constraints 留在开源层，把资源数据/资源视图/时间线/打印优化放进 Scheduler Premium。它最值得借鉴的是 API 深度和稳定 seam，不是免费功能数量。
- **Schedule-X v4** 的商业边界更激进：核心显示与 recurrence 免费，但拖放、缩放、资源、drag-to-create、交互表单等生产交互进入付费层。[v3 → v4 migration](https://schedule-x.dev/docs/calendar/major-version-migrations) 也明确记录 drag/resize 包迁移到 `@sx-premium`。
- **TOAST UI Calendar** 和 **EventCalendar** 均为 MIT 单层产品。前者功能集中但维护信号较弱；后者免费资源/timeline/interaction 对本项目最有直接参考价值。
- 对 `svelte5plus-calendar` 而言，免费提供拖放、系列编辑、资源列、ICS、零依赖是可宣传的差异化。若未来商业化，更适合把高级 scheduler（层级、timeline、虚拟化、调度助手）或企业支持作为边界，而不是收回已有基础交互。

## 维护信号快照

以下版本与时间来自 npm registry，仓库热度/活动来自官方 GitHub，均为 2026-08-26 快照；stars 只反映可见度，不代表质量。

| 项目 | npm 最新版 / 发布时间 | 官方仓库信号 | 判断 |
| --- | --- | --- | --- |
| [FullCalendar](https://www.npmjs.com/package/fullcalendar) | 7.0.2 / 2026-07-24 | [20.6k stars，2026-07-24 有推送](https://github.com/fullcalendar/fullcalendar) | 高采用度、持续维护；v7 是当前活跃大版本 |
| [TOAST UI Calendar](https://www.npmjs.com/package/@toast-ui/calendar) | 2.1.3 / 2022-08-16 | [12.7k stars；默认分支最后提交 2023-02，仓库 pushed_at 2024-06](https://github.com/nhn/tui.calendar) | 高知名度但发布和开发节奏明显停滞，适合借鉴 API，不宜作为未来方向标 |
| [Schedule-X](https://www.npmjs.com/package/@schedule-x/calendar) | 4.6.1 / 2026-07-08 | [2.5k stars，2026-08-14 有推送](https://github.com/schedule-x/schedule-x) | 活跃、快速演进；需关注大版本与付费边界变化 |
| [EventCalendar](https://www.npmjs.com/package/@event-calendar/core) | 5.12.0 / 2026-07-31 | [2.3k stars，2026-07-31 有推送](https://github.com/vkurko/calendar) | 活跃、Svelte 5 原生度最高，是最直接的实现参照 |

## 建议的完善路线

### P0：可靠性与生产接入

1. 定义日期时间领域模型：all-day、floating、instant、zoned 四类输入/输出；形成 DST 测试矩阵和序列化约定。
2. 引入可见范围数据源接口：`fetchEvents(range, { timeZone, signal })`、loading/error、取消、缓存、refetch；保留数组模式作为最简单入口。
3. 统一选择/创建/拖动/缩放的 transaction seam：同步或异步 `allow`、optimistic update、`revert`、权限/资源/business-hours/overlap 组合约束。
4. 发布跨 month/week/day/year/agenda/resources 的键盘与读屏契约，并用自动化测试覆盖焦点进入、移动、弹窗关闭后恢复和无鼠标编辑。

### P1：调度深度与可扩展性

5. 资源周视图；事件支持多个 resource IDs；层级资源与折叠；per-resource business hours；大资源/事件量的虚拟化或明确上限。
6. 扩展类型化 snippets：day cell/header、time-axis、resource label/header、more/no-events、popover/details；每个 snippet 同时规定默认语义和 ARIA 责任。
7. 公布 RRULE 支持表与失败策略；逐步补 `WKST`、`RDATE`、`EXRULE`、`BYMONTH`/`BYSETPOS` 等，并保持“本次 / 本次及以后 / 整个系列”编辑的一致性。
8. 增加 RTL 与完整消息覆盖，包括 ARIA announcements；按 locale 验证 first day、12/24 小时制和 week-number 规则。

### P2：扩展场景

9. custom-duration views、multi-month、外部/跨日历拖放、background events、打印样式。
10. 给 SvelteKit SSR/hydration 建立明确支持矩阵和 CI 示例；即使选择 client-only，也应文档化无 hydration mismatch 的推荐模式。

## 最终定位建议

不要把目标定义成“功能数量追平 FullCalendar”。更有胜算的定位是：**Svelte 5 原生、MIT、零依赖、对重复事件编辑友好，并能从个人日历平滑升级到中等复杂度资源排班**。近期成功标准应是生产可靠性与 API 深度，而不是继续堆叠看得见但彼此独立的 UI 功能。
