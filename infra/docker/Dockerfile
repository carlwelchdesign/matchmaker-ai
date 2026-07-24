# syntax=docker/dockerfile:1.7

ARG NODE_IMAGE=node:20.20.1-bookworm-slim@sha256:17281e8d1dc4d671976c6b89a12f47a44c2f390b63a989e2e327631041f544fd

FROM ${NODE_IMAGE} AS toolchain
ENV PNPM_HOME=/pnpm
ENV PATH=${PNPM_HOME}:${PATH}
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@10.34.5 --activate
WORKDIR /workspace

FROM toolchain AS dependencies
COPY . .
RUN --mount=type=cache,id=argent-pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile \
      --filter @argent/web... \
      --filter @argent/api... \
      --filter @argent/worker...

FROM dependencies AS build
RUN pnpm --filter @argent/domain build \
    && pnpm --filter @argent/web build \
    && pnpm --filter @argent/api build \
    && pnpm --filter @argent/worker build \
    && pnpm --filter @argent/api deploy --prod /output/api --legacy \
    && pnpm --filter @argent/worker deploy --prod /output/worker --legacy

FROM ${NODE_IMAGE} AS web
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
WORKDIR /app
COPY --from=build --chown=node:node /workspace/apps/web/.next/standalone/ ./
USER node
EXPOSE 3000
CMD ["node", "apps/web/server.js"]

FROM ${NODE_IMAGE} AS api
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001
WORKDIR /app
COPY --from=build --chown=node:node /output/api/ ./
USER node
EXPOSE 3001
CMD ["node", "dist/server.js"]

FROM ${NODE_IMAGE} AS worker
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /output/worker/ ./
USER node
CMD ["node", "dist/main.js"]
