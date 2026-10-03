// Pure easing and timing helpers. No state, no wall clock: f(t) only.

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
/** 0 → 1 progress of `t` through [a, b]. */
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
/** True while `t` is inside [a, b). */
export const within = (t: number, a: number, b: number) => t >= a && t < b;

export const easeOutCubic = (p: number) => 1 - (1 - p) ** 3;
export const easeInCubic = (p: number) => p ** 3;
export const easeInOutCubic = (p: number) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2);
export const easeOutQuint = (p: number) => 1 - (1 - p) ** 5;
export const easeInQuint = (p: number) => p ** 5;
export const easeOutExpo = (p: number) => (p >= 1 ? 1 : 1 - 2 ** (-10 * p));
export const easeInExpo = (p: number) => (p <= 0 ? 0 : 2 ** (10 * p - 10));
export function easeInOutExpo(p: number) {
	return p <= 0 ? 0 : p >= 1 ? 1 : p < 0.5 ? 2 ** (20 * p - 10) / 2 : (2 - 2 ** (-20 * p + 10)) / 2;
}
export const smootherstep = (p: number) => p * p * p * (p * (p * 6 - 15) + 10);
export function easeOutBack(p: number, s = 1.4) {
	const c3 = s + 1;
	return 1 + c3 * (p - 1) ** 3 + s * (p - 1) ** 2;
}

/** Ease-in from `a`, readable landing at `b` — "fast exit, slowing arrival" in one curve. */
export const arrive = (t: number, a: number, b: number) => easeOutQuint(prog(t, a, b));
export const leave = (t: number, a: number, b: number) => easeInQuint(prog(t, a, b));

/** Deterministic pseudo-random in [0, 1) from an integer seed (mulberry32). */
export function rand(seed: number) {
	let x = (seed + 0x6D2B79F5) | 0;
	x = Math.imul(x ^ (x >>> 15), x | 1);
	x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
	return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
}

/** Linear keyframes [[t, v], …] with an easing per segment. */
export function keys(t: number, frames: [number, number][], ease: (p: number) => number = easeInOutCubic) {
	if (t <= frames[0][0])
		return frames[0][1];
	for (let i = 1; i < frames.length; i++) {
		const [t1, v1] = frames[i];
		const [t0, v0] = frames[i - 1];
		if (t <= t1)
			return lerp(v0, v1, ease(prog(t, t0, t1)));
	}
	return frames.at(-1)![1];
}
