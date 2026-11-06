# @north-foundry/ui

Shared UI for North Foundry frontends. The package ships TypeScript sources: consumers compile it
as part of their app, so there is no build step and no duplicated copy of the source.

- [Checkbox](src/components/checkbox/) — Controls for toggling individual options and showing partial selections.

## North arrow

`NorthArrow` draws the North Foundry mark: the north needle, dithered as a faceted pyramid. It is
the `logo-only` proposal from the logo lab on the website, and the code that produced
`north-foundry-github-avatar.png`.

```vue
<script setup lang="ts">
import { NorthArrow } from '@north-foundry/ui';
</script>

<template>
  <NorthArrow :size="96" label="North Foundry" />
</template>
```

Vue is a peer dependency, so the app owns its copy. The component mounts the canvas when it enters
the page, repaints when its props change and stops the animation loop when it unmounts.

Outside Vue, `mountNorthArrow` exposes the same behaviour against a canvas:

```ts
import { mountNorthArrow } from '@north-foundry/ui';

const canvas = document.querySelector<HTMLCanvasElement>('canvas')!;
const mark = mountNorthArrow(canvas, { size: 96 });
```

In both cases `size` is the side of the square frame in CSS pixels and `cell` is the dither grain;
the lattice is rebuilt on that grid, so the mark stays aligned at any size. `ground` picks the
palette for a dark or light surface, `mono` paints everything in the foundry blue, and `animated`
lets the grains rise off the tip. Animation only starts on the client and respects
`prefers-reduced-motion`.

The stories live in `apps/storybook` (`yarn storybook`).

## Dither underlay

`DitherUnderlay` adds a decorative Bayer texture to any corner or full side of a positioned
parent. `position` selects the anchor, `size` scales corner textures, and `depth` controls
full-side textures. Animation respects reduced motion, viewport visibility and hidden tabs.

```vue
<script setup lang="ts">
import { DitherUnderlay } from '@north-foundry/ui/dither-underlay';
</script>

<template>
  <section style="position: relative">
    <DitherUnderlay position="bottom" animation="wave" :depth="180" />
    <div style="position: relative">Your content</div>
  </section>
</template>
```

The framework-free `mountDitherUnderlay(host, canvas, options)` returns `update` and `destroy`
methods. `DitherCorner`, its types and the `corner` prop remain compatibility aliases.
Import from `@north-foundry/ui/dither-underlay` and prefer `DitherUnderlay` and `position` in new code;
`position` takes precedence when both props are supplied.

Set `gradient` to fill the parent with a dithered gradient ground: `graphite`, `slate`,
`signal`, `horizon`, `aurora`, `eclipse`, `steel`, `polar` or `paper`. Without a `position`,
only the gradient is drawn; with one, the texture runs over it.

```vue
<DitherUnderlay gradient="aurora" />
<DitherUnderlay gradient="horizon" position="top" animation="wave" />
```

Each animation has a separate implementation of a small rendering interface. Shared numerical
helpers live in `src/lib/dither.ts` and `src/lib/math.ts`; overlay geometry stays with the component.
See `src/components/dither-underlay/README.md` for the options and module map.

## Theme

Colour and the other design values are organised in three tiers; the full rules are in
`.agents/docs/design-tokens.md` at the repository root.

1. **Primitives** — `src/styles/primitives.css`. Raw `--nf-<family>-<step>` values (graphite,
   navy, blue, cyan, red, pencil), plus type, spacing, radii, shadows and motion.
2. **Semantic tokens** — `src/styles/themes/north-foundry.css`. The shadcn-vue contract
   (`--background`, `--primary`, `--border`, ...) with an editorial extension (`--rule`,
   `--signal`, `--selection`, `--tone-ink-*`, `--tone-signal-*`, ...). The dark scheme on `:root`
   and `.dark` and the paper scheme on `.paper` define the same set.
3. **Component tokens** — `--<component>-*`, declared by the component that reads them.

`src/styles/tailwind.css` exposes the semantic tokens as utilities (`bg-background`,
`text-signal`, `bg-tone-signal-3`, ...).

```css
@import 'tailwindcss';
@import '@north-foundry/ui/styles.css';
```

Import the theme after `tailwindcss`: the bridge uses `@theme inline`, which only exists once
Tailwind is in the build. Without Tailwind, import `@north-foundry/ui/tokens.css` instead.

`components.json` points the shadcn-vue CLI at `src/styles/index.css`, so
`npx shadcn-vue@latest add <component>` writes into `src/components/<name>`, next to the
hand-written components, and uses the `cn` helper in `src/lib/utils.ts`. After adding a
component:

- replace its `@/` imports with relative paths, because the apps consume this package from source
  and do not resolve the alias;
- move the variants the CLI writes into `index.ts` to `<Name>.ts` next to `<Name>.vue`, keep
  `index.ts` as a barrel and split the class strings into grouped lines (see
  `.agents/docs/code-style.md`);
- export it from `src/index.ts`, and add a `./<name>` entry to `exports` in `package.json` so it is
  also reachable as `@north-foundry/ui/<name>`;
- check its colours on both schemes, and prefer the theme's `*-foreground` tokens over fixed
  colours such as `text-white`;
- if it teleports content to `body`, as `SelectContent` does, wrap that content in an element
  with `class="contents"` and the scheme class from `useScheme(trigger)`, so it keeps the scheme
  of the band it was opened from.

`dark:` classes follow the theme's schemes rather than the operating system: they apply outside
`.paper`, and inside a `.dark` element nested in paper.

The shadcn-vue `Button` is the first component added this way:

```vue
<script setup lang="ts">
import { Button } from '@north-foundry/ui';
</script>

<template>
  <Button variant="outline" size="sm">Read more</Button>
</template>
```

`Badge` supports the shadcn-vue `default`, `secondary`, `destructive` and `outline` variants,
icons in its default slot, and `as-child` to style a link. Import it from `@north-foundry/ui`
or `@north-foundry/ui/badge`; both also export `badgeVariants` and `BadgeVariants`.

```vue
<script setup lang="ts">
import { Badge } from '@north-foundry/ui/badge';
</script>

<template>
  <Badge variant="secondary">In progress</Badge>
  <Badge variant="outline" as-child>
    <a href="/projects">Projects</a>
  </Badge>
  <Badge class="rounded-full">8</Badge>
</template>
```

Badges use `rounded-sm` (2px) to keep compact labels sharper than the `rounded-md` (4px)
controls. Rounding follows the existing theme tokens; use `class="rounded-none"`,
`class="rounded-md"` or `class="rounded-full"` for a local override. Prefer pill shapes for
counters.

`AlertDialog` is the shadcn-vue confirmation modal: it only closes through its cancel or action
button, or Escape, and focuses the cancel button when it opens. Import it from
`@north-foundry/ui` or `@north-foundry/ui/alert-dialog`.

```vue
<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from '@north-foundry/ui';
</script>

<template>
  <AlertDialog>
    <AlertDialogTrigger as-child>
      <Button variant="destructive">Delete</Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete this project?</AlertDialogTitle>
        <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Keep it</AlertDialogCancel>
        <AlertDialogAction variant="destructive">Delete project</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
```

It departs from the registry in a few places: `AlertDialogAction` and `AlertDialogCancel` take the
button's `variant` and `size` (cancel defaults to `outline`); the panel is a raised layer with
`bg-popover`, `shadow-float` and the 4px `rounded-md`; and the backdrop uses the theme's `--scrim`
(`bg-scrim`) instead of a fixed black. The dialog takes the scheme of its trigger's band. When it
is opened through `v-model:open` without a trigger, it takes the scheme of the page instead.

The dark scheme is the identity: a graphite ground with one cool accent. Add the `paper` class to
any element to switch it and everything inside it to the light scheme, and `dark` to switch back.
The font families point at Instrument Sans, IBM Plex Mono and Architects Daughter, but the font files are
not bundled yet, so consumers currently fall back to system fonts.

## Provenance

`src/components/north-arrow/engine/`, `glyphs/` and `effects/` preserve the implementations from
`website/apps/website/src/lab/logo`, split into modules by responsibility. Their imaging
dependencies are kept local: `src/lib/dither.ts` provides shared dithering utilities for North
Arrow and DitherUnderlay, while `src/components/north-arrow/vendor/palette.ts` holds the palette. Both come
from `@north-foundry/imaging`, so the UI package does not depend on the plate pipeline. Source
comments follow this repository's multiline format. `mount.ts` wires the engine to a canvas,
following what `stage.ts` does on the website. The mark itself is untouched.

See `src/components/north-arrow/README.md` for the file-by-file map and where to change what.
