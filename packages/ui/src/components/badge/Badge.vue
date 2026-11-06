<script setup lang="ts">
/**
 * A compact label, or with `as-child` an element styled as one, in a theme variant.
 */
import type { PrimitiveProps } from 'reka-ui';
import { Primitive } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { type BadgeVariants, badgeVariants } from './Badge';

interface Props extends PrimitiveProps {
  variant?: BadgeVariants['variant'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  as: 'span',
});
</script>

<template>
  <Primitive
    data-slot="badge"
    :as="as"
    :as-child="asChild"
    :class="cn(badgeVariants({ variant }), props.class)"
  >
    <slot />
  </Primitive>
</template>
