<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { coordinate2size, calcPosition, snapOnMove, snapOnResize } from './utils/item';
	import { hasCollisions, getCollisions } from './utils/grid';
	import type { LayoutItem, ItemSize, GridParams, LayoutChangeDetail } from './types';

	type T = $$Generic;

	const dispatch = createEventDispatcher<{
		itemchange: LayoutChangeDetail<T>;
		previewchange: LayoutChangeDetail<T>;
	}>();

	export let item: LayoutItem<T>;

	export let gridParams: GridParams;

	let classes: string | undefined = undefined;

	export { classes as class };

	export let activeClass: string | undefined = undefined;

	export let previewClass: string | undefined = undefined;

	export let resizerClass: string | undefined = undefined;

	export let collision: boolean | undefined = undefined;

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

	let previewItem: LayoutItem<T> = item;

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

		if (!collision) {
			window.scroll({
				left: left - window.innerWidth / 2,
				top: top - window.innerHeight / 2,
				behavior: 'smooth'
			});
		}

		if (
			Math.abs(left - item.w * gridParams.itemSize.width) > gridParams.itemSize.width / 8 ||
			Math.abs(left - item.w * gridParams.itemSize.width) > gridParams.itemSize.width / 8 ||
			Math.abs(top - item.h * gridParams.itemSize.height) > gridParams.itemSize.height / 8
		) {
			const { x, y } = snapOnMove(left, top, previewItem, gridParams);

			if (collision) {
				movePreviewWithCollisions(x, y);
			} else {
				if (!hasCollisions({ ...previewItem, x, y }, gridParams.items)) {
					previewItem = { ...previewItem, x, y };
					dispatch('itemchange', { item: previewItem as LayoutItem<T> });
				}
			}
		}
	}

	function movePreviewWithCollisions(x: number, y: number) {
		let newY = y;
		const itemsExceptPreview = gridParams.items.filter((item) => item.id != previewItem.id);
		while (newY >= 0) {
			const collItems = getCollisions({ ...previewItem, x, y: newY }, gridParams.items);
			if (collItems.length > 0) {
				const sortedItems = collItems.sort((a, b) => b.y - a.y);
				let moved = false;
				sortedItems.forEach((sortItem) => {
					//if you want to fix sensitivity of grid, change this statement
					if (y + previewItem.h / 2 >= sortItem.y + sortItem.h / 2) {
						moved = true;
						newY = sortItem.y + sortItem.h;
						sortedItems.forEach((item) => {
							if (
								!hasCollisions({ ...item, y: item.y - previewItem.h }, itemsExceptPreview) &&
								item.y - previewItem.h >= 0
							) {
								item.y -= previewItem.h;
							}
						});
						return false;
					}
				});
				if (!moved) {
					newY = previewItem.y;
				}
				break;
			}
			newY--;
		}
		if (newY < 0 || y === 0) {
			newY = 0;
		}
		const positionChanged = x != previewItem.x || newY != previewItem.y;
		previewItem = { ...previewItem, x, y: newY };
		if (positionChanged) {
			compressItems();
			applyPreview();
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

		if (!collision) {
			window.scroll({
				left: left - window.innerWidth / 2,
				top: top - window.innerHeight / 2,
				behavior: 'smooth'
			});
		}

		if (
			Math.abs(left - item.w * gridParams.itemSize.width) > gridParams.itemSize.width / 8 ||
			Math.abs(top - item.h * gridParams.itemSize.height) > gridParams.itemSize.height / 8
		) {
			const { w, h } = snapOnResize(width, height, previewItem, gridParams);
			if (collision) {
				resizePreviewWithCollisions(w, h);
			} else {
				if (!hasCollisions({ ...previewItem, w, h }, gridParams.items)) {
					previewItem = { ...previewItem, w, h };
				}
			}
		}
	}

	function resizePreviewWithCollisions(w: number, h: number) {
		const sizeChanged = w != previewItem.w || h != previewItem.h;
		if (sizeChanged) {
			const hGap = h - previewItem.h;
			previewItem = { ...previewItem, w, h };
			applyPreview();
			const collItems = getCollisions({ ...previewItem, w, h: 9999 }, gridParams.items);
			collItems.forEach((item) => {
				item.y += hGap;
				dispatch('itemchange', { item: item as LayoutItem<T> });
			});
			compressItems();
		}
	}

	function resizeEnd(event: PointerEvent) {
		if (event.button !== 0) return;
		endInteraction(event);
		window.removeEventListener('pointermove', resize);
		window.removeEventListener('pointerup', resizeEnd);
	}

	function compressItems() {
		const sortedItems = [...gridParams.items].sort((a, b) => a.y - b.y);
		sortedItems.reduce(
			(accItem, currentItem) => {
				if (currentItem.id === previewItem.id) {
					//if previewItem do nothing
				} else if (previewItem.y < currentItem.y + currentItem.h) {
					//compress items above previewItem
					const maxY =
						currentItem.y >= previewItem.y
							? currentItem.y + previewItem.h + 1
							: previewItem.y + currentItem.h + 1;
					let newY = maxY;
					while (newY >= 0) {
						if (hasCollisions({ ...currentItem, y: newY }, accItem)) {
							break;
						}
						newY--;
					}
					currentItem.y = newY + 1;
					dispatch('itemchange', { item: currentItem as LayoutItem<T> });
					accItem.push(currentItem as LayoutItem<T>);
				} else {
					//compress items below previewItem
					let newY = currentItem.y;
					while (newY >= 0) {
						if (hasCollisions({ ...currentItem, y: newY }, accItem)) {
							break;
						}
						newY--;
					}
					if (newY < currentItem.y && newY > 0) {
						currentItem.y = newY + 1;
					}
					dispatch('itemchange', { item: currentItem as LayoutItem<T> });
					accItem.push(currentItem as LayoutItem<T>);
				}
				return accItem;
			},
			[previewItem]
		);
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
