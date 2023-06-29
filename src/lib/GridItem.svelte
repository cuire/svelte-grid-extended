<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	import { coordinate2size, calcPosition, snapOnMove, snapOnResize } from './utils/item';
	import { hasCollisions } from './utils/grid';

	import type { LayoutItem, LayoutChangeDetail, Size, ItemSize } from './types';
	import { getGridContext } from './Grid.svelte';

	const dispatch = createEventDispatcher<{
		itemchange: LayoutChangeDetail;
		previewchange: LayoutChangeDetail;
	}>();

	let gridParams = getGridContext();

	let classes: string | undefined = undefined;

	export { classes as class };

	/**
	 * Unique identifier of the item. Used to identify the item in collision checks.
	 * @default uuidv4
	 *
	 * TODO: crypto.randomUUID() is not supported in non ssl environments
	 */
	export let id: string = crypto.randomUUID();

	export let activeClass: string | undefined = undefined;

	export let previewClass: string | undefined = undefined;

	export let x = 0;

	export let y = 0;

	export let w = 1;

	export let h = 1;

	/**
	 * Minimum size of the item in Grid Units.
	 */
	export let min: Size = { w: 1, h: 1 };

	/**
	 * Maximum size of the item in Grid Units.
	 * If not provided, the item will be able to grow infinitely.
	 */
	export let max: Size | undefined = undefined;

	export let movable = true;

	export let resizable = true;

	let active = false;

	let left: number;

	let top: number;

	let width: number;

	let height: number;

	$: item = {
		id,
		x,
		y,
		w,
		h,
		min,
		max,
		movable,
		resizable
	} as LayoutItem;

	onMount(() => {
		$gridParams.registerItem(item);
		return () => {
			$gridParams.unregisterItem(item);
		};
	});

	// reposition item on grid change
	$: if (!active && $gridParams.itemSize) {
		const newPosition = calcPosition(item, {
			itemSize: $gridParams.itemSize,
			gap: $gridParams.gap
		});
		left = newPosition.left;
		top = newPosition.top;
		width = newPosition.width;
		height = newPosition.height;
	}

	$: previewItem = { ...item };

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
		$gridParams.updateGridDimensions();
	}

	// MOVE ITEM LOGIC

	let initialPosition = { left: 0, top: 0 };

	$: _movable = !$gridParams.readOnly && movable;

	let pointerShift = { left: 0, top: 0 };

	function moveStart(event: PointerEvent) {
		if (event.button !== 0) return;
		initInteraction(event);
		initialPosition = { left, top };
		pointerShift = { left: event.pageX - left, top: event.pageY - top };
		window.addEventListener('pointermove', move);
		window.addEventListener('pointerup', moveEnd);
	}

	function move(event: PointerEvent) {
		if (!$gridParams.itemSize) {
			throw new Error('Grid is not mounted yet');
		}
		let _left = event.pageX - initialPointerPosition.left + initialPosition.left;
		let _top = event.pageY - initialPointerPosition.top + initialPosition.top;

		if ($gridParams.bounds && $gridParams.boundsTo) {
			const parentRect = $gridParams.boundsTo.getBoundingClientRect();
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

		window.scroll({
			left: left - window.innerWidth / 2,
			top: top - window.innerHeight / 2,
			behavior: 'smooth'
		});

		// TODO: throttle this, hasColisions is expensive
		{
			const { x, y } = snapOnMove(left, top, previewItem, $gridParams);
			if (!hasCollisions({ ...previewItem, x, y }, Object.values($gridParams.items))) {
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

	let initialSize = { width: 0, height: 0 };

	let minSize: ItemSize | undefined;

	let maxSize: ItemSize | undefined;

	$: if ($gridParams.itemSize) {
		minSize = {
			width: coordinate2size(min.w, $gridParams.itemSize.width, $gridParams.gap),
			height: coordinate2size(min.h, $gridParams.itemSize.height, $gridParams.gap)
		};
	}

	$: if ($gridParams.itemSize && max) {
		maxSize = {
			width: coordinate2size(max.w, $gridParams.itemSize.width, $gridParams.gap),
			height: coordinate2size(max.h, $gridParams.itemSize.height, $gridParams.gap)
		};
	}

	$: _resizable = !$gridParams.readOnly && item.resizable;

	function resizeStart(event: PointerEvent) {
		if (event.button !== 0) return;
		event.stopPropagation();
		initInteraction(event);
		initialSize = { width, height };
		window.addEventListener('pointermove', resize);
		window.addEventListener('pointerup', resizeEnd);
	}

	function resize(event: PointerEvent) {
		if (!$gridParams.itemSize) {
			throw new Error('Grid is not mounted yet');
		}

		width = event.pageX + initialSize.width - initialPointerPosition.left;
		height = event.pageY + initialSize.height - initialPointerPosition.top;

		if ($gridParams.bounds && $gridParams.boundsTo) {
			const parentRect = $gridParams.boundsTo.getBoundingClientRect();
			if (width + left > parentRect.width) {
				width = parentRect.width - left;
			}
			if (height + top > parentRect.height) {
				height = parentRect.height - top;
			}
		}

		if (minSize) {
			width = Math.max(width, minSize.width);
			height = Math.max(height, minSize.height);
		}
		if (maxSize) {
			width = Math.min(width, maxSize.width);
			height = Math.min(height, maxSize.height);
		}

		window.scroll({
			left: left - window.innerWidth / 2,
			top: top - window.innerHeight / 2,
			behavior: 'smooth'
		});

		// TODO: throttle this, hasColisions is expensive
		{
			const { w, h } = snapOnResize(width, height, previewItem, $gridParams);
			if (!hasCollisions({ ...previewItem, w, h }, Object.values($gridParams.items))) {
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
	on:pointerdown={_movable && !$$slots.moveHandle ? moveStart : null}
	style={`position: absolute; left:${left}px; top:${top}px; width: ${width}px; height: ${height}px; 
			${_movable && !$$slots.moveHandle ? 'cursor: move;' : ''} touch-action: none; user-select: none;`}
	bind:this={itemRef}
>
	{#if _movable}
		<slot name="moveHandle" {moveStart} />
	{/if}

	<slot />

	{#if _resizable}
		<slot name="resizeHandle" {resizeStart}>
			<div class="resizer-default" on:pointerdown={resizeStart} />
		</slot>
	{/if}
</div>

{#if active && $gridParams.itemSize}
	{@const preview = calcPosition(previewItem, {
		itemSize: $gridParams.itemSize,
		gap: $gridParams.gap
	})}
	<div
		class={previewClass ?? ''}
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
