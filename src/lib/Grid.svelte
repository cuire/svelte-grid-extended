<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	import GridItem from './GridItem.svelte';
	import { assertGridOptions } from './utils/assert';
	import { findGridSize } from './utils/breakpoints';
	import { getGridDimensions } from './utils/grid';

	import type { Breakpoints, ItemSize, GridSize, LayoutItem, LayoutChangeDetail } from './types';

	type T = $$Generic;

	const dispatch = createEventDispatcher<{
		change: LayoutChangeDetail<T>;
	}>();

	interface $$Slots {
		default: {
			/**
			 * GridItem data object.
			 */
			item: LayoutItem<T>;
		};
		loader: Record<string, never>;
	}

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
	export let items: LayoutItem<T>[];

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
	 * GridItem container style.
	 */
	export let itemClass: string | undefined = undefined;

	/**
	 * GridItem active state style.
	 */
	export let itemActiveClass: string | undefined = undefined;

	/**
	 * GridItem preview state style.
	 */
	export let itemPreviewClass: string | undefined = undefined;

	/**
	 * GridItem resize handle style.
	 */
	export let itemResizerClass: string | undefined = undefined;

	/**
	 * This option allows for collision between grid items, And it also deprecates 'rows' option. (fix to 0)
	 */
	export let collision: boolean | undefined = undefined;

	let _itemSize: ItemSize;

	let _cols: number;

	let _rows: number;

	let maxCols: number;

	let maxRows: number;

	let containerWidth: number;

	let containerHeight: number;

	let shouldExpandRows = false;

	let shouldExpandCols = false;

	$: if (collision) rows = 0;

	$: if (typeof cols === 'number') _cols = cols;

	$: if (typeof rows === 'number') _rows = rows;

	$: if (itemSize?.width && itemSize?.height) _itemSize = { ...itemSize } as ItemSize;

	$: if (itemSize?.width && _itemSize?.width) containerWidth = _cols * (_itemSize.width + gap + 1);

	$: if (itemSize?.height && _itemSize?.height)
		containerHeight = _rows * (_itemSize.height + gap + 1);

	$: calculatedGridSize = getGridDimensions(items);

	let gridContainer: HTMLDivElement;

	$: {
		_cols = shouldExpandCols ? calculatedGridSize.cols : _cols;
		maxCols = shouldExpandCols ? Infinity : _cols;
	}

	$: {
		_rows = shouldExpandRows ? calculatedGridSize.rows : _rows;
		maxRows = shouldExpandRows ? Infinity : _rows;
	}

	function handleItemChange(event: CustomEvent<LayoutChangeDetail<T>>) {
		dispatch('change', { item: event.detail.item });
		items = [...items];
	}

	function updateGridDimensions(event: CustomEvent<LayoutChangeDetail<T>>) {
		const { item } = event.detail;
		calculatedGridSize = getGridDimensions([...items.filter((i) => i.id !== item.id), item]);
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

			_itemSize = {
				width: itemSize.width ?? (width - (gap + 1) * _cols) / _cols,
				height: itemSize.height ?? (height - (gap + 1) * _rows) / _rows
			};
		});

		sizeObserver.observe(gridContainer);

		return () => sizeObserver.disconnect();
	});
</script>

<div
	class={`svelte-grid-extended ${classes}`}
	style={`width: ${containerWidth ? `${containerWidth}px` : '100%'}; 
		height: ${containerHeight ? `${containerHeight}px` : '100%'};`}
	bind:this={gridContainer}
>
	{#if _itemSize && _cols && _rows}
		{#each items as item (item.id)}
			<GridItem
				class={itemClass ?? ''}
				{item}
				gridParams={{
					itemSize: _itemSize,
					gap,
					maxCols,
					maxRows,
					bounds,
					boundsTo: gridContainer,
					items,
					readOnly
				}}
				{collision}
				activeClass={itemActiveClass}
				previewClass={itemPreviewClass}
				resizerClass={itemResizerClass}
				on:itemchange={handleItemChange}
				on:previewchange={updateGridDimensions}
			>
				<slot {item} />
			</GridItem>
		{/each}
	{:else}
		<slot name="loader">
			{#if debug}
				{_itemSize} {_cols} {_rows}
			{/if}
		</slot>
	{/if}
</div>

<style>
	.svelte-grid-extended {
		position: relative !important;
	}
</style>
