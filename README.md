# @north-foundry/frontend

Turborepo monorepo for the North Foundry frontend.

## Structure

```
.
├── apps/        # runnable applications
├── packages/    # shared libraries and configuration
└── turbo.json   # task pipeline
```

## Requirements

- Node.js 24 LTS or newer
- Yarn Berry 4 (`corepack enable`; the version is pinned in the `packageManager` field)

## Commands

```bash
yarn install     # install every dependency in the workspace
yarn dev         # start the dev task in every app
yarn build       # build apps and packages in dependency order
yarn lint        # lint every workspace
yarn check-types # type check every workspace
yarn test        # test every workspace
```

Root commands delegate to Turborepo, which runs the matching script only in workspaces that define it.

## Adding a workspace

Create a folder in `apps/` or `packages/` with its own `package.json` and add the scripts it needs
(`build`, `dev`, `lint`, `test`, `check-types`). Turborepo picks it up automatically.

## Repository conventions

`packages/ui` holds the shared UI (`@north-foundry/ui`).

Agent-facing rules live in `AGENTS.md` and under `.agents/docs/`. Commit messages follow
Conventional Commits and are validated by `.githooks/commit-msg`; enable the hook once per clone with
`git config core.hooksPath .githooks`.
