# Contributing

Thanks for your interest in improving svelte5plus-calendar!

## Project layout

- `src/lib/` — the published component library (zero runtime dependencies)
- `src/routes/` — the bilingual documentation site (SvelteKit, prerendered)
- `src/docs/` — docs-site components and the live examples shown on every page

## Development

```bash
npm install
npm run dev        # docs site with live examples — the best playground
npm test           # unit tests (vitest)
npm run check      # svelte-check + TypeScript
npm run build      # build the docs site and package the library
```

Please keep `npm test` and `npm run check` green; both run in CI on every push
and pull request.

## Submitting changes

1. Fork and create a feature branch.
2. Make your change. For anything user-visible in the **library**, run
   `npx changeset` and describe it (choose patch/minor/major) — commit the
   generated markdown file alongside your change. Docs-site-only changes do
   not need a changeset.
3. Open a pull request against `main`.

## How releases work (maintainers)

Releases are fully automated with [changesets](https://github.com/changesets/changesets):

- Merged changesets accumulate in a "chore: version packages" PR that the
  Release workflow keeps up to date.
- Merging that PR bumps the version, updates `CHANGELOG.md`, publishes to npm,
  pushes the git tag, and creates the GitHub release.
- Publishing requires the `NPM_TOKEN` repository secret (npm automation token).

## Docs deployment

The docs site deploys to GitHub Pages automatically on every push to `main`.
