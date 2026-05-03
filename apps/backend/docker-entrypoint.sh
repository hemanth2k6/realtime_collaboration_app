#!/bin/sh
# Runs before the Node server: wait for Postgres, apply migrations, then exec the app.
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "docker-entrypoint: DATABASE_URL is not set" >&2
  exit 1
fi

DB_HOST=$(echo "$DATABASE_URL" | sed 's|.*@\([^:]*\).*|\1|')
DB_PORT=$(echo "$DATABASE_URL" | sed 's|.*:\([0-9]*\)/.*|\1|')

exec /wait-for-postgres.sh "$DB_HOST" "$DB_PORT" -- sh -c '
  set -e
  cd /app/apps/backend
  echo "docker-entrypoint: prisma generate"
  npx prisma generate --schema=prisma/schema.prisma
  echo "docker-entrypoint: prisma migrate deploy"
  npx prisma migrate deploy --schema=prisma/schema.prisma
  echo "docker-entrypoint: starting server"
  exec node /app/apps/backend/dist/index.js
'
