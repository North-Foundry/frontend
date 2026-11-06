/**
 * The shadcn-vue input, matched to the select's border, surface, radius and focus treatment.
 */
export const inputClasses = `
  flex

  h-9
  w-full
  min-w-0
  px-3
  py-1

  rounded-md
  border
  border-input

  bg-transparent

  text-base
  text-foreground
  md:text-sm

  shadow-xs
  transition-[color,box-shadow]
  outline-none

  placeholder:text-muted-foreground
  selection:bg-selection
  selection:text-selection-foreground
  focus-visible:border-ring
  focus-visible:ring-3
  focus-visible:ring-ring/50
  disabled:cursor-not-allowed
  disabled:opacity-50
  aria-invalid:border-destructive
  aria-invalid:ring-destructive/20

  file:inline-flex
  file:h-7
  file:border-0
  file:bg-transparent
  file:text-sm
  file:font-medium
  file:text-foreground

  dark:bg-input/30
  dark:hover:bg-input/50
  dark:aria-invalid:ring-destructive/40
`;
