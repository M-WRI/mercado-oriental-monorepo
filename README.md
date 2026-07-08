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

Product images are uploaded to **Cloudinary** via the admin API (`POST /api/admin/uploads/product-image`). The API stores only the returned HTTPS URL on the product — no files are kept on the server.

Add these to `apps/admin-api/.env` (free tier at [cloudinary.com](https://cloudinary.com)):

```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
# optional:
# CLOUDINARY_FOLDER=mercado-oriental/products
```

## Email (Brevo) & payments (Stripe)

Vendor email notifications and checkout use **Brevo** and **Stripe Connect** (marketplace model). Add to `apps/admin-api/.env.local`:

```bash
BREVO_API_KEY=...
BREVO_SENDER_EMAIL=notifications@yourdomain.com
BREVO_SENDER_NAME=Mercado Oriental
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PLATFORM_FEE_PERCENT=5
ADMIN_WEB_URL=http://localhost:5173
STORE_WEB_URL=http://localhost:5174
```

- **Checkout:** Store uses `POST /api/store/checkout` → Stripe Hosted Checkout (one payment, multi-shop split).
- **Webhooks (local):** `stripe listen --forward-to localhost:8000/api/webhooks/stripe`
- **Vendor Stripe:** Admin → Settings → Connect Stripe (required before a shop can receive orders).
- **Tests:** `ALLOW_LEGACY_ORDERS=true` is set in `test/setup.ts` for direct order creation in integration tests.

Run migrations after pulling: `pnpm --filter @mercado/admin-api prisma:migrate`

## Production deploy (summary)

| Component | Notes |
|-----------|--------|
| **Database** | Managed Postgres; set `DATABASE_URL` |
| **API** | Set `JWT_SECRET`, Cloudinary vars; run `prisma migrate deploy` (see `apps/admin-api/docker-entrypoint.sh`) |
| **Admin web** | Build with `VITE_API_URL=https://your-api.example.com/api/admin` |
| **Migrations** | Committed under `apps/admin-api/prisma/migrations/` |

Docker Compose defaults to `PRISMA_DB_PUSH=false` so the API container runs **`migrate deploy`**. For schema-only local Docker without caring about migration history, set `PRISMA_DB_PUSH=true`.

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
