<script lang="ts">
	import move from './utils/move';
	import resize from './utils/resize';

	import type { CellSizeType, GridItemType } from './types';

	export let item: GridItemType;

	export let cellSize: CellSizeType;

	export let gap: number;

	let active = false;

	let left = item.x * cellSize.width + (item.x + 1) * gap;
	let top = item.y * cellSize.height + (item.y + 1) * gap;

	let width = item.w * cellSize.width;
	let height = item.h * cellSize.height;

	function movestart() {
		active = true;
	}

	function moving(event: CustomEvent) {
		left = event.detail.left;
		top = event.detail.top;
	}

	function moveend(event: CustomEvent) {
		active = false;

		const newCords = snap(event.detail.left, event.detail.top);
		left = newCords.left;
		top = newCords.top;
	}

	function snap(left: number, top: number) {
		const l = left - ((left + cellSize.width / 2) % cellSize.width);
		const t = top - ((top + cellSize.height / 2) % cellSize.height);

		return {
			left: l + cellSize.width / 2 + (l / cellSize.width + 1) * gap,
			top: t + cellSize.height / 2 + (t / cellSize.width + 1) * gap
		};
	}
</script>

<div
	class="svelte-grid-extended-grid-item"
	class:svelte-grid-extended-grid-transparent={active}
	use:move={{ initialPosition: { left, top } }}
	on:movestart={movestart}
	on:move={moving}
	on:moveend={moveend}
	use:resize
	style={`left:${left}px; top:${top}px; width: ${width}px; height: ${height}px;`}
>
	<slot />
</div>

{#if active}
	{@const shadow = snap(left, top)}
	<div
		class="svelte-grid-extended-grid-item-preview"
		style={`left:${shadow.left}px; top:${shadow.top}px;  width: ${width}px; height: ${height}px;`}
	/>
{/if}

<style>
	:global(.svelte-grid-extended-grid-item) {
		position: absolute;
		background-color: blueviolet;
		z-index: 10;
	}
	:global(.svelte-grid-extended-grid-transparent) {
		opacity: 0.5;
	}
	:global(.svelte-grid-extended-grid-item-preview) {
		position: absolute;
		background-color: rgb(192, 127, 127);
	}
	:global(.svelte-grid-extended-debug-resizer) {
		position: absolute;
		user-select: none;
		width: 20px;
		height: 20px;
		right: 0;
		bottom: 0;
		cursor: se-resize;
	}
	:global(.svelte-grid-extended-debug-resizer::after) {
		content: '';
		position: absolute;
		right: 3px;
		bottom: 3px;
		width: 5px;
		height: 5px;
		border-right: 2px solid rgba(0, 0, 0, 0.4);
		border-bottom: 2px solid rgba(0, 0, 0, 0.4);
	}
</style>
