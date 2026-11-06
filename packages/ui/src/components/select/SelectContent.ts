/**
 * Classes of the floating list. It casts the theme's float shadow, the one shadow reserved for
 * floating layers, instead of the registry's `shadow-md`.
 */
export const selectContentClasses = `
  relative
  z-50
  overflow-x-hidden
  overflow-y-auto

  min-w-32
  max-h-(--reka-select-content-available-height)

  rounded-md
  border

  bg-popover

  text-popover-foreground

  shadow-float

  data-[state=open]:animate-in
  data-[state=open]:fade-in-0
  data-[state=open]:zoom-in-95
  data-[state=closed]:animate-out
  data-[state=closed]:fade-out-0
  data-[state=closed]:zoom-out-95
  data-[side=bottom]:slide-in-from-top-2
  data-[side=left]:slide-in-from-right-2
  data-[side=right]:slide-in-from-left-2
  data-[side=top]:slide-in-from-bottom-2
`;

/**
 * Extra classes when the list is positioned next to the trigger: a small gap on its side.
 */
export const selectContentPopperClasses = `
  data-[side=bottom]:translate-y-1
  data-[side=left]:-translate-x-1
  data-[side=right]:translate-x-1
  data-[side=top]:-translate-y-1
`;

/**
 * Classes of the scrolling viewport inside the list.
 */
export const selectViewportClasses = 'p-1';

/**
 * Extra viewport classes next to the trigger: at least as wide as the trigger.
 */
export const selectViewportPopperClasses = `
  h-(--reka-select-trigger-height)
  w-full
  min-w-(--reka-select-trigger-width)
  scroll-my-1
`;
