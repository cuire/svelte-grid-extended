<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import move from './utils/move';
	import resize from './utils/resize';
	import {
		position2coordinate,
		coordinate2position,
		coordinate2size,
		size2coordinate,
		snap,
		snapOnMove,
		snapOnResize
	} from './utils/item';

	import type {
		ItemSize,
		GridItem as GridItemType,
		ItemChangeEvent,
		Size,
		ItemPosition
	} from './types';

	const dispatch = createEventDispatcher<{ change: ItemChangeEvent }>();

	export let id: number;

	export let item: GridItemType;

	export let size: ItemSize;

	export let gap: number;

	let minSize: Size;

	let maxSize: Size | undefined;

	let active = false;

	$: left = coordinate2position(item.x, size.width, gap);
	$: top = coordinate2position(item.y, size.height, gap);

	$: width = coordinate2size(item.w, size.width, gap);
	$: height = coordinate2size(item.h, size.height, gap);

	$: minSize = item.min ?? { w: 1, h: 1 };
	$: maxSize = item.max;

	let min: ItemSize | undefined;

	let max: ItemSize | undefined;

	$: if (minSize) {
		min = {
			width: coordinate2size(minSize.w, size.width, gap),
			height: coordinate2size(minSize.h, size.height, gap)
		};
	}

	$: if (maxSize) {
		max = {
			width: coordinate2size(maxSize.w, size.width, gap),
			height: coordinate2size(maxSize.h, size.height, gap)
		};
	}

	function start() {
		active = true;
	}

	function moving(event: CustomEvent<ItemPosition>) {
		left = event.detail.left;
		top = event.detail.top;
	}

	function resizing(event: CustomEvent<ItemSize>) {
		width = event.detail.width;
		height = event.detail.height;
	}

	function moveend(event: CustomEvent<ItemPosition>) {
		active = false;

		const snaped = snapOnMove({
			left: event.detail.left,
			top: event.detail.top,
			itemSize: size,
			gap
		});

		dispatch('change', {
			id: id,
			x: position2coordinate(snaped.left, size.width, gap),
			y: position2coordinate(snaped.top, size.height, gap),
			w: size2coordinate(width, size.width, gap),
			h: size2coordinate(height, size.height, gap)
		});
	}

	function resizeend(event: CustomEvent<ItemSize>) {
		active = false;

		const snaped = snapOnResize({
			width: event.detail.width,
			height: event.detail.height,
			itemSize: size,
			gap
		});

		dispatch('change', {
			id: id,
			x: position2coordinate(left, size.width, gap),
			y: position2coordinate(top, size.height, gap),
			w: size2coordinate(snaped.width, size.width, gap),
			h: size2coordinate(snaped.height, size.height, gap)
		});
	}
</script>

<div
	class="svelte-grid-extended-grid-item"
	class:svelte-grid-extended-grid-transparent={active}
	use:move={{ position: { left, top } }}
	on:movestart={start}
	on:moving={moving}
	on:moveend={moveend}
	use:resize={{ min, max }}
	on:resizestart={start}
	on:resizing={resizing}
	on:resizeend={resizeend}
	style={`left:${left}px; top:${top}px; width: ${width}px; height: ${height}px;`}
>
	<slot />
</div>

{#if active}
	{@const preview = snap({ left, top, width, height, itemSize: size, gap })}
	<div
		class="svelte-grid-extended-grid-item-preview"
		style={`left:${preview.left}px; top:${preview.top}px;  
		width: ${preview.width}px; height: ${preview.height}px;`}
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
