<script lang="ts">
	import { onMount } from 'svelte';

	import GridItem from './GridItem.svelte';
	import type { GridItemType, ItemChangeDetails } from './types';

	export let cols = 8;
	export let rows = 8;

	export let cellSize = { width: 100, height: 100 };

	export let gap = 10;

	export let items: GridItemType[];

	export let debug = false;

	let gridContainer: HTMLDivElement;
	let width: number;

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
	{#each items as item, index}
		<GridItem id={index} {item} {cellSize} {gap} on:change={updateItem}>
			<slot />
		</GridItem>
	{/each}
</div>

<style>
	:global(.svelte-grid-extended-container) {
		position: relative;
	}
	:global(.svelte-grid-extended-debug) {
		width: 100%;
		height: 100%;
		background-image: repeating-linear-gradient(#ccc 0 1px, transparent 1px 100%),
			repeating-linear-gradient(90deg, #ccc 0 1px, transparent 1px 100%);
		background-size: 167px 167px;
	}
</style>
