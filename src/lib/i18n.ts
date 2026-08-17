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
	/** Quick-create popover: confirm button. */
	add: string;
	/** Quick-create popover: start-field label. */
	starts: string;
	/** Quick-create popover: end-field label. */
	ends: string;
	/** Event details popover: delete button. */
	delete: string;
	/** Quick-create popover: title input placeholder. */
	titlePlaceholder: string;
	/** Title shown for events saved without a title. */
	untitled: string;
	/** Details popover: label for recurring events. */
	recurringEvent: string;
	close: string;
	/** Details popover: delete a single occurrence of a series. */
	deleteOccurrence: string;
	/** Details popover: delete the whole series. */
	deleteSeries: string;
	/** Series-edit confirm popover: title. */
	editRecurring: string;
	/** Series-edit confirm popover: apply to this occurrence only. */
	thisEvent: string;
	/** Series-edit confirm popover: apply to this and all following occurrences. */
	thisAndFollowing: string;
	cancel: string;
	/** Toolbar label of the resource view. */
	resources: string;
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
	events: 'events',
	add: 'Add',
	starts: 'Starts',
	ends: 'Ends',
	delete: 'Delete',
	titlePlaceholder: 'Add title',
	untitled: '(no title)',
	recurringEvent: 'Recurring event',
	close: 'Close',
	deleteOccurrence: 'Delete this occurrence',
	deleteSeries: 'Delete series',
	editRecurring: 'Edit recurring event',
	thisEvent: 'This event',
	thisAndFollowing: 'This and following',
	cancel: 'Cancel',
	resources: 'Resources'
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
	events: '项日程',
	add: '添加',
	starts: '开始',
	ends: '结束',
	delete: '删除',
	titlePlaceholder: '添加标题',
	untitled: '（无标题）',
	recurringEvent: '重复日程',
	close: '关闭',
	deleteOccurrence: '删除仅此次',
	deleteSeries: '删除整个系列',
	editRecurring: '修改重复日程',
	thisEvent: '仅此日程',
	thisAndFollowing: '此次及以后',
	cancel: '取消',
	resources: '资源'
};

export const de: CalendarMessages = {
	today: 'Heute',
	day: 'Tag',
	week: 'Woche',
	month: 'Monat',
	year: 'Jahr',
	agenda: 'Agenda',
	allDay: 'Ganztägig',
	more: (n) => `+${n} weitere`,
	noEvents: 'Keine Termine',
	newEvent: 'Neuer Termin',
	weekNo: (n) => `KW ${n}`,
	previous: 'Zurück',
	next: 'Weiter',
	events: 'Termine',
	add: 'Hinzufügen',
	starts: 'Beginn',
	ends: 'Ende',
	delete: 'Löschen',
	titlePlaceholder: 'Titel hinzufügen',
	untitled: '(Ohne Titel)',
	recurringEvent: 'Serientermin',
	close: 'Schließen',
	deleteOccurrence: 'Nur diesen Termin löschen',
	deleteSeries: 'Serie löschen',
	editRecurring: 'Serientermin bearbeiten',
	thisEvent: 'Dieser Termin',
	thisAndFollowing: 'Dieser und folgende',
	cancel: 'Abbrechen',
	resources: 'Ressourcen'
};

export const fr: CalendarMessages = {
	today: 'Aujourd\'hui',
	day: 'Jour',
	week: 'Semaine',
	month: 'Mois',
	year: 'Année',
	agenda: 'Agenda',
	allDay: 'Journée entière',
	more: (n) => `+${n} autres`,
	noEvents: 'Aucun événement',
	newEvent: 'Nouvel événement',
	weekNo: (n) => `S${n}`,
	previous: 'Précédent',
	next: 'Suivant',
	events: 'événements',
	add: 'Ajouter',
	starts: 'Début',
	ends: 'Fin',
	delete: 'Supprimer',
	titlePlaceholder: 'Ajouter un titre',
	untitled: '(Sans titre)',
	recurringEvent: 'Événement récurrent',
	close: 'Fermer',
	deleteOccurrence: 'Supprimer cette occurrence',
	deleteSeries: 'Supprimer la série',
	editRecurring: 'Modifier l\'événement récurrent',
	thisEvent: 'Cet événement',
	thisAndFollowing: 'Celui-ci et les suivants',
	cancel: 'Annuler',
	resources: 'Ressources'
};

export const es: CalendarMessages = {
	today: 'Hoy',
	day: 'Día',
	week: 'Semana',
	month: 'Mes',
	year: 'Año',
	agenda: 'Agenda',
	allDay: 'Todo el día',
	more: (n) => `+${n} más`,
	noEvents: 'Sin eventos',
	newEvent: 'Nuevo evento',
	weekNo: (n) => `S${n}`,
	previous: 'Anterior',
	next: 'Siguiente',
	events: 'eventos',
	add: 'Añadir',
	starts: 'Comienza',
	ends: 'Termina',
	delete: 'Eliminar',
	titlePlaceholder: 'Añadir título',
	untitled: '(Sin título)',
	recurringEvent: 'Evento recurrente',
	close: 'Cerrar',
	deleteOccurrence: 'Eliminar esta repetición',
	deleteSeries: 'Eliminar la serie',
	editRecurring: 'Editar evento recurrente',
	thisEvent: 'Este evento',
	thisAndFollowing: 'Este y los siguientes',
	cancel: 'Cancelar',
	resources: 'Recursos'
};

export const pt: CalendarMessages = {
	today: 'Hoje',
	day: 'Dia',
	week: 'Semana',
	month: 'Mês',
	year: 'Ano',
	agenda: 'Agenda',
	allDay: 'Dia inteiro',
	more: (n) => `+${n} mais`,
	noEvents: 'Sem eventos',
	newEvent: 'Novo evento',
	weekNo: (n) => `S${n}`,
	previous: 'Anterior',
	next: 'Próximo',
	events: 'eventos',
	add: 'Adicionar',
	starts: 'Início',
	ends: 'Fim',
	delete: 'Excluir',
	titlePlaceholder: 'Adicionar título',
	untitled: '(Sem título)',
	recurringEvent: 'Evento recorrente',
	close: 'Fechar',
	deleteOccurrence: 'Excluir esta ocorrência',
	deleteSeries: 'Excluir a série',
	editRecurring: 'Editar evento recorrente',
	thisEvent: 'Este evento',
	thisAndFollowing: 'Este e os seguintes',
	cancel: 'Cancelar',
	resources: 'Recursos'
};

export const ja: CalendarMessages = {
	today: '今日',
	day: '日',
	week: '週',
	month: '月',
	year: '年',
	agenda: '予定リスト',
	allDay: '終日',
	more: (n) => `他 ${n} 件`,
	noEvents: '予定なし',
	newEvent: '新しい予定',
	weekNo: (n) => `第${n}週`,
	previous: '前へ',
	next: '次へ',
	events: '件',
	add: '追加',
	starts: '開始',
	ends: '終了',
	delete: '削除',
	titlePlaceholder: 'タイトルを追加',
	untitled: '（タイトルなし）',
	recurringEvent: '繰り返しの予定',
	close: '閉じる',
	deleteOccurrence: 'この予定のみ削除',
	deleteSeries: 'シリーズを削除',
	editRecurring: '繰り返しの予定を変更',
	thisEvent: 'この予定',
	thisAndFollowing: 'これ以降すべて',
	cancel: 'キャンセル',
	resources: 'リソース'
};

export const ko: CalendarMessages = {
	today: '오늘',
	day: '일',
	week: '주',
	month: '월',
	year: '년',
	agenda: '일정 목록',
	allDay: '종일',
	more: (n) => `+${n}개 더보기`,
	noEvents: '일정 없음',
	newEvent: '새 일정',
	weekNo: (n) => `${n}주차`,
	previous: '이전',
	next: '다음',
	events: '개 일정',
	add: '추가',
	starts: '시작',
	ends: '종료',
	delete: '삭제',
	titlePlaceholder: '제목 추가',
	untitled: '(제목 없음)',
	recurringEvent: '반복 일정',
	close: '닫기',
	deleteOccurrence: '이 일정만 삭제',
	deleteSeries: '반복 모두 삭제',
	editRecurring: '반복 일정 수정',
	thisEvent: '이 일정',
	thisAndFollowing: '이 일정 및 향후 일정',
	cancel: '취소',
	resources: '리소스'
};

export const ru: CalendarMessages = {
	today: 'Сегодня',
	day: 'День',
	week: 'Неделя',
	month: 'Месяц',
	year: 'Год',
	agenda: 'Повестка',
	allDay: 'Весь день',
	more: (n) => `ещё ${n}`,
	noEvents: 'Нет событий',
	newEvent: 'Новое событие',
	weekNo: (n) => `Нед. ${n}`,
	previous: 'Назад',
	next: 'Вперёд',
	events: 'события',
	add: 'Добавить',
	starts: 'Начало',
	ends: 'Конец',
	delete: 'Удалить',
	titlePlaceholder: 'Добавьте название',
	untitled: '(Без названия)',
	recurringEvent: 'Повторяющееся событие',
	close: 'Закрыть',
	deleteOccurrence: 'Удалить только это событие',
	deleteSeries: 'Удалить серию',
	editRecurring: 'Изменить повторяющееся событие',
	thisEvent: 'Это событие',
	thisAndFollowing: 'Это и последующие',
	cancel: 'Отмена',
	resources: 'Ресурсы'
};

export const it: CalendarMessages = {
	today: 'Oggi',
	day: 'Giorno',
	week: 'Settimana',
	month: 'Mese',
	year: 'Anno',
	agenda: 'Agenda',
	allDay: 'Tutto il giorno',
	more: (n) => `+${n} altri`,
	noEvents: 'Nessun evento',
	newEvent: 'Nuovo evento',
	weekNo: (n) => `Sett. ${n}`,
	previous: 'Indietro',
	next: 'Avanti',
	events: 'eventi',
	add: 'Aggiungi',
	starts: 'Inizio',
	ends: 'Fine',
	delete: 'Elimina',
	titlePlaceholder: 'Aggiungi titolo',
	untitled: '(Senza titolo)',
	recurringEvent: 'Evento ricorrente',
	close: 'Chiudi',
	deleteOccurrence: 'Elimina questa occorrenza',
	deleteSeries: 'Elimina la serie',
	editRecurring: 'Modifica evento ricorrente',
	thisEvent: 'Questo evento',
	thisAndFollowing: 'Questo e i successivi',
	cancel: 'Annulla',
	resources: 'Risorse'
};

const BUILT_IN: Record<string, CalendarMessages> = {
	en,
	'zh-cn': zhCN,
	'zh': zhCN,
	'zh-hans': zhCN,
	de,
	fr,
	es,
	pt,
	'pt-br': pt,
	ja,
	ko,
	ru,
	it
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
	}
	catch {
		// fall through to heuristic
	}
	// Heuristic fallback: US-style locales start Sunday, most others Monday.
	return /^(?:en-US|en-CA|ja|ko|zh-TW|he|pt-BR)/i.test(locale) ? 0 : 1;
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
	const hourOpts: Intl.DateTimeFormatOptions
		= hour12 === undefined ? {} : { hour12 };
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
