/**
 * The shadcn-vue checkbox, matched to the theme's field borders, selection and focus treatment.
 */
export const checkboxClasses = `
  peer
  inline-flex
  items-center
  justify-center
  shrink-0

  size-4

  rounded-sm
  border
  border-input

  bg-transparent

  shadow-xs
  transition-[color,box-shadow]
  outline-none

  focus-visible:border-ring
  focus-visible:ring-3
  focus-visible:ring-ring/50
  disabled:cursor-not-allowed
  disabled:opacity-50
  data-[state=checked]:border-primary
  data-[state=checked]:bg-primary
  data-[state=checked]:text-primary-foreground
  data-[state=indeterminate]:border-primary
  data-[state=indeterminate]:bg-primary
  data-[state=indeterminate]:text-primary-foreground
  aria-invalid:border-destructive
  aria-invalid:ring-destructive/20
  aria-invalid:data-[state=checked]:border-destructive
  aria-invalid:data-[state=indeterminate]:border-destructive

  dark:data-[state=unchecked]:bg-input/30
  dark:data-[state=unchecked]:hover:bg-input/50
  dark:aria-invalid:ring-destructive/40
`;

/**
 * Centers either the default check or minus mark, or a consumer's custom indicator.
 */
export const checkboxIndicatorClasses = `
  flex
  items-center
  justify-center

  text-current

  [&_svg]:pointer-events-none
  [&_svg]:shrink-0
`;
