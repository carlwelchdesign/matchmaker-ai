#!/usr/bin/env bash

set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
compose_project_name="${COMPOSE_PROJECT_NAME:-argent-smoke}"
web_port="${WEB_PORT:-33000}"
admin_port="${ADMIN_PORT:-33002}"
api_port="${API_PORT:-33001}"
postgres_port="${POSTGRES_PORT:-35432}"
redis_port="${REDIS_PORT:-36379}"

compose() {
  COMPOSE_PROJECT_NAME="${compose_project_name}" \
    WEB_PORT="${web_port}" \
    ADMIN_PORT="${admin_port}" \
    API_PORT="${api_port}" \
    POSTGRES_PORT="${postgres_port}" \
    REDIS_PORT="${redis_port}" \
    docker compose --file "${repository_root}/compose.yaml" "$@"
}

cleanup() {
  local exit_status=$?
  if [[ "${exit_status}" != "0" ]]; then
    compose ps || true
    compose logs --no-color web admin api worker || true
  fi
  if [[ "${KEEP_ARGENT_SMOKE_STACK:-0}" != "1" ]]; then
    compose down --volumes --remove-orphans
  fi
  return "${exit_status}"
}
trap cleanup EXIT

compose config --quiet
compose up --build --detach --wait

for service in web admin api worker; do
  container_id="$(compose ps --quiet "${service}")"
  test "$(docker inspect "${container_id}" --format '{{.Config.User}}')" = "65532:65532"
  test "$(docker inspect "${container_id}" --format '{{.HostConfig.ReadonlyRootfs}}')" = "true"
  docker inspect "${container_id}" --format '{{json .HostConfig.CapDrop}}' |
    grep --quiet '"ALL"'
done
test "$(compose port web 3000)" = "127.0.0.1:${web_port}"
test "$(compose port admin 3002)" = "127.0.0.1:${admin_port}"
test "$(compose port api 3001)" = "127.0.0.1:${api_port}"

curl --fail --silent --show-error "http://127.0.0.1:${web_port}" |
  grep --quiet "The Montecito Matchmaker"
curl --fail --silent --show-error "http://127.0.0.1:${admin_port}" |
  grep --quiet "Owner workspace"
curl --fail --silent --show-error "http://127.0.0.1:${api_port}/health/live" |
  grep --quiet '"state":"ok"'
compose exec --no-TTY postgres sh -c \
  'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"' >/dev/null
test "$(compose exec --no-TTY redis redis-cli ping | tr -d '\r')" = "PONG"
compose logs --no-color worker | grep --quiet "Worker started"

compose stop --timeout 10 api worker
compose logs --no-color api | grep --quiet "API shutdown requested"
compose logs --no-color worker | grep --quiet "Worker stopped"

echo "Argent Docker smoke path passed."
