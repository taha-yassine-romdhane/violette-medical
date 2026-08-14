#!/usr/bin/env bash
# Violette Medical — deploy script.
# Run from the project root on the VPS:  ./deploy.sh
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "FATAL: .env is missing. It holds DATABASE_URL, AUTH_SECRET and the site URL."
  exit 1
fi
set -a; . ./.env; set +a

echo "==> Pulling latest code"
git pull --ff-only

echo "==> Installing dependencies"
npm ci

echo "==> Generating Prisma client"
npx prisma generate

echo "==> Applying database migrations"
npx prisma migrate deploy

echo "==> Building image"
sudo docker compose build

echo "==> Restarting container"
sudo docker compose up -d

echo "==> Waiting for the app to answer on :${PORT:-3006}"
for i in $(seq 1 30); do
  if curl -fsS -o /dev/null "http://127.0.0.1:${PORT:-3006}/"; then
    echo "Deploy OK — violette-app is serving on ${PORT:-3006}."
    exit 0
  fi
  sleep 2
done

echo "App did not respond in 60s. Recent logs:"
sudo docker logs --tail 40 violette-app
exit 1
