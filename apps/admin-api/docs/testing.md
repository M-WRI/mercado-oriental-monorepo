# Testing

## Commands

| Command | Purpose |
|---------|---------|
| `yarn test` | Run all tests once (`vitest run`) |
| `yarn test:watch` | Watch mode for local development |

## Layout (mirrors `src/`)

Tests follow the same domain boundaries as `src/_modules/`. Each domain has **`unit/`** and **`integration/`**; add `*.test.ts` files as you grow coverage.

Shared code that is not a route module lives under **`test/lib/`** (mirrors `src/lib/`).

```
test/
  setup.ts                    # dotenv before any test file
  helpers/                    # shared test utilities (not test cases)
    database.ts               # hasTestDatabase
    testApp.ts                # getTestApp() — cached createApp()
    testEmails.ts             # reserved `@mercado-test.invalid` addresses
    cleanupIntegrationData.ts # delete integration test users after each suite
    registerUser.ts           # registerRandomUser()
    createShop.ts             # createShopForUser()
  _modules/
    auth/
      unit/
      integration/
        auth.integration.test.ts
    shop/
      unit/
      integration/
        shop.integration.test.ts
    attributes/
      unit/
      integration/
        attributes.integration.test.ts
    products/
      unit/
      integration/
        products.integration.test.ts
    dashboard/
      unit/
      integration/
        dashboard.integration.test.ts
  lib/
    unit/
      error.unit.test.ts
```

Naming suggestion: **`<domain>.integration.test.ts`** and **`<topic>.unit.test.ts`** so filenames stay searchable in the IDE.

## App entry for tests

The Express application is created by **`createApp()`** in `src/app.ts`. Integration tests use **`getTestApp()`** from `test/helpers/testApp.ts` so nothing listens on a port.

## Database and integration tests

Integration suites use **`describe.skipIf(!hasTestDatabase)`** from `test/helpers/database.ts`, where **`hasTestDatabase`** reflects **`DATABASE_URL`** after `test/setup.ts` loads `.env.local` / `.env`. When the URL is missing, those files are skipped and **`src/app`** (and Prisma) are never imported.

### Leaving the database clean

Integration tests register users with emails under **`@mercado-test.invalid`** (reserved-style suffix). Each suite’s **`afterAll`** calls **`cleanupIntegrationTestUsers()`**, which deletes those users; Prisma **`onDelete: Cascade`** removes their shops, products, variants, attributes, and related rows. Tests still hit a real Postgres instance—they verify end-to-end behavior—but they do not intentionally leave test rows behind.

Do not use **`@mercado-test.invalid`** for real accounts.

With **`DATABASE_URL`** set, integration tests cover:

- **auth:** login validation, register + **`GET /api/auth/me`**
- **shop:** **`GET /api/shops`** without/invalid token, empty list for a new user
- **attributes:** create attribute with values for a shop, list with **`?shopId=`**, get by id
- **products:** create product + variant, list (serialized), show with analytics
- **dashboard:** empty dashboard when the user has no shops

## Unit tests

**`test/lib/unit/error.unit.test.ts`** covers **`AppError`** serialization and does not use the database.

## Tooling

- **Vitest** — test runner and assertions
- **Supertest** — HTTP assertions against Express `app`

`vitest.config.ts` runs tests in **forks** with **file parallelism disabled** to reduce Prisma connection contention across integration files.

## GitHub Actions

The workflow **`.github/workflows/ci.yml`** runs on pushes and pull requests to **`main`** / **`master`**. It:

1. Starts a **PostgreSQL 16** service container
2. Sets **`DATABASE_URL`** / **`JWT_SECRET`** for the job
3. Runs **`yarn install --frozen-lockfile`**, **`yarn prisma generate`**, **`yarn prisma db push`**, **`yarn build`**, **`yarn test`**

Integration tests run in CI because **`DATABASE_URL`** is defined; they still clean up **`@mercado-test.invalid`** users in **`afterAll`**.

To run CI on other branches, edit the `on:` section in the workflow file. To use a different default branch name only, adjust the branch list there.
