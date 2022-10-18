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
	class="svelte-grid-extended-container"
	class:svelte-grid-extended-debug={debug}
	bind:this={gridContainer}
>
	{#if _itemSize && _cols && _rows}
		{#each items as item}
			<GridItem
				{item}
				gridParams={{
					itemSize: _itemSize,
					gap,
					cols: _cols,
					rows: _rows,
					bounds,
					items
				}}
			>
				<slot />
			</GridItem>
		{/each}
	{/if}
</div>

<style>
	:global(.svelte-grid-extended-container) {
		position: relative;
		width: 100%;
		height: 100%;
	}
	:global(.svelte-grid-extended-debug) {
		width: 100%;
		height: 100%;
		background-image: repeating-linear-gradient(#ccc 0 1px, transparent 1px 100%),
			repeating-linear-gradient(90deg, #ccc 0 1px, transparent 1px 100%);
		background-size: 167px 167px;
	}
</style>
