export type GridItemType = { x: number; y: number; w: number; h: number };

export type CellPositionType = { left: number; top: number };

export type CellSizeType = { width: number; height: number };

export type ItemChangeDetails = { id: number; x: number; y: number; w: number; h: number };

export type BreakPointKey = 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs';

export type BreakPoints = Record<BreakPointKey, number>;

export type Cols = number | Pick<BreakPoints, 'md'>;
