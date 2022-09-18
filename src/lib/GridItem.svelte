<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import move from './utils/move';
	import resize from './utils/resize';
	import {
		calculateCoordinate,
		calculatePosition,
		calculateSize,
		calculateSizeCoordinate,
		snapMove,
		snapResize
	} from './utils/grid';

	import type { CellSizeType, GridItemType, ItemChangeDetails } from './types';

	const dispatch = createEventDispatcher<{ change: ItemChangeDetails }>();

	export let id: number;

	export let item: GridItemType;

	export let cellSize: CellSizeType;

	export let gap: number;

	let active = false;

	$: left = calculatePosition(item.x, cellSize.width, gap);
	$: top = calculatePosition(item.y, cellSize.height, gap);

	$: width = calculateSize(item.w, cellSize.width, gap);
	$: height = calculateSize(item.h, cellSize.height, gap);

	function start() {
		active = true;
	}

	function update(event: CustomEvent) {
		left = event.detail.left ?? left;
		top = event.detail.top ?? top;
		width = event.detail.width ?? width;
		height = event.detail.height ?? height;
	}

	function end(event: CustomEvent) {
		active = false;

		if (event.detail.left && event.detail.top) {
			const newPosition = snapMove(event.detail.left, event.detail.top, cellSize, gap);
			left = newPosition.left;
			top = newPosition.top;
		}

		if (event.detail.width && event.detail.height) {
			const newSize = snapResize(event.detail.width, event.detail.height, cellSize, gap);
			width = newSize.width;
			height = newSize.height;
		}

		dispatch('change', {
			id: id,
			x: calculateCoordinate(left, cellSize.width, gap),
			y: calculateCoordinate(top, cellSize.height, gap),
			w: calculateSizeCoordinate(width, cellSize.width, gap),
			h: calculateSizeCoordinate(height, cellSize.height, gap)
		});
	}
</script>

<div
	class="svelte-grid-extended-grid-item"
	class:svelte-grid-extended-grid-transparent={active}
	use:move={{ initialPosition: { left, top } }}
	on:movestart={start}
	on:move={update}
	on:moveend={end}
	use:resize={{ min: cellSize }}
	on:resizestart={start}
	on:resizing={update}
	on:resizeend={end}
	style={`left:${left}px; top:${top}px; width: ${width}px; height: ${height}px;`}
>
	<slot />
</div>

{#if active}
	{@const preview = snapMove(left, top, cellSize, gap)}
	{@const previewSize = snapResize(width, height, cellSize, gap)}
	<div
		class="svelte-grid-extended-grid-item-preview"
		style={`left:${preview.left}px; top:${preview.top}px;  
		width: ${previewSize.width}px; height: ${previewSize.height}px;`}
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
