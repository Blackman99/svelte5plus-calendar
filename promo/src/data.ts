import type { CalendarEvent, Resource } from 'svelte5plus-calendar';

// The film's week: Mon 12 – Sun 18 Oct 2026 ("now" is Tue 13 Oct, 09:41 — see freeze-time.ts).
export const FOCUS_DATE = new Date(2026, 9, 13);
export const at = (day: number, h = 0, m = 0) => new Date(2026, 9, 12 + day, h, m);

/** The persistent actor: an amber event that is dragged, resized, then made recurring. */
export const HERO_ID = 'hero';
export const HERO_TITLE = 'Release sync';
export const HERO_COLOR = '#e8900c';
/** Where the hero starts (Wed 14:00–15:00) and where it is dropped and resized to (Mon 10:00–11:30). */
export const HERO_FROM = { day: 2, start: 14 * 60, end: 15 * 60 };
export const HERO_TO = { day: 0, start: 10 * 60, end: 11 * 60 + 30 };

export function hero(day: number, startMin: number, endMin: number, extra: Partial<CalendarEvent> = {}): CalendarEvent {
	return { id: HERO_ID, title: HERO_TITLE, color: HERO_COLOR, start: at(day, 0, startMin), end: at(day, 0, endMin), ...extra };
}

/** Everything else on the calendar. A few events carry no color so they follow `--s5c-accent`. */
export const baseEvents: CalendarEvent[] = [
	{ id: 'standup', title: 'Team standup', start: at(-14, 9, 30), end: at(-14, 9, 45), recurrence: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR', color: 'teal' },
	{ id: 'design', title: 'Design review', start: at(1, 14, 0), end: at(1, 15, 30) },
	{ id: 'lunch', title: 'Lunch with Sam', start: at(2, 12, 0), end: at(2, 13, 0), color: 'green' },
	{ id: 'planning', title: 'Sprint planning', start: at(3, 13, 0), end: at(3, 14, 30), color: 'indigo' },
	{ id: 'oneone', title: '1:1 with Alex', start: at(3, 15, 0), end: at(3, 15, 30) },
	{ id: 'call', title: 'Customer call', start: at(3, 8, 0), end: at(3, 9, 0), color: 'blue' },
	{ id: 'focus', title: 'Focus time', start: at(3, 16, 0), end: at(3, 17, 30), color: 'graphite' },
	{ id: 'codereview', title: 'Code review', start: at(4, 14, 0), end: at(4, 16, 0) },
	{ id: 'gym', title: 'Gym', start: at(1, 18, 0), end: at(1, 19, 0), recurrence: 'FREQ=WEEKLY;BYDAY=TU,TH', color: 'green' },
	{ id: 'movie', title: 'Movie night', start: at(4, 18, 0), end: at(4, 19, 30), color: 'purple' },
	{ id: 'yoga', title: 'Yoga class', start: at(5, 9, 0), end: at(5, 10, 0), color: 'pink' },
	{ id: 'brunch', title: 'Brunch', start: at(6, 11, 0), end: at(6, 12, 30), color: 'orange' },
	{ id: 'sprint', title: 'Sprint 42', start: at(0), end: at(5), allDay: true, color: 'indigo' },
	{ id: 'launch', title: 'v1.0 launch day', start: at(4), end: at(5), allDay: true, color: 'red' },
	// Month-view texture beyond the focus week.
	{ id: 'conf', title: 'SvelteConf', start: at(8), end: at(11), allDay: true, color: 'purple' },
	{ id: 'offsite', title: 'Team offsite', start: at(-9), end: at(-7), allDay: true, color: 'teal' },
	{ id: 'retro', title: 'Retro', start: at(-3, 16, 0), end: at(-3, 17, 0), recurrence: 'FREQ=WEEKLY;INTERVAL=2', color: 'graphite' },
	{ id: 'dentist', title: 'Dentist', start: at(9, 8, 30), end: at(9, 9, 30), color: 'red' },
	{ id: 'hack', title: 'Hack day', start: at(15), end: at(16), allDay: true, color: 'orange' },
	{ id: 'bday', title: 'Mia’s birthday', start: at(-6), end: at(-5), allDay: true, color: 'pink' },
	{ id: 'kickoff', title: 'Q4 kickoff', start: at(-11, 11, 0), end: at(-11, 12, 0), color: 'blue' },
	{ id: 'demo', title: 'Demo day', start: at(-4, 15, 0), end: at(-4, 16, 0) }
];

export const resources: Resource[] = [
	{ id: 'room-a', name: 'Room A', color: 'blue' },
	{ id: 'room-b', name: 'Room B', color: 'green' },
	{ id: 'room-c', name: 'Room C', color: 'purple' },
	{ id: 'room-d', name: 'Room D', color: 'teal' }
];

export const resourceEvents: CalendarEvent[] = [
	{ id: 'r1', title: 'Morning sync', start: at(1, 9, 0), end: at(1, 10, 0), resourceId: 'room-a' },
	{ id: 'r2', title: 'Client demo', start: at(1, 10, 30), end: at(1, 12, 0), resourceId: 'room-b' },
	{ id: 'r3', title: 'Interview', start: at(1, 11, 0), end: at(1, 12, 0), resourceId: 'room-c' },
	{ id: 'r4', title: HERO_TITLE, start: at(1, 14, 0), end: at(1, 15, 0), resourceId: 'room-a', color: HERO_COLOR },
	{ id: 'r5', title: 'Training', start: at(1, 15, 0), end: at(1, 17, 0), resourceId: 'room-c' },
	{ id: 'r6', title: 'Board prep', start: at(1, 13, 0), end: at(1, 14, 30), resourceId: 'room-d' },
	{ id: 'r7', title: 'Design review', start: at(1, 16, 0), end: at(1, 17, 30), resourceId: 'room-b' }
];
