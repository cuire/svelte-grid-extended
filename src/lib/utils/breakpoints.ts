import type { BreakPointKey, BreakPoints, Cols } from '$lib/types';

export function findCols(cols: Cols, width: number, breakpoints: BreakPoints) {
	if (typeof cols == 'number') {
		return cols;
	}
	return Object.entries(cols).reduce((acc, obj) =>
		Math.abs(width - breakpoints[obj[0] as BreakPointKey]) <
		Math.abs(width - breakpoints[acc[0] as BreakPointKey])
			? obj
			: acc
	)[1];
}
