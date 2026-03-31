# Docker (API + PostgreSQL)

## Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build: install deps, `prisma generate`, `tsc`, run with `docker-entrypoint.sh` |
| `docker-compose.yml` | `db` (Postgres 16) + `api` (this service) on port **8000** |
| `docker-entrypoint.sh` | Applies schema then starts the server (see below) |
| `.dockerignore` | Keeps image builds fast and avoids leaking local secrets |

## Quick start

```bash
docker compose up --build
```

- **API:** [http://localhost:8000](http://localhost:8000) (or set **`HOST_API_PORT`** if that port is already in use, e.g. `HOST_API_PORT=8001 docker compose up`)
- **Postgres (from your host):** `localhost:5433` → container `5432`, user `mercado`, password `mercado`, database `mercado`. The API container talks to `db:5432` on the Docker network and does not need this port.

Stop:

```bash
docker compose down
```

Data is kept in the `postgres_data` volume. Remove it with `docker compose down -v` if you want a clean database.

## Schema: `db push` vs `migrate deploy`

The compose file sets **`PRISMA_DB_PUSH=true`** so the container runs **`prisma db push`** on start. That matches many local setups that do not yet commit **`prisma/migrations`**, and applies the current `schema.prisma` to the database.

For **production**, prefer **`prisma migrate deploy`**:

1. Add migration history to the repo (`prisma migrate dev` locally, commit `prisma/migrations`).
2. Build/run the image with **`PRISMA_DB_PUSH=false`** (or unset). The entrypoint will run **`prisma migrate deploy`** instead.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection string (set automatically in `docker-compose.yml` for `api`) |
| `JWT_SECRET` | JWT signing secret (compose defaults to a dev value; override via `.env` next to compose or shell) |
| `PORT` | HTTP port inside the container (default **8000**) |
| `PRISMA_DB_PUSH` | If **`true`**, run `db push`; if **`false`**, run `migrate deploy` |

Optional: create `.env.docker` with `JWT_SECRET=...` and run:

```bash
docker compose --env-file .env.docker up --build
```

## Yarn scripts

| Script | Command |
|--------|---------|
| `yarn docker:up` | `docker compose up --build` |
| `yarn docker:down` | `docker compose down` |
