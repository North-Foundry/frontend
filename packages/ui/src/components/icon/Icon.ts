/**
 * The North Foundry icon: a Lucide glyph drawn at one of the theme's size steps.
 *
 * The steps match the sizes the components already give their own glyphs: 12px in badges, 14px
 * in checkboxes, 16px in buttons and selects, and 20px for larger controls.
 */
import { type VariantProps, cva } from 'class-variance-authority';

/**
 * The stroke width every icon is drawn with, in the 24-unit Lucide grid.
 */
export const ICON_STROKE_WIDTH = 2;

/**
 * Returns the icon's size classes.
 */
export const iconVariants = cva('pointer-events-none shrink-0', {
  variants: {
    size: {
      xs: 'size-3',
      sm: 'size-3.5',
      md: 'size-4',
      lg: 'size-5',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export type IconVariants = VariantProps<typeof iconVariants>;
