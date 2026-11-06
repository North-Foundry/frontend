/**
 * The shadcn-vue textarea, using the same surface and interaction states as the input and select.
 */
export const textareaClasses = `
  flex
  field-sizing-fixed
  resize-y

  min-h-16
  w-full
  min-w-0
  px-3
  py-2

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
  data-[autosize=true]:field-sizing-content
  data-[autosize=true]:resize-none

  dark:bg-input/30
  dark:hover:bg-input/50
  dark:aria-invalid:ring-destructive/40
`;
