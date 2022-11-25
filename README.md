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

### Main props

| prop     | description                                                                        | type                                | default  |
| -------- | ---------------------------------------------------------------------------------- | ----------------------------------- | -------- |
| cols     | Grid columns count. If set to 0, grid will grow infinitly. Must be >= 0.           | number                              | 0        |
| rows     | Grid rows count. If set to 0, grid will grow infinitly. Must be >= 0.              | number                              | 0        |
| itemSize | Size of the grid item. If not set, grid will calculate it based on container size. | { width?: number, height?: number } | {}       |
| items    | Array of grid items.                                                               | [Layout\<T\>](#layout-type)         | requried |
| gap      | Gap between grid items.                                                            | number                              | 10       |
| bounds   | Should grid items be bounded by the grid container.                                | boolean                             | false    |
| readonly | If true disables interaction with grid items.                                      | boolean                             | false    |

> ⚠️ if `cols` or/and `rows` are set to 0, `itemSize.width` or/and `itemSize.height` must be setted.

### Layout

`Layout<T>` are represented as an array of objects, items of which must have the following properties:

| prop      | description                                                         | type    | default   |
| --------- | ------------------------------------------------------------------- | ------- | --------- |
| id        | Unique id of the item. Used to compare items during collision tests | string  | requried  |
| x         | X position of the item in grid units.                               | number  | requried  |
| y         | Y position of the item in grid units.                               | number  | requried  |
| w         | Width of the item in grid units.                                    | number  | requried  |
| h         | Height of the item in grid units.                                   | number  | requried  |
| movable   | If true, item can be moved by user.                                 | boolean | true      |
| resizable | If true, item can be resized by user.                               | boolean | true      |
| data      | Custom attributes. 🦌                                               | T       | undefined |

### Style related props:

Component can be styled with css framework of your choice or with global classes. To do so, you can use the following props:

- `class` - class name for grid container.
- `itemClass` - class name for grid item.
- `itemActiveClass` - class name that applies when item is currently being dragged or resized. By default, it is used to make active grid item transparent.
- `itemPreviewClass` - class name for preview where item will be placed after interaction.
- `resizerClass` - class name for item's resize handle.

To understand how to use these props, look at `<Grid />` component simplified structure.

> 📄 `active` is variable that indicates if grid item is currently being dragged or resized:

```svelte
<!-- Grid -->
<div class={class}>
	<!-- GridItem -->
	<div class={itemClass} class:itemActiveClass={active}>
		<slot />
		<!-- Resizer -->
		<div class={resizerClass} />
		<!-- Resizer -->
	</div>

	{#if active}
		<!-- GridItemGhost -->
		<div class={itemPreviewClass} />
	{/if}

	<!-- /GridItem -->
</div>
<!-- /Grid -->
```

## Usage

- [Basic](#basic)
- [Static grid](#static-grid)
- [Grid without bounds](#grid-without-bounds)
- [Styling](#styling)
- [Disable interactions](#disable-interactions)

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

### Styling

Grid can be styled with classes passed to various props. Check [Style related props](#style-related-props) section for more info.

✨ [repl](https://svelte.dev/repl/b158b6fbb2234241b7ea9737b7e2fc24?version=3.53.1)

```svelte
<script lang="ts">
	import Grid from 'svelte-grid-extended';

	const items = [
		{ id: '0', x: 0, y: 0, w: 1, h: 1 },
		{ id: '1', x: 0, y: 1, w: 1, h: 1 }
	];
</script>

<Grid
	{items}
	class="grid-container"
	itemClass="grid-item"
	itemActiveClass="grid-item-active"
	itemPreviewClass="bg-red-500 rounded"
>
	<div>Content</div>
</Grid>

<style>
	:global(.grid-container) {
		opacity: 0.7;
	}

	:global(.grid-item) {
		transition: width 4s, height 4s;
		transition: transform 4s, opacity 4s;
	}

	:global(.grid-item-active) {
		opacity: 0.1;
	}

	/* tailwind classes */
	:global(.bg-red-500) {
		background-color: rgb(202, 33, 33);
	}

	:global(.rounded) {
		border-radius: 0.25rem;
	}
</style>
```

### Disable interactions

To disable interactions, set `readOnly` prop to `true`. Or set `movable` and/or `resizable` to `false` on specific item.

Read Only grid: ✨ [repl](https://svelte.dev/repl/29ce85a23a714c51b6638f12f5ecdd7c?version=3.53.1)

```svelte
<script lang="ts">
	import Grid from 'svelte-grid-extended';

	const items = [
		{ id: '0', x: 0, y: 0, w: 1, h: 1 },
		{ id: '1', x: 0, y: 1, w: 1, h: 1 }
	];
</script>

<Grid {items} cols={10} rows={10} readOnly>
	<div>Content</div>
</Grid>
```

Make item non-interactive: ✨ [repl](https://svelte.dev/repl/1b3b9b9b9b9b9b9b9b9b9b9b9b9b9b9b?version=3.53.1)

```svelte
<script lang="ts">
	import Grid from 'svelte-grid-extended';

	const items = [
		{ id: '0', x: 0, y: 0, w: 1, h: 1, movable: false },
		{ id: '1', x: 0, y: 1, w: 1, h: 1, movable: false, resizable: false }
	];
</script>

<Grid {items} cols={10} rows={10}>
	<div>Content</div>
</Grid>
```
