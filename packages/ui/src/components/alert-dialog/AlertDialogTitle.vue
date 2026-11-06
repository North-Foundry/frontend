<script setup lang="ts">
/**
 * The dialog's accessible name; screen readers announce it when the dialog opens.
 */
import { reactiveOmit } from '@vueuse/core';
import type { AlertDialogTitleProps } from 'reka-ui';
import { AlertDialogTitle } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { alertDialogTitleClasses } from './AlertDialogTitle';

const props = defineProps<AlertDialogTitleProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <AlertDialogTitle
    data-slot="alert-dialog-title"
    v-bind="delegatedProps"
    :class="cn(alertDialogTitleClasses, props.class)"
  >
    <slot />
  </AlertDialogTitle>
</template>
