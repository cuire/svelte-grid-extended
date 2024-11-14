import type { GridSize, ItemSize, Breakpoints, Collision } from './types';
import type { Action } from 'svelte/action';

interface Props {
	/**
	 * Number of columns in the grid.
	 */
	cols?: GridSize;
	/**
	 * Number of rows in the grid.
	 */
	rows?: GridSize;
	/**
	 * Size of the grid items.
	 * @description
	 * If not provided, the grid will try to calculate the size based on the container size.
	 *
	 * You can provide only one of the dimensions, the other will be calculated automatically or you can provide both.
	 * @example
	 * ```svelte
	 * <Grid itemSize={{ width: 100, height: 100 }}>
	 * <Grid itemSize={{ width: 100}}>
	 * ```
	 */
	itemSize?: Partial<ItemSize>;
	/**
	 * Gap between the grid items.
	 */
	gap?: number;
	/**
	 * Breakpoints for the grid. That will be used to calculate the grid size.
	 *
	 * Important: numbers represent container width NOT document width.
	 * @example
	 * ```svelte
	 * <Grid breakpoints={{ xs: 320, sm: 640, md: 768, lg: 1024, xl: 1280, xxl: 1536 }}>
	 * ```
	 */
	breakpoints?: Breakpoints;
	/**
	 * Bound the grid items to the grid container.
	 */
	bounds?: boolean;
	/**
	 * Disable the items interaction.
	 */
	readOnly?: boolean;
	/**
	 * Enable the grid debug mode.
	 * WIP
	 */
	debug?: boolean;
	class?: string;
	/**
	 * This option set the collision strategy between grid items. If is not 'none' then it sets 'rows' option to 0.
	 */
	collision?: Collision;
	/**
	 * Auto compress the grid items when programmatically changing grid items.
	 * Only works with 'compress' collision strategy.
	 * @default true
	 */
	autoCompress?: boolean;
}

export function createGrid(params: Props) {
	console.log(params);
	//

	const grid: Action<HTMLElement> = () => {};

	const griditem: Action<HTMLElement> = () => {};

	return {
		grid: grid,
		griditem: griditem,
		items: null
	};
}
