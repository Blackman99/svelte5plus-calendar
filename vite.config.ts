import process from 'node:process';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter(),
			alias: {
				'$docs': './src/docs',
				// The docs import the library by its published name, so example
				// code is copy-paste identical to real-world usage.
				'svelte5plus-calendar': './src/lib'
			},
			paths: {
				// Set by CI when deploying to GitHub Pages (project sites live under /<repo>/).
				base: (process.env.BASE_PATH || '') as '' | `/${string}`,
				// Keep `base` absolute at prerender time — the docs compute
				// language-switch URLs from `page.url.pathname` + `base`.
				relative: false
			}
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
