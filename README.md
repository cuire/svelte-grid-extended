# svelte-grid-extended

> ⚠️ Package currently in alpha, please consider that it **will** be changed in the future.

<!-- plase gif here -->

## Description

Svelte-Grid-Extended is a draggable, resizable ~~and responsive~~ grid layout. The package is created as extended verison of [svelte-grid](<[url](https://github.com/vaheqelyan/svelte-grid)>), and will implement all of its features in future releases.

## Installation

With NPM:

```sh
npm install svelte-grid-extended
```

With Yarn:

```shPackage currently in alpha, please consider that it **will** be changed in the future
yarn add svelte-grid-extended
```

With pnpm:

```sh
pnpm install svelte-grid-extended
```

## Props

List of all available props:

| prop     | description                                                                        | type                                | default  |
| -------- | ---------------------------------------------------------------------------------- | ----------------------------------- | -------- |
| cols     | Grid columns count. If set to 0, grid will grow infinitly. Must be >= 0.           | number                              | 0        |
| rows     | Grid rows count. If set to 0, grid will grow infinitly. Must be >= 0.              | number                              | 0        |
| itemSize | Size of the grid item. If not set, grid will calculate it based on container size. | { width?: number, height?: number } | {}       |
| items    | Array of grid items.                                                               | [Item[]\<T\>](#item-type)           | requried |
| gap      | Gap between grid items.                                                            | number                              | 10       |
| bounds   | Should grid items be bounded by the grid container.                                | boolean                             | false    |

> ⚠️ if `cols` or/and `rows` are set to 0, `itemSize.width` or/and `itemSize.height` must be setted.

### Item[] type

`Item[]<T>` are represented as an array of objects, which must have the following properties:

| prop | description                                                         | type   | default   |
| ---- | ------------------------------------------------------------------- | ------ | --------- |
| id   | Unique id of the item. Used to compare items during collision tests | string | requried  |
| x    | X position of the item in grid units.                               | number | requried  |
| y    | Y position of the item in grid units.                               | number | requried  |
| w    | Width of the item in grid units.                                    | number | requried  |
| h    | Height of the item in grid units.                                   | number | requried  |
| data | Custom attributes. 🦌                                               | T      | undefined |

## Usage

- [Basic](#basic)
- [Static grid](#static-grid)
- [Grid without bounds](#grid-without-bounds)

### Basic

✨ [repl](https://svelte.dev/repl/b3e11826a1b54e05aefeb1f9fead15ac?version=3.52.0)

```svelte
<script lang="ts">
	import Grid from 'svelte-grid-extended';

	const items = [
		{ id: '0', x: 0, y: 0, w: 1, h: 1 },
		{ id: '1', x: 0, y: 1, w: 3, h: 1 }
	];
</script>

<Grid {items} cols={10} rows={10}>
	<div>Content</div>
</Grid>
```

### Static grid

When `cols` or `rows` and `itemsSize` are set, grid becomes static and ignores the size of the container.

It can be set to both dimensions or just one.

Both:
✨ [repl](https://svelte.dev/repl/d38bd9b77ad34f6da278a69fcdc09adf?version=3.52.0)

```svelte
<script lang="ts">
	import Grid from 'svelte-grid-extended';

	const items = [
		{ id: '0', x: 0, y: 0, w: 1, h: 1 },
		{ id: '1', x: 0, y: 1, w: 1, h: 1 }
	];

	const itemSize = { width: 100, height: 40 };
</script>

<Grid {items} {itemSize} cols={10} rows={10}>
	<div>Content</div>
</Grid>
```

Only rows:
✨ [repl](https://svelte.dev/repl/3e92c8de8c924a3d9e0cc340063b4381?version=3.52.0)

```svelte
<script lang="ts">
	import Grid from 'svelte-grid-extended';

	const items = [
		{ id: '0', x: 0, y: 0, w: 1, h: 1 },
		{ id: '1', x: 0, y: 1, w: 1, h: 1 }
	];

	const itemSize = { height: 40 };
</script>

<Grid {items} {itemSize} cols={10} rows={10}>
	<div>Content</div>
</Grid>
```

### Grid without bounds

When `cols` or/and `rows` set to 0, grid grows infinitly. The grid container adapts its width and height to fit all elements.

It can be set to both dimensions or just one.

✨ [repl](https://svelte.dev/repl/858bb48cc8f8477590b8d45ac0c8891e?version=3.52.0)

```svelte
<script lang="ts">
	import Grid from 'svelte-grid-extended';

	const items = [
		{ id: '0', x: 0, y: 0, w: 1, h: 1 },
		{ id: '1', x: 0, y: 1, w: 1, h: 1 }
	];

	const itemSize = { width: 100, height: 40 };
</script>

<Grid {items} {itemSize} cols={0} rows={0}>
	<div>Content</div>
</Grid>
```
