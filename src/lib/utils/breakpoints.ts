import type { BreakpointKey, Breakpoints, Cols } from '$lib/types';

export function findCols(cols: Cols, width: number, breakpoints: Breakpoints) {
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
