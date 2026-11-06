# Code style

## Conditional branches

Always wrap the body of every `if`, `else if` and `else` branch in braces,
including a single statement, early return, `continue` or `throw`.
Keep `else if` chains, with braces around each branch's executed statements.

```ts
if (!context) {
  throw new Error('Canvas 2D is not available');
} else if (ready) {
  render();
} else {
  return;
}
```

## Component files

A component's entry point, `src/components/<name>/index.ts`, is only a
barrel: it re-exports and declares nothing. Modules inside a component folder, such as an effect
registry, are not entry points.

The non-template code of a `.vue` file, such as its `cva` variants and their
types, lives in a `.ts` file with the same name next to it.

```text
src/components/button/
  Button.vue   the component
  Button.ts    buttonVariants and ButtonVariants
  index.ts     export { default as Button } from './Button.vue';
               export { type ButtonVariants, buttonVariants } from './Button';
```

## Class lists

In TypeScript, such as `cva` variants or `cn` arguments, write a list of three
or more Tailwind classes as a template literal with one class per line. Shorter
lists stay on one line in single quotes. Vue template `class` attributes are
not affected.

Group related classes and separate groups with one empty line, with no spaces on
it. Keep groups in this order and leave out the empty ones:

1. Layout: display, flex and grid, alignment, gap, shrink, whitespace.
2. Size and spacing: width, height, `size-*`, padding, margin.
3. Shape and border: radius, border width and colour.
4. Background.
5. Text: size, weight, colour, decoration.
6. Effects: shadow, transition, outline.
7. States: `hover:`, `focus-visible:`, `disabled:`, `aria-*:`, `has-*:`.
8. Descendants: arbitrary variants such as `[&_svg]:`.
9. `dark:` overrides.

```ts
outline: `
  border

  bg-background

  shadow-xs

  hover:bg-accent
  hover:text-accent-foreground

  dark:border-input
  dark:bg-input/30
  dark:hover:bg-input/50
`,
```

## Canonical classes

Write every Tailwind class in its canonical form, the one the Tailwind
`suggestCanonicalClasses` diagnostic proposes. Use an arbitrary value or variant
only when no scale, theme value or built-in variant produces the same CSS.

- Spacing and sizes use the spacing scale: `max-w-190`, not `max-w-[760px]`;
  `h-4.5`, not `h-[18px]`.
- Named theme values replace their raw equivalent: `font-normal`, not
  `font-[400]`; `rounded-xs`, not `rounded-[2px]`.
- Built-in variants replace arbitrary ones: `data-disabled:`, not
  `data-[disabled]:`; `**:`, not `[&_*]:`.

## Function and method comments

Give every function and method a brief comment directly above it: named
functions, class methods and constructors, functions assigned to a variable or
property, and functions declared inside other functions. Inline callbacks passed
as arguments, such as the function given to `map` or `watch`, are exempt.

- Say what it does or why it exists in one or two sentences; do not restate the
  name or the parameter types.
- Write it as a `/** */` block on separate lines, even for a single sentence.

```ts
/**
 * Paints one cell at a quantised tone level; level 0 leaves it untouched.
 */
plotLevel(x: number, y: number, level: number, layer: Layer): void {
```
