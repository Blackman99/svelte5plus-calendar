import { fileURLToPath } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

const lib = fileURLToPath(new URL('../src/lib', import.meta.url));

export default defineConfig({
	root: fileURLToPath(new URL('.', import.meta.url)),
	plugins: [svelte({ compilerOptions: { runes: true } })],
	resolve: {
		// The film imports the library by its published name, straight from source —
		// every calendar on screen is the real component, never a mock-up.
		alias: { 'svelte5plus-calendar': lib }
	},
	server: { port: 5199, strictPort: true, fs: { allow: ['..'] } }
});
