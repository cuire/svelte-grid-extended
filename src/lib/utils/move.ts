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
	node.style.cursor = 'move';
	node.style.userSelect = 'none';

	let initialPosition = { left: 0, top: 0 };

	let parentRect: DOMRect | undefined;

	let rect: DOMRect;

	function onMouseDown(event: MouseEvent) {
		node.classList.add('selected');

		initialPosition = {
			left: node.offsetLeft - event.clientX,
			top: node.offsetTop - event.clientY
		};

		parentRect = node.parentElement?.getBoundingClientRect();
		rect = node.getBoundingClientRect();

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
		left = event.clientX + initialPosition.left;
		top = event.clientY + initialPosition.top;

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

	return {
		destroy() {
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onMouseUp);
		}
	};
}
