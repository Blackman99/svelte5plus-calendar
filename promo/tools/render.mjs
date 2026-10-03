#!/usr/bin/env node
/* eslint-disable no-console, antfu/no-top-level-await -- CLI script */
// Deterministic frame renderer: Vite serves the film, headless Chromium seeks the single film clock
// to every frame (or sub-frame) and screenshots it, ffmpeg encodes. Rendering is chunked across
// workers; because every frame is a pure function of time, chunks are independent.
//
// Usage: node tools/render.mjs [--out renders/picture.mp4] [--from 0] [--to 30] [--fps 60]
//          [--shutter 4]   sub-frames averaged per output frame (accumulation motion blur, 180° shutter); 1 = off
//          [--workers 6] [--scale 1] [--jpeg] [--still 12.3,14 --stills-dir renders/stills]
import { Buffer } from 'node:buffer';
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { createServer } from 'vite';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);

const fps = Number(opt('--fps', 60));
const from = Number(opt('--from', 0));
const shutter = Math.max(1, Number(opt('--shutter', 4)));
const workers = Number(opt('--workers', 6));
const scale = Number(opt('--scale', 1));
const out = resolve(ROOT, opt('--out', 'renders/picture.mp4'));
const stills = opt('--still', null);

function run(cmd, argv, input) {
	return new Promise((ok, fail) => {
		const p = spawn(cmd, argv, { stdio: [input ? 'pipe' : 'ignore', 'ignore', 'pipe'] });
		let err = '';
		p.stderr.on('data', (d) => (err += d));
		p.on('close', (code) => (code === 0 ? ok() : fail(new Error(`${cmd} exited ${code}\n${err.slice(-2000)}`))));
		if (input)
			input(p);
	});
}

const server = await createServer({ configFile: join(ROOT, 'vite.config.ts'), logLevel: 'error', server: { port: 0, strictPort: false } });
await server.listen();
// any free port: the dev preview (5199) may be in use
const url = server.resolvedUrls.local[0];
const browser = await chromium.launch({ args: ['--font-render-hinting=none', '--disable-lcd-text'] });

async function openPage() {
	// A fixed zone and locale keep every render identical on any machine.
	const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: scale, timezoneId: 'America/New_York', locale: 'en-US' });
	page.on('pageerror', (e) => console.error('[page]', e.message));
	await page.goto(url);
	await page.waitForFunction(() => !!window.__film);
	await page.evaluate(() => document.fonts.ready);
	page.cdp = await page.context().newCDPSession(page);
	return page;
}
// CDP's speed-optimised PNG is still lossless and ~4× faster than the default encoder; --jpeg for quick drafts.
const jpeg = args.includes('--jpeg');
async function grab(page) {
	const { data } = await page.cdp.send('Page.captureScreenshot', jpeg ? { format: 'jpeg', quality: 92, optimizeForSpeed: true } : { format: 'png', optimizeForSpeed: true });
	return Buffer.from(data, 'base64');
}
const seek = (page, t) => page.evaluate((t) => window.__film.seek(t), t);

try {
	if (stills) {
		const dir = resolve(ROOT, opt('--stills-dir', 'renders/stills'));
		mkdirSync(dir, { recursive: true });
		const page = await openPage();
		for (const s of stills.split(',')) {
			await seek(page, Number(s));
			await page.screenshot({ path: join(dir, `t${Number(s).toFixed(2)}.png`) });
		}
		console.log(`stills → ${dir}`);
	}
	else {
		const duration = await (await openPage()).evaluate(() => window.__film.duration);
		const to = Number(opt('--to', duration));
		const first = Math.round(from * fps);
		const total = Math.round(to * fps) - first;
		const tmp = resolve(ROOT, 'renders/_chunks');
		rmSync(tmp, { recursive: true, force: true });
		mkdirSync(tmp, { recursive: true });
		const per = Math.ceil(total / workers);
		const started = Date.now();
		let done = 0;

		const chunk = async (w) => {
			const a = first + w * per;
			const b = Math.min(first + total, a + per);
			if (a >= b)
				return null;
			const page = await openPage();
			const file = join(tmp, `c${String(w).padStart(2, '0')}.mkv`);
			// Sub-frames sit centred on the frame time across half a frame interval (180° shutter);
			// tmix averages them, select keeps one output frame per group.
			const vf = shutter > 1
				? [`tmix=frames=${shutter}`, `select='eq(mod(n\\,${shutter})\\,${shutter - 1})'`, `setpts=N/(${fps}*TB)`].join(',')
				: 'null';
			await run('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps * shutter), '-i', '-', '-vf', vf, '-r', String(fps), '-c:v', 'libx264rgb', '-crf', '0', '-preset', 'ultrafast', file], async (p) => {
				for (let f = a; f < b; f++) {
					for (let s = 0; s < shutter; s++) {
						const t = f / fps + (shutter > 1 ? ((s + 0.5) / shutter - 0.5) * (0.5 / fps) : 0);
						await seek(page, Math.max(0, t));
						const png = await grab(page);
						if (!p.stdin.write(png))
							await new Promise((r) => p.stdin.once('drain', r));
					}
					if (++done % 60 === 0)
						process.stdout.write(`\r${done}/${total} frames  ${((Date.now() - started) / 1000).toFixed(0)}s`);
				}
				p.stdin.end();
			});
			await page.close();
			return file;
		};

		const files = (await Promise.all(Array.from({ length: workers }, (_, w) => chunk(w)))).filter(Boolean);
		const list = join(tmp, 'list.txt');
		writeFileSync(list, files.map((f) => `file '${f}'`).join('\n'));
		mkdirSync(dirname(out), { recursive: true });
		await run('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-r', String(fps), '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-movflags', '+faststart', out]);
		rmSync(tmp, { recursive: true, force: true });
		console.log(`\n${total} frames (shutter ${shutter}) in ${((Date.now() - started) / 1000).toFixed(0)}s → ${out}`);
	}
}
finally {
	await browser.close();
	await server.close();
}
