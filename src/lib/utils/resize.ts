import type { ItemSize } from '$lib/types';

type ResizeOptions = {
	min?: ItemSize;
	max?: ItemSize;
};

export default function resize(node: HTMLElement, options?: ResizeOptions) {
	const bottomRight = document.createElement('div');
	bottomRight.classList.add('svelte-grid-extended-debug-resizer');

	const { min, max } = options ?? {};

	const rect = node.getBoundingClientRect();

	let width = rect.width;
	let height = rect.height;

	node.appendChild(bottomRight);
	bottomRight.addEventListener('mousedown', onMouseDown);

	function onMouseDown(event: MouseEvent) {
		event.stopPropagation();

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
		width += event.movementX;
		height += event.movementY;

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
