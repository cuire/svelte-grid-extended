import { describe, expect, test } from 'vitest';

import {
	calcPosition,
	clamp,
	coordinate2position,
	coordinate2size,
	position2coordinate,
	size2coordinate,
	snapOnMove,
	snapOnResize
} from '../../src/lib/utils/item';

import type { GridParams, LayoutItem, ItemSize, Position, Size } from '../../src/lib/types';

describe('🥐 coordinate2position()', () => {
	test.each([
		[0, 10, 10, 10],
		[1, 10, 10, 30],
		[2, 10, 10, 50],
		[1, 20, 10, 40],
		[2, 20, 10, 70],
		[0, 10, 5, 5],
		[1, 10, 5, 20],
		[2, 10, 5, 35],
		[0, 20, 5, 5],
		[1, 20, 5, 30],
		[2, 20, 5, 55]
	])(
		'coordinate2position(%d, %d, %d) should be %d',
		(coordinate: number, cellSize: number, gap: number, expected: number) => {
			expect(coordinate2position(coordinate, cellSize, gap)).toBe(expected);
		}
	);
});

describe('🍋 coordinate2size()', () => {
	test.each([
		[1, 20, 10, 20],
		[2, 20, 10, 50],
		[3, 20, 10, 80],
		[1, 10, 5, 10],
		[2, 10, 5, 25],
		[3, 10, 5, 40],
		[1, 5, 0, 5],
		[2, 5, 0, 10],
		[3, 5, 0, 15]
	])(
		'coordinate2size(%d, %d, %d) should be %d',
		(coordinate: number, cellSize: number, gap: number, expected: number) => {
			expect(coordinate2size(coordinate, cellSize, gap)).toBe(expected);
		}
	);
});

describe('🍓 position2coordinate()', () => {
	test.each([
		[0, 10, 0, 0],
		[10, 10, 0, 1],
		[20, 10, 0, 2],
		[30, 10, 0, 3],
		[40, 10, 0, 4],
		[50, 10, 0, 5],
		[0, 20, 0, 0],
		[20, 20, 0, 1],
		[40, 20, 0, 2],
		[60, 20, 0, 3],
		[80, 20, 0, 4],
		[100, 20, 0, 5],
		[0, 30, 0, 0],
		[30, 30, 0, 1],
		[60, 30, 0, 2],
		[90, 30, 0, 3],
		[120, 30, 0, 4],
		[150, 30, 0, 5],
		[0, 10, 5, 0],
		[15, 10, 5, 1],
		[30, 10, 5, 2],
		[45, 10, 5, 3],
		[60, 10, 5, 4],
		[75, 10, 5, 5],
		[0, 20, 5, 0],
		[25, 20, 5, 1],
		[50, 20, 5, 2],
		[75, 20, 5, 3],
		[100, 20, 5, 4]
	])(
		'position2coordinate(%d, %d, %d) should be %d',
		(position: number, cellSize: number, gap: number, expected: number) => {
			expect(position2coordinate(position, cellSize, gap)).toBe(expected);
		}
	);
});

describe('🫐 size2coordinate()', () => {
	test.each([
		[10, 10, 0, 1],
		[20, 10, 0, 2],
		[30, 10, 0, 3],
		[40, 10, 0, 4],
		[50, 10, 0, 5],
		[10, 20, 0, 1],
		[20, 20, 0, 1],
		[30, 20, 0, 2],
		[40, 20, 0, 2],
		[50, 20, 0, 3],
		[10, 30, 0, 0],
		[20, 30, 0, 1],
		[30, 30, 0, 1],
		[40, 30, 0, 1],
		[50, 30, 0, 2],
		[10, 10, 5, 1],
		[15, 10, 5, 2],
		[20, 10, 5, 2],
		[25, 10, 5, 2],
		[30, 10, 5, 3],
		[35, 10, 5, 3],
		[40, 10, 5, 3],
		[45, 10, 5, 4],
		[50, 10, 5, 4],
		[55, 10, 5, 4],
		[10, 20, 10, 1],
		[20, 20, 10, 1],
		[30, 20, 10, 2],
		[40, 20, 10, 2],
		[50, 20, 10, 2],
		[60, 20, 10, 3]
	])(
		'size2coordinate(%d, %d, %d) should be %d',
		(size: number, cellSize: number, gap: number, expected: number) => {
			expect(size2coordinate(size, cellSize, gap)).toBe(expected);
		}
	);
});

describe('🥝 clamp()', () => {
	test.each([
		[100, 20, 80, 80],
		[100, 20, 100, 100],
		[100, 20, 120, 100],
		[10, 20, 80, 20],
		[10, 20, 100, 20],
		[10, 120, 20, 120],
		[130, 120, 20, 120]
	])(
		'clamp(%d, %d, %d) should be %d',
		(num: number, min: number, max: number, expected: number) => {
			expect(clamp(num, min, max)).toBe(expected);
		}
	);
});

const gridParams: GridParams = {
	itemSize: { width: 100, height: 100 },
	gap: 0,
	maxCols: 8,
	maxRows: 8,
	items: [],
	bounds: false,
	//It can be tested on the environment of a browser.
	boundsTo: new Object() as HTMLElement,
	readOnly: false,
	collision: true
};

describe('🥥 snapOnMove()', () => {
	const item1x1: LayoutItem = { id: '0', x: 0, y: 0, w: 1, h: 1 };
	const item4x4: LayoutItem = { id: '0', x: 0, y: 0, w: 4, h: 4 };

	test.each([
		[0, 0, item1x1, gridParams, { x: 0, y: 0 }],
		[100, 0, item1x1, gridParams, { x: 1, y: 0 }],
		[300, 0, item1x1, gridParams, { x: 3, y: 0 }],
		[600, 0, item1x1, gridParams, { x: 6, y: 0 }],
		[0, 100, item1x1, gridParams, { x: 0, y: 1 }],
		[100, 100, item1x1, gridParams, { x: 1, y: 1 }],
		[300, 100, item1x1, gridParams, { x: 3, y: 1 }],
		[600, 100, item1x1, gridParams, { x: 6, y: 1 }],
		[0, 300, item1x1, gridParams, { x: 0, y: 3 }],
		[100, 300, item1x1, gridParams, { x: 1, y: 3 }],
		[300, 300, item1x1, gridParams, { x: 3, y: 3 }],
		[600, 300, item1x1, gridParams, { x: 6, y: 3 }],
		[0, 600, item1x1, gridParams, { x: 0, y: 6 }],
		[100, 600, item1x1, gridParams, { x: 1, y: 6 }],
		[300, 600, item1x1, gridParams, { x: 3, y: 6 }],
		[600, 600, item1x1, gridParams, { x: 6, y: 6 }]
	])(
		'should find the correct position %dx%d for item 1x1',
		(left: number, top: number, item: LayoutItem, gridParams: GridParams, expected: Position) => {
			expect(snapOnMove(left, top, item, gridParams)).toEqual(expected);
		}
	);

	test.each([
		[0, 0, item4x4, gridParams, { x: 0, y: 0 }],
		[300, 0, item4x4, gridParams, { x: 3, y: 0 }],
		[100, 0, item4x4, gridParams, { x: 1, y: 0 }],
		[600, 0, item4x4, gridParams, { x: 4, y: 0 }],
		[0, 100, item4x4, gridParams, { x: 0, y: 1 }],
		[100, 100, item4x4, gridParams, { x: 1, y: 1 }],
		[300, 100, item4x4, gridParams, { x: 3, y: 1 }],
		[600, 100, item4x4, gridParams, { x: 4, y: 1 }],
		[0, 300, item4x4, gridParams, { x: 0, y: 3 }],
		[100, 300, item4x4, gridParams, { x: 1, y: 3 }],
		[300, 300, item4x4, gridParams, { x: 3, y: 3 }],
		[600, 300, item4x4, gridParams, { x: 4, y: 3 }],
		[0, 600, item4x4, gridParams, { x: 0, y: 4 }],
		[100, 600, item4x4, gridParams, { x: 1, y: 4 }],
		[300, 600, item4x4, gridParams, { x: 3, y: 4 }],
		[600, 600, item4x4, gridParams, { x: 4, y: 4 }]
	])(
		'should find the correct position %dx%d for item4x4',
		(left: number, top: number, item: LayoutItem, gridParams: GridParams, expected: Position) => {
			expect(snapOnMove(left, top, item, gridParams)).toEqual(expected);
		}
	);
});

describe('🍍 snapOnResize()', () => {
	const itemX1Y1: LayoutItem = { id: '0', x: 1, y: 1, w: 1, h: 1 };
	const itemX4Y4: LayoutItem = { id: '0', x: 4, y: 4, w: 1, h: 1 };

	test.each([
		[100, 100, itemX1Y1, gridParams, { w: 1, h: 1 }],
		[200, 100, itemX1Y1, gridParams, { w: 2, h: 1 }],
		[300, 100, itemX1Y1, gridParams, { w: 3, h: 1 }],
		[600, 100, itemX1Y1, gridParams, { w: 6, h: 1 }],
		[100, 200, itemX1Y1, gridParams, { w: 1, h: 2 }],
		[200, 200, itemX1Y1, gridParams, { w: 2, h: 2 }],
		[300, 200, itemX1Y1, gridParams, { w: 3, h: 2 }],
		[600, 200, itemX1Y1, gridParams, { w: 6, h: 2 }],
		[100, 300, itemX1Y1, gridParams, { w: 1, h: 3 }],
		[200, 300, itemX1Y1, gridParams, { w: 2, h: 3 }],
		[300, 300, itemX1Y1, gridParams, { w: 3, h: 3 }],
		[600, 300, itemX1Y1, gridParams, { w: 6, h: 3 }],
		[100, 600, itemX1Y1, gridParams, { w: 1, h: 6 }],
		[200, 600, itemX1Y1, gridParams, { w: 2, h: 6 }],
		[300, 600, itemX1Y1, gridParams, { w: 3, h: 6 }],
		[600, 600, itemX1Y1, gridParams, { w: 6, h: 6 }]
	])(
		'should find the correct size %dx%d for itemX1Y1',
		(width: number, height: number, item: LayoutItem, gridParams: GridParams, expected: Size) => {
			expect(snapOnResize(width, height, item, gridParams)).toEqual(expected);
		}
	);

	test.each([
		[100, 100, itemX4Y4, gridParams, { w: 1, h: 1 }],
		[400, 100, itemX4Y4, gridParams, { w: 4, h: 1 }],
		[800, 100, itemX4Y4, gridParams, { w: 4, h: 1 }],
		[1200, 100, itemX4Y4, gridParams, { w: 4, h: 1 }],
		[100, 400, itemX4Y4, gridParams, { w: 1, h: 4 }],
		[400, 400, itemX4Y4, gridParams, { w: 4, h: 4 }],
		[800, 400, itemX4Y4, gridParams, { w: 4, h: 4 }],
		[1200, 400, itemX4Y4, gridParams, { w: 4, h: 4 }],
		[100, 800, itemX4Y4, gridParams, { w: 1, h: 4 }],
		[400, 800, itemX4Y4, gridParams, { w: 4, h: 4 }],
		[800, 800, itemX4Y4, gridParams, { w: 4, h: 4 }],
		[1200, 800, itemX4Y4, gridParams, { w: 4, h: 4 }],
		[100, 1200, itemX4Y4, gridParams, { w: 1, h: 4 }],
		[400, 1200, itemX4Y4, gridParams, { w: 4, h: 4 }],
		[800, 1200, itemX4Y4, gridParams, { w: 4, h: 4 }],
		[1200, 1200, itemX4Y4, gridParams, { w: 4, h: 4 }]
	])(
		'should find the correct size %dx%d for itemX4Y4',
		(width: number, height: number, item: LayoutItem, gridParams: GridParams, expected: Size) => {
			expect(snapOnResize(width, height, item, gridParams)).toEqual(expected);
		}
	);
});

describe('🫑 calcPosition()', () => {
	const item: LayoutItem = { id: '0', x: 1, y: 1, w: 1, h: 1 };
	const itemSize: ItemSize = { width: 100, height: 100 };
	const gap = 0;

	test('should find the correct position', () => {
		expect(calcPosition(item, { itemSize, gap })).toEqual({
			left: 100,
			top: 100,
			width: 100,
			height: 100
		});
	});
});
