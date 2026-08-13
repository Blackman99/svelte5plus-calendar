import { base } from '$app/paths';

export type Lang = 'en' | 'zh';

/** Bilingual text picker. */
export function T(lang: Lang) {
	return (en: string, zh: string) => (lang === 'en' ? en : zh);
}

export interface NavItem {
	slug: string;
	en: string;
	zh: string;
}

export const guideNav: NavItem[] = [
	{ slug: 'getting-started', en: 'Getting Started', zh: '快速开始' },
	{ slug: 'views', en: 'Views', zh: '视图' },
	{ slug: 'events', en: 'Events & Calendars', zh: '事件与日历' },
	{ slug: 'interactions', en: 'Drag, Drop & Selection', zh: '拖拽与选择' },
	{ slug: 'recurrence', en: 'Recurring Events', zh: '重复事件' },
	{ slug: 'time-grid', en: 'Time Grid Options', zh: '时间网格' },
	{ slug: 'resources', en: 'Resources View', zh: '资源视图' },
	{ slug: 'theming', en: 'Theming & Dark Mode', zh: '主题与暗色模式' },
	{ slug: 'i18n', en: 'Internationalization', zh: '国际化' },
	{ slug: 'custom-rendering', en: 'Custom Rendering', zh: '自定义渲染' },
	{ slug: 'mini-calendar', en: 'Mini Calendar', zh: '迷你月历' }
];

export const REPO_URL = 'https://github.com/Blackman99/svelte5plus-calendar';

/** Prefixes an app-absolute path with the deployment base path. */
export function withBase(path: string): string {
	return `${base}${path}`;
}

/** Ordered list of all doc pages for prev/next footer navigation. */
export function docSequence(lang: Lang): Array<{ href: string; title: string }> {
	const t = T(lang);
	return [
		...guideNav.map((item) => ({
			href: withBase(`/${lang}/guide/${item.slug}/`),
			title: lang === 'en' ? item.en : item.zh
		})),
		{ href: withBase(`/${lang}/api/`), title: t('API Reference', 'API 参考') }
	];
}
