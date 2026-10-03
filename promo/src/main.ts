import { flushSync, mount } from 'svelte';
import { clock, DURATION, FPS, measureHooks } from './clock.svelte';
import Film from './Film.svelte';
import './freeze-time';
import './film.css';

mount(Film, { target: document.getElementById('app')! });

declare global {
	interface Window {
		__film: { duration: number; fps: number; seek: (t: number) => Promise<void> };
	}
}

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

window.__film = {
	duration: DURATION,
	fps: FPS,
	async seek(t: number) {
		clock.t = t;
		clock.tf = Math.round(t * FPS) / FPS;
		flushSync();
		for (const measure of measureHooks)
			measure();
		flushSync();
		await nextFrame();
	}
};

// Preview mode: ?t=12.3 freezes on a time, ?play plays in real time (preview only — renders always seek).
const params = new URLSearchParams(location.search);
if (params.has('t'))
	window.__film.seek(Number(params.get('t')));
if (params.has('play')) {
	const start = performance.now() - Number(params.get('play') || 0) * 1000;
	const tick = () => {
		window.__film.seek(((performance.now() - start) / 1000) % DURATION);
		requestAnimationFrame(tick);
	};
	tick();
}
