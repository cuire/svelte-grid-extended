<script lang="ts">
	import { fade } from 'svelte/transition';
	import Grid, { GridItem, type GridController } from '$lib';

	let items = [
		{ id: crypto.randomUUID(), x: 0, y: 0, w: 2, h: 5 },
		{ id: crypto.randomUUID(), x: 2, y: 2, w: 2, h: 2 },
		{ id: crypto.randomUUID(), x: 2, y: 0, w: 1, h: 2 },
		{ id: crypto.randomUUID(), x: 3, y: 0, w: 2, h: 2 },
		{ id: crypto.randomUUID(), x: 4, y: 2, w: 1, h: 3 },
		{ id: crypto.randomUUID(), x: 8, y: 0, w: 2, h: 8 },
		{ id: crypto.randomUUID(), x: 4, y: 5, w: 1, h: 1 },
		{ id: crypto.randomUUID(), x: 2, y: 6, w: 3, h: 2 },
		{ id: crypto.randomUUID(), x: 2, y: 4, w: 2, h: 2 }
	];

	const itemsBackup = structuredClone(items);

	const itemSize = { height: 40 };

	function resetGrid() {
		items = structuredClone(itemsBackup);
	}

	function remove(id: string) {
		items = items.filter((i) => i.id !== id);
	}

	let gridController: GridController;

	function addNewItem() {
		const w = Math.floor(Math.random() * 2) + 1;
		const h = Math.floor(Math.random() * 5) + 1;
		const newPosition = gridController.getFirstAvailablePosition(w, h);
		items = newPosition
			? [...items, { id: crypto.randomUUID(), x: newPosition.x, y: newPosition.y, w, h }]
			: items;
	}
</script>

<button class="btn" on:click={addNewItem}>Add New Item</button>
<button class="btn" on:click={resetGrid}>Reset Grid</button>

<Grid {itemSize} cols={10} collision="push" bind:controller={gridController}>
	{#each items as item (item.id)}
		<div transition:fade={{ duration: 300 }}>
			<GridItem id={item.id} bind:x={item.x} bind:y={item.y} bind:w={item.w} bind:h={item.h}>
				<button
					on:pointerdown={(e) => e.stopPropagation()}
					on:click={() => remove(item.id)}
					class="remove"
				>
					✕
				</button>
				<div class="item">{item.id.slice(0, 5)}</div>
			</GridItem>
		</div>
	{/each}
</Grid>

<style>
	.item {
		display: grid;
		place-items: center;
		background-color: rgb(150, 150, 150);
		width: 100%;
		height: 100%;
	}
	.remove {
		cursor: pointer;
		position: absolute;
		right: 10px;
		top: 3px;
	}
	.btn {
		margin-top: 10px;
		margin-left: 10px;
		right: 2px;
		top: 1px;
		color: aqua;
	}
</style>
