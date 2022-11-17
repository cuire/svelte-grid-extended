import type { GridSize, ItemSize } from '$lib/types';

export type GridOptions = {
	cols: GridSize;
	rows: GridSize;
	itemSize: Partial<ItemSize>;
};

export function assertGridOptions(options: GridOptions) {
	const { cols, rows, itemSize } = options;
	if (
		(cols === 0 && itemSize?.width === undefined) ||
		(rows === 0 && itemSize?.height === undefined) ||
		(typeof cols === 'object' &&
			Object.values(cols).includes(0) &&
			itemSize?.width === undefined) ||
		(typeof rows === 'object' && Object.values(rows).includes(0) && itemSize?.height === undefined)
	) {
		throw new Error('If `rows` or `cols` === `0`, the `itemSize` parameter must be specified');
	}

	if (cols < 0) {
		throw new Error('`cols` must be greater than or equal to `0`');
	}

	if (rows < 0) {
		throw new Error('`rows` must be greater than or equal to `0`');
	}
}
