<script lang="ts">
	import move from './utils/move';
	import resize from './utils/resize';
	import { coordinate2size, calcPosition, snapOnMove, snapOnResize } from './utils/item';
	import { hasCollisions } from './utils/grid';

	import type { Item, ItemSize, ItemPosition, GridParams } from './types';

	export let item: Item;

	export let gridParams: GridParams;

	let active = false;

	$: ({ left, top, width, height } = calcPosition(item, {
		itemSize: gridParams.itemSize,
		gap: gridParams.gap
	}));

	let min: ItemSize;

	let max: ItemSize | undefined;

	$: {
		const minSize = item.min ?? { w: 1, h: 1 };
		min = {
			width: coordinate2size(minSize.w, gridParams.itemSize.width, gridParams.gap),
			height: coordinate2size(minSize.h, gridParams.itemSize.height, gridParams.gap)
		};
	}

	$: if (item.max) {
		max = {
			width: coordinate2size(item.max.w, gridParams.itemSize.width, gridParams.gap),
			height: coordinate2size(item.max.h, gridParams.itemSize.height, gridParams.gap)
		};
	}

	let previewItem: Item = item;

	function start() {
		active = true;
	}

	function moving(event: CustomEvent<ItemPosition>) {
		left = event.detail.left;
		top = event.detail.top;

		if (
			Math.abs(left - item.w * gridParams.itemSize.width) > gridParams.itemSize.width / 8 ||
			Math.abs(top - item.h * gridParams.itemSize.height) > gridParams.itemSize.height / 8
		) {
			const { x, y } = snapOnMove(left, top, previewItem, gridParams);
			if (!hasCollisions({ ...previewItem, x, y }, gridParams.items)) {
				previewItem = { ...previewItem, x, y };
			}
		}
	}

	function resizing(event: CustomEvent<ItemSize>) {
		width = event.detail.width;
		height = event.detail.height;

		if (
			Math.abs(left - item.w * gridParams.itemSize.width) > gridParams.itemSize.width / 8 ||
			Math.abs(top - item.h * gridParams.itemSize.height) > gridParams.itemSize.height / 8
		) {
			const { w, h } = snapOnResize(width, height, previewItem, gridParams);
			if (!hasCollisions({ ...previewItem, w, h }, gridParams.items)) {
				previewItem = { ...previewItem, w, h };
			}
		}
	}

	function end() {
		active = false;
		item.x = previewItem.x;
		item.y = previewItem.y;
		item.w = previewItem.w;
		item.h = previewItem.h;
	}
</script>

<div
	class="svelte-grid-extended-grid-item"
	class:svelte-grid-extended-grid-transparent={active}
	use:move={{ position: { left, top } }}
	on:movestart={start}
	on:moving={moving}
	on:moveend={end}
	use:resize={{ min, max, bounds }}
	on:resizestart={start}
	on:resizing={resizing}
	on:resizeend={end}
	style={`left:${left}px; top:${top}px; width: ${width}px; height: ${height}px;`}
>
	<slot />
</div>

{#if active}
	{@const preview = calcPosition(previewItem, {
		itemSize: gridParams.itemSize,
		gap: gridParams.gap
	})}
	<div
		class="svelte-grid-extended-grid-item-preview"
		style={`left:${preview.left}px; top:${preview.top}px;  
		width: ${preview.width}px; height: ${preview.height}px;`}
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
