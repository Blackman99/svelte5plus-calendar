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

/**
 * Inverse of {@link toZoned}: the real instant whose wall-clock in `timeZone`
 * matches `zoned`'s local fields.
 *
 * The result is exact for any wall-clock that exists. DST transitions make two
 * wall-clocks ambiguous, which the local-fields `Date` representation cannot
 * disambiguate (it carries no UTC offset):
 *
 * - **Fall-back overlap** — a wall-clock that occurs twice resolves
 *   deterministically to one of the two instants (the iteration converges to
 *   the later one).
 * - **Spring-forward gap** — a wall-clock that does not exist has no exact
 *   answer; the function returns the best-effort instant at the transition,
 *   and callers should treat such times as invalid.
 */
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
	// Fixed-point iteration: adjust by the difference between the guess's
	// wall-clock and the target. Converges in 1–2 steps for valid times
	// (the guess lands on the opposite side of the offset change); the cap is
	// a safety net for the spring-forward gap, where the wall-clock never
	// exists and the iteration oscillates around the transition.
	for (let i = 0; i < 8; i++) {
		const [y, m, d, h, mi, s] = wallParts(guess, timeZone);
		const wallUTC = Date.UTC(y, m - 1, d, h, mi, s, guess.getMilliseconds());
		const diff = targetUTC - wallUTC;
		if (diff === 0) return guess;
		guess = new Date(guess.getTime() + diff);
	}
	return guess;
}
