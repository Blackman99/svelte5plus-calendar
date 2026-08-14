/**
 * Long-press drag lifecycle shared by the time-grid, resource and month views.
 *
 * Mouse (and untyped) pointers activate immediately; touch/pen pointers activate
 * after a ~300 ms long-press (with a haptic tick), blocking native scrolling. A
 * swipe beyond the slop distance before activation cancels the drag so page
 * scrolling keeps working, and the browser's `pointercancel` is honoured by the
 * caller invoking {@link cancel}.
 */

export interface DragBase {
	activated: boolean;
	startX: number;
	startY: number;
}

const LONG_PRESS_MS = 300;
const TOUCH_SLOP_PX = 10;

const preventTouchScroll = (e: TouchEvent) => e.preventDefault();

export function createPointerDrag<TData>(
	getDrag: () => (DragBase & TData) | null,
	setDrag: (drag: (DragBase & TData) | null) => void
) {
	let pressTimer: ReturnType<typeof setTimeout> | null = null;

	function blockTouchScroll() {
		window.addEventListener('touchmove', preventTouchScroll, { passive: false });
	}
	function unblockTouchScroll() {
		window.removeEventListener('touchmove', preventTouchScroll);
	}

	/** Starts a drag: immediately for mouse, after a long-press for touch/pen. */
	function begin(e: PointerEvent, data: TData): DragBase & TData {
		const base: DragBase = {
			activated: e.pointerType === 'mouse' || e.pointerType === '',
			startX: e.clientX,
			startY: e.clientY
		};
		const drag = { ...base, ...data };
		setDrag(drag);
		if (!base.activated) {
			pressTimer = setTimeout(() => {
				const current = getDrag();
				if (current && !current.activated) {
					setDrag({ ...current, activated: true });
					blockTouchScroll();
					navigator.vibrate?.(10);
				}
			}, LONG_PRESS_MS);
		}
		return drag;
	}

	/** True when a not-yet-activated drag should be cancelled as a scroll swipe. */
	function isSwipe(drag: DragBase, e: PointerEvent): boolean {
		return Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > TOUCH_SLOP_PX;
	}

	function cancel() {
		if (pressTimer) clearTimeout(pressTimer);
		pressTimer = null;
		unblockTouchScroll();
		setDrag(null);
	}

	/**
	 * Swallow the compat click that follows pointerup on the drag's target.
	 * Removed on a timeout too: when the drag ends over a different element no
	 * click fires at all, and the suppressor must not eat the next one.
	 */
	function suppressNextClick() {
		const handler = (e: MouseEvent) => e.stopPropagation();
		window.addEventListener('click', handler, { capture: true });
		setTimeout(() => window.removeEventListener('click', handler, { capture: true }), 0);
	}

	return { begin, cancel, isSwipe, suppressNextClick };
}
