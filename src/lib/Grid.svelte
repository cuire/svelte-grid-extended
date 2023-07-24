<script lang="ts" context="module">
	const GRID_CONTEXT_NAME = Symbol('svelte-grid-extended-context');
	export function getGridContext(): Readable<GridParams> {
		let context: Writable<GridParams> | undefined = getContext(GRID_CONTEXT_NAME);
		if (context === undefined) {
			throw new Error(
				`<GridItem /> is missing a parent <Grid /> component. Make sure you are using the component inside a <Grid />.`
			);
		}
		return context;
	}
</script>

<script lang="ts">
	import { createEventDispatcher, getContext, onMount, setContext } from 'svelte';

	import { assertGridOptions } from './utils/assert';
	import { findGridSize } from './utils/breakpoints';
	import { getGridDimensions } from './utils/grid';

	import type {
		Breakpoints,
		ItemSize,
		GridSize,
		LayoutItem,
		LayoutChangeDetail,
		GridParams,
		Collision
	} from './types';
	import { writable, type Readable, type Writable } from 'svelte/store';

	const dispatch = createEventDispatcher<{
		change: LayoutChangeDetail;
	}>();

	/**
	 * Number of columns in the grid.
	 */
	export let cols: GridSize = 0;

	/**
	 * Number of rows in the grid.
	 */
	export let rows: GridSize = 0;

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
	export let itemSize: Partial<ItemSize> = {};

	/**
	 * Gap between the grid items.
	 */
	export let gap = 10;

	/**
	 * Grid items.
	 */
	let items: Record<string, LayoutItem> = {};

	/**
	 * Breakpoints for the grid. That will be used to calculate the grid size.
	 *
	 * Important: numbers represent container width NOT document width.
	 * @example
	 * ```svelte
	 * <Grid breakpoints={{ xs: 320, sm: 640, md: 768, lg: 1024, xl: 1280, xxl: 1536 }}>
	 * ```
	 */
	export let breakpoints: Breakpoints = {
		xxl: 1536,
		xl: 1280,
		lg: 1024,
		md: 768,
		sm: 640,
		xs: 320
	};

	assertGridOptions({ cols, rows, itemSize });

	/**
	 * Bound the grid items to the grid container.
	 */
	export let bounds = false;

	/**
	 * Disable the items interaction.
	 */
	export let readOnly = false;

	/**
	 * Enable the grid debug mode.
	 * WIP
	 */
	export let debug = false;

	/**
	 * Grid container class.
	 */
	let classes = '';

	export { classes as class };

	/**
	 * This option set the collision strategy between grid items. If is not 'none' then it sets 'rows' option to 0.
	 */
	export let collision: Collision = 'none';

	let _cols: number;

	let _rows: number;

	let maxCols = Infinity;

	let maxRows = Infinity;

	let containerWidth: number;

	let containerHeight: number;

	let shouldExpandRows = false;

	let shouldExpandCols = false;

	$: if (typeof cols === 'number') _cols = cols;

	$: if (typeof rows === 'number') _rows = rows;

	$: if (itemSize?.width && itemSize?.height) $gridSettings.itemSize = { ...itemSize } as ItemSize;

	$: if ($gridSettings.itemSize) containerWidth = _cols * ($gridSettings.itemSize.width + gap + 1);

	$: if ($gridSettings.itemSize)
		containerHeight = _rows * ($gridSettings.itemSize.height + gap + 1);

	$: calculatedGridSize = getGridDimensions(Object.values(items));

	let gridContainer: HTMLDivElement;

	$: {
		_cols = shouldExpandCols ? calculatedGridSize.cols : _cols;
		maxCols = shouldExpandCols ? Infinity : _cols;
	}

	$: {
		_rows = shouldExpandRows ? calculatedGridSize.rows : _rows;
		maxRows = shouldExpandRows ? Infinity : _rows;
	}

	$: if (collision !== 'none') {
		rows = 0;
	}

	/**
	 * Force the grid to update. By default called when any of the grid items changes.
	 */
	function updateGrid() {
		items = items;
	}

	onMount(() => {
		const sizeObserver = new ResizeObserver((entries) => {
			if (entries.length > 1) {
				throw new Error('that observer must have only one entry');
			}
			const entry = entries[0];

			const width = entry.contentRect.width;
			const height = entry.contentRect.height;

			_cols = findGridSize(cols, width, breakpoints);
			_rows = findGridSize(rows, height, breakpoints);

			shouldExpandCols = _cols === 0;
			shouldExpandRows = _rows === 0;

			$gridSettings.itemSize = {
				width: itemSize.width ?? (width - (gap + 1) * _cols) / _cols,
				height: itemSize.height ?? (height - (gap + 1) * _rows) / _rows
			};
		});

		sizeObserver.observe(gridContainer);

		return () => sizeObserver.disconnect();
	});

	// writable with grid settings

	function registerItem(item: LayoutItem): void {
		if (item.id in items) return;
		items[item.id] = item;
		items = items;
	}

	function unregisterItem(item: LayoutItem): void {
		delete items[item.id];
		items = items;
	}

	const gridSettings = writable<GridParams>({
		cols: 0,
		rows: 0,
		maxCols,
		maxRows,
		gap,
		items,
		bounds,
		readOnly,
		debug,
		collision,
		registerItem,
		unregisterItem,
		updateGrid,
		dispatch
	});

	$: gridSettings.update((settings) => ({
		...settings,
		cols: _cols,
		rows: _rows,
		maxCols,
		maxRows,
		gap,
		items,
		bounds,
		readOnly,
		debug,
		collision
	}));

	setContext(GRID_CONTEXT_NAME, gridSettings);
</script>

<div
	class={`svelte-grid-extended ${classes}`}
	style={`width: ${containerWidth ? `${containerWidth}px` : '100%'}; 
		height: ${containerHeight ? `${containerHeight}px` : '100%'};`}
	bind:this={gridContainer}
>
	<slot />
</div>

<style>
	.svelte-grid-extended {
		position: relative !important;
	}
</style>
