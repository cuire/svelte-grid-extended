type MoveOptions = {
	initialPosition?: {
		left: number;
		top: number;
	};
};

export default function move(node: HTMLElement, options?: MoveOptions) {
	let left = options?.initialPosition?.left ?? 0;
	let top = options?.initialPosition?.top ?? 0;

	node.style.position = 'absolute';
	node.style.top = `${top}px`;
	node.style.left = `${left}px`;
	node.style.cursor = 'move';
	node.style.userSelect = 'none';

	function onMouseDown() {
		node.classList.add('selected');
		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onMouseUp);

		node.dispatchEvent(
			new CustomEvent('movestart', {
				detail: { left, top }
			})
		);
	}

	function onMouseUp() {
		node.classList.remove('selected');
		window.removeEventListener('mousemove', onMove);
		window.removeEventListener('mouseup', onMouseUp);

		node.dispatchEvent(
			new CustomEvent('moveend', {
				detail: { left, top }
			})
		);
	}

	function onMove(event: MouseEvent) {
		left += event.movementX;
		top += event.movementY;
		node.style.top = `${top}px`;
		node.style.left = `${left}px`;

		node.dispatchEvent(
			new CustomEvent('move', {
				detail: { left, top }
			})
		);
	}

	node.addEventListener('mousedown', onMouseDown);

	return {
		destroy() {
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onMouseUp);
		}
	};
}
