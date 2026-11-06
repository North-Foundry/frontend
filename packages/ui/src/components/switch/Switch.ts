/**
 * The shadcn-vue switch track, using the shared field focus and validation treatment.
 */
export const switchClasses = `
  peer
  inline-flex
  items-center
  shrink-0

  h-5
  w-9

  rounded-full
  border-2
  border-transparent

  bg-input

  shadow-xs
  transition-[background-color,border-color,box-shadow]
  outline-none

  focus-visible:border-ring
  focus-visible:ring-3
  focus-visible:ring-ring/50
  disabled:cursor-not-allowed
  disabled:opacity-50
  data-[state=checked]:bg-primary
  aria-invalid:border-destructive
  aria-invalid:ring-destructive/20

  dark:data-[state=unchecked]:bg-input/80
  dark:aria-invalid:ring-destructive/40
`;

/**
 * Moves the thumb between the track's ends, following the surrounding reading direction.
 */
export const switchThumbClasses = `
  block
  shrink-0

  size-4

  rounded-full

  bg-background

  shadow-xs
  transition-transform
  pointer-events-none

  data-[state=checked]:translate-x-4
  data-[state=checked]:bg-primary-foreground
  data-[state=unchecked]:translate-x-0
  rtl:data-[state=checked]:-translate-x-4
`;
