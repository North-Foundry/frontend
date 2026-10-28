# North arrow

The mark, the engine that draws it, and where to change what.

## Files

- `glyphs/` — the shapes, in design units. `geometric.ts` defines the `northArrow` used here.
- `effects/` — the motion, split by effect. `index.ts` preserves the `./effects` entry point;
  `ascent.ts` is the one used here.
- `engine/` — grid, mask, ordered dither, distance fields. No knowledge of any specific mark.
- `../../lib/dither.ts` — shared dithering utilities used by North Arrow and DitherUnderlay.
- `../../lib/math.ts` — shared hash, noise, clamping and interpolation utilities.
- `vendor/palette.ts` — a local copy from `@north-foundry/imaging`, kept here so this package
  does not depend on the plate pipeline.
- `mount.ts` — the public API: options, canvas sizing, lifecycle, `NORTH_ARROW_DEFAULTS`.
- `NorthArrow.vue` — the Vue wrapper: props in, lifecycle out. It contains no drawing code.
- `index.ts` — exports of the `@north-foundry/ui/north-arrow` subpath.

Inside `engine/`, the modules separate rendering from numerical calculations:

- `types.ts` — the `Ground`, `Layer`, `Glyph` and `Mask` contracts.
- `surface.ts` — the pixel buffer, palette handling and ordered dithering.
- `rendering.ts` — glyph placement, rasterization and solid drawing.
- `distance-field.ts` — distances to the nearest glyph edge.
- `math.ts` — compatibility re-export of the shared `../../lib/math.ts` module.
- `index.ts` — the existing `./engine` entry point.

Inside `glyphs/`, related marks and their private helpers stay together:

- `primitives.ts` — shared shape drawing tools and the geometric glyph factory.
- `geometric.ts` — geometric marks, including the north arrow and related ligatures.
- `typography.ts` — font loading, text measurement and marks built from text.
- `index.ts` — the existing `./glyphs` entry point; primitives stay internal.

Inside `effects/`, each effect has its own file. Shared pieces stay grouped by responsibility:

- `types.ts` — the `Effect` and `EffectDefinition` contracts.
- `shading.ts` — the base tone and cast relief lighting.
- `particles.ts` — the particle shape and particles built from a mask.
- `rising-grains.ts` — the glyph extent and rising grain renderer.
- `index.ts` — effect and contract exports; helpers stay internal to the folder.

## Where to change what

| Goal | File |
| --- | --- |
| Reshape the needle | `glyphs/geometric.ts` → `northArrow` |
| Change how it moves | `effects/ascent.ts` → `ascent` |
| Change frame size, padding or grain rules | `mount.ts` |
| Change defaults | `mount.ts` → `NORTH_ARROW_DEFAULTS` |
| Change props, accessibility or DOM | `NorthArrow.vue` |
| Change the rendered tones | `engine/surface.ts` (dithered) or `engine/rendering.ts` (solid) |
| Change the shared blue palette | `vendor/palette.ts` (shared with the plate pipeline) |
| Add a story | `apps/storybook/stories/north-arrow.stories.ts` |

## Why there is more code than one mark needs

The marks and effects come from the website's logo lab. This package keeps eight effect exports,
split across focused modules so individual implementations can be synced with upstream. Only
`northArrow` and `ascent` are reachable from this package; the rest are unused exports that
bundlers drop.

## Convention

The modules in `engine/`, `glyphs/` and `effects/` keep the implementation from
`website/apps/website/src/lab/logo/`. Sync changes module by module; do not copy the upstream
`engine.ts`, `glyphs.ts` or `effects.ts` wholesale. Math lives in `src/lib/math.ts` and is shared
with DitherUnderlay; `engine/math.ts` remains as a compatibility re-export. The imports in
`engine/surface.ts` use
`../../../lib/dither` and `../vendor/palette` instead of `@north-foundry/imaging`. The shared
`src/lib/dither.ts` and local `vendor/palette.ts` likewise keep their upstream implementation.

All source comments use multiline blocks, even for a single sentence:

```ts
/**
 * Draws the rest frame.
 */
```

Comments may differ from upstream to follow this format and the repository's English-only policy.

If the mark itself has to change, change it in the website lab first and port the affected shapes,
effects and helpers into their corresponding files here, so the two do not drift. Wrapper files
(`mount.ts`, `NorthArrow.vue`, `index.ts`) are maintained here.
