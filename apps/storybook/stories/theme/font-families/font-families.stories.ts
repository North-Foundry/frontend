import type { Meta, StoryObj } from '@storybook/vue3-vite';
import TypographySpecimen from './TypographySpecimen.vue';

const meta = {
  title: 'Theme/Font Families',
  component: TypographySpecimen,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TypographySpecimen>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Shows the typefaces, their intended roles and the tokens used to apply them. */
export const FontFamilies: Story = {};
