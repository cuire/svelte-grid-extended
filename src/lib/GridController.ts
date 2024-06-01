import { getAvailablePosition, hasCollisions } from './utils/grid';
import type { GridParams, GridController as GridControllerType, LayoutItem } from './types';

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

	compress(): void {
		this._compress(this.gridParams.items);
	}

	_internalCompress(): void {
		this._compress(this.gridParams.items, true);
	}

	private _compress(items: Record<string, LayoutItem>, skipUpdate = false): void {
		const gridItems = Object.values(items);
		const sortedItems = [...gridItems].sort((a, b) => a.y - b.y);

		sortedItems.reduce((accItem, currentItem) => {
			let newY = currentItem.y;
			while (newY >= 0) {
				if (hasCollisions({ ...currentItem, y: newY }, accItem)) {
					break;
				}
				newY--;
			}
			if (newY !== currentItem.y - 1) {
				currentItem.y = newY + 1;
				currentItem.invalidate();
			}
			accItem.push(currentItem);
			return accItem;
		}, [] as LayoutItem[]);

		if (!skipUpdate) {
			this.gridParams.updateGrid();
		}
	}
}
