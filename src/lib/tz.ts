/**
 * Display-time-zone conversion. The calendar lays events out by the local
 * wall-clock of plain `Date`s; to render in another IANA zone we shift each
 * instant so its *local* fields equal its wall-clock in the target zone
 * (`toZoned`), and shift edited values back to real instants (`fromZoned`).
 */

const dtfCache = new Map<string, Intl.DateTimeFormat>();

function zoneFormatter(timeZone: string): Intl.DateTimeFormat {
	let f = dtfCache.get(timeZone);
	if (!f) {
		f = new Intl.DateTimeFormat('en-US', {
			timeZone,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false
		});
		dtfCache.set(timeZone, f);
	}
	return f;
}

function wallParts(date: Date, timeZone: string): number[] {
	const parts = zoneFormatter(timeZone).formatToParts(date);
	const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
	// `hour12: false` may yield "24" at midnight in some engines.
	return [get('year'), get('month'), get('day'), get('hour') % 24, get('minute'), get('second')];
}

/** The instant's wall-clock in `timeZone`, expressed as a local-fields Date. */
export function toZoned(date: Date, timeZone: string): Date {
	const [y, m, d, h, mi, s] = wallParts(date, timeZone);
	return new Date(y, m - 1, d, h, mi, s, date.getMilliseconds());
}

/** Inverse of {@link toZoned}: the real instant whose wall-clock in `timeZone` matches `zoned`'s local fields. */
export function fromZoned(zoned: Date, timeZone: string): Date {
	const targetUTC = Date.UTC(
		zoned.getFullYear(),
		zoned.getMonth(),
		zoned.getDate(),
		zoned.getHours(),
		zoned.getMinutes(),
		zoned.getSeconds(),
		zoned.getMilliseconds()
	);
	let guess = new Date(targetUTC);
	// Iterate: adjust by the difference between the guess's wall-clock and the target.
	for (let i = 0; i < 3; i++) {
		const [y, m, d, h, mi, s] = wallParts(guess, timeZone);
		const wallUTC = Date.UTC(y, m - 1, d, h, mi, s, guess.getMilliseconds());
		const diff = targetUTC - wallUTC;
		if (diff === 0) break;
		guess = new Date(guess.getTime() + diff);
	}
	return guess;
}
