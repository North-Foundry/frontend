<script setup lang="ts">
/**
 * A Lucide icon at a theme size step: decorative by default, or announced as an image when it
 * has a label.
 */
import type { LucideIcon } from '@lucide/vue';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { ICON_STROKE_WIDTH, type IconVariants, iconVariants } from './Icon';

interface Props {
  icon: LucideIcon;
  size?: IconVariants['size'];
  strokeWidth?: number;
  label?: string;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  strokeWidth: ICON_STROKE_WIDTH,
});
</script>

<template>
  <component
    :is="icon"
    data-slot="icon"
    :stroke-width="strokeWidth"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
    :class="cn(iconVariants({ size }), props.class)"
  />
</template>
