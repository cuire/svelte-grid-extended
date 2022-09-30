import type { ActionReturn } from 'svelte/action';

type MoveOptions = {
	initialPosition?: {
		left: number;
		top: number;
	};
	bounds?: boolean;
};

type MoveAtributes = {
	'on:movestart': MoveEventHandler;
	'on:moving': MoveEventHandler;
	'on:moveend': MoveEventHandler;
};

type MoveEventHandler = (e: CustomEvent<MoveEvent>) => void;

export type MoveEvent = {
	left: number;
	top: number;
};

export default function move(
	node: HTMLElement,
	options?: MoveOptions
): ActionReturn<MoveOptions, MoveAtributes> {
	const { bounds = false } = options ?? {};

	let left = options?.initialPosition?.left ?? 0;
	let top = options?.initialPosition?.top ?? 0;

	node.style.position = 'absolute';
	node.style.top = `${top}px`;
	node.style.left = `${left}px`;
	node.classList.add('svelte-grid-extended-grid-item');

	let initialPosition = { left: 0, top: 0 };

	let parentRect: DOMRect | undefined;

	let rect: DOMRect;

	function onMouseDown(event: MouseEvent | TouchEvent) {
		node.classList.add('selected');

		const { clientX, clientY } = event instanceof MouseEvent ? event : event.touches[0];

		initialPosition = {
			left: node.offsetLeft - clientX,
			top: node.offsetTop - clientY
		};

		parentRect = node.parentElement?.getBoundingClientRect();
		rect = node.getBoundingClientRect();

		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onMouseUp);
		window.addEventListener('touchmove', onMove);
		window.addEventListener('touchend', onMouseUp);

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
		window.removeEventListener('touchmove', onMove);
		window.removeEventListener('touchend', onMouseUp);

		node.dispatchEvent(
			new CustomEvent('moveend', {
				detail: { left, top }
			})
		);
	}

	function onMove(event: MouseEvent | TouchEvent) {
		const { clientX, clientY } = event instanceof MouseEvent ? event : event.touches[0];

		left = clientX + initialPosition.left;
		top = clientY + initialPosition.top;

		if (bounds && parentRect) {
			if (left < parentRect.left) {
				left = parentRect.left;
			}
			if (top < parentRect.top) {
				top = parentRect.top;
			}
			if (left + rect.width > parentRect.right) {
				left = parentRect.right - rect.width;
			}
			if (top + rect.height > parentRect.bottom) {
				top = parentRect.bottom - rect.height;
			}
		}

		node.style.top = `${top}px`;
		node.style.left = `${left}px`;

		node.dispatchEvent(
			new CustomEvent('moving', {
				detail: { left, top }
			})
		);
	}

	node.addEventListener('mousedown', onMouseDown);
	node.addEventListener('touchstart', onMouseDown);

	return {
		destroy() {
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onMouseUp);
			window.removeEventListener('touchmove', onMove);
			window.removeEventListener('touchend', onMouseUp);
		}
	};
}
