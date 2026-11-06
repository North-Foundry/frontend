/**
 * The shadcn-vue badge (new-york style), adapted to the North Foundry theme.
 *
 * Badges use the small radius token (2px), below the controls' medium radius (4px).
 * Override it with a class such as `rounded-full` for counters. The destructive variant uses
 * the theme's foreground token to preserve contrast on both colour schemes.
 */
import { type VariantProps, cva } from 'class-variance-authority';

/**
 * Returns the badge's variant classes; also styles other elements as badges.
 */
export const badgeVariants = cva(
  `
    inline-flex
    items-center
    justify-center
    gap-1
    shrink-0
    overflow-hidden
    whitespace-nowrap

    w-fit
    px-2
    py-0.5

    rounded-sm
    border

    text-xs
    font-medium

    transition-[color,box-shadow]
    outline-none

    focus-visible:border-ring
    focus-visible:ring-3
    focus-visible:ring-ring/50
    aria-invalid:border-destructive
    aria-invalid:ring-destructive/20

    [&>svg]:size-3
    [&>svg]:pointer-events-none

    dark:aria-invalid:ring-destructive/40
  `,
  {
    variants: {
      variant: {
        default: `
          border-transparent

          bg-primary

          text-primary-foreground

          [a&]:hover:bg-primary/90
        `,
        secondary: `
          border-transparent

          bg-secondary

          text-secondary-foreground

          [a&]:hover:bg-secondary/90
        `,
        destructive: `
          border-transparent

          bg-destructive

          text-destructive-foreground

          [a&]:hover:bg-destructive/90
          focus-visible:ring-destructive/20

          dark:focus-visible:ring-destructive/40
        `,
        outline: `
          border-border

          text-foreground

          [a&]:hover:bg-accent
          [a&]:hover:text-accent-foreground
        `,
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;
