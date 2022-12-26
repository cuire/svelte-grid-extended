<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import { coordinate2size, calcPosition, snapOnMove, snapOnResize } from './utils/item';
	import { hasCollisions } from './utils/grid';

	import type { LayoutItem, ItemSize, GridParams } from './types';

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
		item.x = previewItem.x;
		item.y = previewItem.y;
		item.w = previewItem.w;
		item.h = previewItem.h;
		dispatch('itemchange', { item });
	}

	// INTERACTION LOGIC

	let itemRef: HTMLElement;

	const initialPointerPosition = { left: 0, top: 0 };

	function initInteraction(event: PointerEvent) {
		active = true;
		initialPointerPosition.left = event.pageX;
		initialPointerPosition.top = event.pageY;
		itemRef.setPointerCapture(event.pointerId);
	}

	function endInteraction(event: PointerEvent) {
		applyPreview();
		active = false;
		initialPointerPosition.left = 0;
		initialPointerPosition.top = 0;
		itemRef.releasePointerCapture(event.pointerId);
	}

	// MOVE ITEM LOGIC

	let initialPosition = { left: 0, top: 0 };

	$: movable = !gridParams.readOnly && item.movable === undefined && item.movable !== false;

	let pointerShift = { left: 0, top: 0 };

	function moveStart(event: PointerEvent) {
		if (!movable) return;
		if (event.button !== 0) return;
		initInteraction(event);
		initialPosition = { left, top };
		// pointerShift = { left: event.pageX - left, top: event.pageY - top };
		window.addEventListener('pointermove', move);
		window.addEventListener('pointerup', moveEnd);
	}

	function move(event: PointerEvent) {
		let _left = event.pageX - initialPointerPosition.left + initialPosition.left;
		let _top = event.pageY - initialPointerPosition.top + initialPosition.top;

		if (gridParams.bounds) {
			const parentRect = gridParams.boundsTo.getBoundingClientRect();
			if (_left < parentRect.left) {
				_left = parentRect.left;
			}
			if (_top < parentRect.top) {
				_top = parentRect.top;
			}
			if (_left + width > parentRect.right) {
				_left = parentRect.right - width;
			}
			if (_top + height > parentRect.bottom) {
				_top = parentRect.bottom - height;
			}
		}

		left = _left;
		top = _top;

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

	function moveEnd(event: PointerEvent) {
		if (event.button !== 0) return;
		endInteraction(event);
		pointerShift = { left: 0, top: 0 };
		window.removeEventListener('pointermove', move);
		window.removeEventListener('pointerup', moveEnd);
	}

	// RESIZE ITEM LOGIC

	let min: ItemSize;

	let max: ItemSize | undefined;

	let initialSize = { width: 0, height: 0 };

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
		if (event.button !== 0) return;
		event.stopPropagation();
		initInteraction(event);
		initialSize = { width, height };
		window.addEventListener('pointermove', resize);
		window.addEventListener('pointerup', resizeEnd);
	}

	function resize(event: PointerEvent) {
		width = event.pageX + initialSize.width - initialPointerPosition.left;
		height = event.pageY + initialSize.height - initialPointerPosition.top;

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

	function resizeEnd(event: PointerEvent) {
		if (event.button !== 0) return;
		endInteraction(event);
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
	bind:this={itemRef}
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
