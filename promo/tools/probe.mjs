/* eslint-disable no-console, antfu/no-top-level-await -- CLI script */
// Dev helper: screenshot a view and print the card-local rects of key calendar parts (to calibrate cameras).
import process from 'node:process';
import { chromium } from 'playwright-core';
import { createServer } from 'vite';

const [view = 'week', out = 'renders/probe.png', t = '0'] = process.argv.slice(2);
const server = await createServer({ configFile: 'vite.config.ts', logLevel: 'error', server: { port: 0, strictPort: false } });
await server.listen();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, timezoneId: 'America/New_York', locale: 'en-US' });
page.on('pageerror', (e) => console.error('[page]', e.message));
page.on('console', (m) => m.type() === 'error' && console.error('[console]', m.text()));
await page.goto(`${server.resolvedUrls.local[0]}?view=${view}&t=${t}`);
await page.waitForFunction(() => !!window.__film);
await page.evaluate((t) => window.__film.seek(Number(t)), t);
await page.screenshot({ path: out });
const rects = await page.evaluate(() => {
	const card = document.querySelector('.card')?.getBoundingClientRect();
	if (!card)
		return null;
	const r = (sel, n = 3) => [...document.querySelectorAll(sel)].slice(0, n).map((e) => {
		const b = e.getBoundingClientRect();
		return `${Math.round(b.left - card.left)},${Math.round(b.top - card.top)} ${Math.round(b.width)}x${Math.round(b.height)}`;
	});
	return { card: `${card.width}x${card.height}`, toolbar: r('.s5c-toolbar'), title: r('.s5c-toolbar-title'), header: r('.s5c-tg-header'), allday: r('.s5c-allday'), scroll: r('.s5c-tg-scroll'), col: r('.s5c-tg-col', 7), hour: r('.s5c-tg-hourline', 2), block: r('.s5c-block', 30).length, hero: r('[aria-label^="Release sync"]'), month: r('.s5c-month-week', 6), sh: [...document.querySelectorAll('.s5c-tg-scroll')].map((e) => `${e.scrollTop}/${e.scrollHeight}/${e.clientHeight}`) };
});
console.log(JSON.stringify(rects, null, 1));
await browser.close();
await server.close();
