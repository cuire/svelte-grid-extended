type ResizeOptions = {
	min: {
		width: number;
		height: number;
	};
};

export default function resize(node: HTMLElement, options?: ResizeOptions) {
	const bottomRight = document.createElement('div');
	bottomRight.classList.add('svelte-grid-extended-debug-resizer');

	const minSize = options?.min ?? { width: 10, height: 10 };

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
		width = Math.max(width + event.movementX, minSize.width);
		height = Math.max(height + event.movementY, minSize.height);
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
