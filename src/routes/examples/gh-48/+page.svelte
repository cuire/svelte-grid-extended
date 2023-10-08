<script>
	import Grid, { GridItem } from '$lib';
</script>

<section>CONTENT</section>

<Grid rows={20} cols={10} gap={8} class="grid">
	<GridItem x={0} y={0} w={3} h={3}>Test</GridItem>
</Grid>

<section>CONTENT</section>

<style>
	section {
		min-height: 100vh;
		background: darkcyan;
		color: white;
	}

	:global(.grid) {
		min-height: 100vh;
		background: darkgray;
	}
</style>
