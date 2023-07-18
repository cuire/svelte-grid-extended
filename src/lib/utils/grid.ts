import type { GridDimensions, LayoutItem } from '$lib/types';

export function isItemColliding(item: LayoutItem, otherItem: LayoutItem): boolean {
	return (
		item.id !== otherItem.id &&
		item.x <= otherItem.x + otherItem.w - 1 &&
		item.y <= otherItem.y + otherItem.h - 1 &&
		item.x + item.w - 1 >= otherItem.x &&
		item.y + item.h - 1 >= otherItem.y
	);
}

export function getCollisions(currentItem: LayoutItem, items: LayoutItem[]): LayoutItem[] {
	return items.filter((item) => isItemColliding(currentItem, item));
}

export function hasCollisions(currentItem: LayoutItem, items: LayoutItem[]): boolean {
	return items.some((item) => isItemColliding(currentItem, item));
}

export function getGridDimensions(items: LayoutItem[]): GridDimensions {
	const cols = Math.max(...items.map((item) => item.x + item.w), 1);
	const rows = Math.max(...items.map((item) => item.y + item.h), 1);

	return { cols, rows };
}

export function getAvailablePosition(
	currentItem: LayoutItem,
	items: LayoutItem[],
	maxCols: number,
	maxRows: number
): { x: number; y: number } | null {
	let { cols, rows } = getGridDimensions(items);

	if (maxCols < Infinity) cols = maxCols;
	if (maxRows < Infinity) rows = maxRows;

	for (let y = 0; y <= rows - currentItem.h; y++) {
		for (let x = 0; x <= cols - currentItem.w; x++) {
			const item = { ...currentItem, x, y };

			if (!hasCollisions(item, items)) {
				const newPosition = { x, y };
				return newPosition;
			}
		}
	}

	if (maxRows === Infinity) return { x: 0, y: rows };
	if (maxCols === Infinity) return { x: cols, y: 0 };

	return null;
}
