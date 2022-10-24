<script lang="ts">
	import { onMount } from 'svelte';

	import GridItem from './GridItem.svelte';
	import { assertGridOptions } from './utils/assert';
	import { findGridSize } from './utils/breakpoints';

	import type { Breakpoints, ItemSize, GridSize, Item } from './types';

	export let cols: GridSize = 8;

	export let rows: GridSize = 8;

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

	export let itemClass = 'item-default';

	export let itemActiveClass = 'active-default';

	export let itemPreviewClass = 'item-preview-default';

	export let itemResizerClass = 'resizer-default';

	let _itemSize: ItemSize;

	let _cols: number;

	let _rows: number;

	$: if (typeof cols === 'number') _cols = cols;

	$: if (typeof rows === 'number') _rows = rows;

	$: if (itemSize?.width && itemSize?.height) _itemSize = itemSize as ItemSize;

	$: if (_rows && _itemSize?.height) containerHeight = _rows * (_itemSize.height + gap);

	let gridContainer: HTMLDivElement;

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

			if (!(itemSize?.width && itemSize?.height)) {
				_itemSize = {
					width: (width - (gap + 1) * _cols) / _cols,
					height: (height - (gap + 1) * _rows) / _rows
				};
			}
		});

		sizeObserver.observe(gridContainer);

		return () => sizeObserver.disconnect();
	});
</script>

<div
	class={`svelte-grid-extended ${classes}`}
	bind:this={gridContainer}
>
	{#if _itemSize && _cols && _rows}
		{#each items as item}
			<GridItem
				class={itemClass}
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
			>
				<slot {item} />
			</GridItem>
		{/each}
	{/if}
</div>

<style>
	:global(.svelte-grid-extended) {
		position: relative !important;
	}
	:global(.svelte-grid-extended > .item-default) {
		transition: width 0.2s, height 0.2s;
		transition: transform 0.2s, opacity 0.2s;
	}
	:global(.svelte-grid-extended > .item-default.active-default) {
		opacity: 0.5;
	}
	:global(.svelte-grid-extended .item-preview-default) {
		background-color: rgb(192, 127, 127);
		transition: all 0.2s;
	}
	:global(.svelte-grid-extended .resizer-default) {
		cursor: move;
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
