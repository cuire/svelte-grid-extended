<script lang="ts">
	import { createEventDispatcher } from 'svelte';

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

	export let resizerClass: string | undefined = undefined;

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

	let previewItem: LayoutItem = item;

	$: previewItem, dispatch('previewchange', { item: previewItem });

	function applyPreview() {
		active = false;
		item.x = previewItem.x;
		item.y = previewItem.y;
		item.w = previewItem.w;
		item.h = previewItem.h;
		dispatch('itemchange', { item });
	}

	// MOVE ITEM LOGIC

	$: movable = !gridParams.readOnly && item.movable === undefined && item.movable !== false;

	function moveStart(event: PointerEvent) {
		if (!movable) return;
		if (event.button !== 0) return;
		active = true;
		window.addEventListener('pointermove', move);
		window.addEventListener('pointerup', moveEnd);
	}

	function move(event: PointerEvent) {
		left += event.movementX;
		top += event.movementY;

		if (gridParams.bounds) {
			const parentRect = gridParams.boundsTo.getBoundingClientRect();
			if (left < parentRect.left) {
				left = parentRect.left;
			}
			if (top < parentRect.top) {
				top = parentRect.top;
			}
			if (left + width > parentRect.right) {
				left = parentRect.right - width;
			}
			if (top + height > parentRect.bottom) {
				top = parentRect.bottom - height;
			}
		}

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

	function moveEnd() {
		applyPreview();
		window.removeEventListener('pointermove', move);
		window.removeEventListener('pointerup', moveEnd);
	}

	// RESIZE ITEM LOGIC

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

	$: resizable = !gridParams.readOnly && item.resizable === undefined && item.resizable !== false;

	function resizeStart(event: PointerEvent) {
		event.stopPropagation();
		if (event.button !== 0) return;
		if (!resizable) return;
		active = true;
		window.addEventListener('pointermove', resize);
		window.addEventListener('pointerup', resizeEnd);
	}

	function resize(event: PointerEvent) {
		width += event.movementX;
		height += event.movementY;

		if (gridParams.bounds) {
			const parentRect = gridParams.boundsTo.getBoundingClientRect();
			if (width + left > parentRect.width) {
				width = parentRect.width - left;
			}
			if (height + top > parentRect.height) {
				height = parentRect.height - top;
			}
		}

		if (min) {
			width = Math.max(width, min.width);
			height = Math.max(height, min.height);
		}
		if (max) {
			width = Math.min(width, max.width);
			height = Math.min(height, max.height);
		}

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

	function resizeEnd() {
		applyPreview();
		window.removeEventListener('pointermove', resize);
		window.removeEventListener('pointerup', resizeEnd);
	}
</script>

<div
	class={`${classes} ${active ? activeClass : ''}`}
	class:item-default={!classes}
	class:active-default={!activeClass && active}
	on:pointerdown={moveStart}
	style={`position: absolute; left:${left}px; top:${top}px; width: ${width}px; height: ${height}px; 
			${movable ? 'cursor: move;' : ''} touch-action: none; user-select: none;`}
>
	<slot />
	{#if resizable}
		<slot name="resizeHandle">
			<div
				class={resizerClass}
				class:resizer-default={!resizerClass}
				on:pointerdown={resizeStart}
			/>
		</slot>
	{/if}
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

	.resizer-default {
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
	.resizer-default::after {
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
