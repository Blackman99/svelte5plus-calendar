# Changesets

This folder is managed by [changesets](https://github.com/changesets/changesets).

Release flow:

1. Make your changes, then run `npx changeset` and describe them (pick patch/minor/major).
2. Commit the generated markdown file together with your changes.
3. When the PR lands on `main`, the **Release** workflow opens/updates a
   "chore: version packages" PR that bumps the version and updates `CHANGELOG.md`.
4. Merging that PR publishes the package to npm automatically
   (requires the `NPM_TOKEN` repository secret).
