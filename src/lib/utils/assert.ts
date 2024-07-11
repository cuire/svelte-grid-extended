import type { Collision, GridSize, ItemSize } from '$lib/types';

export type GridOptions = {
	cols: GridSize;
	rows: GridSize;
	itemSize: Partial<ItemSize>;
	collision?: Collision;
};

export function assertGridOptions(options: GridOptions) {
	const { cols, rows, itemSize, collision } = options;

	if (rows !== 0 && collision !== 'none') {
		console.warn('`rows` is ignored and setted to 0 when `collision` is not `none`');
	}

	if (collision !== 'none' && itemSize?.height === undefined) {
		throw new Error(
			'If `collision` is not `none`, the `itemSize.height` parameter must be specified'
		);
	}

	if (
		(cols === 0 && itemSize?.width === undefined) ||
		(typeof cols === 'object' && Object.values(cols).includes(0) && itemSize?.width === undefined)
	) {
		throw new Error('If `cols` === `0`, the `itemSize.width` parameter must be specified');
	}

	if (
		(rows === 0 && itemSize?.height === undefined) ||
		(typeof rows === 'object' && Object.values(rows).includes(0) && itemSize?.height === undefined)
	) {
		throw new Error('If `rows` === `0`, the `itemSize.height` parameter must be specified');
	}

	if (typeof cols === 'number' && cols < 0) {
		throw new Error('`cols` must be greater than or equal to `0`');
	}

	if (typeof rows === 'number' && rows < 0) {
		throw new Error('`rows` must be greater than or equal to `0`');
	}
}
