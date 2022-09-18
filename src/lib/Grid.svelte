<script lang="ts">
	import { onMount } from 'svelte';

	import GridItem from './GridItem.svelte';
	import { findCols } from './utils/breakpoints';

	import type { BreakPoints, CellSizeType, Cols, GridItemType, ItemChangeDetails } from './types';

	export let cols: Cols = 8;
	export let rows = 8;

	export let cellSize: CellSizeType | undefined = undefined;

	export let gap = 10;

	export let items: GridItemType[];

	export let breakpoints: BreakPoints = {
		xxl: 1536,
		xl: 1280,
		lg: 1024,
		md: 768,
		sm: 640,
		xs: 320
	};

	export let debug = false;

	let _cellSize: CellSizeType;

	$: if (cellSize) _cellSize = cellSize;

	let gridContainer: HTMLDivElement;
	let width: number;
	let height: number;

	function updateItem(event: CustomEvent<ItemChangeDetails>) {
		const { id, ...newValues } = event.detail;
		if (items) {
			items[id] = { ...items[id], ...newValues };
		}
	}

	$: console.log(items);

	onMount(() => {
		const sizeObserver = new ResizeObserver((entries) => {
			if (entries.length > 1) {
				throw new Error('that observer must have only one entry');
			}
			const entry = entries[0];
			width = entry.contentRect.width;
			height = entry.contentRect.height;

			const _cols = findCols(cols, width, breakpoints);

			if (!cellSize) {
				_cellSize = {
					width: (width - (gap + 1) * _cols) / _cols,
					height: (height - (gap + 1) * rows) / rows
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
	{#if _cellSize}
		{#each items as item, index}
			<GridItem id={index} {item} cellSize={_cellSize} {gap} on:change={updateItem}>
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
