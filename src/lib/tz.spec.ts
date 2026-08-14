import { describe, expect, it } from 'vitest';
import { fromZoned, toZoned } from './tz.js';

describe('toZoned / fromZoned', () => {
	it('shifts an instant into the target zone wall clock', () => {
		// 2026-08-13T06:00Z = 14:00 in Shanghai (UTC+8), 02:00 in New York (EDT, UTC-4)
		const instant = new Date(Date.UTC(2026, 7, 13, 6, 0));
		const sh = toZoned(instant, 'Asia/Shanghai');
		expect([sh.getHours(), sh.getMinutes()]).toEqual([14, 0]);
		const ny = toZoned(instant, 'America/New_York');
		expect(ny.getHours()).toBe(2);
	});

	it('fromZoned inverts toZoned', () => {
		for (const tz of ['Asia/Shanghai', 'America/New_York', 'Europe/Berlin', 'UTC']) {
			const instant = new Date(Date.UTC(2026, 2, 8, 6, 30)); // near US DST switch
			const roundTrip = fromZoned(toZoned(instant, tz), tz);
			expect(roundTrip.getTime()).toBe(instant.getTime());
		}
	});

	it('handles half-hour offset zones', () => {
		const instant = new Date(Date.UTC(2026, 7, 13, 6, 0));
		const kolkata = toZoned(instant, 'Asia/Kolkata'); // UTC+5:30
		expect([kolkata.getHours(), kolkata.getMinutes()]).toEqual([11, 30]);
		expect(fromZoned(kolkata, 'Asia/Kolkata').getTime()).toBe(instant.getTime());
	});

	it('round-trips valid wall-clocks across the spring-forward transition', () => {
		// America/New_York springs forward on 2026-03-08: every instant maps to
		// a unique (existing) wall-clock, so the round-trip must be exact even
		// across the 02:00 → 03:00 offset jump.
		for (let h = 0; h < 24; h++) {
			const instant = new Date(`2026-03-08T${String(h).padStart(2, '0')}:30:00Z`);
			const roundTrip = fromZoned(toZoned(instant, 'America/New_York'), 'America/New_York');
			expect(roundTrip.getTime()).toBe(instant.getTime());
		}
	});

	it('resolves the fall-back overlap deterministically', () => {
		// 01:30 on 2026-11-01 occurs twice in America/New_York (EDT and EST).
		// A wall-clock `Date` carries no offset, so both instants map to the
		// same input; the result must at least be stable across calls.
		const zoned = new Date(2026, 10, 1, 1, 30);
		const a = fromZoned(zoned, 'America/New_York');
		const b = fromZoned(zoned, 'America/New_York');
		expect(a.getTime()).toBe(b.getTime());
	});

	it('returns a finite best-effort instant for a non-existent wall-clock', () => {
		// 02:30 on 2026-03-08 does not exist in America/New_York (spring-forward gap).
		const zoned = new Date(2026, 2, 8, 2, 30);
		const result = fromZoned(zoned, 'America/New_York');
		expect(Number.isFinite(result.getTime())).toBe(true);
	});
});
