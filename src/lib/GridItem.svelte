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
	} from './utils/item';

	import type { ItemSize, GridItem as GridItemType, ItemChangeEvent, Size } from './types';

	const dispatch = createEventDispatcher<{ change: ItemChangeEvent }>();

	export let id: number;

	export let item: GridItemType;

	export let size: ItemSize;

	export let gap: number;

	export let bounds = false;

	let minSize: Size;

	let maxSize: Size | undefined;

	let active = false;

	$: left = calculatePosition(item.x, size.width, gap);
	$: top = calculatePosition(item.y, size.height, gap);

	$: width = calculateSize(item.w, size.width, gap);
	$: height = calculateSize(item.h, size.height, gap);

	$: minSize = item.min ?? { w: 1, h: 1 };
	$: maxSize = item.max;

	let min: ItemSize | undefined;

	let max: ItemSize | undefined;

	$: if (minSize) {
		min = {
			width: calculateSize(minSize.w, size.width, gap),
			height: calculateSize(minSize.h, size.height, gap)
		};
	}

	$: if (maxSize) {
		max = {
			width: calculateSize(maxSize.w, size.width, gap),
			height: calculateSize(maxSize.h, size.height, gap)
		};
	}

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
			const newPosition = snapMove(event.detail.left, event.detail.top, size, gap);
			left = newPosition.left;
			top = newPosition.top;
		}

		if (event.detail.width && event.detail.height) {
			const newSize = snapResize(event.detail.width, event.detail.height, size, gap);
			width = newSize.width;
			height = newSize.height;
		}

		dispatch('change', {
			id: id,
			x: calculateCoordinate(left, size.width, gap),
			y: calculateCoordinate(top, size.height, gap),
			w: calculateSizeCoordinate(width, size.width, gap),
			h: calculateSizeCoordinate(height, size.height, gap)
		});
	}
</script>

<div
	class="svelte-grid-extended-grid-item"
	class:svelte-grid-extended-grid-transparent={active}
	use:move={{ initialPosition: { left, top }, bounds }}
	on:movestart={start}
	on:moving={update}
	on:moveend={end}
	use:resize={{ min, max, bounds }}
	on:resizestart={start}
	on:resizing={update}
	on:resizeend={end}
	style={`left:${left}px; top:${top}px; width: ${width}px; height: ${height}px;`}
>
	<slot />
</div>

{#if active}
	{@const preview = snapMove(left, top, size, gap)}
	{@const previewSize = snapResize(width, height, size, gap)}
	<div
		class="svelte-grid-extended-grid-item-preview"
		style={`left:${preview.left}px; top:${preview.top}px;  
		width: ${previewSize.width}px; height: ${previewSize.height}px;`}
	/>
{/if}

<style>
	:global(.svelte-grid-extended-grid-item) {
		cursor: move;
		user-select: none;
		touch-action: none;
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
		cursor: move;
		user-select: none;
		touch-action: none;
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
