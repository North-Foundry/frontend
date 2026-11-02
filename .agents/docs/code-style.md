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
