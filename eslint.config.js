import antfu from '@antfu/eslint-config';

export default antfu(
	{
		svelte: true,
		// Match the project's established style (sv-create defaults).
		stylistic: {
			indent: 'tab',
			quotes: 'single',
			semi: true
		},
		ignores: [
			'build',
			'dist',
			'.svelte-kit',
			'CHANGELOG.md',
			'static',
			'.changeset/*.md'
		]
	},
	{
		// Keep the style the codebase already uses (sv-create / Prettier-svelte).
		rules: {
			'style/comma-dangle': ['error', 'never'],
			'style/arrow-parens': ['error', 'always'],
			'antfu/if-newline': 'off',
			// Labeled loops are legitimate in the recurrence-expansion algorithms.
			'no-labels': ['error', { allowLoop: true }],
			// `Array.from({length}).fill(x)` types as unknown[]; the typed
			// constant-callback form keeps TypeScript happy.
			'e18e/prefer-array-fill': 'off'
		}
	},
	{
		files: ['**/*.svelte'],
		rules: {
			// Markup keeps conventional double quotes (scripts stay single-quoted).
			'svelte/html-quotes': ['error', { prefer: 'double' }],
			// Internal links are computed with a manual `withBase()` helper;
			// this docs site does not use SvelteKit's resolve().
			'svelte/no-navigation-without-resolve': 'off',
			// svelte-check is the authority on which svelte-ignore comments are
			// needed (it sees warnings this plugin's compile pass does not).
			'svelte/no-unused-svelte-ignore': 'off',
			// $state + $effect is intentional where initialization must be
			// client-only (DOM reads) or interval-driven.
			'svelte/prefer-writable-derived': 'off',
			// Dates/Sets in this codebase are immutable snapshots, never mutated
			// in place, so the reactive wrappers would add nothing.
			'svelte/prefer-svelte-reactivity': 'off',
			// Fights svelte/indent inside multiline template expressions.
			'style/indent-binary-ops': 'off'
		}
	},
	{
		// The docs demos intentionally use console/prompt to keep examples tiny.
		files: ['src/docs/**'],
		rules: {
			'no-console': 'off',
			'no-alert': 'off'
		}
	},
	{
		// Prism output is trusted, self-generated HTML.
		files: ['src/docs/CodeBlock.svelte'],
		rules: {
			'svelte/no-at-html-tags': 'off'
		}
	}
);
