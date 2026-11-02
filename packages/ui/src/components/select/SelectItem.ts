/**
 * Classes of one option in the select list.
 */
export const selectItemClasses = `
  relative
  flex
  items-center
  gap-2

  w-full
  py-1.5
  pr-8
  pl-2

  rounded-sm

  text-sm

  outline-hidden
  cursor-default
  select-none

  focus:bg-accent
  focus:text-accent-foreground
  data-[disabled]:pointer-events-none
  data-[disabled]:opacity-50

  [&_svg]:pointer-events-none
  [&_svg]:shrink-0
  [&_svg:not([class*='size-'])]:size-4
  [&_svg:not([class*='text-'])]:text-muted-foreground
  *:[span]:last:flex
  *:[span]:last:items-center
  *:[span]:last:gap-2
`;
