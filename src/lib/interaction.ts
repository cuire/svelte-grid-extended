import type { LayoutItem, GridParams } from "./types.js";

class Interaction {
    previewItem: LayoutItem | null = $state(null);

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

        this.previewItem = { ...item };

        this.pointerShift = {
            left: event.pageX - this.initialPosition.left,
            top: event.pageY - this.initialPosition.top
        };

        this.node.setPointerCapture(event.pointerId);
    }

    destroy(event: PointerEvent) {
        this.node.releasePointerCapture(event.pointerId);
    }

    this.move = this.moveHandler.bind(this);

    moveHandler(event: PointerEvent) {
        if (!this.gridSettings?.itemSize) {
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
            // const { x, y } = snapOnMove(
            // 	itemPosition.left,
            // 	itemPosition.top,
            // 	item,
            // 	gridSettings as SnapGridParams
            // );
            // item.x = x;
            // item.y = y;
            // if (gridSettings.collision !== 'none') {
            // 	movePreviewWithCollisions(x, y);
            // } else {
            // 	if (!hasCollisions({ ...previewItem, x, y }, Object.values(gridSettings.items))) {
            // 		previewItem = { ...previewItem, x, y };
            // 	}
            // }
        }
    }

    endInteraction(event: PointerEvent) {
        // applyPreview();
        // itemRef.releasePointerCapture(event.pointerId);
        // $gridParams.updateGrid();
    }

    moveEnd(event: PointerEvent) {
        if (event.button !== 0) return;
        this.destroy(event);
        window.removeEventListener('pointermove', this.move);
        window.removeEventListener('pointerup', this.moveEnd);
    }
}