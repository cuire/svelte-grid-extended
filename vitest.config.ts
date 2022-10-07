import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['**/test/unit/*.ts'],
		globals: true,
		coverage: {
			reporter: ['text', 'json', 'html']
		}
	}
});
