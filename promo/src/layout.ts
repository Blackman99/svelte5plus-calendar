// Shared stage geometry. A calendar card is 1608×912 at scale 1 (see Cal.svelte).
export const CARD_W = 1608;
export const CARD_H = 912;

export interface Cam { cx: number; cy: number; s: number }
/** Where the month card sits while it materialises; it pushes to FRONT_CAM.s in place. */
export const MONTH_CAM: Cam = { cx: 960, cy: 616, s: 0.88 };
/** The carousel's front slot; the week canvas starts from exactly here. */
export const FRONT_CAM: Cam = { cx: 960, cy: 616, s: 0.92 };

/** CSS transform placing a card (transform-origin 0 0) so its centre is at (cx, cy) with scale s. */
export const camTransform = (c: Cam) => `translate(${c.cx - (CARD_W / 2) * c.s}px, ${c.cy - (CARD_H / 2) * c.s}px) scale(${c.s})`;
export const camRect = (c: Cam) => ({ x: c.cx - (CARD_W / 2) * c.s, y: c.cy - (CARD_H / 2) * c.s, w: CARD_W * c.s, h: CARD_H * c.s });

/** The code card (scene 3) grows into the month card's frame; scene 4 clips to the same rect. */
// Same width as the month card, so the month view can take over the card's surface without a jump.
export const CODE_RECT = { x: 960 - 707.5, y: 640 - 225, w: 1415, h: 450, r: 30 };
/** The code card's slow reading push; the morph starts from the pushed rect. */
export const HOLD_PUSH = 0;
export const MORPH = [3.3, 3.7] as const;
export function codeMorph(t: number) {
	const p = t <= MORPH[0] ? 0 : t >= MORPH[1] ? 1 : (t - MORPH[0]) / (MORPH[1] - MORPH[0]);
	const e = p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2;
	const to = camRect(MONTH_CAM);
	const l = (a: number, b: number) => a + (b - a) * e;
	const k = 1 + HOLD_PUSH;
	const cx = CODE_RECT.x + CODE_RECT.w / 2;
	const cy = CODE_RECT.y + CODE_RECT.h / 2;
	const from = { x: cx - (CODE_RECT.w * k) / 2, y: cy - (CODE_RECT.h * k) / 2, w: CODE_RECT.w * k, h: CODE_RECT.h * k };
	return { x: l(from.x, to.x), y: l(from.y, to.y), w: l(from.w, to.w), h: l(from.h, to.h), r: l(CODE_RECT.r * k, 14 * MONTH_CAM.s) };
}
