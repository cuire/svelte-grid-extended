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
	maxCols: number
): { x: number; y: number } | null {
	const { cols, rows } = getGridDimensions(items);

	if (maxCols === 0 || maxCols === Infinity) maxCols = cols;

	for (let y = 0; y <= rows - currentItem.h; y++) {
		for (let x = 0; x <= maxCols - currentItem.w; x++) {
			const item = { ...currentItem, x, y };

			if (!hasCollisions(item, items)) {
				const newPosition = { x, y };
				return newPosition;
			}
		}
	}

	return null;
}
