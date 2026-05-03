#!/bin/sh
# wait-for-postgres.sh — waits until the DATABASE_URL host is accepting connections
# Usage: ./wait-for-postgres.sh <host> <port> -- <command>

set -e

HOST="$1"
PORT="$2"
shift 2

# Strip the leading "--" separator
if [ "$1" = "--" ]; then shift; fi

echo "Waiting for PostgreSQL at $HOST:$PORT..."

until nc -z "$HOST" "$PORT"; do
  echo "  Postgres not ready yet — sleeping 2s"
  sleep 2
done

echo "PostgreSQL is up — starting server"
exec "$@"
