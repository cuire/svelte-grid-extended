<script lang="ts">
	import Grid from '$lib';

	const items = [
		{ id: '0', x: 0, y: 0, w: 1, h: 1, max: { w: 2, h: 1 } },
		{ id: '3', x: 0, y: 1, w: 3, h: 1 }
	];

	const cols = { xxl: 6, xl: 5, lg: 4, md: 3, sm: 2, xs: 1 };
	const itemSize = { height: 100 };
</script>

<Grid class="container" {items} {cols} {itemSize} bounds={true}>123</Grid>

<style>
	:global(.container) {
		max-width: 900px;
		height: 100vh;
		background-color: aquamarine;
	}
</style>
