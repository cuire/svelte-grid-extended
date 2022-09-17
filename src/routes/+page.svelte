<script lang="ts">
	import Grid from '$lib';

	const items = [
		{ x: 0, y: 0, w: 1, h: 1 },
		{ x: 1, y: 1, w: 3, h: 1 }
	];
</script>

<div class="container">
	<Grid {items}>123</Grid>
</div>

<style>
	.container {
		max-width: 800px;
		background-color: aquamarine;
		height: 500px;
	}
</style>
