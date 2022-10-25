import { describe, expect, test } from 'vitest';

import { assertGridOptions, type GridOptions } from '$lib/utils/assert';

describe('🥐 assertGridOptions()', () => {
	test.each([
		{ cols: 0, rows: 0, itemSize: {} },
		{ cols: 0, rows: 10, itemSize: { height: 10 } },
		{ cols: { md: 0 }, rows: 10, itemSize: {} },
		{ cols: { md: 0 }, rows: 10, itemSize: { height: 10 } },
		{ cols: 10, rows: 0, itemSize: {} },
		{ cols: 10, rows: 0, itemSize: { width: 10 } },
		{ cols: 10, rows: { md: 0 }, itemSize: {} },
		{ cols: 10, rows: { md: 0 }, itemSize: { width: 10 } }
	])('%o should throw', (options: GridOptions) => {
		expect(() => assertGridOptions(options)).toThrow('`itemSize` parameter must be specified');
	});

	test.each([
		{ cols: { md: 0 }, rows: { md: 0 }, itemSize: { width: 10, height: 10 } },
		{ cols: 0, rows: 10, itemSize: { width: 10 } },
		{ cols: 10, rows: 0, itemSize: { height: 10 } },
		{ cols: 10, rows: 10, itemSize: {} },
		{ cols: 10, rows: 10, itemSize: { width: 10 } },
		{ cols: 10, rows: 10, itemSize: { height: 10 } },
		{ cols: 10, rows: 10, itemSize: { width: 10, height: 10 } },
		{ cols: { md: 10 }, rows: { md: 10 }, itemSize: {} },
		{ cols: { md: 10 }, rows: { md: 10 }, itemSize: { width: 10 } },
		{ cols: { md: 10 }, rows: { md: 10 }, itemSize: { height: 10 } },
		{ cols: { md: 10 }, rows: { md: 10 }, itemSize: { width: 10, height: 10 } }
	])('%o should not throw', (options: GridOptions) => {
		expect(() => assertGridOptions(options)).not.toThrow();
	});
});
