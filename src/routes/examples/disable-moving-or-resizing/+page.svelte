<script lang="ts">
	import Grid, { GridItem } from '$lib';

	const items = [
		{ x: 0, y: 0, w: 2, h: 5, movable: false },
		{ x: 2, y: 2, w: 2, h: 2, movable: false, resizable: false },
		{ x: 2, y: 0, w: 1, h: 2, resizable: false },
		{ x: 3, y: 0, w: 2, h: 2 },
		{ x: 4, y: 2, w: 1, h: 3 },
		{ x: 8, y: 0, w: 2, h: 8 },
		{ x: 4, y: 5, w: 1, h: 1 },
		{ x: 2, y: 6, w: 3, h: 2 },
		{ x: 2, y: 4, w: 2, h: 2 }
	];
</script>

<Grid cols={10} rows={10}>
	{#each items as item}
		<GridItem
			x={item.x}
			y={item.y}
			w={item.w}
			h={item.h}
			movable={item.movable}
			resizable={item.resizable}
		>
			<div class="item">
				{item.movable === false ? 'Cant move' : ''}
				{item.resizable === false ? 'Cant resize' : ''}
			</div>
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
</style>
