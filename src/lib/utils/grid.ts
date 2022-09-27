import type { GridItem, ItemChangeEvent } from '$lib/types';

export function getCollisions(currentItem: ItemChangeEvent, items: GridItem[]): GridItem[] {
	items = items.filter(
		(item, index) =>
			index !== currentItem.id &&
			currentItem.x <= item.x + item.w - 1 &&
			currentItem.y <= item.y + item.h - 1 &&
			currentItem.x + currentItem.w - 1 >= item.x &&
			currentItem.y + currentItem.h - 1 >= item.y
	);

	return items;
}
