<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import move from './utils/move';
	import resize from './utils/resize';
	import { coordinate2size, calcPosition, snapOnMove, snapOnResize } from './utils/item';
	import { hasCollisions } from './utils/grid';

	import type { LayoutItem, ItemSize, ItemPosition, GridParams } from './types';

	const dispatch = createEventDispatcher<{
		itemchange: { item: LayoutItem };
		previewchange: { item: LayoutItem };
	}>();

	export let item: LayoutItem;

	export let gridParams: GridParams;

	let classes: string | undefined = undefined;

	export { classes as class };

	export let activeClass: string | undefined = undefined;

	export let previewClass: string | undefined = undefined;

	export let resizerClass = 'resizer-default';

	let active = false;

	let left: number;

	let top: number;

	let width: number;

	let height: number;

	$: if (!active) {
		const newPosition = calcPosition(item, {
			itemSize: gridParams.itemSize,
			gap: gridParams.gap
		});
		left = newPosition.left;
		top = newPosition.top;
		width = newPosition.width;
		height = newPosition.height;
	}

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

	let previewItem: LayoutItem = item;

	$: previewItem, dispatch('previewchange', { item: previewItem });

	const movable = !gridParams.readOnly && item.movable === undefined && item.movable !== false;

	const resizable =
		!gridParams.readOnly && item.resizable === undefined && item.resizable !== false;

	const moveAction = movable
		? move
		: () => {
				// do nothing
		  };

	const resizeAction = resizable
		? resize
		: () => {
				// do nothing
		  };

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
		dispatch('itemchange', { item });
	}
</script>

<div
	class={`${classes} ${active ? activeClass : ''}`}
	class:item-default={!classes}
	class:active-default={!activeClass && active}
	use:moveAction={{ position: { left, top } }}
	on:movestart={start}
	on:moving={moving}
	on:moveend={end}
	use:resizeAction={{ min, max, resizerClass, bounds: gridParams.bounds }}
	on:resizestart={start}
	on:resizing={resizing}
	on:resizeend={end}
	style={`position: absolute; left:${left}px; top:${top}px; width: ${width}px; height: ${height}px; 
			${movable ? 'cursor: move;' : ''} touch-action: none; user-select: none;`}
>
	<slot />
</div>

{#if active}
	{@const preview = calcPosition(previewItem, {
		itemSize: gridParams.itemSize,
		gap: gridParams.gap
	})}
	<div
		class={previewClass}
		class:item-preview-default={!previewClass}
		style={`position: absolute; left:${preview.left}px; top:${preview.top}px;  
		width: ${preview.width}px; height: ${preview.height}px; z-index: -10;`}
	/>
{/if}

<style>
	.item-default {
		transition: width 0.2s, height 0.2s;
		transition: transform 0.2s, opacity 0.2s;
	}
	.active-default {
		opacity: 0.7;
	}
	.item-preview-default {
		background-color: rgb(192, 127, 127);
		transition: all 0.2s;
	}
</style>
