<script>
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children } = $props();
</script>

<div class="layout">
	{@render children?.()}
</div>

<style>
	.layout {
		height: 100vh;
	}
</style>
