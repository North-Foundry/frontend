# Dither underlay

A transparent decorative underlay based on the landing's single-ink, 8×8 Bayer texture.
It sits above the host background and behind content placed after it.

```vue
<script setup lang="ts">
import { DitherUnderlay } from '@north-foundry/ui/dither-underlay';
</script>

<template>
  <section class="panel">
    <DitherUnderlay position="top-right" animation="breathe" :size="600" :pixel-size="2" />
    <div class="content">Your content</div>
  </section>
</template>

<style scoped>
.panel { position: relative; border-radius: 4px; background: #0e1116; }
.content { position: relative; }
</style>
```

Place the component first in a positioned parent. Content rendered after the underlay can use
`position: relative` to sit above it. The underlay clips itself to the parent's rounded corners,
never captures input, and is hidden from assistive technology. It does not affect layout.

| Prop | Default | Purpose |
| --- | --- | --- |
| `position` | `bottom-right` | Four corners, plus `bottom`, `right`, `top`, and `left` for a complete edge |
| `animation` | `none` | `none`, `drift`, `breathe`, `expand`, `contract`, `ripple`, `wave`, `fire`, `fire-down`, `evaporate`, `rays`, `snowing`, `fireworks`, `chladni`, `voronoi`, `reaction-diffusion`, `interference`, `vortex`, `soliton`, `moire`, `phyllotaxis`, `branching`, or `kuramoto` |
| `size` | `900` | Corner texture width in CSS pixels; height follows the original 900:560 ratio |
| `depth` | `200` | Full-edge texture depth in CSS pixels; its length automatically follows the host |
| `waveShape` | `sine` | `sine`, `triangle`, `sawtooth`, or `square` when animation is `wave` |
| `waveCount` | `3` | Wave periods along the edge, clamped to 0.25–16 |
| `amplitude` | `0.22` | Wave height as a fraction of depth, clamped to 0–0.45 |
| `pixelSize` | `1` | Grain size in CSS pixels, clamped to 1–8 |
| `color` | `#5b8fd6` | Canvas fill colour; simple CSS variables such as `var(--signal)` also work |
| `intensity` | `0.9` | Ink coverage from 0 (transparent) to 1 |
| `reactionThickness` | `1` | Reaction-diffusion shape thickness from `0` (thin) to `1` (full) |
| `duration` | `12` | Seconds per loop for looping effects, minimum 0.5; controls speed for reaction-diffusion and Kuramoto |
| `paused` | `false` | Freeze the current animation frame |

`expand` starts small, grows, and returns; `contract` starts large, shrinks, and returns.
Looping animations repeat smoothly and preserve the Bayer grid rather than stretching its pixels.
Size is capped at 2400px; use a smaller size and 2–4px grains for compact panels or galleries.
Corner layers keep their size on small screens and are cropped by their parent.

For a complete edge, use the same component with an edge value:

```vue
<DitherUnderlay position="bottom" animation="wave" wave-shape="sawtooth"
  :depth="180" :pixel-size="2" :wave-count="3" :amplitude="0.3" />
```

Full-edge placements use `depth` instead of `size`. A resize observer matches their length to
the parent, preserving the grain size as the host changes. Horizontal edges span its full
width; vertical edges span its full height. Depth is capped at 2400px and clipped to the host.

`wave` travels along the edge. The sawtooth has a short smooth return and the square wave has
softened transitions to avoid hard flashes. Wave count, amplitude, and duration are independent.
`fire` carries turbulent ink and grains away from the edge; `fire-down` reverses that flow.
On the bottom edge these rise and fall respectively. On other edges the direction follows
the anchor. `evaporate` uses a quieter base with detached grains that drift and fade, inspired
by the north arrow's rising grains. These effects reuse the shared seeded noise in `src/lib/math.ts`.
`rays` emits short, seeded dithered beams that move away from the selected edge; corner
placements fan beams out from the corner. It uses the existing `duration`, `intensity`,
`pixelSize`, and `depth` controls, with no additional props. A loop has three staggered bursts.
`snowing` sends flakes away from the selected edge, where they sway gently while retaining a
seeded dithered shape fixed in each flake's local coordinates. Each entire flake fades continuously
in opacity during travel; its shape is never re-thresholded on the screen grid. Corner placements
follow the existing corner projection. It is primarily intended for the top edge, as shown in the
Storybook Snowing example.
`fireworks` emits staggered circular explosions through the existing field renderer on a
fixed screen Bayer dither grid. Random origins stay inside separate zones, with the burst radius
limited by the available spacing. Soft cores and expanding fronts fade by decreasing dither density.
The loop repeats seamlessly and uses the existing position, intensity, duration, and pixel size
controls without adding props.
`reaction-diffusion` evolves a seeded Gray–Scott simulation; it advances per rendered frame, does not loop, and moves faster with a shorter `duration`. `kuramoto` is a stateful, non-looping field of oscillators that gradually synchronize; `duration` controls how quickly they move. `voronoi` draws a dense network of sharp, moving cell boundaries. `chladni` blends two resonance modes into nodal lines. `interference` overlays moving wave fields into crossing bands; `vortex` sweeps the pattern in
curved, rotating ribbons; and `soliton` sends isolated pulses through the field. `moire` drifts
offset repeating patterns to create interference fringes. `phyllotaxis` arranges motion in
spirals inspired by botanical growth, while `branching` divides the flow into branching streams.
All six modes support corner and full-edge placements. `waveCount` and `amplitude` tune the
wave-driven patterns where applicable; the modes otherwise use the existing duration, intensity,
pixel size, and depth controls without adding props.

Motion runs at up to 24 frames per second and stops outside the viewport, in hidden tabs, or
while paused. With `prefers-reduced-motion: reduce`, every variant uses the static reference.
No animation or canvas work runs during server rendering; drawing starts on mount.

Run `yarn storybook` and open **Effects / Dither underlay**, or run
`yarn workspace @north-foundry/storybook test` to check rendering against the source.

## Files

The Vue component, browser lifecycle and drawing modules follow the same separation as North Arrow.

- `DitherUnderlay.vue` — reactive props, decorative markup and Vue lifecycle.
- `types.ts` — placement, motion and option contracts.
- `layout.ts` — shared defaults, corner proportions and full-side placement.
- `mount.ts` — canvas sizing, colour, animation, visibility, resize and cleanup.
- `render.ts` — buffer preparation, control normalization and effect dispatch.
- `engine/` — underlay rasterization, field sampling, corner geometry and grain projection.
- `effects/` — one implementation per animation and a typed registry.
- `index.ts` — public component, mount, types and compatibility exports.

Each animation implements `DitherEffect` from `effects/types.ts` with one `render(context)`
method. The context supplies the image buffer, normalized loop phase, coverage, edge and wave
controls. `effects/index.ts` maps every `DitherUnderlayAnimation` to its implementation.

To change an animation, open its named file, such as `effects/phyllotaxis.ts` or
`effects/fire-down.ts`. To add one, extend `DitherUnderlayAnimation`, implement the effect and
register it. The registry's `Record` check catches missing implementations.

Animation files directly inside `effects/` export their `DitherEffect` implementation;
`types.ts` and `index.ts` hold the contract and registry. Helpers live in `effects/shared/`:

- `fire.ts` — the rendering calculation shared by fire, fire-down and evaporation.
- `flowing-grains.ts` — the particles used by those flow effects.
- `waveforms.ts` — the four small wave functions used by the wave effect.

Drawing code used only by one effect stays inside that effect's `render` method, including
ray shooting in `effects/rays.ts`. No effect classes, inheritance or registration lifecycle
are needed.

Inside `engine/`:

- `constants.ts` — the local Bayer table and corner rotation constants.
- `field.ts` — coarse density sampling, interpolation and Bayer rasterization; it knows no
  animation names.
- `corner.ts` — the original rotated corner footprint and transformation options.
- `grains.ts` — particle projection onto the underlay's corners and full sides.

The numerical algorithms remain shared at package level: `src/lib/dither.ts` provides Bayer
utilities, and `src/lib/math.ts` provides hash and noise for both North Arrow and this underlay.
Underlay geometry stays local; extract another helper when a second component actually needs
its semantics, so this folder does not become a speculative general rendering framework.

Keep numerical calculations unchanged when reorganizing them. The source-rendering test
checks the original corner formula, full sides, animation direction, seamless loops and
85 reference frame hashes captured before extracting effects. All source comments use
multiline blocks, following North Arrow's convention.

## Framework-free usage

```ts
import { mountDitherUnderlay } from '@north-foundry/ui/dither-underlay';

const underlay = mountDitherUnderlay(host, canvas, { position: 'bottom', animation: 'wave' });
underlay.update({ position: 'left', depth: 160 });
underlay.destroy();
```

Supply a positioned, clipped host containing the canvas. The mount sizes and positions the
canvas and owns its observers and listeners. Call `destroy` before removing the elements.
Omitted or undefined options keep their current values on update. The Vue wrapper supplies
its own decorative host, hides it from assistive technology and disables pointer events.

## Migration

`DitherUnderlay` describes a texture that can occupy a corner or a complete side. Use
`position` for all eight anchors. The old `DitherCorner` component, `DitherCornerProps`,
`DitherCornerPosition` and `DitherCornerAnimation` remain aliases. Import the component from
`@north-foundry/ui/dither-underlay`. The old `corner` prop is accepted by both component names; `position` wins
when both are supplied. Existing `.nf-dither-corner` selectors still match the underlay host.

`DitherOverlay`, its types, `mountDitherOverlay` and `DITHER_OVERLAY_DEFAULTS`
remain compatibility aliases as well. Existing
`.nf-dither-overlay` selectors continue to match; prefer `.nf-dither-underlay` in new code.
