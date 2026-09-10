# svelte5plus-calendar — honest comparison

**MIT features SVAR puts behind PRO** (agenda / year / resources + recurrence) — stated as fact, not trash-talk.

**Docs:** https://blackman99.github.io/svelte5plus-calendar/  
**Repo:** https://github.com/Blackman99/svelte5plus-calendar  
**npm:** `svelte5plus-calendar` (MIT)

## Feature matrix

| | **svelte5plus-calendar** | **SVAR Svelte Calendar** | **Schedule-X** | **@event-calendar/core** | **FullCalendar** |
|---|---|---|---|---|---|
| **License / cost** | **MIT, $0** — full feature set in OSS | Free MIT: day/week/month + DnD; **PRO** (from ~$599) for agenda/year/resources/timeline + **recurrence** | Core MIT; **Premium** for DnD/resize (v4+), resource scheduler / time-grid resource | MIT | Standard MIT (day/week/month/list + DnD + recurrence); **Premium** for resource/timeline schedulers |
| **Svelte 5 native** | **Yes** (Svelte 5 component, `$state` / snippets) | Yes (Svelte package) | Svelte **wrapper** around Schedule-X core | Yes (Svelte 5 `Calendar` + plugins) | Official React/Vue/etc.; not a first-party Svelte 5 component |
| **Zero runtime deps** | **Yes** | No (SVAR ecosystem packages) | No (calendar + theme + plugins; Premium pkgs extra) | Yes (standalone / zero-dependency claim) | Plugin ecosystem; not “one zero-dep Svelte component” |
| **Views: month** | ✅ | ✅ free | ✅ free | ✅ DayGrid | ✅ Standard |
| **Views: week / day** | ✅ | ✅ free | ✅ free | ✅ TimeGrid | ✅ Standard |
| **Views: year** | ✅ | **PRO** | Check docs / plugins | Limited / not the same “year overview” | Not a free year overview like this |
| **Views: agenda** | ✅ | **PRO** | Month-agenda style in free; check current docs | ✅ List plugin | ✅ list / agenda (Standard) |
| **Views: resources** | ✅ column-style rooms/people (**not** horizontal Timeline yet — roadmap) | **PRO** (resources + timeline) | **Premium** resource views | ✅ ResourceTimeGrid / ResourceTimeline plugins | **Premium** resource/timeline |
| **Drag & drop** | ✅ move / resize / select-create; touch long-press | ✅ free | **Premium** in v4+ (`@sx-premium/drag-and-drop`, resize) | ✅ Interaction plugin | ✅ Standard |
| **RRULE / recurrence** | ✅ **practical subset** (see caveats) | **PRO** | Check plugins / Premium product surface | Partial / DIY vs FullCalendar-style | ✅ Standard (mature) |
| **i18n** | BCP-47 via `Intl`; 10 UI languages; IANA `timeZone` | Localization supported | Strong i18n story | Locale options | Strong locale story |

### How to read this

- **vs SVAR:** Closest “Svelte calendar product” pitch. Their free tier stops at day/week/month; **agenda, year, resources, timeline, and recurring events are PRO**. svelte5plus-calendar ships those views + practical RRULE under MIT — that’s the headline, stated as fact not trash-talk.
- **vs Schedule-X:** Excellent multi-framework calendar; Svelte is a wrapper. As of v4, interactive DnD/resize and advanced resource views sit in Premium. We are Svelte-5-native and zero-runtime-dep with DnD in MIT.
- **vs @event-calendar/core:** Strong MIT, zero-dep, Svelte 5 support, resource plugins. Contrast on **batteries-included** UX (built-in popovers, year/agenda/resources in one component, theming tokens) and “install one package” DX — not on license purity.
- **vs FullCalendar:** Industry default; Standard already includes DnD + recurrence. Premium is for scheduler/resource. Our edge is **Svelte 5 native + zero runtime deps + MIT year/agenda/resources**, not “more complete than FullCalendar.”

## Honest caveats (always say these)

- RRULE is a **practical subset**, not a full RFC 5545 engine: `FREQ`, `INTERVAL`, `COUNT`, `UNTIL`, `BYDAY` (incl. `2TU` / `-1FR`), `BYMONTHDAY`, plus `exdates`; “this” and “this and following” edits. Exotic rules → don’t claim parity with FullCalendar/Google.
- No CalDAV server; ICS import/export helpers only.
- Resources here is **column-style** (rooms/people), MIT. Horizontal Resource Timeline is still roadmap — do **not** claim timeline/Gantt parity with SVAR PRO / Schedule-X Premium / FullCalendar Premium.
- Star/npm counts are early; don’t inflate.

## One-sentence pitches

- **Primary:** Zero-dep Svelte 5 calendar — MIT features SVAR puts behind PRO.
- **Alt:** Month/week/day/year/agenda/resources, DnD, practical RRULE, i18n — one Svelte 5 component, zero runtime dependencies.
