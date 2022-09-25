export type GridItem = Size &
	Position & {
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

export type Cols = number | Pick<Breakpoints, 'md'>;
