import type { RequireAtLeastOne } from '$lib/utils/types';

export type Item<T = unknown> = Size &
	Position & {
		id: string;
		min?: Size;
		max?: Size;
	} & (T extends undefined ? { data: T } : { data?: T });

export type Size = { w: number; h: number };

export type Position = { x: number; y: number };

export type ItemPosition = { left: number; top: number };

export type ItemSize = { width: number; height: number };

export type ItemChangeEvent = { id: number; x: number; y: number; w: number; h: number };

export type BreakpointKey = 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs';

export type Breakpoints = Record<BreakpointKey, number>;

export type GridSize = number | RequireAtLeastOne<Breakpoints>;

export type GridDimensions = { cols: number; rows: number };

export type GridParams = {
	itemSize: ItemSize;
	gap: number;
	maxCols: number;
	maxRows: number;
	bounds: boolean;
	items: Item[];
};
