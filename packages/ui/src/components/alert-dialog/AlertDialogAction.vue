<script setup lang="ts">
/**
 * Confirms and closes the dialog, styled as a button. Unlike the registry it takes the button's
 * `variant` and `size`, so a destructive confirmation can use `variant="destructive"`.
 */
import { reactiveOmit } from '@vueuse/core';
import type { AlertDialogActionProps } from 'reka-ui';
import { AlertDialogAction } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { type ButtonVariants, buttonVariants } from '../button/Button';

const props = defineProps<
  AlertDialogActionProps & {
    variant?: ButtonVariants['variant'];
    size?: ButtonVariants['size'];
    class?: HTMLAttributes['class'];
  }
>();

const delegatedProps = reactiveOmit(props, 'class', 'variant', 'size');
</script>

<template>
  <AlertDialogAction
    data-slot="alert-dialog-action"
    v-bind="delegatedProps"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <slot />
  </AlertDialogAction>
</template>
