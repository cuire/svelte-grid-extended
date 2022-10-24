import type { GridDimensions, Item } from '$lib/types';

export function isItemColliding(item: Item, otherItem: Item): boolean {
	return (
		item.id !== otherItem.id &&
		item.x <= otherItem.x + otherItem.w - 1 &&
		item.y <= otherItem.y + otherItem.h - 1 &&
		item.x + item.w - 1 >= otherItem.x &&
		item.y + item.h - 1 >= otherItem.y
	);
}

export function getCollisions(currentItem: Item, items: Item[]): Item[] {
	return items.filter((item) => isItemColliding(currentItem, item));
}

export function hasCollisions(currentItem: Item, items: Item[]): boolean {
	return items.some((item) => isItemColliding(currentItem, item));
}

export function getGridDimensions(items: Item[]): GridDimensions {
	const cols = Math.max(...items.map((item) => item.x + item.w), 1);
	const rows = Math.max(...items.map((item) => item.y + item.h), 1);

	return { cols, rows };
}
