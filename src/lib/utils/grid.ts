import type { CellPositionType, CellSizeType } from '$lib/types';

export function calculatePosition(coordinate: number, cellSize: number, gap: number): number {
	return coordinate * cellSize + (coordinate + 1) * gap;
}

export function calculateSize(coordinate: number, cellSize: number, gap: number): number {
	return coordinate * cellSize + (coordinate - 1) * gap;
}

export function calculateCoordinate(position: number, cellSize: number, gap: number): number {
	return Math.floor((position + cellSize / 2) / (cellSize + gap));
}

export function calculateSizeCoordinate(position: number, cellSize: number, gap: number): number {
	return calculateCoordinate(position + gap * 2, cellSize, gap);
}

export function snapMove(
	left: number,
	top: number,
	cellSize: CellSizeType,
	gap: number
): CellPositionType {
	const x = calculateCoordinate(left, cellSize.width, gap);
	const y = calculateCoordinate(top, cellSize.height, gap);

	return {
		left: calculatePosition(x, cellSize.width, gap),
		top: calculatePosition(y, cellSize.height, gap)
	};
}

export function snapResize(
	width: number,
	height: number,
	cellSize: CellSizeType,
	gap: number
): CellSizeType {
	const w = calculateCoordinate(width + gap * 2, cellSize.width, gap);
	const h = calculateCoordinate(height + gap * 2, cellSize.height, gap);

	return {
		width: calculateSize(w, cellSize.width, gap),
		height: calculateSize(h, cellSize.height, gap)
	};
}
