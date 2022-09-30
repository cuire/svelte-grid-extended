import type { ActionReturn } from 'svelte/action';

import type { ItemSize } from '$lib/types';

type ResizeOptions = {
	min?: ItemSize;
	max?: ItemSize;
	bounds?: boolean;
};

type ResizeAtributes = {
	'on:resizestart': ResizeEventHandler;
	'on:resizing': ResizeEventHandler;
	'on:resizeend': ResizeEventHandler;
};

type ResizeEventHandler = (e: CustomEvent<ResizeEvent>) => void;

export type ResizeEvent = {
	width: number;
	height: number;
};

export default function resize(
	node: HTMLElement,
	options?: ResizeOptions
): ActionReturn<ResizeOptions, ResizeAtributes> {
	const bottomRight = document.createElement('div');
	bottomRight.classList.add('svelte-grid-extended-debug-resizer');

	const { min, max, bounds = false } = options ?? {};

	let width: number;
	let height: number;

	let initialRect: { width: number; height: number };
	let initialPosition = { x: 0, y: 0 };

	let parentRect: DOMRect | undefined;

	let rect: DOMRect;

	node.appendChild(bottomRight);
	bottomRight.addEventListener('mousedown', onMouseDown);
	bottomRight.addEventListener('touchstart', onMouseDown);

	function onMouseDown(event: MouseEvent | TouchEvent) {
		event.stopPropagation();

		const { clientX, clientY } = event instanceof MouseEvent ? event : event.touches[0];

		initialPosition = { x: clientX, y: clientY };

		parentRect = node.parentElement?.getBoundingClientRect();
		rect = node.getBoundingClientRect();

		initialRect = {
			width: rect.width,
			height: rect.height
		};

		width = initialRect.width;
		height = initialRect.height;

		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onMouseUp);
		window.addEventListener('touchmove', onMove);
		window.addEventListener('touchend', onMouseUp);

		node.dispatchEvent(
			new CustomEvent('resizestart', {
				detail: { width, height }
			})
		);
	}

	function onMouseUp(event: MouseEvent | TouchEvent) {
		event.stopPropagation();
		window.removeEventListener('mousemove', onMove);
		window.removeEventListener('mouseup', onMouseUp);
		window.removeEventListener('touchmove', onMove);
		window.removeEventListener('touchend', onMouseUp);

		node.dispatchEvent(
			new CustomEvent('resizeend', {
				detail: { width, height }
			})
		);
	}

	function onMove(event: MouseEvent | TouchEvent) {
		const { clientX, clientY } = event instanceof MouseEvent ? event : event.touches[0];

		width = initialRect.width + clientX - initialPosition.x;
		height = initialRect.height + clientY - initialPosition.y;

		if (bounds && parentRect) {
			if (width + rect.left > parentRect.width) {
				width = parentRect.width - rect.left;
			}
			if (height + rect.top > parentRect.height) {
				height = parentRect.height - rect.top;
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

		node.style.width = `${width}px`;
		node.style.height = `${height}px`;

		node.dispatchEvent(
			new CustomEvent('resizing', {
				detail: { width, height }
			})
		);
	}

	return {
		destroy() {
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onMouseUp);
			window.removeEventListener('touchmove', onMove);
			window.removeEventListener('touchend', onMouseUp);

			node.removeChild(bottomRight);
		}
	};
}
