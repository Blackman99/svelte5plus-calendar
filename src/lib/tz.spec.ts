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
});
