import type { ActionReturn } from 'svelte/action';

import type { ItemSize } from '$lib/types';

type ResizeOptions = {
	min?: ItemSize;
	max?: ItemSize;
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

	const { min, max } = options ?? {};

	let width: number;
	let height: number;

	let initialRect: { width: number; height: number };
	let initialPosition = { x: 0, y: 0 };

	node.appendChild(bottomRight);
	bottomRight.addEventListener('mousedown', onMouseDown);

	function onMouseDown(event: MouseEvent) {
		event.stopPropagation();

		initialPosition = {
			x: event.clientX,
			y: event.clientY
		};

		const rect = node.getBoundingClientRect();

		initialRect = {
			width: rect.width,
			height: rect.height
		};

		width = initialRect.width;
		height = initialRect.height;

		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onMouseUp);

		node.dispatchEvent(
			new CustomEvent('resizestart', {
				detail: { width, height }
			})
		);
	}

	function onMouseUp(event: MouseEvent) {
		event.stopPropagation();
		window.removeEventListener('mousemove', onMove);
		window.removeEventListener('mouseup', onMouseUp);

		node.dispatchEvent(
			new CustomEvent('resizeend', {
				detail: { width, height }
			})
		);
	}

	function onMove(event: MouseEvent) {
		width = initialRect.width + event.clientX - initialPosition.x;
		height = initialRect.height + event.clientY - initialPosition.y;

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

			node.removeChild(bottomRight);
		}
	};
}
