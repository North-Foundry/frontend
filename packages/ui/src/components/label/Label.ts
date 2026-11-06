/**
 * The shadcn-vue label, with the field text scale and disabled group or peer states.
 */
export const labelClasses = `
  flex
  items-center
  gap-2

  text-sm
  font-medium
  leading-none
  text-foreground

  select-none

  group-data-[disabled=true]:pointer-events-none
  group-data-[disabled=true]:opacity-50
  peer-disabled:cursor-not-allowed
  peer-disabled:opacity-50
`;
