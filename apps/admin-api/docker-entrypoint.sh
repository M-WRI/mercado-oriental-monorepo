#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "error: DATABASE_URL is not set"
  exit 1
fi

PRISMA=./node_modules/.bin/prisma

if [ "${PRISMA_DB_PUSH:-false}" = "true" ]; then
  echo "Applying database schema (prisma db push)..."
  "$PRISMA" db push
else
  echo "Running database migrations (prisma migrate deploy)..."
  "$PRISMA" migrate deploy
fi

exec node dist/index.js
