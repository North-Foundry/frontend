<script setup lang="ts">
/**
 * Holds the dialog's title and description.
 */
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { alertDialogHeaderClasses } from './AlertDialogHeader';

const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>

<template>
  <div data-slot="alert-dialog-header" :class="cn(alertDialogHeaderClasses, props.class)">
    <slot />
  </div>
</template>
