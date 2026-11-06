# Storybook

Workshop for `@north-foundry/ui`.

- `yarn storybook` from the repo root, or `yarn workspace @north-foundry/storybook dev`.
- Stories live in `stories/`; configuration in `.storybook/`.
- `stories/` mirrors the sidebar: one folder per group (`components`, `brand`, `effects`,
  `theme`), then one folder per subject named as in `packages/ui/src/components`. Each holds
  `<subject>.stories.ts` plus any Vue or CSS helper used only by that story. Sub-components are
  shown in their parent's stories rather than in stories of their own.
- `yarn workspace @north-foundry/storybook build` writes `storybook-static/`, which is gitignored.
- `yarn workspace @north-foundry/storybook deploy` builds and publishes to
  [storybook.northfoundry.eu](https://storybook.northfoundry.eu) with Wrangler.
  Run `yarn workspace @north-foundry/storybook exec wrangler login` first if Cloudflare is not authenticated.

`wrangler.jsonc` serves the build as Cloudflare Worker static assets and manages the custom domain.

The components live in `packages/ui`, outside this app's root, so `.storybook/main.ts` loads the Vue
plugin explicitly and widens the dev server allow list. Without that, Vite tries to parse `.vue`
files as plain modules.

Storybook is pinned to 10.6.3: 10.6.4 is marked quarantined by the registry.
