import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

/**
 * The site base: Astro alone, plus Vue for the pieces that are components and Tailwind for the
 * shared theme. No MDX, no sitemap, no lab integrations until a page needs them.
 */
export default defineConfig({
  integrations: [
    vue()
  ],
  vite: {
    plugins: [
      tailwindcss()
    ],
  },
});
