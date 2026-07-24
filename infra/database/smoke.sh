#!/usr/bin/env bash

set -euo pipefail

readonly postgres_image="postgres:18.3-alpine@sha256:54451ecb8ab38c24c3ec123f2fd501303a3a1856a5c66e98cecf2460d5e1e9d7"
readonly container_name="argent-database-smoke-${$}"
readonly database_name="argent_test"
readonly database_user="argent_test"
readonly database_password="argent-test-only"

cleanup() {
  docker rm --force "${container_name}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker run \
  --detach \
  --name "${container_name}" \
  --env "POSTGRES_DB=${database_name}" \
  --env "POSTGRES_USER=${database_user}" \
  --env "POSTGRES_PASSWORD=${database_password}" \
  --publish "127.0.0.1::5432" \
  "${postgres_image}" >/dev/null

for _ in $(seq 1 30); do
  if docker exec "${container_name}" pg_isready \
    --username "${database_user}" \
    --dbname "${database_name}" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

docker exec "${container_name}" pg_isready \
  --username "${database_user}" \
  --dbname "${database_name}" >/dev/null

host_port="$(
  docker inspect "${container_name}" \
    --format '{{(index (index .NetworkSettings.Ports "5432/tcp") 0).HostPort}}'
)"

TEST_DATABASE_URL="postgresql://${database_user}:${database_password}@127.0.0.1:${host_port}/${database_name}" \
  pnpm --filter @argent/database test:integration

echo "Argent database migration and fixture smoke passed."
