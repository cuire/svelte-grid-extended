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
