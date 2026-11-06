/** A primary navigation entry. */
export interface NavItem {
  label: string;
  href: string;
}

/** Site-wide identity. Page copy lives next to the page, not here. */
export const site = {
  name: 'North Foundry',
  url: 'https://northfoundry.eu',
  description: 'An independent software laboratory in Turin.',
  github: 'https://github.com/North-Foundry',
} as const;

export const primaryNav: NavItem[] = [
  { label: 'Projects', href: '/#projects' },
  { label: 'How we work', href: '/#how-we-work' },
];
