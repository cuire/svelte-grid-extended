<script lang="ts">
	import type {
		GridSize,
		ItemSize,
		Breakpoints,
		Collision,
		GridParams,
		LayoutItem,
		PreviewItem
	} from '$lib/types.js';
	import { assertGridOptions } from '$lib/utils/assert.js';
	import { findGridSize } from '$lib/utils/breakpoints.js';
	import { getGridDimensions, hasCollisions } from '$lib/utils/grid.js';
	import { calcPosition, snapOnMove, type SnapGridParams } from '$lib/utils/item.js';
	import type { Action } from 'svelte/action';

	function isPreviewItem(item: Partial<LayoutItem>): item is PreviewItem {
		return (item as PreviewItem).skipRegister === true;
	}

	interface Props {
		/**
		 * Number of columns in the grid.
		 */
		cols?: GridSize;
		/**
		 * Number of rows in the grid.
		 */
		rows?: GridSize;
		/**
		 * Size of the grid items.
		 * @description
		 * If not provided, the grid will try to calculate the size based on the container size.
		 *
		 * You can provide only one of the dimensions, the other will be calculated automatically or you can provide both.
		 * @example
		 * ```svelte
		 * <Grid itemSize={{ width: 100, height: 100 }}>
		 * <Grid itemSize={{ width: 100}}>
		 * ```
		 */
		itemSize?: Partial<ItemSize>;
		/**
		 * Gap between the grid items.
		 */
		gap?: number;
		/**
		 * Breakpoints for the grid. That will be used to calculate the grid size.
		 *
		 * Important: numbers represent container width NOT document width.
		 * @example
		 * ```svelte
		 * <Grid breakpoints={{ xs: 320, sm: 640, md: 768, lg: 1024, xl: 1280, xxl: 1536 }}>
		 * ```
		 */
		breakpoints?: Breakpoints;
		/**
		 * Bound the grid items to the grid container.
		 */
		bounds?: boolean;
		/**
		 * Disable the items interaction.
		 */
		readOnly?: boolean;
		/**
		 * Enable the grid debug mode.
		 * WIP
		 */
		debug?: boolean;
		/**
		 * This option set the collision strategy between grid items. If is not 'none' then it sets 'rows' option to 0.
		 */
		collision?: Collision;
		/**
		 * Auto compress the grid items when programmatically changing grid items.
		 * Only works with 'compress' collision strategy.
		 * @default true
		 */
		autoCompress?: boolean;
	}

	const DEFAULT_PARAMS: Required<Props> = {
		cols: 0,
		rows: 0,
		gap: 10,
		itemSize: {},
		breakpoints: {
			xxl: 1536,
			xl: 1280,
			lg: 1024,
			md: 768,
			sm: 640,
			xs: 320
		},
		bounds: false,
		readOnly: false,
		debug: false,
		collision: 'none',
		autoCompress: true
	};

	class Interaction {
		previewItem: PreviewItem | null = $state(null);

		activeItem: LayoutItem;
		activeItemPosition: any;

		initialPointerPosition = { left: 0, top: 0 };
		pointerShift = { left: 0, top: 0 };
		initialPosition: DOMRect;
		node: HTMLElement;

		gridSettings: GridParams;

		constructor(
			node: HTMLElement,
			event: PointerEvent,
			item: LayoutItem,
			itemPosition: any,
			gridSettings: GridParams
		) {
			console.log(gridSettings);
			this.node = node;
			this.activeItem = item;
			this.gridSettings = gridSettings;
			console.log(this.gridSettings);
			this.activeItemPosition = itemPosition;

			this.initialPointerPosition.left = event.pageX;
			this.initialPointerPosition.top = event.pageY;

			this.initialPosition = node.getBoundingClientRect();

			this.previewItem = { ...item, skipRegister: true };

			this.pointerShift = {
				left: event.pageX - this.initialPosition.left,
				top: event.pageY - this.initialPosition.top
			};

			this.node.setPointerCapture(event.pointerId);
		}

		move(event: PointerEvent) {
			if (!this.gridSettings?.itemSize || !this.previewItem) {
				throw new Error('Grid is not mounted yet');
			}
			let _left = event.pageX - this.initialPointerPosition.left + this.initialPosition.left;
			let _top = event.pageY - this.initialPointerPosition.top + this.initialPosition.top;

			if (this.gridSettings.bounds && this.gridSettings.boundsTo) {
				const parentRect = this.gridSettings.boundsTo.getBoundingClientRect();
				if (_left < parentRect.left) {
					_left = parentRect.left;
				}
				if (_top < parentRect.top) {
					_top = parentRect.top;
				}
				if (_left + this.initialPosition.width > parentRect.right) {
					_left = parentRect.right - this.initialPosition.width;
				}
				if (_top + this.initialPosition.height > parentRect.bottom) {
					_top = parentRect.bottom - this.initialPosition.height;
				}
			}

			this.activeItemPosition.left = _left;
			this.activeItemPosition.top = _top;

			// if (gridSettings.collision === 'none') {
			// 	scroll();
			// }

			// // TODO: throttle this, hasColisions is expensive
			{
				const { x, y } = snapOnMove(
					this.activeItemPosition.left,
					this.activeItemPosition.top,
					this.activeItem,
					this.gridSettings as SnapGridParams
				);
				this.previewItem.x = x;
				this.previewItem.y = y;
				// if (gridSettings.collision !== 'none') {
				// 	movePreviewWithCollisions(x, y);
				// } else {
				if (!hasCollisions({ ...this.previewItem, x, y }, Object.values(this.gridSettings.items))) {
					this.previewItem.x = x;
					this.previewItem.y = y;
				}
				// }
			}
		}

		moveEnd(event: PointerEvent) {
			if (event.button !== 0 || !this.previewItem || !this.gridSettings.itemSize) return;

			this.node.releasePointerCapture(event.pointerId);

			this.activeItem.x = this.previewItem.x;
			this.activeItem.y = this.previewItem.y;
			this.activeItem.w = this.previewItem.w;
			this.activeItem.h = this.previewItem.h;

			const { left, top } = calcPosition(this.activeItem, {
				itemSize: this.gridSettings.itemSize,
				gap: this.gridSettings.gap
			});

			this.activeItemPosition.left = left;
			this.activeItemPosition.top = top;

			console.log('moveEnd');
		}
	}

	export function createGrid(params: Props) {
		const {
			cols,
			rows,
			itemSize,
			gap,
			breakpoints,
			bounds,
			readOnly,
			debug,
			collision,
			autoCompress
		} = {
			...DEFAULT_PARAMS,
			...params
		};

		assertGridOptions({ cols, rows, itemSize, collision });

		let items: Record<string, LayoutItem> = $state({});

		let shouldExpand = $state({ cols: false, rows: false });

		let calculatedGridSize = $derived(getGridDimensions(Object.values(items)));

		const gridSettings = $state<GridParams>({
			cols: typeof cols == 'number' ? cols : 0,
			rows: typeof rows == 'number' ? rows : 0,
			maxCols: Infinity,
			maxRows: Infinity,
			gap,
			items,
			bounds,
			readOnly,
			debug,
			collision
		});

		$effect(() => {
			items;
			if (autoCompress && collision === 'compress') {
				// controller._internalCompress();
			}
		});

		function registerItem(item: LayoutItem): void {
			if (item.id in items) {
				throw new Error(`Item with id ${item.id} already exists`);
			}
			items[item.id] = item;
		}

		function unregisterItem(item: LayoutItem): void {
			delete items[item.id];
		}

		let interaction: Interaction | null = $state(null);

		const grid: Action<HTMLElement> = (node) => {
			node.style.position = 'relative';

			const sizeObserver = new ResizeObserver((entries) => {
				if (entries.length > 1) {
					throw new Error('that observer must have only one entry');
				}
				const entry = entries[0];

				const width = entry.contentRect.width;
				const height = entry.contentRect.height;

				const _cols = findGridSize(cols, width, breakpoints);
				const _rows = findGridSize(rows, height, breakpoints);

				gridSettings.cols = _cols;
				gridSettings.rows = _rows;

				shouldExpand = { cols: _cols === 0, rows: _rows === 0 };

				gridSettings.itemSize = {
					width: itemSize.width ?? (width - (_cols + 1) * gap) / _cols,
					height: itemSize.height ?? (height - (_rows + 1) * gap) / _rows
				};
			});

			sizeObserver.observe(node);

			$effect(() => {
				gridSettings.cols = shouldExpand.cols ? calculatedGridSize.cols : gridSettings.cols;
				gridSettings.maxCols = shouldExpand.cols ? Infinity : gridSettings.cols;
			});

			$effect(() => {
				gridSettings.rows = shouldExpand.rows ? calculatedGridSize.rows : gridSettings.rows;
				gridSettings.maxRows = shouldExpand.rows ? Infinity : gridSettings.rows;
			});

			$effect(() => {
				if (gridSettings.itemSize && rows === 0) {
					node.style.height = `${gridSettings.rows * (gridSettings.itemSize.height + gap + 1)}px`;
				} else {
					node.style.height = '100%';
				}
			});

			$effect(() => {
				if (gridSettings.itemSize && cols === 0) {
					node.style.width = `${gridSettings.cols * (gridSettings.itemSize.width + gap + 1)}px`;
				} else {
					node.style.width = '100%';
				}
			});

			// $effect(() => {
			// 	node.style.width = containerSize?.width ? `${containerSize.width}` : '100%';
			// 	node.style.height = containerSize?.height ? `${containerSize.height}px` : '100%';
			// 	console.log(containerSize);
			// });
		};

		type ItemInput = Partial<LayoutItem>;

		const griditem: Action<HTMLElement, Partial<ItemInput>> = (node, params: ItemInput) => {
			const PREVIEW_ID = 'preview';

			node.style.position = 'absolute';
			node.style.touchAction = 'none';
			node.style.userSelect = 'none';

			const id = isPreviewItem(params) ? PREVIEW_ID : (params.id ?? crypto.randomUUID());

			const item: LayoutItem = $state({
				id,
				x: params.x ?? 0,
				y: params.y ?? 0,
				w: params.w ?? 1,
				h: params.h ?? 1,
				min: { w: 1, h: 1 },
				max: params.max,
				movable: params.movable ?? true,
				resizable: params.resizable ?? true
			});

			$effect(() => {
				node.textContent = JSON.stringify(item);
			});

			$effect(() => {
				params.x = item.x;
				params.y = item.y;
				params.w = item.w;
				params.h = item.h;
			});

			$effect(() => {
				if (params.x !== undefined) item.x = params.x;
				if (params.y !== undefined) item.y = params.y;
				if (params.w !== undefined) item.w = params.w;
				if (params.h !== undefined) item.h = params.h;
			});

			if (item.id !== PREVIEW_ID) {
				registerItem(item);
			}

			let itemPosition = $state({ left: 0, top: 0, width: 0, height: 0 });

			$effect(() => {
				if (gridSettings.itemSize) {
					itemPosition = calcPosition(item, {
						itemSize: gridSettings.itemSize,
						gap: gridSettings.gap
					});
				}
			});

			$effect(() => {
				node.style.left = itemPosition.left + 'px';
				node.style.top = itemPosition.top + 'px';
				node.style.width = itemPosition.width + 'px';
				node.style.height = itemPosition.height + 'px';
			});

			$effect(() => {
				node.style.cursor = item.movable ? 'move' : 'default';
			});

			const moveStart = (event: PointerEvent) => {
				if (event.button !== 0 || !gridSettings) return;
				event.stopPropagation();

				interaction = new Interaction(node, event, item, itemPosition, gridSettings);

				createGridState.active = interaction;

				window.addEventListener('pointermove', move);
				window.addEventListener('pointerup', moveEnd);
			};

			const move = (event: PointerEvent) => {
				if (!interaction) return;
				interaction.move(event);
			};

			const moveEnd = (event: PointerEvent) => {
				if (!interaction) return;

				interaction.moveEnd(event);

				createGridState.active = null;

				window.removeEventListener('pointermove', move);
				window.removeEventListener('pointerup', moveEnd);
			};

			node.addEventListener('pointerdown', moveStart);

			return {
				destroy: () => {
					unregisterItem(item);
				}
			};
		};

		type GridState = {
			grid: Action<HTMLElement>;
			griditem: Action<HTMLElement, ItemInput>;
			active: Interaction | null;
		};

		let createGridState = $state<GridState>({
			grid,
			griditem,
			active: null
		});

		return createGridState;
	}

	const dashboard = createGrid({
		itemSize: { width: 100, height: 100 },
		gap: 10,
		collision: 'compress'
	});

	let item = $state({ id: '1', x: 3, y: 2 });
</script>

<div use:dashboard.grid style="background-color: rgb(200, 200, 200)">
	{#if dashboard.active?.previewItem}
		<div
			use:dashboard.griditem={dashboard.active.previewItem}
			style="background-color: rgb(192, 127, 127)"
		>
			Item
		</div>
	{/if}
	<div
		use:dashboard.griditem={{ id: '2', x: 0, y: 0, w: 1, h: 1 }}
		style="background-color: rgb(150, 150, 150)"
	>
		Item
	</div>

	<div use:dashboard.griditem={item} style="background-color: rgb(150, 150, 150)">Item</div>
</div>

<button
	onclick={() => {
		item.x += 1;
	}}
	>test
</button>

{#if dashboard.active?.previewItem}
	<p>
		{JSON.stringify(dashboard.active.previewItem)}
	</p>
{/if}

<p>
	{JSON.stringify(item)}
</p>
