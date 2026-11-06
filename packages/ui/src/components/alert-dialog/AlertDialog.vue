<script setup lang="ts">
/**
 * The alert dialog root: holds the open state and renders no element of its own. An alert dialog
 * is always modal and only closes through its action or cancel button, or Escape.
 */
import type { AlertDialogEmits, AlertDialogProps } from 'reka-ui';
import { AlertDialogRoot, useForwardPropsEmits } from 'reka-ui';

const props = defineProps<AlertDialogProps>();
const emits = defineEmits<AlertDialogEmits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <AlertDialogRoot v-slot="slotProps" data-slot="alert-dialog" v-bind="forwarded">
    <slot v-bind="slotProps" />
  </AlertDialogRoot>
</template>
