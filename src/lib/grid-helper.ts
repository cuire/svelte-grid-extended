import { get } from 'svelte/store';
import { gridSettings } from './stores';
import { getAvailablePosition } from './utils/grid';

export class GridHelper {
	static getFirstAvailablePosition(w: number, h: number) {
		const gridParams = get(gridSettings);
		if (!gridParams) throw new Error('Grid not initialized');
		const { items, maxCols, maxRows } = gridParams;
		return getAvailablePosition(
			{
				id: '',
				x: 0,
				y: 0,
				w,
				h,
				movable: true,
				resizable: true,
				invalidate: () => {
					/* .. */
				}
			},
			Object.values(items),
			maxCols,
			maxRows
		);
	}
}
