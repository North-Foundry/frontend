<script setup lang="ts">
/**
 * The backdrop and the dialog panel, teleported to `body`. Both are wrapped in the trigger's
 * scheme class, so a dialog opened from a `.paper` band opens on paper.
 */
import { reactiveOmit } from '@vueuse/core';
import type { AlertDialogContentEmits, AlertDialogContentProps } from 'reka-ui';
import {
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogPortal,
  injectDialogRootContext,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { useScheme } from '../../lib/scheme';
import { cn } from '../../lib/utils';
import { alertDialogContentClasses, alertDialogOverlayClasses } from './AlertDialogContent';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<AlertDialogContentProps & { class?: HTMLAttributes['class'] }>();
const emits = defineEmits<AlertDialogContentEmits>();

const delegatedProps = reactiveOmit(props, 'class');

const forwarded = useForwardPropsEmits(delegatedProps, emits);

const rootContext = injectDialogRootContext();
const scheme = useScheme(rootContext.triggerElement, rootContext.open);
</script>

<template>
  <AlertDialogPortal>
    <div :class="scheme" class="contents">
      <AlertDialogOverlay data-slot="alert-dialog-overlay" :class="alertDialogOverlayClasses" />
      <AlertDialogContent
        data-slot="alert-dialog-content"
        v-bind="{ ...$attrs, ...forwarded }"
        :class="cn(alertDialogContentClasses, props.class)"
      >
        <slot />
      </AlertDialogContent>
    </div>
  </AlertDialogPortal>
</template>
