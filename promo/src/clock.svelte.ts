// The single seek clock. Every animated value in the film is a pure function of `clock.t`.
// `t` is the sub-frame time (renders average several per frame for motion blur); `tf` is the frame time.
// Discrete state changes (text swaps, snapping, locale/zone flips) read `tf`, so all sub-frames of a frame
// agree on them and nothing is blended into doubled text.
export const clock = $state({ t: 0, tf: 0 });

export const FPS = 60;
export const DURATION = 22.5;

/**
 * Post-layout hooks: run after the DOM for a frame is up to date, to measure real component
 * geometry (event blocks, grid columns) and place overlays (cursor, rings) on it.
 */
// eslint-disable-next-line svelte/prefer-svelte-reactivity -- a plain registry, deliberately not reactive
export const measureHooks = new Set<() => void>();
