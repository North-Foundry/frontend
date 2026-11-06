<script setup lang="ts">
/**
 * Holds the cancel and action buttons.
 */
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { alertDialogFooterClasses } from './AlertDialogFooter';

const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>

<template>
  <div data-slot="alert-dialog-footer" :class="cn(alertDialogFooterClasses, props.class)">
    <slot />
  </div>
</template>
