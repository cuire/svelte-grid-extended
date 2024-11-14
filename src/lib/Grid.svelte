<script lang="ts" module>
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
	import { run } from 'svelte/legacy';

	import { createEventDispatcher, getContext, onMount, setContext } from 'svelte';

	import { assertGridOptions } from './utils/assert.js';
	import { findGridSize } from './utils/breakpoints.js';
	import { getGridDimensions } from 'lib/utils/grid';
	import { GridController } from '$lib/GridController';

	import type {
		Breakpoints,
		ItemSize,
		GridSize,
		LayoutItem,
		LayoutChangeDetail,
		GridParams,
		Collision,
		GridController as GridControllerType
	} from '$lib/types.js';
	import { writable, type Readable, type Writable } from 'svelte/store';

	const dispatch = createEventDispatcher<{
		change: LayoutChangeDetail;
	}>();

	/**
	 * Grid items.
	 */
	let items: Record<string, LayoutItem> = $state({});

	/**
	 * Grid container class.
	 */

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
		children?: import('svelte').Snippet;
		[key: string]: any;
	}

	let {
		cols = 0,
		rows = 0,
		itemSize = {},
		gap = 10,
		breakpoints = {
			xxl: 1536,
			xl: 1280,
			lg: 1024,
			md: 768,
			sm: 640,
			xs: 320
		},
		bounds = false,
		readOnly = false,
		debug = false,
		class: classes = '',
		collision = 'none',
		autoCompress = true,
		children,
		...rest
	}: Props = $props();

	let _cols: number = $state();

	let _rows: number = $state();

	let maxCols = $state(Infinity);

	let maxRows = $state(Infinity);

	let shouldExpandRows = $state(false);

	let shouldExpandCols = $state(false);

	let containerWidth: number | null = $state(null);

	let containerHeight: number | null = $state(null);

	let gridContainer: HTMLDivElement = $state();

	/**
	 * Force the grid to update. By default called when any of the grid items changes.
	 */
	function updateGrid() {
		items = items;

		if (autoCompress && collision === 'compress') {
			_controller._internalCompress();
		}
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
				width: itemSize.width ?? (width - (_cols + 1) * gap) / _cols,
				height: itemSize.height ?? (height - (_rows + 1) * gap) / _rows
			};
		});

		sizeObserver.observe(gridContainer);

		return () => sizeObserver.disconnect();
	});

	function registerItem(item: LayoutItem): void {
		if (item.id in items) {
			throw new Error(`Item with id ${item.id} already exists`);
		}
		items[item.id] = item;
		updateGrid();
	}

	function unregisterItem(item: LayoutItem): void {
		delete items[item.id];
		updateGrid();
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

	const _controller = $state(new GridController($gridSettings));

	export const controller = _controller as GridControllerType;

	setContext(GRID_CONTEXT_NAME, gridSettings);
	run(() => {
		assertGridOptions({ cols, rows, itemSize, collision });
	});
	run(() => {
		if (typeof cols === 'number') _cols = cols;
	});
	let calculatedGridSize = $derived(getGridDimensions(Object.values(items)));
	run(() => {
		_cols = shouldExpandCols ? calculatedGridSize.cols : _cols;
		maxCols = shouldExpandCols ? Infinity : _cols;
	});
	// Check for colls / rows === 0 used to recalculate the grid container only if the grid is dynamic size
	// #gh-48
	run(() => {
		if ($gridSettings.itemSize && cols === 0) {
			containerWidth = _cols * ($gridSettings.itemSize.width + gap + 1);
		} else {
			containerWidth = null;
		}
	});
	run(() => {
		if (typeof rows === 'number') _rows = rows;
	});
	run(() => {
		_rows = shouldExpandRows ? calculatedGridSize.rows : _rows;
		maxRows = shouldExpandRows ? Infinity : _rows;
	});
	run(() => {
		if (collision !== 'none') {
			_rows = 0;
		}
	});
	run(() => {
		if ($gridSettings.itemSize && rows === 0) {
			containerHeight = _rows * ($gridSettings.itemSize.height + gap + 1);
		} else {
			containerHeight = null;
		}
	});
	run(() => {
		if (itemSize?.width && itemSize?.height) $gridSettings.itemSize = { ...itemSize } as ItemSize;
	});
	run(() => {
		gridSettings.update((settings) => ({
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
	});
	run(() => {
		_controller.gridParams = $gridSettings;
	});
</script>

<div
	class={`svelte-grid-extended ${classes}`}
	bind:this={gridContainer}
	style={`width: ${containerWidth ? `${containerWidth}px` : '100%'}; 
	height: ${containerHeight ? `${containerHeight}px` : '100%'}; ${rest.style ?? ''}`}
>
	{#if $gridSettings.itemSize}
		{@render children?.()}
	{/if}
</div>

<style>
	.svelte-grid-extended {
		position: relative !important;
	}
</style>
