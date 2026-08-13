/**
 * iCalendar (RFC 5545) import/export for the common VEVENT subset this
 * library models. Timed values are treated as local (“floating”) times —
 * `TZID` parameters and trailing `Z` (UTC) markers are converted to the
 * runtime's local time zone on import.
 */
import type { CalendarEvent } from './types.js';
import { parseRRule, serializeRRule } from './recurrence.js';

const pad = (n: number) => String(n).padStart(2, '0');

function fmtDate(d: Date): string {
	return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}
function fmtDateTime(d: Date): string {
	return `${fmtDate(d)}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function escapeText(s: string): string {
	return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}
function unescapeText(s: string): string {
	return s
		.replace(/\\n/gi, '\n')
		.replace(/\\,/g, ',')
		.replace(/\\;/g, ';')
		.replace(/\\\\/g, '\\');
}

/** Folds a content line at 74 octets-ish (we fold by chars, safe for UTF-8 readers). */
function fold(line: string): string {
	if (line.length <= 74) return line;
	const out: string[] = [];
	for (let i = 0; i < line.length; i += 73) {
		out.push((i === 0 ? '' : ' ') + line.slice(i, i + 73));
	}
	return out.join('\r\n');
}

/** Serializes events into an `text/calendar` document. */
export function toICS(events: CalendarEvent[], opts: { prodId?: string } = {}): string {
	const lines: string[] = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		`PRODID:${opts.prodId ?? '-//svelte5plus-calendar//EN'}`
	];
	for (const ev of events) {
		lines.push('BEGIN:VEVENT');
		lines.push(`UID:${escapeText(ev.id)}`);
		lines.push(`DTSTAMP:${fmtDateTime(ev.start)}`);
		lines.push(`SUMMARY:${escapeText(ev.title)}`);
		if (ev.allDay) {
			lines.push(`DTSTART;VALUE=DATE:${fmtDate(ev.start)}`);
			lines.push(`DTEND;VALUE=DATE:${fmtDate(ev.end)}`);
		}
		else {
			lines.push(`DTSTART:${fmtDateTime(ev.start)}`);
			lines.push(`DTEND:${fmtDateTime(ev.end)}`);
		}
		if (ev.recurrence) lines.push(`RRULE:${serializeRRule(ev.recurrence)}`);
		for (const x of ev.exdates ?? []) {
			lines.push(ev.allDay ? `EXDATE;VALUE=DATE:${fmtDate(x)}` : `EXDATE:${fmtDateTime(x)}`);
		}
		if (ev.location) lines.push(`LOCATION:${escapeText(ev.location)}`);
		if (ev.description) lines.push(`DESCRIPTION:${escapeText(ev.description)}`);
		lines.push('END:VEVENT');
	}
	lines.push('END:VCALENDAR');
	return `${lines.map(fold).join('\r\n')}\r\n`;
}

interface ParsedProp {
	name: string;
	params: Record<string, string>;
	value: string;
}

function parseProp(line: string): ParsedProp | null {
	const colon = line.indexOf(':');
	if (colon < 0) return null;
	const [name, ...paramParts] = line.slice(0, colon).split(';');
	const params: Record<string, string> = {};
	for (const p of paramParts) {
		const eq = p.indexOf('=');
		if (eq > 0) params[p.slice(0, eq).toUpperCase()] = p.slice(eq + 1);
	}
	return { name: name.toUpperCase(), params, value: line.slice(colon + 1) };
}

/** Parses `YYYYMMDD` or `YYYYMMDDTHHMMSS[Z]` into a local Date. */
function parseICSDate(value: string): { date: Date; dateOnly: boolean } | null {
	const m = value.trim().match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/);
	if (!m) return null;
	const [, y, mo, d, h, mi, s, z] = m;
	if (h === undefined) return { date: new Date(+y, +mo - 1, +d), dateOnly: true };
	if (z) return { date: new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s)), dateOnly: false };
	return { date: new Date(+y, +mo - 1, +d, +h, +mi, +s), dateOnly: false };
}

/**
 * Parses an iCalendar document into {@link CalendarEvent}s. Unsupported
 * components and properties are ignored; VEVENTs without a parsable DTSTART
 * are skipped. DTEND defaults to one hour (or one day for all-day events).
 */
export function parseICS(text: string): CalendarEvent[] {
	// Unfold continuation lines, then walk VEVENT blocks.
	const lines = text.replace(/\r?\n[ \t]/g, '').split(/\r?\n/);
	const events: CalendarEvent[] = [];
	let cur: Record<string, ParsedProp[]> | null = null;
	let counter = 0;

	for (const line of lines) {
		if (/^BEGIN:VEVENT$/i.test(line.trim())) {
			cur = {};
			continue;
		}
		if (/^END:VEVENT$/i.test(line.trim())) {
			if (cur) {
				const ev = buildEvent(cur, counter++);
				if (ev) events.push(ev);
			}
			cur = null;
			continue;
		}
		if (!cur) continue;
		const prop = parseProp(line);
		if (prop) (cur[prop.name] ??= []).push(prop);
	}
	return events;
}

function buildEvent(props: Record<string, ParsedProp[]>, index: number): CalendarEvent | null {
	const first = (name: string) => props[name]?.[0];
	const dtstartProp = first('DTSTART');
	if (!dtstartProp) return null;
	const dtstart = parseICSDate(dtstartProp.value);
	if (!dtstart) return null;
	const allDay = dtstart.dateOnly || dtstartProp.params.VALUE === 'DATE';

	let end: Date;
	const dtend = first('DTEND') ? parseICSDate(first('DTEND')!.value) : null;
	if (dtend) {
		end = dtend.date;
	}
	else {
		end = new Date(dtstart.date.getTime() + (allDay ? 86_400_000 : 3_600_000));
	}

	const event: CalendarEvent = {
		id: first('UID') ? unescapeText(first('UID')!.value) : `ics-${index}`,
		title: first('SUMMARY') ? unescapeText(first('SUMMARY')!.value) : '',
		start: dtstart.date,
		end,
		...(allDay ? { allDay: true } : {})
	};
	if (first('RRULE')) {
		try {
			event.recurrence = parseRRule(first('RRULE')!.value);
		}
		catch {
			// Unsupported rule — import as a single event.
		}
	}
	const exdates = (props.EXDATE ?? [])
		.flatMap((p) => p.value.split(','))
		.map((v) => parseICSDate(v)?.date)
		.filter((d): d is Date => !!d);
	if (exdates.length) event.exdates = exdates;
	if (first('LOCATION')) event.location = unescapeText(first('LOCATION')!.value);
	if (first('DESCRIPTION')) event.description = unescapeText(first('DESCRIPTION')!.value);
	return event;
}
