<script lang="ts">
	import Grid from '$lib';
	import type { Item } from '$lib/types';

	const items: Item<{ text: string }>[] = [
		{ id: '0', x: 6, y: 0, w: 2, h: 2, data: { text: '🎅' } },
		{ id: '1', x: 6, y: 2, w: 2, h: 2, data: { text: '🤶' } },
		{ id: '2', x: 4, y: 0, w: 2, h: 2, data: { text: '🦌' } },
		{ id: '3', x: 4, y: 2, w: 2, h: 2, data: { text: '🦌' } },
		{ id: '4', x: 2, y: 1, w: 2, h: 2, data: { text: '🦌' } },
		{ id: '5', x: 8, y: 2, w: 2, h: 2, data: { text: '🎄' } },
		{ id: '6', x: 8, y: 0, w: 2, h: 2, data: { text: '🎁' } }
	];
</script>

<Grid {items} cols={10} rows={10} let:item>
	<div class="item">{item.data?.text}</div>
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
