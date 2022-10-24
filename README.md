# svelte-grid-extended

> ⚠️ Package currently in alpha, please consider that it **will** be changed in the future. 
<!-- plase gif here -->

## Description

Svelte-Grid-Extended is a draggable, resizable ~~and responsive~~ grid layout. The package  is created as extended verison of [svelte-grid]([url](https://github.com/vaheqelyan/svelte-grid)), and will implement all of its features in future releases.

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

## Usage

- [Basic](#basic)
- [Static grid](#static-grid)
- [Grid without bounds](#grid-without-bounds)

### Basic

```html
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

```html
<script lang="ts">
	import Grid from 'svelte-grid-extended';

	const items = [
		{ id: '0', x: 0, y: 0, w: 1, h: 1 },
		{ id: '1', x: 0, y: 1, w: 1, h: 1 },
	];

	const itemSize = { width: 100, height: 40 };
</script>

<Grid {items} {itemSize} cols={10} rows={10}>
	<div>Content</div>
</Grid>
```

Only rows:

```html
<script lang="ts">
	import Grid from 'svelte-grid-extended';

	const items = [
		{ id: '0', x: 0, y: 0, w: 1, h: 1 },
		{ id: '1', x: 0, y: 1, w: 1, h: 1 },
	];

	const itemSize = { height: 40 };
</script>

<Grid {items} {itemSize} cols={10} rows={10}>
	<div>Content</div>
</Grid>
```


### Grid without bounds

When `cols` or `rows` params set to 0, grid grows infinitly. The grid container adapts its width and height to fit all elements.

It can be set to both dimensions or just one.


```html
<script lang="ts">
	import Grid from 'svelte-grid-extended';

	const items = [
		{ id: '0', x: 0, y: 0, w: 1, h: 1 },
		{ id: '1', x: 0, y: 1, w: 1, h: 1 },
	];

	const itemSize = { width: 100, height: 40 };
</script>

<Grid {items} {itemSize} cols={0} rows={0}>
	<div>Content</div>
</Grid>
```

