/**
 * Storybook configuration for the shared UI.
 *
 * Stories live in this app while the components live in `packages/ui`, so the Vue plugin is
 * loaded by hand in `viteFinal`.
 */
import tailwindcss from '@tailwindcss/vite';
import type { StorybookConfig } from '@storybook/vue3-vite';
import vue from '@vitejs/plugin-vue';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.ts'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  /**
   * The UI package sits outside this app's root, where Vite would treat its `.vue` files as plain
   * modules and fail on the template. Loading the Vue plugin here, deduping Vue and widening the
   * dev server allow list is what lets stories import the component straight from source.
   */
  async viteFinal(viteConfig) {
    return mergeConfig(viteConfig, {
      plugins: [
        tailwindcss(),
        vue()
      ],
      resolve: {
        dedupe: ['vue'],
      },
      server: {
        fs: {
          allow: ['../..'],
        },
      },
    });
  },
};

export default config;
