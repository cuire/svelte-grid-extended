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
pnpm add svelte-grid-extended
```

## Props

### Main props

| prop      | description                                                                        | type                                | default  |
| --------- | ---------------------------------------------------------------------------------- | ----------------------------------- | -------- |
| cols      | Grid columns count. If set to 0, grid will grow infinitly. Must be >= 0.           | number                              | 0        |
| rows      | Grid rows count. If set to 0, grid will grow infinitly. Must be >= 0.              | number                              | 0        |
| itemSize  | Size of the grid item. If not set, grid will calculate it based on container size. | { width?: number, height?: number } | {}       |
| items     | Array of grid items.                                                               | [Layout\<T\>](#layout-type)         | required |
| gap       | Gap between grid items.                                                            | number                              | 10       |
| bounds    | Should grid items be bounded by the grid container.                                | boolean                             | false    |
| readonly  | If true disables interaction with grid items.                                      | boolean                             | false    |
| collision | Collision behavior of grid items. Can be `none`, `push`, or `compress`.            | string                              | `none`   |

> ⚠️ if `cols` or/and `rows` are set to 0, `itemSize.width` or/and `itemSize.height` must be setted.

### Layout

`Layout<T>` are represented as an array of objects, items of which must have the following properties:

| prop      | description                                                         | type    | default   |
| --------- | ------------------------------------------------------------------- | ------- | --------- |
| id        | Unique id of the item. Used to compare items during collision tests | string  | required  |
| x         | X position of the item in grid units.                               | number  | required  |
| y         | Y position of the item in grid units.                               | number  | required  |
| w         | Width of the item in grid units.                                    | number  | required  |
| h         | Height of the item in grid units.                                   | number  | required  |
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

## Events

Grid emits the following events:

| event name | description                          | payload            |
| ---------- | ------------------------------------ | ------------------ |
| change     | Emitted when grid items are changed. | {item: LayoutItem} |

```svelte
<script lang="ts">
	import Grid, { type LayoutChangeDetail } from 'svelte-grid-extended';

	const items = [
		{ id: '0', x: 0, y: 0, w: 1, h: 1 },
		{ id: '1', x: 0, y: 1, w: 3, h: 1 }
	];

	function hanleGridChange(event: CustomEvent<LayoutChangeDetail>) {
		console.log(event.detail.item);
	}
</script>

<Grid {items} cols={10} rows={10} on:change={hanleGridChange}>
	<div>Content</div>
</Grid>
```

## Usage

- [svelte-grid-extended](#svelte-grid-extended)
  - [Description](#description)
  - [Installation](#installation)
  - [Props](#props)
    - [Main props](#main-props)
    - [Layout](#layout)
    - [Style related props:](#style-related-props)
  - [Events](#events)
  - [Usage](#usage)
    - [Basic](#basic)
    - [Static grid](#static-grid)
    - [Grid without bounds](#grid-without-bounds)
    - [Styling](#styling)
    - [Disable interactions](#disable-interactions)
    - [Collision Behavior](#collision-behavior)
      - [None](#none)
      - [Push](#push)
      - [Compress](#compress)

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

### Collision Behavior

The `collision` prop controls how the grid handles collisions. There are three available options: `none`, `push`, and `compress`.

#### None

Setting `collision` prop to `none` will ignore any collisions. This is the default behavior.

✨ [repl](https://svelte.dev/repl/c549a05c30b84793b2bab156f49bedd3?version=4.1.1)

```svelte
<script lang="ts">
	import Grid, { GridItem } from 'svelte-grid-extended';

	const items = [
		{ id: '0', x: 0, y: 0, w: 2, h: 5 },
		{ id: '1', x: 2, y: 2, w: 2, h: 2 },
		{ id: '2', x: 2, y: 0, w: 1, h: 2 },
		{ id: '3', x: 3, y: 0, w: 2, h: 2 },
		{ id: '4', x: 4, y: 2, w: 1, h: 3 },
		{ id: '5', x: 8, y: 0, w: 2, h: 8 }
	];

	const itemSize = { height: 40 };
</script>

<Grid {itemSize} cols={10} collision="none">
	{#each items as item}
		<GridItem x={item.x} y={item.y} w={item.w} h={item.h}>
			<div class="item">{item.id}</div>
		</GridItem>
	{/each}
</Grid>
```

#### Push

Setting `collision` prop to `push` will cause grid items to move to the first available space when colliding. The grid will grow vertically as needed to accommodate all items.

✨ [repl](https://svelte.dev/repl/36abb5e5be6f4b0ebe637b2676ccf606?version=4.1.1)

```svelte
<script lang="ts">
	import Grid, { GridItem } from 'svelte-grid-extended';

	const items = [
		{ id: '0', x: 0, y: 0, w: 2, h: 5 },
		{ id: '1', x: 2, y: 2, w: 2, h: 2 },
		{ id: '2', x: 2, y: 0, w: 1, h: 2 },
		{ id: '3', x: 3, y: 0, w: 2, h: 2 },
		{ id: '4', x: 4, y: 2, w: 1, h: 3 },
		{ id: '5', x: 8, y: 0, w: 2, h: 8 }
	];

	const itemSize = { height: 40 };
</script>

<Grid {itemSize} cols={10} collision="push">
	{#each items as item}
		<GridItem x={item.x} y={item.y} w={item.w} h={item.h}>
			<div class="item">{item.id}</div>
		</GridItem>
	{/each}
</Grid>
```

#### Compress

Setting `collision` prop to `compress` will compress items vertically towards the top into any available space when colliding. The grid will grow vertically as needed to accommodate all items.

✨ [repl](https://svelte.dev/repl/86cff54f2efa437285c3245ecb713702?version=4.1.1)

```svelte
<script lang="ts">
	import Grid, { GridItem } from 'svelte-grid-extended';

	const items = [
		{ id: '0', x: 0, y: 0, w: 2, h: 5 },
		{ id: '1', x: 2, y: 2, w: 2, h: 2 },
		{ id: '2', x: 2, y: 0, w: 1, h: 2 },
		{ id: '3', x: 3, y: 0, w: 2, h: 2 },
		{ id: '4', x: 4, y: 2, w: 1, h: 3 },
		{ id: '5', x: 8, y: 0, w: 2, h: 8 }
	];

	const itemSize = { height: 40 };
</script>

<Grid {itemSize} cols={10} collision="compress">
	{#each items as item}
		<GridItem x={item.x} y={item.y} w={item.w} h={item.h}>
			<div class="item">{item.id}</div>
		</GridItem>
	{/each}
</Grid>
```

> ⚠️ Setting `collision` to `push` or `compress` will set `rows` to `0` so `ItemSize.height` must be setted.
