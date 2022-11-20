<script lang="ts">
	import { onMount } from 'svelte';

	import GridItem from './GridItem.svelte';
	import { assertGridOptions } from './utils/assert';
	import { findGridSize } from './utils/breakpoints';
	import { getGridDimensions } from './utils/grid';

	import type { Breakpoints, ItemSize, GridSize, Item } from './types';

	export let cols: GridSize = 0;

	export let rows: GridSize = 0;

	export let itemSize: Partial<ItemSize> = {};

	export let gap = 10;

	export let items: Item[];

	export let breakpoints: Breakpoints = {
		xxl: 1536,
		xl: 1280,
		lg: 1024,
		md: 768,
		sm: 640,
		xs: 320
	};

	assertGridOptions({ cols, rows, itemSize });

	export let bounds = false;

	export let debug = false;

	let classes = '';

	export { classes as class };

	export let itemClass: string | undefined = undefined;

	export let itemActiveClass: string | undefined = undefined;

	export let itemPreviewClass: string | undefined = undefined;

	export let itemResizerClass = 'resizer-default';

	let _itemSize: ItemSize;

	let _cols: number;

	let _rows: number;

	let maxCols: number;

	let maxRows: number;

	let containerWidth: number;

	let containerHeight: number;

	let shouldExpandRows = false;

	let shouldExpandCols = false;

	$: if (typeof cols === 'number') _cols = cols;

	$: if (typeof rows === 'number') _rows = rows;

	$: if (itemSize?.width && itemSize?.height) _itemSize = itemSize as ItemSize;

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

	function updateGrid() {
		items = [...items];
	}

	function updateGridDimensions(event: CustomEvent<{ item: Item }>) {
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
			_rows = findGridSize(rows, width, breakpoints);

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
		{#each items as item}
			<GridItem
				class={itemClass ?? ''}
				{item}
				gridParams={{
					itemSize: _itemSize,
					gap,
					maxCols,
					maxRows,
					bounds,
					items
				}}
				activeClass={itemActiveClass}
				previewClass={itemPreviewClass}
				resizerClass={itemResizerClass}
				on:itemchange={updateGrid}
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

	:global(.svelte-grid-extended .resizer-default) {
		user-select: none;
		touch-action: none;
		position: absolute;
		user-select: none;
		width: 20px;
		height: 20px;
		right: 0;
		bottom: 0;
		cursor: se-resize;
	}
	:global(.svelte-grid-extended .resizer-default::after) {
		content: '';
		position: absolute;
		right: 3px;
		bottom: 3px;
		width: 5px;
		height: 5px;
		border-right: 2px solid rgba(0, 0, 0, 0.4);
		border-bottom: 2px solid rgba(0, 0, 0, 0.4);
	}
</style>
