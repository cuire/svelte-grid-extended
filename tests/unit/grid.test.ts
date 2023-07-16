import { describe, expect, test } from 'vitest';

import {
	getCollisions,
	getGridDimensions,
	hasCollisions,
	isItemColliding,
	getAvailablePosition
} from '../../src/lib/utils/grid';

import type { LayoutItem } from '../../src/lib/types';

/**
 * Grid with shape:\
 * |  0 1 2 3 |\
 * |  4 5 5 5 |\
 * |  6 5 5 5 |\
 * |  7 ~ ~ ~ |\
 * Where ~ is empty spot
 */
const items: LayoutItem[] = [
	{ id: '0', x: 0, y: 0, w: 1, h: 1 },
	{ id: '1', x: 1, y: 0, w: 1, h: 1 },
	{ id: '2', x: 2, y: 0, w: 1, h: 1 },
	{ id: '3', x: 3, y: 0, w: 1, h: 1 },
	{ id: '4', x: 0, y: 1, w: 1, h: 1 },
	{ id: '5', x: 1, y: 1, w: 3, h: 2 },
	{ id: '6', x: 0, y: 2, w: 1, h: 1 },
	{ id: '7', x: 0, y: 3, w: 1, h: 1 }
];

describe('🎏 isItemColliding()', () => {
	test.each(items)('should collide when items are in the same place', (item) => {
		const itemInSameSpot = { ...item, id: 'same as item' };
		expect(isItemColliding(item, itemInSameSpot)).toBe(true);
	});

	test.each(items)('should not collide with self', (item) => {
		expect(isItemColliding(item, item)).toBe(false);
	});

	test.each([
		[
			{ id: '5', x: 1, y: 1, w: 3, h: 2 },
			{ id: '1', x: 1, y: 1, w: 1, h: 1 }
		],
		[
			{ id: '5', x: 1, y: 1, w: 3, h: 2 },
			{ id: '1', x: 2, y: 1, w: 1, h: 1 }
		],
		[
			{ id: '5', x: 1, y: 1, w: 3, h: 2 },
			{ id: '1', x: 1, y: 2, w: 1, h: 1 }
		],
		[
			{ id: '5', x: 1, y: 1, w: 3, h: 2 },
			{ id: '1', x: 2, y: 2, w: 1, h: 1 }
		]
	])("should collide when item is within another item's bounding box", (item1, item2) => {
		expect(isItemColliding(item1, item2)).toBe(true);
	});

	test.each(items)("should not collide when item within another item's bounding box", (item) => {
		const itemTopLeft = { id: 'itemTopLeft', x: item.x - item.w, y: item.y - item.h, w: 1, h: 1 };
		const itemBottomRight = {
			id: 'itemBottomRight',
			x: item.x + item.w,
			y: item.y + item.h,
			w: 1,
			h: 1
		};
		expect(isItemColliding(item, itemTopLeft)).toBe(false);
		expect(isItemColliding(item, itemBottomRight)).toBe(false);
	});
});

describe('🎐 hasCollisions()', () => {
	test.each([
		{ id: '8', x: 1, y: 3, w: 1, h: 1 },
		{ id: '8', x: 2, y: 3, w: 1, h: 1 },
		{ id: '8', x: 3, y: 3, w: 1, h: 1 },
		{ id: '8', x: 1, y: 3, w: 2, h: 1 }
	])('should not have collisions', (item) => {
		expect(hasCollisions(item, items)).toBe(false);
	});

	test.each([
		{ id: '8', x: 0, y: 0, w: 1, h: 1 },
		{ id: '8', x: 0, y: 1, w: 1, h: 1 },
		{ id: '8', x: 1, y: 0, w: 1, h: 1 },
		{ id: '8', x: 1, y: 1, w: 1, h: 1 }
	])('should have collision', (item) => {
		expect(hasCollisions(item, items)).toBe(true);
	});
});

describe('🎑 getCollisions()', () => {
	test.each([
		[{ id: '8', x: 0, y: 0, w: 1, h: 1 }, 1],
		[{ id: '8', x: 0, y: 0, w: 2, h: 1 }, 2],
		[{ id: '8', x: 0, y: 0, w: 2, h: 2 }, 4],
		[{ id: '8', x: 0, y: 0, w: 3, h: 3 }, 6],
		[{ id: '8', x: 0, y: 0, w: 4, h: 4 }, 8]
	])('should have collisions', (item, expected) => {
		expect(getCollisions(item, items).length).toBe(expected);
	});
});

describe('🍦 getGridDimensions()', () => {
	test('items should have cols = 4 and rows = 4', () => {
		const { cols, rows } = getGridDimensions(items);
		expect(cols).toBe(4);
		expect(rows).toBe(4);
	});
});

describe('🍨 getAvailablePosition()', () => {
	test.each([
		{
			item: { id: '8', x: 0, y: 0, w: 1, h: 1 },
			expected: { x: 4, y: 0 },
			maxCols: 5,
			maxRows: Infinity
		},
		{
			item: { id: '8', x: 0, y: 0, w: 1, h: 1 },
			expected: { x: 1, y: 3 },
			maxCols: Infinity,
			maxRows: Infinity
		},
		{
			item: { id: '8', x: 0, y: 0, w: 4, h: 4 },
			expected: { x: 0, y: 4 },
			maxCols: 5,
			maxRows: Infinity
		},
		{
			item: { id: '8', x: 0, y: 0, w: 4, h: 4 },
			expected: { x: 4, y: 0 },
			maxCols: Infinity,
			maxRows: 5
		},
		{
			item: { id: '8', x: 0, y: 0, w: 4, h: 4 },
			expected: null,
			maxCols: 5,
			maxRows: 5
		}
	])('should return available position', ({ item, expected, maxCols, maxRows }) => {
		expect(getAvailablePosition(item, items, maxCols, maxRows)).toEqual(expected);
	});
});
