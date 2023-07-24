<script lang="ts">
	import Grid, { type LayoutChangeDetail } from '$lib';
	import GridItem from '$lib/GridItem.svelte';

	function logItem(event: CustomEvent<LayoutChangeDetail>) {
		console.log(event.detail.item);
	}
</script>

<Grid cols={10} rows={10} on:change={logItem}>
	<GridItem x={1} y={0} class="item" on:change={logItem}>Hey</GridItem>
	<GridItem x={3} y={3} w={4} class="item" on:previewchange={logItem}>Hoy</GridItem>
</Grid>

<style>
	:global(.item) {
		display: grid;
		place-items: center;
		background-color: rgb(150, 150, 150);
		width: 100%;
		height: 100%;
		font-size: xx-large;
	}
</style>
