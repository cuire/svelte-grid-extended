import { getAvailablePosition } from './utils/grid';
import type { GridParams } from './types';

export class GridController {
	static gridParams: GridParams | undefined;
	static getFirstAvailablePosition(w: number, h: number) {
		if (!this.gridParams) throw new Error('Grid not initialized');
		const { items, maxCols, maxRows } = this.gridParams;
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
