<script lang="ts">
	import Grid, { GridItem, type GridController } from '$lib';

	let items = [
		{ id: '1', x: 0, y: 0, w: 2, h: 5 },
		{ id: '2', x: 2, y: 2, w: 2, h: 2 }
	];

	let gridController: GridController;

	function compressItems() {
		gridController.compress();
	}

	const itemSize = { height: 40 };
</script>

<button class="btn" on:click={compressItems}>Compress Items</button>

<Grid {itemSize} cols={10} collision="push" bind:controller={gridController}>
	{#each items as item (item.id)}
		<GridItem id={item.id} bind:x={item.x} bind:y={item.y} bind:w={item.w} bind:h={item.h}>
			<div class="item">{item.id.slice(0, 5)}</div>
		</GridItem>
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
	.btn {
		margin-top: 10px;
		margin-left: 10px;
		right: 2px;
		top: 1px;
	}
</style>
