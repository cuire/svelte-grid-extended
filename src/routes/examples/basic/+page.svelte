<script lang="ts">
	import Grid from '$lib';
	import GridItem from '$lib/GridItem.svelte';
</script>

<Grid cols={10} rows={10}>
	<GridItem x={1} y={0} class="item">Hey</GridItem>
	<GridItem x={3} y={3} w={4} class="item">Hoy</GridItem>
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
