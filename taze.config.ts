import { defineConfig } from 'taze';

export default defineConfig({
	// Weekly automation runs `taze minor -w`; majors are reviewed manually
	// via `npx taze major`.
	exclude: [],
	// Also keep the pinned action versions in .github/workflows fresh.
	depFields: {
		overrides: false
	}
});
