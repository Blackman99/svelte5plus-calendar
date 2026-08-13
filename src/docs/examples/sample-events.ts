/**
 * Demo data used by the documentation examples.
 * Everything is generated relative to “today” so the demos always have content.
 */
import type { CalendarEvent, CalendarSource } from '$lib';
import { addDays, startOfDay, startOfWeek } from '$lib';

const zh = (locale: string) => locale.toLowerCase().startsWith('zh');

export function sampleSources(locale = 'en'): CalendarSource[] {
	const t = zh(locale);
	return [
		{ id: 'work', name: t ? '工作' : 'Work', color: 'blue', visible: true },
		{ id: 'personal', name: t ? '个人' : 'Personal', color: 'green', visible: true },
		{ id: 'family', name: t ? '家庭' : 'Family', color: 'orange', visible: true }
	];
}

export function sampleEvents(locale = 'en'): CalendarEvent[] {
	const t = zh(locale);
	const today = startOfDay(new Date());
	const monday = startOfWeek(today, 1);
	const at = (dayOffset: number, h: number, m = 0) => {
		const d = addDays(monday, dayOffset);
		return new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m);
	};

	return [
		{
			id: 'standup',
			title: t ? '每日站会' : 'Team standup',
			start: at(0, 9, 30),
			end: at(0, 9, 45),
			recurrence: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
			calendarId: 'work'
		},
		{
			id: 'design-review',
			title: t ? '设计评审' : 'Design review',
			start: at(1, 14, 0),
			end: at(1, 15, 30),
			calendarId: 'work',
			location: t ? '3 号会议室' : 'Room 3'
		},
		{
			id: 'one-on-one',
			title: t ? '一对一沟通' : '1:1 with Alex',
			start: at(3, 10, 0),
			end: at(3, 10, 30),
			calendarId: 'work'
		},
		{
			id: 'sprint-planning',
			title: t ? '迭代规划' : 'Sprint planning',
			start: at(3, 14, 0),
			end: at(3, 16, 0),
			calendarId: 'work',
			color: 'indigo'
		},
		{
			id: 'code-review',
			title: t ? '代码走查' : 'Code review',
			start: at(3, 15, 0),
			end: at(3, 17, 0),
			calendarId: 'work',
			color: 'teal'
		},
		{
			id: 'conference',
			title: t ? 'SvelteConf 大会' : 'SvelteConf',
			start: addDays(monday, 8),
			end: addDays(monday, 11),
			allDay: true,
			calendarId: 'work',
			color: 'purple',
			location: t ? '上海' : 'Amsterdam'
		},
		{
			id: 'launch',
			title: t ? 'v1.0 发布日' : 'v1.0 launch day',
			start: addDays(monday, 4),
			end: addDays(monday, 5),
			allDay: true,
			calendarId: 'work',
			color: 'red'
		},
		{
			id: 'lunch',
			title: t ? '和小林吃午饭' : 'Lunch with Sam',
			start: at(2, 12, 0),
			end: at(2, 13, 0),
			calendarId: 'personal',
			location: t ? '面馆' : 'Noodle bar'
		},
		{
			id: 'gym',
			title: t ? '健身' : 'Gym',
			start: at(1, 18, 0),
			end: at(1, 19, 0),
			recurrence: 'FREQ=WEEKLY;BYDAY=TU,TH',
			calendarId: 'personal'
		},
		{
			id: 'yoga',
			title: t ? '瑜伽课' : 'Yoga class',
			start: at(5, 9, 0),
			end: at(5, 10, 0),
			calendarId: 'personal',
			color: 'pink'
		},
		{
			id: 'movie',
			title: t ? '电影之夜' : 'Movie night',
			start: at(4, 20, 0),
			end: at(4, 22, 30),
			calendarId: 'family'
		},
		{
			id: 'dentist',
			title: t ? '看牙医' : 'Dentist',
			start: at(7, 11, 0),
			end: at(7, 11, 45),
			calendarId: 'personal',
			color: 'yellow'
		},
		{
			id: 'grandma',
			title: t ? '看望奶奶' : 'Visit grandma',
			start: addDays(monday, 6),
			end: addDays(monday, 7),
			allDay: true,
			calendarId: 'family'
		},
		{
			id: 'rent',
			title: t ? '交房租' : 'Pay rent',
			start: new Date(today.getFullYear(), today.getMonth(), 1, 8, 0),
			end: new Date(today.getFullYear(), today.getMonth(), 1, 8, 15),
			recurrence: 'FREQ=MONTHLY;BYMONTHDAY=1',
			calendarId: 'personal',
			color: 'graphite'
		}
	];
}
