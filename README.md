# @north-foundry/frontend

Monorepo Turborepo per il frontend di North Foundry.

## Struttura

```
.
├── apps/        # applicazioni eseguibili
├── packages/    # librerie e configurazioni condivise
└── turbo.json   # pipeline dei task
```

## Requisiti

- Node.js 24 LTS or newer
- Yarn Berry 4 (`corepack enable`; la versione è fissata nel campo `packageManager`)

## Comandi

```bash
yarn install     # installa tutte le dipendenze del workspace
yarn dev         # avvia i task dev in tutte le app
yarn build       # build di app e package, rispettando le dipendenze
yarn lint        # lint di tutti i workspace
yarn check-types # type check di tutti i workspace
yarn test        # test di tutti i workspace
```

I comandi di root delegano a Turborepo, che esegue lo script omonimo solo nei workspace che lo definiscono.

## Aggiungere un workspace

Creare una cartella in `apps/` o `packages/` con il proprio `package.json` e aggiungere gli script che servono
(`build`, `dev`, `lint`, `test`, `check-types`). Turborepo li rileva automaticamente.
