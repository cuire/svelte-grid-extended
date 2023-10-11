<script lang="ts">
	import Grid, { GridItem } from '$lib';

	const items = [
		{ id: '0', x: 0, y: 0, w: 2, h: 5 },
		{ id: '1', x: 2, y: 2, w: 2, h: 2 },
		{ id: '2', x: 2, y: 0, w: 1, h: 2 },
		{ id: '3', x: 3, y: 0, w: 2, h: 2 },
		{ id: '4', x: 4, y: 2, w: 1, h: 3 },
		{ id: '5', x: 8, y: 0, w: 2, h: 8 },
		{ id: '6', x: 4, y: 5, w: 1, h: 1 },
		{ id: '7', x: 2, y: 6, w: 3, h: 2 },
		{ id: '8', x: 2, y: 4, w: 2, h: 2 },
		{ id: '9', x: 2, y: 8, w: 2, h: 6 },
		{ id: '10', x: 2, y: 14, w: 2, h: 2 },
		{ id: '11', x: 2, y: 16, w: 2, h: 6 },
		{ id: '11', x: 2, y: 22, w: 2, h: 2 }
	];

	const itemSize = { height: 30 };
</script>

<div class="bg-red">
	<Grid {itemSize} cols={10} collision="compress">
		{#each items as item}
			<GridItem x={item.x} y={item.y} w={item.w} h={item.h}>
				<div class="item">{item.id}</div>
			</GridItem>
		{/each}
	</Grid>

	<div style="height: 100px;" />
</div>

<style>
	.item {
		display: grid;
		place-items: center;
		background-color: lightskyblue;
		width: 100%;
		height: 100%;
	}
	.bg-red {
		background-color: red;
		min-height: 100vh;
	}
</style>
