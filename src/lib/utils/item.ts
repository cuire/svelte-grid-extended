import type { GridParams, Item, ItemPosition, ItemSize, Position, Size } from '$lib/types';

export function coordinate2position(coordinate: number, cellSize: number, gap: number): number {
	return coordinate * cellSize + (coordinate + 1) * gap;
}

export function coordinate2size(coordinate: number, cellSize: number, gap: number): number {
	return coordinate * cellSize + (coordinate - 1) * gap;
}

export function position2coordinate(position: number, cellSize: number, gap: number): number {
	return Math.round(position / (cellSize + gap));
}

export function size2coordinate(size: number, cellSize: number, gap: number): number {
	return position2coordinate(size + gap * 2, cellSize, gap);
}

export function snapOnMove(
	left: number,
	top: number,
	item: Item,
	gridParams: GridParams
): Position {
	const { itemSize, gap } = gridParams;
	const { w, h } = item;

	let x = position2coordinate(left, itemSize.width, gap);
	let y = position2coordinate(top, itemSize.height, gap);

	x = clamp(x, 0, gridParams.maxCols - w);
	y = clamp(y, 0, gridParams.maxRows - h);

	return { x, y };
}

export function snapOnResize(
	width: number,
	height: number,
	item: Item,
	gridParams: GridParams
): Size {
	const { itemSize, gap } = gridParams;
	const { x, y } = item;

	let w = position2coordinate(width + gap * 2, itemSize.width, gap);
	let h = position2coordinate(height + gap * 2, itemSize.height, gap);

	w = clamp(w, 0, gridParams.maxCols - x);
	h = clamp(h, 0, gridParams.maxRows - y);

	return { w, h };
}

export function calcPosition(
	item: Item,
	options: { itemSize: ItemSize; gap: number }
): ItemPosition & ItemSize {
	const { itemSize, gap } = options;
	return {
		left: coordinate2position(item.x, itemSize.width, gap),
		top: coordinate2position(item.y, itemSize.height, gap),
		width: coordinate2size(item.w, itemSize.width, gap),
		height: coordinate2size(item.h, itemSize.height, gap)
	};
}

export function clamp(num: number, min: number, max: number): number {
	return Math.max(Math.min(num, max), min);
}
