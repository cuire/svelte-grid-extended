<script lang="ts">
	import Grid, { GridItem } from '$lib';

	const items = [
		{ x: 6, y: 0, w: 2, h: 2, data: { text: '🎅' } },
		{ x: 6, y: 2, w: 2, h: 2, data: { text: '🤶' } },
		{ x: 4, y: 0, w: 2, h: 2, data: { text: '🦌' } },
		{ x: 4, y: 2, w: 2, h: 2, data: { text: '🦌' } },
		{ x: 2, y: 1, w: 2, h: 2, data: { text: '🦌' } },
		{ x: 8, y: 2, w: 2, h: 2, data: { text: '🎄' } },
		{ x: 8, y: 0, w: 2, h: 2, data: { text: '🎁' } }
	];
</script>

<Grid cols={10} rows={10}>
	{#each items as item}
		<GridItem x={item.x} y={item.y} w={item.w} h={item.h}>
			<div class="item">{item.data.text}</div>
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
		font-size: xx-large;
	}
</style>
