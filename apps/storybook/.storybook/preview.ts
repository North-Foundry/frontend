import './preview.css';

import type { Decorator, Preview } from '@storybook/vue3-vite';

/**
 * Backgrounds offered in the toolbar, one per colour scheme of the theme. Both paint the canvas
 * with `--background`, which `withScheme` resolves to the picked scheme's ground.
 */
const backgrounds = {
  dark: { name: 'Dark', value: 'var(--background)' },
  light: { name: 'Paper', value: 'var(--background)' },
};

/**
 * Puts the scheme matching the toolbar background on `<html>`, so the whole canvas switches,
 * including content teleported to `body` such as select lists and dialogs. Without a background
 * the canvas falls back to the dark scheme, the theme's default.
 */
const withScheme: Decorator = (story, context) => {
  const background = context.globals.backgrounds?.value;
  const root = document.documentElement;
  root.classList.toggle('paper', background === 'light');
  root.classList.toggle('dark', background !== 'light');
  return story();
};

/** Global settings shared by every story: marks are small, so they read better centred. */
const preview: Preview = {
  decorators: [withScheme],
  parameters: {
    layout: 'centered',
    backgrounds: { options: backgrounds },
    controls: {
      disableSaveFromUI: true,
    },
  },
  initialGlobals: {
    backgrounds: { value: 'dark' },
  },
};

export default preview;
