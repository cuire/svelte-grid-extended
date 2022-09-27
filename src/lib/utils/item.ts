import type { ItemPosition, ItemSize } from '$lib/types';

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

type SnapCommonParams = {
	itemSize: ItemSize;
	gap: number;
};

type SnapMoveParams = SnapCommonParams & {
	left: number;
	top: number;
};

export function snapOnMove(params: SnapMoveParams): ItemPosition {
	const { left, top, itemSize, gap } = params;

	const x = position2coordinate(left, itemSize.width, gap);
	const y = position2coordinate(top, itemSize.height, gap);

	return {
		left: coordinate2position(x, itemSize.width, gap),
		top: coordinate2position(y, itemSize.height, gap)
	};
}

type SnapResizeParams = SnapCommonParams & {
	width: number;
	height: number;
};

export function snapOnResize(params: SnapResizeParams): ItemSize {
	const { width, height, itemSize, gap } = params;

	const w = position2coordinate(width + gap * 2, itemSize.width, gap);
	const h = position2coordinate(height + gap * 2, itemSize.height, gap);

	return {
		width: coordinate2size(w, itemSize.width, gap),
		height: coordinate2size(h, itemSize.height, gap)
	};
}

type SnapMoveResizeParams = SnapMoveParams & SnapResizeParams;

export function snap(params: SnapMoveResizeParams): ItemPosition & ItemSize {
	const { left, top, width, height, itemSize, gap } = params;

	const x = position2coordinate(left, itemSize.width, gap);
	const y = position2coordinate(top, itemSize.height, gap);
	const w = position2coordinate(width + gap * 2, itemSize.width, gap);
	const h = position2coordinate(height + gap * 2, itemSize.height, gap);

	return {
		left: coordinate2position(x, itemSize.width, gap),
		top: coordinate2position(y, itemSize.height, gap),
		width: coordinate2size(w, itemSize.width, gap),
		height: coordinate2size(h, itemSize.height, gap)
	};
}
