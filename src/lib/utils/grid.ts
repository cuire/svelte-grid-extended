import type { Item } from '$lib/types';

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
	items = items.filter((item) => isItemColliding(currentItem, item));

	return items;
}

export function hasCollisions(currentItem: Item, items: Item[]): boolean {
	console.log(currentItem);
	items.map((item) => {
		if (isItemColliding(currentItem, item)) return true;
	});

	return false;
}
