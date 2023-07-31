import { getAvailablePosition } from './utils/grid';
import type { GridParams, GridController as GridControllerType } from './types';

export class GridController implements GridControllerType {
	gridParams: GridParams;

	constructor(gridParams: GridParams) {
		this.gridParams = gridParams;
	}

	getFirstAvailablePosition(w: number, h: number) {
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
