<script setup lang="ts">
/**
 * The dialog's accessible description: what will happen and whether it can be undone.
 */
import { reactiveOmit } from '@vueuse/core';
import type { AlertDialogDescriptionProps } from 'reka-ui';
import { AlertDialogDescription } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { alertDialogDescriptionClasses } from './AlertDialogDescription';

const props = defineProps<AlertDialogDescriptionProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <AlertDialogDescription
    data-slot="alert-dialog-description"
    v-bind="delegatedProps"
    :class="cn(alertDialogDescriptionClasses, props.class)"
  >
    <slot />
  </AlertDialogDescription>
</template>
