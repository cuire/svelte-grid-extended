<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	import GridItem from './GridItem.svelte';
	import { assertGridOptions } from './utils/assert';
	import { findGridSize } from './utils/breakpoints';
	import { getGridDimensions } from './utils/grid';

	import type { Breakpoints, ItemSize, GridSize, LayoutItem } from './types';

	const dispatch = createEventDispatcher<{
		change: { item: LayoutItem };
	}>();

	export let cols: GridSize = 0;

	export let rows: GridSize = 0;

	export let itemSize: Partial<ItemSize> = {};

	export let gap = 10;

	type T = $$Generic;

	interface $$Slots {
		default: {
			item: LayoutItem<T>;
		};
		loader: Record<string, never>;
	}

	export let items: LayoutItem<T>[];

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

	export let readOnly = false;

	export let debug = false;

	let classes = '';

	export { classes as class };

	export let itemClass: string | undefined = undefined;

	export let itemActiveClass: string | undefined = undefined;

	export let itemPreviewClass: string | undefined = undefined;

	export let itemResizerClass: string | undefined = undefined;

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

	function handleItemChange(event: CustomEvent<{ item: LayoutItem }>) {
		dispatch('change', { item: event.detail.item });
		items = [...items];
	}

	function updateGridDimensions(event: CustomEvent<{ item: LayoutItem }>) {
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
					boundsTo: gridContainer,
					items,
					readOnly
				}}
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
