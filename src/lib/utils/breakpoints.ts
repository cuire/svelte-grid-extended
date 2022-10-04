import type { BreakpointKey, Breakpoints, GridSize } from '$lib/types';

export function findGridSize(cols: GridSize, width: number, breakpoints: Breakpoints) {
	if (typeof cols == 'number') {
		return cols;
	}
	return Object.entries(cols).reduce((acc, obj) =>
		Math.abs(width - breakpoints[obj[0] as BreakpointKey]) <
		Math.abs(width - breakpoints[acc[0] as BreakpointKey])
			? obj
			: acc
	)[1];
}
