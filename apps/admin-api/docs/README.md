# Mercado Oriental Admin API — Documentation

REST API for admin operations: authentication, shops, catalog (products, variants, attributes), and dashboard analytics.

## Contents

| Document | Description |
|----------|-------------|
| [Architecture](./architecture.md) | Tech stack, repository layout, request lifecycle, data layer, module pattern |
| [API reference](./api.md) | Base URL, authentication, routes, error format |
| [Testing](./testing.md) | Running tests, unit vs integration, `DATABASE_URL` |
| [Docker](./docker.md) | API + Postgres with Docker Compose |

## Quick start

- **Install:** [Yarn classic](https://classic.yarnpkg.com/) (v1); lockfile is **`yarn.lock`**. Run **`yarn install`**.
- **Run locally:** `yarn dev` (default: `http://localhost:8000`)
- **Environment:** Set `DATABASE_URL` (PostgreSQL). Optional: `JWT_SECRET`, `PORT`. See [Architecture → Configuration](./architecture.md#configuration).
- **Database:** `yarn prisma:migrate` / `yarn prisma:generate`

## Project scripts

| Script | Purpose |
|--------|---------|
| `yarn dev` | `tsx watch src/index.ts` |
| `yarn build` | TypeScript compile to `dist/` |
| `yarn start` | Run compiled `dist/index.js` |
| `yarn generate` | Interactive module scaffold from Prisma schema |
| `yarn prisma:*` | Generate client, migrate, studio, seed |
| `yarn test` | Run Vitest (`test/_modules/*`, `test/lib`; integration needs `DATABASE_URL`) |
| `yarn test:watch` | Vitest watch mode |
| `yarn docker:up` | Build and start API + Postgres (`docker compose up --build`) |
| `yarn docker:down` | Stop Compose stack |
