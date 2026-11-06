/**
 * The shadcn-vue radio option, matched to the checkbox's border and focus treatment.
 */
export const radioGroupItemClasses = `
  peer
  inline-flex
  items-center
  justify-center
  shrink-0

  size-4

  rounded-full
  border
  border-input

  bg-transparent

  text-primary

  shadow-xs
  transition-[color,box-shadow]
  outline-none

  focus-visible:border-ring
  focus-visible:ring-3
  focus-visible:ring-ring/50
  disabled:cursor-not-allowed
  disabled:opacity-50
  data-[state=checked]:border-primary
  aria-invalid:border-destructive
  aria-invalid:ring-destructive/20
  aria-invalid:data-[state=checked]:border-destructive

  dark:bg-input/30
  dark:hover:bg-input/50
  dark:aria-invalid:ring-destructive/40
`;

/**
 * Centers the default dot or a consumer's custom selected indicator.
 */
export const radioGroupIndicatorClasses = `
  flex
  items-center
  justify-center

  [&_svg]:pointer-events-none
  [&_svg]:shrink-0
`;
