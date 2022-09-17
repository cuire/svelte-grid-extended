export default function resize(node: HTMLElement) {
	const bottomRight = document.createElement('div');
	bottomRight.classList.add('svelte-grid-extended-debug-resizer');

	let initialRect = null;
	let initialPos = null;

	node.appendChild(bottomRight);
	bottomRight.addEventListener('mousedown', onMousedown);

	function onMousedown(event: MouseEvent) {
		event.stopPropagation();
		const rect = node.getBoundingClientRect();
		const parent = node.parentElement?.getBoundingClientRect();

		if (!parent) return;

		initialRect = {
			width: rect.width,
			height: rect.height
		};
		initialPos = { x: event.pageX, y: event.pageY };
		(event.target as Element)?.classList.add('selected');
		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onMouseup);
	}

	function onMouseup(event: MouseEvent) {
		event.stopPropagation();
		(event.target as Element).classList.remove('selected');
		initialRect = null;
		initialPos = null;
		window.removeEventListener('mousemove', onMove);
		window.removeEventListener('mousemove', onMousedown);
	}

	function onMove(event: MouseEvent) {
		let delta;
		delta = event.pageX - initialPos.x;
		node.style.width = `${initialRect.width + delta}px`;
		delta = event.pageY - initialPos.y;
		node.style.height = `${initialRect.height + delta}px`;
	}

	return {
		destroy() {
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mousemove', onMousedown);

			node.removeChild(bottomRight);
		}
	};
}
