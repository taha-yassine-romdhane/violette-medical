#!/bin/sh
set -e

# docker-compose passes .env through env_file, but keep this for `docker run`.
if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

if [ -z "$DATABASE_URL" ]; then
  echo "FATAL: DATABASE_URL is not set."
  exit 1
fi

# Migrations are applied by ./deploy.sh on the host before the image is
# rebuilt — the runtime image deliberately ships without the Prisma CLI.
echo "Starting Next.js on ${HOSTNAME:-0.0.0.0}:${PORT:-3006}..."
exec node server.js
