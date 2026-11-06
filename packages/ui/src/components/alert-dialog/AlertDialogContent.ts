/**
 * Classes of the backdrop behind the dialog. It dims the page with the theme's `--scrim` instead
 * of the registry's fixed `bg-black/50`, so the dimming suits the scheme the dialog opens in.
 */
export const alertDialogOverlayClasses = `
  fixed
  inset-0
  z-50

  bg-scrim

  data-[state=open]:animate-in
  data-[state=open]:fade-in-0
  data-[state=closed]:animate-out
  data-[state=closed]:fade-out-0
`;

/**
 * Classes of the dialog panel, centred in the viewport. Two departures from the registry: it is a
 * raised layer, so it takes the popover surface and the theme's float shadow rather than
 * `bg-background` and `shadow-lg`, and it keeps the theme's 4px `rounded-md`.
 */
export const alertDialogContentClasses = `
  fixed
  top-1/2
  left-1/2
  z-50
  grid
  gap-4
  -translate-x-1/2
  -translate-y-1/2

  w-full
  max-w-[calc(100%-2rem)]
  p-6
  sm:max-w-lg

  rounded-md
  border

  bg-popover

  text-popover-foreground

  shadow-float
  duration-200

  data-[state=open]:animate-in
  data-[state=open]:fade-in-0
  data-[state=open]:zoom-in-95
  data-[state=closed]:animate-out
  data-[state=closed]:fade-out-0
  data-[state=closed]:zoom-out-95
`;
