# Design tokens

The colour palette and every other design value live in CSS custom properties in
`packages/ui/src/styles/`. They are organised in three tiers, and each tier reads only from the one
below it.

## Tiers

| Tier | File | Name | Holds |
| --- | --- | --- | --- |
| Primitives | `primitives.css` | `--nf-<family>-<step>`, `--nf-<name>` | Raw values only |
| Semantic | `themes/north-foundry.css` | shadcn-vue contract + editorial extension, no prefix | `var(--nf-*)` only |
| Component | the component's own styles | `--<component>-<role>` | `var()` of a semantic token |

`tailwind.css` bridges semantic tokens to utilities as `--color-<token>`, `--font-*`, `--text-*`
and so on. Its only literal values are the line heights paired with the text scale.

## Primitives

- Colour families: `graphite` (neutrals), `navy` (low-chroma blue tints), `blue` (the accent),
  `cyan` (syntax strings only), `red` (errors only) and the single `pencil`.
- Within a family a higher step is always darker, from 50 to 950. Graphite and navy share their
  lightness at equal steps. The accent families (blue, cyan, red) run lighter than graphite at the
  same step, so choose them by contrast, not by number. Use intermediate steps such as `550`
  between two existing ones.
- A family lists only the steps in use. To use a new colour, add a step here first; no other file
  may write a hex colour that is not a primitive value. Before adding one, check the nearest
  existing step: a difference under about 2.5 ΔE in OKLab is not visible, so reuse the step.

## Semantic tokens

- Two colour schemes define exactly the same set of tokens: dark on `:root` and `.dark`, paper on
  `.paper`. Adding a token to one scheme means adding it to the other.
- Tokens that do not depend on the ground (`--radius`, `--font-family-*`, `--code-*`) are defined
  once, in the shared `:root` block.
- Names describe a role, never a colour or a mood: `--signal`, not `--blue` or `--sky`.
- Names stay out of Tailwind's theme namespaces (`--color-*`, `--font-*`, `--text-*`,
  `--shadow-*`, `--radius-*`, ...) so the bridge can map them without collisions. That is why the
  theme uses `--font-family-sans` and `--float-shadow`.
- `--tone-ink-1…5` and `--tone-signal-1…5` are ordered ramps for generative artwork, running from
  the step nearest the ground to the one in strongest contrast with it on either scheme.

## Components

- Components read semantic tokens, so they follow the scheme they are placed in.
- Content teleported out of its band, such as a select list or a dialog, takes the scheme of the
  element that opened it through `useScheme` in `src/lib/scheme.ts`.
- Floating layers (lists, popovers, menus) use `shadow-float`, the theme's only shadow for them.
- Canvas renderers resolve tokens at runtime with `getComputedStyle` and keep a built-in fallback,
  made of primitive values, for use without the stylesheet.
- Fixed artwork that must look the same on any ground, such as `GradientUnderlay` variants or the
  homepage hero shadow, may use primitives directly and says so in a comment.
- Storybook stories that document the palette may read primitives directly.
