// Deterministic "now": every frame of the film sees the same wall clock, so the
// today highlight and the now-indicator never drift between renders.
// Must be imported before anything that reads the date.
export const NOW = new Date(2026, 9, 13, 9, 41).getTime(); // Tue 13 Oct 2026, 09:41

const RealDate = Date;
class FrozenDate extends RealDate {
	constructor(...args: unknown[]) {
		if (args.length === 0)
			super(NOW);
		else
			// @ts-expect-error -- forwarding the native overloads
			super(...args);
	}

	static override now() {
		return NOW;
	}
}
globalThis.Date = FrozenDate as DateConstructor;
