import { writable } from 'svelte/store';
import type { GridParams } from './types';

export const gridSettings = writable<GridParams | undefined>(undefined);
