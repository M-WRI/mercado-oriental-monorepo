# Mercado Oriental

Monorepo for the Mercado Oriental marketplace platform.

| App | Package | Description |
|-----|---------|-------------|
| **Admin API** | `@mercado/admin-api` | REST API (Express, Prisma, PostgreSQL) |
| **Admin Web** | `@mercado/admin-web` | Vendor admin dashboard (React, Vite) |
| **Store Web** | `@mercado/store-web` | Customer storefront (React, Vite) |

**Current MVP focus:** admin API + admin web. Store-front is present but not required for the admin MVP.

## Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 9
- **Docker** (recommended for local PostgreSQL)

## Quick start (admin MVP)

From the repo root:

```bash
pnpm install
```

### 1. Start PostgreSQL

```bash
cd apps/admin-api
docker compose up -d db
```

Postgres listens on **`localhost:5433`** (user `mercado`, password `mercado`, database `mercado`).

### 2. Configure the API

```bash
cp apps/admin-api/.env.example apps/admin-api/.env
```

Default `DATABASE_URL` in `.env.example` matches the Docker Postgres above.

### 3. Migrate and seed

```bash
pnpm --filter @mercado/admin-api prisma:generate
pnpm --filter @mercado/admin-api prisma:migrate
pnpm --filter @mercado/admin-api prisma:seed
```

### 4. Configure admin web

```bash
cp apps/admin-web/.env.example apps/admin-web/.env
```

Default: `VITE_API_URL=http://localhost:8000/api/admin`

### 5. Run admin stack

In separate terminals (or use the combined script below):

```bash
pnpm dev:api    # http://localhost:8000
pnpm dev:admin  # http://localhost:5173
```

Or start API + admin + store together:

```bash
pnpm dev
```

### 6. Log in

After seeding, use:

| Role | Email | Password |
|------|-------|----------|
| Admin | `moritz@mercado-oriental.com` | `password123` |

Pick a shop from the shop picker to enter the dashboard.

## Scripts (root)

| Script | Description |
|--------|-------------|
| `pnpm dev:api` | Admin API with hot reload |
| `pnpm dev:admin` | Admin web (Vite) |
| `pnpm dev:store` | Store web (Vite) |
| `pnpm dev` | All three apps in parallel |
| `pnpm build` | Build all packages |
| `pnpm test` | Run tests in all packages |

## Product image uploads

Uploaded images are stored on disk under `apps/admin-api/uploads/` and served at `/uploads/...`.

When creating or updating a product with an image, the API returns an absolute `imageUrl`. Set **`PUBLIC_BASE_URL`** in the API environment so URLs stay correct behind a reverse proxy or on another host:

```bash
# apps/admin-api/.env
PUBLIC_BASE_URL=https://api.example.com
```

If unset, the API derives the base URL from each request (`Host` / `X-Forwarded-Proto`). For production deployments, set `PUBLIC_BASE_URL` explicitly and ensure the `uploads/` directory is persisted (volume mount) or migrate to object storage later.

See also: [apps/admin-api/docs/architecture.md](./apps/admin-api/docs/architecture.md#configuration).

## Documentation

- [Admin API docs](./apps/admin-api/docs/README.md) — architecture, API reference, testing, Docker
- [Admin API Docker](./apps/admin-api/docs/docker.md) — full API + Postgres via Compose

## Project layout

```
apps/
  admin-api/     Express API, Prisma schema, seed data
  admin-web/     Vendor admin UI
  store-web/     Customer storefront
packages/
  shared-ui/     Shared React components and hooks
  shared-types/  Shared TypeScript types
```
