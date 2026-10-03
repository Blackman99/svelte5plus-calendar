/* eslint-disable no-console, antfu/no-top-level-await -- CLI script */
// Quality-bar check: the same frame rendered after different seek histories must match (within 1/255).
// Usage: node tools/determinism.mjs [t1,t2,...]
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import process from 'node:process';
import { chromium } from 'playwright-core';
import { createServer } from 'vite';

const times = (process.argv[2] ?? '1.55,3.5,6.6,9.2,12.1,13.5,15.0,16.0,17.0,19.3,20.75').split(',').map(Number);
const server = await createServer({ configFile: 'vite.config.ts', logLevel: 'error', server: { port: 0, strictPort: false } });
await server.listen();
const browser = await chromium.launch();
async function open() {
	const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, timezoneId: 'America/New_York', locale: 'en-US' });
	await page.goto(server.resolvedUrls.local[0]);
	await page.waitForFunction(() => !!window.__film);
	return page;
}
async function shot(page, t) {
	await page.evaluate((t) => window.__film.seek(t), t);
	return page.screenshot();
}
const hash = (png) => createHash('sha1').update(png).digest('hex').slice(0, 12);
const rgb = (png) => spawnSync('ffmpeg', ['-v', 'error', '-i', 'pipe:0', '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1'], { input: png, maxBuffer: 1 << 26 }).stdout;
/** Largest per-channel difference (0–255). GPU rasterisation of huge scaled SVG can round by 1. */
function maxDiff(a, b) {
	const x = rgb(a);
	const y = rgb(b);
	let m = 0;
	for (let i = 0; i < x.length; i++)
		m = Math.max(m, Math.abs(x[i] - y[i]));
	return m;
}
const a = await open();
const b = await open();
let bad = 0;
for (const t of times) {
	const direct = await shot(a, t); // fresh jump (after the previous test time)
	await shot(b, Math.max(0, t - 3.7)); // a different history: earlier frame first
	await shot(b, t + 2.1); // then a later one
	const viaHistory = await shot(b, t);
	const same = hash(direct) === hash(viaHistory);
	const d = same ? 0 : maxDiff(direct, viaHistory);
	bad += d > 1 ? 1 : 0;
	console.log(`${t.toFixed(2)}s  ${hash(direct)}  ${hash(viaHistory)}  ${same ? 'identical' : d <= 1 ? 'same (±1/255 raster rounding)' : `DIFFERENT (max ${d}/255)`}`);
}
console.log(bad ? `${bad} frame(s) depend on seek history` : 'deterministic: every frame matches within 1/255');
await browser.close();
await server.close();
process.exit(bad ? 1 : 0);
