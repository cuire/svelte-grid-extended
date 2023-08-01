import { describe, expect, test } from 'vitest';
import type { createEventDispatcher } from 'svelte';

import { GridController } from '../../src/lib/GridController';
import type { LayoutItem, GridParams, LayoutChangeDetail } from '../../src/lib/types';

describe('🍦 GridController firstAvailablePosition', () => {
	type TestCase = {
		items: Record<string, LayoutItem>;
		maxCols: number;
		maxRows: number;
		w: number;
		h: number;
		expected: { x: number; y: number } | null;
	};

	const gridParams: GridParams = {
		items: {},
		maxCols: 0,
		maxRows: 0,
		cols: 0,
		rows: 0,
		gap: 0,
		bounds: false,
		readOnly: false,
		debug: false,
		collision: 'none',
		registerItem: () => {
			/* .. */
		},
		unregisterItem: () => {
			/* .. */
		},
		updateGrid: () => {
			/* .. */
		},
		dispatch: {} as ReturnType<typeof createEventDispatcher>
	};

	test.each<TestCase>([
		{
			items: {
				'1': {
					id: '1',
					x: 0,
					y: 0,
					w: 2,
					h: 5,
					movable: true,
					resizable: true,
					invalidate: () => {
						/* .. */
					}
				},
				'2': {
					id: '2',
					x: 2,
					y: 2,
					w: 2,
					h: 2,
					movable: true,
					resizable: true,
					invalidate: () => {
						/* .. */
					}
				},
				'3': {
					id: '3',
					x: 2,
					y: 0,
					w: 1,
					h: 2,
					movable: true,
					resizable: true,
					invalidate: () => {
						/* .. */
					}
				},
				'4': {
					id: '4',
					x: 3,
					y: 0,
					w: 2,
					h: 2,
					movable: true,
					resizable: true,
					invalidate: () => {
						/* .. */
					}
				},
				'5': {
					id: '5',
					x: 4,
					y: 2,
					w: 1,
					h: 3,
					movable: true,
					resizable: true,
					invalidate: () => {
						/* .. */
					}
				},
				'6': {
					id: '6',
					x: 8,
					y: 0,
					w: 2,
					h: 8,
					movable: true,
					resizable: true,
					invalidate: () => {
						/* .. */
					}
				},
				'7': {
					id: '7',
					x: 4,
					y: 5,
					w: 1,
					h: 1,
					movable: true,
					resizable: true,
					invalidate: () => {
						/* .. */
					}
				},
				'8': {
					id: '8',
					x: 2,
					y: 6,
					w: 3,
					h: 2,
					movable: true,
					resizable: true,
					invalidate: () => {
						/* .. */
					}
				},
				'9': {
					id: '9',
					x: 2,
					y: 4,
					w: 2,
					h: 2,
					movable: true,
					resizable: true,
					invalidate: () => {
						/* .. */
					}
				}
			},
			maxCols: 5,
			maxRows: Infinity,
			w: 2,
			h: 2,
			expected: { x: 0, y: 5 }
		},
		{
			items: {
				'1': {
					id: '1',
					x: 0,
					y: 0,
					w: 1,
					h: 1,
					movable: true,
					resizable: true,
					invalidate: () => {
						/* .. */
					}
				},
				'2': {
					id: '2',
					x: 1,
					y: 0,
					w: 1,
					h: 2,
					movable: true,
					resizable: true,
					invalidate: () => {
						/* .. */
					}
				},
				'3': {
					id: '3',
					x: 0,
					y: 1,
					w: 1,
					h: 1,
					movable: true,
					resizable: true,
					invalidate: () => {
						/* .. */
					}
				}
			},
			maxCols: 3,
			maxRows: 3,
			w: 1,
			h: 1,
			expected: { x: 2, y: 0 }
		},
		{
			items: {
				'1': {
					id: '1',
					x: 0,
					y: 0,
					w: 3,
					h: 3,
					movable: true,
					resizable: true,
					invalidate: () => {
						/* .. */
					}
				},
				'2': {
					id: '2',
					x: 3,
					y: 0,
					w: 1,
					h: 1,
					movable: true,
					resizable: true,
					invalidate: () => {
						/* .. */
					}
				},
				'3': {
					id: '3',
					x: 3,
					y: 1,
					w: 1,
					h: 1,
					movable: true,
					resizable: true,
					invalidate: () => {
						/* .. */
					}
				}
			},
			maxCols: 5,
			maxRows: 5,
			w: 1,
			h: 1,
			expected: { x: 4, y: 0 }
		},
		{
			items: {
				'1': {
					id: '1',
					x: 0,
					y: 0,
					w: 4,
					h: 2,
					movable: true,
					resizable: true,
					invalidate: () => {
						/* .. */
					}
				},
				'2': {
					id: '2',
					x: 0,
					y: 2,
					w: 2,
					h: 2,
					movable: true,
					resizable: true,
					invalidate: () => {
						/* .. */
					}
				},
				'3': {
					id: '3',
					x: 2,
					y: 2,
					w: 2,
					h: 2,
					movable: true,
					resizable: true,
					invalidate: () => {
						/* .. */
					}
				}
			},
			maxCols: 4,
			maxRows: 4,
			w: 2,
			h: 2,
			expected: null
		}
	])('should return first available position', ({ items, maxCols, maxRows, w, h, expected }) => {
		const controller = new GridController({ ...gridParams, items, maxCols, maxRows });
		expect(controller.getFirstAvailablePosition(w, h)).toEqual(expected);
	});
});
