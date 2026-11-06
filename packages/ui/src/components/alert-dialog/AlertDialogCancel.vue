<script setup lang="ts">
/**
 * Dismisses the dialog without acting, styled as an outline button. It receives focus when the
 * dialog opens, so pressing Enter by reflex never confirms. Takes the button's `variant` and `size`.
 */
import { reactiveOmit } from '@vueuse/core';
import type { AlertDialogCancelProps } from 'reka-ui';
import { AlertDialogCancel } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { type ButtonVariants, buttonVariants } from '../button/Button';

const props = withDefaults(
  defineProps<
    AlertDialogCancelProps & {
      variant?: ButtonVariants['variant'];
      size?: ButtonVariants['size'];
      class?: HTMLAttributes['class'];
    }
  >(),
  {
    variant: 'outline',
  },
);

const delegatedProps = reactiveOmit(props, 'class', 'variant', 'size');
</script>

<template>
  <AlertDialogCancel
    data-slot="alert-dialog-cancel"
    v-bind="delegatedProps"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <slot />
  </AlertDialogCancel>
</template>
