import type { RequireAtLeastOne } from '$lib/utils/types';

export type Item = Size &
	Position & {
		id: string;
		min?: Size;
		max?: Size;
	};

export type Size = { w: number; h: number };

export type Position = { x: number; y: number };

export type ItemPosition = { left: number; top: number };

export type ItemSize = { width: number; height: number };

export type ItemChangeEvent = { id: number; x: number; y: number; w: number; h: number };

export type BreakpointKey = 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs';

export type Breakpoints = Record<BreakpointKey, number>;

export type GridSize = number | RequireAtLeastOne<Breakpoints>;

export type GridParams = {
	itemSize: ItemSize;
	gap: number;
	cols: number;
	rows: number;
	bounds: boolean;
	items: Item[];
};
