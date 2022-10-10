import type { GridSize, ItemSize } from '$lib/types';

export type GridOptions = {
	cols: GridSize;
	rows: GridSize;
	itemSize: ItemSize | undefined;
};

export function assertGridOptions(options: GridOptions) {
	const { cols, rows, itemSize } = options;
	if (
		(cols === 0 && itemSize?.width === undefined) ||
		(rows === 0 && itemSize?.height === undefined) ||
		(typeof cols === 'object' && Object.values(cols).includes(0)) ||
		(typeof rows === 'object' && Object.values(rows).includes(0)) //  TODO: && itemSize === undefined
	) {
		throw new Error('`rows` or `cols` must be greater than zero');
		// TODO: throw new Error('If `rows` or `cols` === `0`, the `itemSize` parameter must be specified');
	}
}
