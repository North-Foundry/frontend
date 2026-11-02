/**
 * Classes of the field that shows the selected value and opens the list.
 */
export const selectTriggerClasses = `
  flex
  items-center
  justify-between
  gap-2
  whitespace-nowrap

  w-fit
  px-3
  py-2

  rounded-md
  border
  border-input

  bg-transparent

  text-sm

  shadow-xs
  transition-[color,box-shadow]
  outline-none

  data-[placeholder]:text-muted-foreground
  data-[size=default]:h-9
  data-[size=sm]:h-8
  focus-visible:border-ring
  focus-visible:ring-3
  focus-visible:ring-ring/50
  disabled:cursor-not-allowed
  disabled:opacity-50
  aria-invalid:border-destructive
  aria-invalid:ring-destructive/20

  *:data-[slot=select-value]:line-clamp-1
  *:data-[slot=select-value]:flex
  *:data-[slot=select-value]:items-center
  *:data-[slot=select-value]:gap-2
  [&_svg]:pointer-events-none
  [&_svg]:shrink-0
  [&_svg:not([class*='size-'])]:size-4
  [&_svg:not([class*='text-'])]:text-muted-foreground

  dark:bg-input/30
  dark:hover:bg-input/50
  dark:aria-invalid:ring-destructive/40
`;
