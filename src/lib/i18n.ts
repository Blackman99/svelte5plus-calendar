/**
 * Internationalization: UI strings + `Intl`-based date formatting.
 * Built-in messages for English and Simplified Chinese; any locale can be
 * added by passing a (partial) `CalendarMessages` object.
 */
import type { Weekday } from './types.js';

export interface CalendarMessages {
	today: string;
	day: string;
	week: string;
	month: string;
	year: string;
	agenda: string;
	allDay: string;
	/** `+{n} more` — receives the hidden-event count. */
	more: (n: number) => string;
	noEvents: string;
	newEvent: string;
	/** Week-number column header / prefix, receives the ISO week number. */
	weekNo: (n: number) => string;
	previous: string;
	next: string;
	events: string;
}

export const en: CalendarMessages = {
	today: 'Today',
	day: 'Day',
	week: 'Week',
	month: 'Month',
	year: 'Year',
	agenda: 'Agenda',
	allDay: 'All-day',
	more: (n) => `+${n} more`,
	noEvents: 'No events',
	newEvent: 'New event',
	weekNo: (n) => `W${n}`,
	previous: 'Previous',
	next: 'Next',
	events: 'events'
};

export const zhCN: CalendarMessages = {
	today: '今天',
	day: '日',
	week: '周',
	month: '月',
	year: '年',
	agenda: '议程',
	allDay: '全天',
	more: (n) => `还有 ${n} 项`,
	noEvents: '暂无日程',
	newEvent: '新建日程',
	weekNo: (n) => `第${n}周`,
	previous: '上一页',
	next: '下一页',
	events: '项日程'
};

const BUILT_IN: Record<string, CalendarMessages> = {
	en,
	'zh-cn': zhCN,
	zh: zhCN,
	'zh-hans': zhCN
};

export function messagesForLocale(
	locale: string,
	overrides?: Partial<CalendarMessages>
): CalendarMessages {
	const key = locale.toLowerCase();
	const base = BUILT_IN[key] ?? BUILT_IN[key.split('-')[0]] ?? en;
	return overrides ? { ...base, ...overrides } : base;
}

/** The locale's default first day of week, via `Intl.Locale#getWeekInfo` when available. */
export function localeFirstDay(locale: string): Weekday {
	try {
		const loc = new Intl.Locale(locale) as Intl.Locale & {
			getWeekInfo?: () => { firstDay: number };
			weekInfo?: { firstDay: number };
		};
		const info = loc.getWeekInfo?.() ?? loc.weekInfo;
		if (info) return (info.firstDay % 7) as Weekday; // Intl: 1=Mon…7=Sun → 0=Sun
	} catch {
		// fall through to heuristic
	}
	// Heuristic fallback: US-style locales start Sunday, most others Monday.
	return /^(en-US|en-CA|ja|ko|zh-TW|he|pt-BR)/i.test(locale) ? 0 : 1;
}

/** Memoized `Intl.DateTimeFormat` factory (constructing them is expensive). */
const fmtCache = new Map<string, Intl.DateTimeFormat>();
export function fmt(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
	const key = locale + JSON.stringify(options);
	let f = fmtCache.get(key);
	if (!f) {
		f = new Intl.DateTimeFormat(locale, options);
		fmtCache.set(key, f);
	}
	return f;
}

/** Formatting helpers used across the components. */
export function formatters(locale: string, hour12?: boolean) {
	const hourOpts: Intl.DateTimeFormatOptions =
		hour12 === undefined ? {} : { hour12 };
	return {
		/** “August 2026” / “2026年8月” */
		monthTitle: (d: Date) => fmt(locale, { year: 'numeric', month: 'long' }).format(d),
		/** “Aug 13, 2026” */
		dayTitle: (d: Date) =>
			fmt(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(d),
		/** “2026” */
		yearTitle: (d: Date) => fmt(locale, { year: 'numeric' }).format(d),
		/** “Mon” / “周一” */
		weekdayShort: (d: Date) => fmt(locale, { weekday: 'short' }).format(d),
		/** “M” / “一” */
		weekdayNarrow: (d: Date) => fmt(locale, { weekday: 'narrow' }).format(d),
		/** “Monday, August 13” */
		dayHeader: (d: Date) =>
			fmt(locale, { weekday: 'long', month: 'long', day: 'numeric' }).format(d),
		/** “13” */
		dayNum: (d: Date) => fmt(locale, { day: 'numeric' }).format(d),
		/** “Aug” */
		monthShort: (d: Date) => fmt(locale, { month: 'short' }).format(d),
		/** “9:30 AM” / “09:30” */
		time: (d: Date) => fmt(locale, { hour: 'numeric', minute: '2-digit', ...hourOpts }).format(d),
		/** “9 AM” / “09时” — hour ruler labels */
		hour: (d: Date) => fmt(locale, { hour: 'numeric', ...hourOpts }).format(d),
		/** “Aug 10 – 16, 2026” — week view title */
		range: (a: Date, b: Date) =>
			fmt(locale, { year: 'numeric', month: 'short', day: 'numeric' }).formatRange(a, b),
		/** “Wed, Aug 13” — agenda day rows */
		agendaDay: (d: Date) =>
			fmt(locale, { weekday: 'short', month: 'short', day: 'numeric' }).format(d)
	};
}

export type Formatters = ReturnType<typeof formatters>;
